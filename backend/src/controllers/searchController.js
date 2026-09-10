const GitHubService = require('../services/githubService');
const { AppError } = require('../utils/errors');
class SearchController {
  constructor(githubService) {
    this.githubService = githubService;
  }

  /**
   * POST /search-users body:
   * { country, stack?, query?, skill?, role?, tech?, company?, maxFollowers?, maxFollowing?, maxRepos?, type?, limit?, page? }
   */
  getUserDetails = async (req, res, next) => {
    try {
      const result = await this.githubService.getUserDetails(req.params.username);
      res.json({
        user: result.user,
        projects: result.projects,
        ...(result.cached ? { cached: true } : {}),
      });
    } catch (error) {
      next(error);
    }
  };

  lookupUser = async (req, res, next) => {
    try {
      const result = await this.githubService.lookupUser(req.body);
      res.json({
        user: result.user,
        projects: result.projects,
        ...(result.cached ? { cached: true } : {}),
      });
    } catch (error) {
      next(error);
    }
  };

  searchUsers = async (req, res, next) => {
    try {
      const result = await this.githubService.searchUsers(req.body);

      res.json({
        count: result.count,
        totalCount: result.totalCount,
        page: result.page,
        perPage: result.perPage,
        hasMore: result.hasMore,
        nextPage: result.nextPage,
        users: result.users,
        ...(result.cached ? { cached: true } : {}),
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /health — liveness check + Demon Runner ownership flag (RUN_ON).
   */
  health = async (_req, res, next) => {
    const runOn = String(process.env.RUN_ON || '')
      .trim()
      .toLowerCase() === 'true';

    try {
      const {
        hasGitHubToken,
        getGitHubTokenStatus,
        createGitHubClient,
      } = require('../utils/githubClient');
      const tokenConfigured = hasGitHubToken();
      const tokens = getGitHubTokenStatus();
      let githubReachable = false;

      if (tokenConfigured) {
        const client = createGitHubClient();
        await client.get('/rate_limit');
        githubReachable = true;
      }

      res.json({
        status: 'ok',
        RUN_ON: runOn,
        tokenConfigured,
        tokens,
        githubReachable,
      });
    } catch (error) {
      const {
        hasGitHubToken,
        getGitHubTokenStatus,
      } = require('../utils/githubClient');
      res.status(503).json({
        status: 'degraded',
        RUN_ON: runOn,
        tokenConfigured: hasGitHubToken(),
        tokens: getGitHubTokenStatus(),
        githubReachable: false,
        error: error.message,
      });
    }
  };
}

function createSearchController(cacheService) {
  const githubService = new GitHubService(cacheService);
  return new SearchController(githubService);
}

module.exports = { SearchController, createSearchController };
