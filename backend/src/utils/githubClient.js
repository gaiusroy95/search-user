const axios = require('axios');
const { RateLimitError, GitHubApiError } = require('./errors');

const GITHUB_API_BASE = 'https://api.github.com';

/**
 * Axios instance configured for GitHub REST API v3.
 * Token is read from env and never exposed to clients.
 */
function createGitHubClient() {
  const token = process.env.GITHUB_TOKEN;

  const client = axios.create({
    baseURL: GITHUB_API_BASE,
    headers: {
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'github-developer-discovery-app',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    timeout: 45000,
  });

  client.interceptors.response.use(
    (response) => response,
    (error) => {
      if (!error.response) {
        const code = error.code || 'NETWORK_ERROR';
        const isTimeout = code === 'ECONNABORTED' || error.message?.includes('timeout');
        const message = isTimeout
          ? 'GitHub API request timed out. Try again or reduce search filters.'
          : `Unable to reach GitHub API (${code}). Check your internet connection, firewall, or VPN, then restart the backend.`;

        throw new GitHubApiError(message, 503);
      }

      const { status, headers, data } = error.response;
      const message =
        data?.message || `GitHub API request failed with status ${status}`;

      if (status === 403 || status === 429) {
        const resetHeader = headers['x-ratelimit-reset'];
        const resetAt = resetHeader
          ? new Date(Number(resetHeader) * 1000).toISOString()
          : null;

        if (
          message.toLowerCase().includes('rate limit') ||
          status === 429
        ) {
          throw new RateLimitError(
            `GitHub API rate limit exceeded. ${token ? '' : 'Set GITHUB_TOKEN in .env for higher limits. '}Resets at ${resetAt || 'unknown'}.`,
            resetAt
          );
        }
      }

      if (status === 422) {
        throw new GitHubApiError(`Invalid search query: ${message}`, 422);
      }

      throw new GitHubApiError(message, status >= 500 ? 502 : status);
    }
  );

  return client;
}

module.exports = { createGitHubClient, GITHUB_API_BASE };
