const { createGitHubClient } = require('../utils/githubClient');
const { ValidationError, NotFoundError } = require('../utils/errors');

const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;
const GITHUB_SEARCH_PER_PAGE = 30;
const MAX_INTERNAL_SEARCH_PAGES = 5;
const DETAIL_CONCURRENCY = 6;

/**
 * Builds a GitHub user search query string from filter options.
 * Note: GitHub Search API supports location and followers qualifiers,
 * but NOT following — that filter is applied after fetching user details.
 */
function mapSearchType(type) {
  if (type === 'group') return 'org';
  return 'user'; // user and users both search individual users
}

function buildSearchQuery({ country, maxFollowers, maxRepos, type }) {
  const searchType = mapSearchType(type || 'user');
  const parts = [`location:"${country}"`, `type:${searchType}`];

  if (maxFollowers != null && maxFollowers > 0) {
    parts.push(`followers:<=${maxFollowers}`);
  }

  if (maxRepos != null && maxRepos > 0) {
    parts.push(`repos:<=${maxRepos}`);
  }

  return parts.join(' ');
}

/**
 * Maps a GitHub commit to patch-style metadata (From + Date).
 */
function mapCommitSummary(commit, owner, repoName) {
  if (!commit?.commit) return null;
  const author = commit.commit.author || commit.commit.committer;
  if (!author) return null;

  const sha = commit.sha;
  return {
    sha: sha?.slice(0, 7),
    fullSha: sha,
    message: (commit.commit.message || '').split('\n')[0],
    from: author.name || null,
    email: author.email || null,
    date: author.date || null,
    url: commit.html_url,
    patchUrl: sha
      ? `https://github.com/${owner}/${repoName}/commit/${sha}.patch`
      : null,
  };
}

/**
 * Derives primary language from a user's most recent public repositories.
 */
function derivePrimaryLanguage(repos) {
  const counts = {};
  for (const repo of repos) {
    if (!repo.language) continue;
    counts[repo.language] = (counts[repo.language] || 0) + 1;
  }

  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  return sorted[0]?.[0] || null;
}

/**
 * Maps raw GitHub user API response to our public contact-signal schema.
 * Only includes publicly available fields — never scrapes private data.
 */
function mapUserProfile(user, extras = {}) {
  return {
    username: user.login,
    name: user.name || null,
    profile: user.html_url,
    avatar: user.avatar_url,
    bio: user.bio || null,
    location: user.location || null,
    email: user.email || null,
    company: user.company || null,
    twitter: user.twitter_username || null,
    website: user.blog || null,
    followers: user.followers,
    following: user.following,
    publicRepos: user.public_repos,
    primaryLanguage: extras.primaryLanguage || null,
    languages: extras.languages || [],
    repositories: extras.repositories || [],
    createdAt: user.created_at,
    activity: extras.activity || null,
  };
}

/**
 * Runs async tasks with a concurrency limit to avoid hammering the API.
 */
async function mapWithConcurrency(items, concurrency, fn) {
  const results = [];
  let index = 0;

  async function worker() {
    while (index < items.length) {
      const current = index++;
      results[current] = await fn(items[current], current);
    }
  }

  const workers = Array.from(
    { length: Math.min(concurrency, items.length) },
    () => worker()
  );
  await Promise.all(workers);
  return results;
}

class GitHubService {
  constructor(cacheService) {
    this.client = createGitHubClient();
    this.cache = cacheService;
  }

