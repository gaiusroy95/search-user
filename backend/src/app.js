require('dotenv').config();

const express = require('express');
const cors = require('cors');
const CacheService = require('./services/cacheService');
const { createSearchController } = require('./controllers/searchController');
const { createVaultController } = require('./controllers/vaultController');
const { createChatController } = require('./controllers/chatController');
const { createCopilotController } = require('./controllers/copilotController');
const { createAuthController } = require('./controllers/authController');
const { createWorkspaceController } = require('./controllers/workspaceController');
const { createIntegrationController } = require('./controllers/integrationController');
const registerSearchRoutes = require('./routes/searchRoutes');
const registerVaultRoutes = require('./routes/vaultRoutes');
const registerChatRoutes = require('./routes/chatRoutes');
const registerCopilotRoutes = require('./routes/copilotRoutes');
const registerAuthRoutes = require('./routes/authRoutes');
const registerWorkspaceRoutes = require('./routes/workspaceRoutes');
const registerIntegrationRoutes = require('./routes/integrationRoutes');
const { startJobRunner } = require('./services/integrationJobRunner');
const { authMiddleware } = require('./middleware/authMiddleware');
const { AppError } = require('./utils/errors');

const PORT = Number(process.env.PORT) || 3000;
const CACHE_TTL = Number(process.env.CACHE_TTL_SECONDS) || 300;

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN
      ? process.env.CORS_ORIGIN.split(',')
      : ['http://localhost:5173', 'http://127.0.0.1:5173'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  })
);
app.use(express.json({ limit: '2mb' }));

// Shared services
const cacheService = new CacheService(CACHE_TTL);
const searchController = createSearchController(cacheService);
const vaultController = createVaultController();
const chatController = createChatController();
const copilotController = createCopilotController();
const authController = createAuthController();
const workspaceController = createWorkspaceController();
const integrationController = createIntegrationController();

registerSearchRoutes(app, searchController);
registerVaultRoutes(app, vaultController);
registerChatRoutes(app, chatController);
registerCopilotRoutes(app, copilotController);
registerAuthRoutes(app, authController, authMiddleware);
registerWorkspaceRoutes(app, workspaceController, {
  authMiddleware,
  loadWorkspaceMembership: require('./middleware/authMiddleware').loadWorkspaceMembership,
  requirePermission: require('./middleware/authMiddleware').requirePermission,
});
registerIntegrationRoutes(app, integrationController, {
  authMiddleware,
  loadWorkspaceMembership: require('./middleware/authMiddleware').loadWorkspaceMembership,
  requirePermission: require('./middleware/authMiddleware').requirePermission,
});

startJobRunner();

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Global error handler
app.use((err, _req, res, _next) => {
  const statusCode = err.statusCode || 500;
  const payload = {
    error: err.message || 'Internal server error',
  };

  if (err.resetAt) {
    payload.resetAt = err.resetAt;
  }

  if (statusCode === 500 && !(err instanceof AppError) && !err.statusCode) {
    console.error('[unhandled]', err);
  }

  res.status(statusCode).json(payload);
});

const HOST = process.env.HOST || '0.0.0.0';

app.listen(PORT, HOST, () => {
  console.log(`GitHub User Discovery API running on http://localhost:${PORT}`);
  if (HOST === '0.0.0.0') {
    console.log(`LAN access: use your machine IP on port ${PORT}`);
  }
  if (process.env.GITHUB_TOKEN) {
    console.log('GitHub token: configured (5000 req/hr)');
  } else {
    console.warn(
      'WARNING: GITHUB_TOKEN not set in .env — limited to 60 GitHub API calls/hour.'
    );
    console.warn('Add token: https://github.com/settings/tokens');
  }
});

module.exports = app;
