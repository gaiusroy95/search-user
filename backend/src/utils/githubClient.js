const axios = require('axios');
const { RateLimitError, GitHubApiError } = require('./errors');

const GITHUB_API_BASE = 'https://api.github.com';
const DEFAULT_COOLDOWN_MS = 60_000;

/**
 * Collect tokens from:
 * - GITHUB_TOKEN (single, backward compatible)
 * - GITHUB_TOKENS (comma or newline separated)
 * - GITHUB_TOKEN_1 … GITHUB_TOKEN_20
 */
function loadGitHubTokens() {
  const tokens = [];

  const single = process.env.GITHUB_TOKEN?.trim();
  if (single) tokens.push(single);

  const list = process.env.GITHUB_TOKENS || '';
  for (const part of list.split(/[,\n\r]+/)) {
    const t = part.trim();
    if (t) tokens.push(t);
  }

  for (let i = 1; i <= 20; i += 1) {
    const t = process.env[`GITHUB_TOKEN_${i}`]?.trim();
    if (t) tokens.push(t);
  }

  return [...new Set(tokens)];
}

/**
 * Round-robin pool that cools down rate-limited tokens until reset.
 */
class GitHubTokenPool {
  constructor(tokens = loadGitHubTokens()) {
    this.tokens = tokens;
    this.index = 0;
    /** @type {Map<string, number>} token -> cooldown until epoch ms */
    this.cooldownUntil = new Map();
  }

  get size() {
    return this.tokens.length;
  }

  get hasTokens() {
    return this.tokens.length > 0;
  }

  _isAvailable(token, now = Date.now()) {
    const until = this.cooldownUntil.get(token);
    if (!until) return true;
    if (until <= now) {
      this.cooldownUntil.delete(token);
      return true;
    }
    return false;
  }

  /**
   * Next available token (round-robin). Returns null if all are cooling down.
   */
  acquire() {
    if (!this.tokens.length) return null;

    const now = Date.now();
    const n = this.tokens.length;

    for (let i = 0; i < n; i += 1) {
      const idx = (this.index + i) % n;
      const token = this.tokens[idx];
      if (this._isAvailable(token, now)) {
        this.index = (idx + 1) % n;
        return token;
      }
    }

    return null;
  }

  /**
   * Mark a token rate-limited until GitHub's reset time (or a short default).
   */
  markLimited(token, resetAtIso) {
    if (!token) return;

    let until = Date.now() + DEFAULT_COOLDOWN_MS;
    if (resetAtIso) {
      const ts = Date.parse(resetAtIso);
      if (!Number.isNaN(ts) && ts > Date.now()) {
        until = ts;
      }
    }

    this.cooldownUntil.set(token, until);
    const remaining = this.tokens.filter((t) => this._isAvailable(t)).length;
    console.warn(
      `[github-tokens] Token …${String(token).slice(-4)} rate-limited until ${new Date(until).toISOString()} (${remaining}/${this.tokens.length} still available)`
    );
  }

  /** Earliest reset among cooled-down tokens (ISO), if any. */
  nextResetAt() {
    let min = null;
    for (const until of this.cooldownUntil.values()) {
      if (min == null || until < min) min = until;
    }
    return min != null ? new Date(min).toISOString() : null;
  }

  status() {
    const now = Date.now();
    return {
      total: this.tokens.length,
      available: this.tokens.filter((t) => this._isAvailable(t, now)).length,
      nextResetAt: this.nextResetAt(),
    };
  }
}

const sharedPool = new GitHubTokenPool();

function isRateLimitResponse(status, message) {
  if (status === 429) return true;
  if (status !== 403) return false;
  const msg = (message || '').toLowerCase();
  return (
    msg.includes('rate limit') ||
    msg.includes('api rate limit') ||
    msg.includes('secondary rate limit')
  );
}

/**
 * Axios instance for GitHub REST API v3 with automatic token rotation.
 */
function createGitHubClient(pool = sharedPool) {
  const client = axios.create({
    baseURL: GITHUB_API_BASE,
    headers: {
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'github-developer-discovery-app',
    },
    timeout: 45000,
  });

  client.interceptors.request.use((config) => {
    const token = pool.acquire();
    config.__githubToken = token || null;

    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    } else if (config.headers?.Authorization) {
      delete config.headers.Authorization;
    }

    return config;
  });

  client.interceptors.response.use(
    (response) => response,
    async (error) => {
      if (!error.response) {
        const code = error.code || 'NETWORK_ERROR';
        const isTimeout =
          code === 'ECONNABORTED' || error.message?.includes('timeout');
        const message = isTimeout
          ? 'GitHub API request timed out. Try again or reduce search filters.'
          : `Unable to reach GitHub API (${code}). Check your internet connection, firewall, or VPN, then restart the backend.`;

        throw new GitHubApiError(message, 503);
      }

      const { status, headers, data, config } = error.response;
      const message =
        data?.message || `GitHub API request failed with status ${status}`;

      if (isRateLimitResponse(status, message)) {
        const resetHeader = headers['x-ratelimit-reset'];
        const resetAt = resetHeader
          ? new Date(Number(resetHeader) * 1000).toISOString()
          : null;

        const usedToken = config?.__githubToken;
        if (usedToken) {
          pool.markLimited(usedToken, resetAt);
        }

        const retries = config.__tokenRetries || 0;
        const stillAvailable = pool.status().available > 0;

        if (stillAvailable && retries < Math.max(pool.size, 1)) {
          const headers = { ...(config.headers || {}) };
          delete headers.Authorization;
          delete headers.authorization;

          return client.request({
            ...config,
            headers,
            __tokenRetries: retries + 1,
            __githubToken: undefined,
          });
        }

        throw new RateLimitError(
          `GitHub API rate limit exceeded on all configured tokens (${pool.size || 0}). Add more via GITHUB_TOKENS or wait until ${resetAt || pool.nextResetAt() || 'unknown'}.`,
          resetAt || pool.nextResetAt()
        );
      }

      if (status === 422) {
        throw new GitHubApiError(`Invalid search query: ${message}`, 422);
      }

      throw new GitHubApiError(message, status >= 500 ? 502 : status);
    }
  );

  return client;
}

function getGitHubTokenStatus() {
  return sharedPool.status();
}

function hasGitHubToken() {
  return sharedPool.hasTokens;
}

module.exports = {
  createGitHubClient,
  GITHUB_API_BASE,
  loadGitHubTokens,
  GitHubTokenPool,
  getGitHubTokenStatus,
  hasGitHubToken,
  sharedPool,
};