  /**
   * Validates and normalizes incoming search parameters.
   */
  normalizeParams(body = {}) {
    const {
      country,
      maxFollowers,
      maxFollowing,
      maxRepos,
      type,
      limit,
      page,
      // legacy min* support maps to max*
      minFollowers,
      minFollowing,
      minRepos,
    } = body;

    if (!country || typeof country !== 'string' || !country.trim()) {
      throw new ValidationError(
        'Field "country" is required and must be a non-empty string.'
      );
    }

    const validTypes = ['user', 'users', 'group'];
    const searchType = type || 'user';

    const normalized = {
      country: country.trim(),
      maxFollowers: null,
      maxFollowing: null,
      maxRepos: null,
      type: validTypes.includes(searchType) ? searchType : 'user',
      limit: DEFAULT_LIMIT,
      page: 1,
    };

    const parseMax = (value, field) => {
      if (value == null) return null;
      const parsed = Number(value);
      if (!Number.isInteger(parsed) || parsed < 0) {
        throw new ValidationError(`"${field}" must be a non-negative integer.`);
      }
      return parsed;
    };

    normalized.maxFollowers = parseMax(
      maxFollowers ?? minFollowers,
      'maxFollowers'
    );
    normalized.maxFollowing = parseMax(
      maxFollowing ?? minFollowing,
      'maxFollowing'
    );
    normalized.maxRepos = parseMax(maxRepos ?? minRepos, 'maxRepos');

    if (page != null) {
      const parsed = Number(page);
      if (!Number.isInteger(parsed) || parsed < 1) {
        throw new ValidationError('"page" must be a positive integer.');
      }
      normalized.page = parsed;
    }

    if (limit != null) {
      const parsed = Number(limit);
      if (!Number.isInteger(parsed) || parsed < 1 || parsed > MAX_LIMIT) {
        throw new ValidationError(
          `"limit" must be an integer between 1 and ${MAX_LIMIT}.`
        );
      }
      normalized.limit = parsed;
    }

    return normalized;
  }

  /**
   * Cache key derived from normalized search params.
   */
  _cacheKey(params) {
    return JSON.stringify(params);
  }

  /**
   * Fetch latest commit metadata for card/list display (2 API calls).
   */
  async _fetchLightActivity(username, accountCreatedAt) {
    try {
      const { data: repos } = await this.client.get(`/users/${username}/repos`, {
        params: { sort: 'pushed', per_page: 1 },
      });
      if (!repos?.length) {
        return {
          accountCreatedAt,
          lastCommitAt: null,
          lastCommitFrom: null,
          lastCommitEmail: null,
          lastCommitMessage: null,
          lastCommitUrl: null,
          lastCommitPatchUrl: null,
          recentCommits: [],
        };
      }

      const repo = repos[0];
      const owner = repo.owner?.login || username;
      const latestCommit = await this._fetchLatestCommit(
        owner,
        repo.name,
        username
      );

      return {
        accountCreatedAt,
        lastCommitAt: latestCommit?.date || null,
        lastCommitFrom: latestCommit?.from || null,
        lastCommitEmail: latestCommit?.email || null,
        lastCommitMessage: latestCommit?.message || null,
        lastCommitUrl: latestCommit?.url || null,
        lastCommitPatchUrl: latestCommit?.patchUrl || null,
        recentCommits: latestCommit ? [latestCommit] : [],
      };
    } catch {
      return {
        accountCreatedAt,
        lastCommitAt: null,
        lastCommitFrom: null,
        lastCommitEmail: null,
        lastCommitMessage: null,
        lastCommitUrl: null,
        lastCommitPatchUrl: null,
        recentCommits: [],
      };
    }
  }

  /**
   * Profile + commit summary for search result cards/lists.
   */
  async _enrichSearchResultLight(item, searchType) {
    const isOrg = searchType === 'group';
    const endpoint = isOrg ? `/orgs/${item.login}` : `/users/${item.login}`;
    const { data } = await this.client.get(endpoint);

    if (isOrg) {
      return mapUserProfile(
        {
          login: data.login,
          name: data.name || data.login,
          html_url: data.html_url,
          avatar_url: data.avatar_url,
          bio: data.description,
          location: data.location,
          email: null,
          company: null,
          twitter_username: data.twitter_username,
          blog: data.blog,
          followers: 0,
          following: 0,
          public_repos: data.public_repos,
          created_at: data.created_at,
        },
        {
          primaryLanguage: null,
          languages: [],
          repositories: [],
          activity: {
            accountCreatedAt: data.created_at,
            lastCommitAt: null,
            lastCommitFrom: null,
            lastCommitEmail: null,
            lastCommitMessage: null,
            lastCommitUrl: null,
            lastCommitPatchUrl: null,
            recentCommits: [],
          },
        }
      );
    }

    const activity = await this._fetchLightActivity(data.login, data.created_at);

    return mapUserProfile(data, {
      primaryLanguage: null,
      languages: [],
      repositories: [],
      activity,
    });
  }

