const express = require('express')

function registerIntegrationRoutes(app, controller, middleware) {
  const { authMiddleware, loadWorkspaceMembership, requirePermission } = middleware

  app.get('/integrations/providers', controller.listProviders)
  app.get('/integrations/oauth/callback/:provider', controller.oauthCallback)

  const router = express.Router({ mergeParams: true })

  router.get('/', requirePermission('integrations:read'), controller.listConnections)
  router.post('/:provider/connect', requirePermission('integrations:write'), controller.connect)
  router.delete('/:provider', requirePermission('integrations:write'), controller.disconnect)
  router.post('/:provider/sync', requirePermission('integrations:sync'), controller.triggerSync)
  router.get('/sync-history', requirePermission('integrations:read'), controller.syncHistory)
  router.get('/jobs', requirePermission('integrations:read'), controller.listJobs)
  router.post('/jobs/:jobId/retry', requirePermission('integrations:sync'), controller.retryJob)

  app.use(
    '/workspaces/:workspaceId/integrations',
    authMiddleware,
    loadWorkspaceMembership,
    router
  )
}

module.exports = registerIntegrationRoutes
