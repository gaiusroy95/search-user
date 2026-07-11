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
   * GET /health — liveness check.
   */
  health = async (_req, res, next) => {
    try {
      const tokenConfigured = Boolean(process.env.GITHUB_TOKEN);
      let githubReachable = false;

      if (tokenConfigured) {
        const client = require('../utils/githubClient').createGitHubClient();
        await client.get('/rate_limit');
        githubReachable = true;
      }

      res.json({
        status: 'ok',
        tokenConfigured,
        githubReachable,
      });
    } catch (error) {
      res.status(503).json({
        status: 'degraded',
        tokenConfigured: Boolean(process.env.GITHUB_TOKEN),
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