  /**
   * Latest commit by user in a repository (patch-style From + Date).
   */
  async _fetchLatestCommit(owner, repoName, username) {
    try {
      const { data } = await this.client.get(
        `/repos/${owner}/${repoName}/commits`,
        { params: { author: username, per_page: 1 } }
      );
      return mapCommitSummary(data[0], owner, repoName);
    } catch {
      return null;
    }
  }

  async _buildRepoSummaries(repos, username, repoLimit) {
    const topRepos = repos.slice(0, repoLimit);
    const commitLimit = Math.min(5, topRepos.length);

    const summaries = await mapWithConcurrency(
      topRepos,
      3,
      async (repo) => {
        const owner = repo.owner?.login || username;
        const latestCommit =
          topRepos.indexOf(repo) < commitLimit
            ? await this._fetchLatestCommit(owner, repo.name, username)
            : null;

        return {
          name: repo.name,
          language: repo.language,
          stars: repo.stargazers_count,
          url: repo.html_url,
          description: repo.description,
          createdAt: repo.created_at,
          pushedAt: repo.pushed_at,
          latestCommit,
        };
      }
    );

    return summaries;
  }

  _buildActivitySummary(user, repoSummaries) {
    const commits = repoSummaries
      .map((r) => r.latestCommit)
      .filter(Boolean)
      .sort((a, b) => new Date(b.date) - new Date(a.date));

    const latest = commits[0] || null;

    return {
      accountCreatedAt: user.created_at,
      lastCommitAt: latest?.date || null,
      lastCommitFrom: latest?.from || null,
      lastCommitEmail: latest?.email || null,
      lastCommitMessage: latest?.message || null,
      lastCommitUrl: latest?.url || null,
      lastCommitPatchUrl: latest?.patchUrl || null,
      recentCommits: commits.slice(0, 5),
    };
  }

  /**
   * Full profile + repos + commit metadata for lookup and detail views.
   */
  async _enrichUser(item, { repoLimit = 10 } = {}) {
    const [{ data: user }, { data: repos }] = await Promise.all([
      this.client.get(`/users/${item.login}`),
      this.client
        .get(`/users/${item.login}/repos`, {
          params: { sort: 'pushed', per_page: 30 },
        })
        .catch(() => ({ data: [] })),
    ]);

    const primaryLanguage = derivePrimaryLanguage(repos);
    const repoSummaries = await this._buildRepoSummaries(
      repos,
      user.login,
      repoLimit
    );

    return mapUserProfile(user, {
      primaryLanguage,
      languages: Object.keys(
        repos.reduce((acc, r) => {
          if (r.language) acc[r.language] = true;
          return acc;
        }, {})
      ),
      repositories: repoSummaries,
      activity: this._buildActivitySummary(user, repoSummaries),
    });
  }

  _passesMaxFilters(profile, { maxFollowing }) {
    if (maxFollowing != null && profile.following > maxFollowing) return false;
    return true;
  }

  /**
   * Search GitHub users with cursor-style page support for infinite scroll.
   * Each request returns up to `limit` users. Client passes `page` (1-based)
   * to load the next batch. GitHub Search allows max 1000 results total.
   */
  async searchUsers(rawParams) {
    const params = this.normalizeParams(rawParams);
    const cacheKey = this._cacheKey(params);

    const cached = this.cache.get(cacheKey);
    if (cached) {
      return { ...cached, cached: true };
    }

    const query = buildSearchQuery(params);
    const collected = [];
    const seenUsernames = new Set();

    // Map client page → GitHub search page range.
    // Each client page requests `limit` users; we scan GitHub pages as needed.
    const githubPagesPerClientPage = Math.max(
      1,
      Math.ceil(params.limit / GITHUB_SEARCH_PER_PAGE)
    );
    const startGithubPage =
      (params.page - 1) * githubPagesPerClientPage + 1;

    let totalCount = 0;
    let lastGithubPageFetched = startGithubPage - 1;
    let githubExhausted = false;

    for (
      let offset = 0;
      offset < MAX_INTERNAL_SEARCH_PAGES &&
      collected.length < params.limit &&
      !githubExhausted;
      offset += 1
    ) {
      const githubPage = startGithubPage + offset;
      if (githubPage > 34) break; // GitHub max ~1000 results at 30/page

      const searchResponse = await this.client.get('/search/users', {
        params: {
          q: query,
          per_page: GITHUB_SEARCH_PER_PAGE,
          page: githubPage,
        },
      });

      totalCount = searchResponse.data.total_count || 0;
      const items = searchResponse.data.items || [];
      lastGithubPageFetched = githubPage;

      if (items.length === 0) {
        githubExhausted = true;
        break;
      }

      const profiles = await mapWithConcurrency(
        items,
        DETAIL_CONCURRENCY,
        (item) => this._enrichSearchResultLight(item, params.type)
      );

      for (const profile of profiles) {
        if (seenUsernames.has(profile.username)) continue;
        if (!this._passesMaxFilters(profile, params)) continue;

        seenUsernames.add(profile.username);
        collected.push(profile);
        if (collected.length >= params.limit) break;
      }

      if (items.length < GITHUB_SEARCH_PER_PAGE) {
        githubExhausted = true;
      }
    }

    collected.sort((a, b) => b.followers - a.followers);
    const users = collected.slice(0, params.limit);

    const maxGithubResults = Math.min(totalCount, 1000);
    const consumedGithubPages =
      lastGithubPageFetched - startGithubPage + 1;
    const hasMore =
      lastGithubPageFetched > 0 &&
      lastGithubPageFetched * GITHUB_SEARCH_PER_PAGE < maxGithubResults;

    const result = {
      count: users.length,
      totalCount: maxGithubResults,
      page: params.page,
      perPage: params.limit,
      hasMore,
      nextPage: hasMore ? params.page + 1 : null,
      users,
      query,
      meta: {
        githubPagesScanned: Math.max(0, consumedGithubPages),
        githubPageStart: startGithubPage,
        githubPageEnd: lastGithubPageFetched,
      },
    };

    this.cache.set(cacheKey, result);
    return result;
  }

  /**
   * Fetch full user profile with repositories (for detail drawer).
   */
  async getUserDetails(username) {
    const login = (username || '').trim();
    if (!login) {
      throw new ValidationError('Username is required.');
    }

    const cacheKey = `user:${login.toLowerCase()}`;
    const cached = this.cache.get(cacheKey);
    if (cached) {
      return { ...cached, cached: true };
    }

    const profile = await this._enrichUser({ login }, { repoLimit: 30 });
    const result = {
      user: profile,
      projects: profile.repositories,
    };

    this.cache.set(cacheKey, result);
    return result;
  }

  /**
   * Look up a single GitHub user by public email or username.
   * Email search only finds users who expose that email on their profile.
   */
  async lookupUser(body = {}) {
    const input = (body.email || body.query || '').trim();
    if (!input) {
      throw new ValidationError('Field "email" is required.');
    }

    const cacheKey = `lookup:${input.toLowerCase()}`;
    const cached = this.cache.get(cacheKey);
    if (cached) {
      return { ...cached, cached: true };
    }

    let profile;

    if (input.includes('@')) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input)) {
        throw new ValidationError('Invalid email format.');
      }

      const searchResponse = await this.client.get('/search/users', {
        params: { q: `${input} in:email`, per_page: 5 },
      });

      const items = searchResponse.data.items || [];
      if (items.length === 0) {
        throw new NotFoundError(
          'No GitHub user found with this public email. The email may be private or not linked to a GitHub account.'
        );
      }

      for (const item of items) {
        const candidate = await this._enrichUser(item, { repoLimit: 30 });
        if (candidate.email?.toLowerCase() === input.toLowerCase()) {
          profile = candidate;
          break;
        }
      }

      if (!profile) {
        profile = await this._enrichUser(items[0], { repoLimit: 30 });
      }
    } else {
      try {
        const { data: user } = await this.client.get(
          `/users/${encodeURIComponent(input)}`
        );
        profile = await this._enrichUser({ login: user.login }, { repoLimit: 30 });
      } catch (error) {
        if (error.statusCode === 404) {
          throw new NotFoundError(`GitHub user "${input}" not found.`);
        }
        throw error;
      }
    }

    const result = {
      user: profile,
      projects: profile.repositories,
    };

    this.cache.set(cacheKey, result);
    return result;
  }
}

module.exports = GitHubService;
