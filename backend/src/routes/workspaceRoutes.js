const express = require('express')

function registerWorkspaceRoutes(app, workspaceController, middleware) {
  const { authMiddleware, loadWorkspaceMembership, requirePermission } = middleware
  const router = express.Router()

  router.get('/workspaces', authMiddleware, workspaceController.listMine)
  router.post('/workspaces', authMiddleware, workspaceController.create)

  const wsRouter = express.Router({ mergeParams: true })

  wsRouter.get('/', workspaceController.get)
  wsRouter.get('/members', requirePermission('members:read'), workspaceController.listMembers)
  wsRouter.post(
    '/members',
    requirePermission('members:invite'),
    workspaceController.inviteMember
  )
  wsRouter.patch(
    '/members/:memberId',
    requirePermission('members:update'),
    workspaceController.updateMember
  )
  wsRouter.delete(
    '/members/:memberId',
    requirePermission('members:remove'),
    workspaceController.removeMember
  )

  wsRouter.get('/prospects', requirePermission('prospects:read'), workspaceController.listProspects)
  wsRouter.post('/prospects', requirePermission('prospects:write'), workspaceController.addProspect)
  wsRouter.patch(
    '/prospects/:prospectId',
    requirePermission('prospects:write'),
    workspaceController.updateProspect
  )
  wsRouter.delete(
    '/prospects/:prospectId',
    requirePermission('prospects:delete'),
    workspaceController.deleteProspect
  )

  wsRouter.get(
    '/prospects/:prospectId/comments',
    requirePermission('comments:read'),
    workspaceController.listComments
  )
  wsRouter.post(
    '/prospects/:prospectId/comments',
    requirePermission('comments:write'),
    workspaceController.addComment
  )

  wsRouter.get(
    '/notifications',
    requirePermission('notifications:read'),
    workspaceController.listNotifications
  )
  wsRouter.patch(
    '/notifications/read-all',
    requirePermission('notifications:read'),
    workspaceController.markAllNotificationsRead
  )
  wsRouter.patch(
    '/notifications/:notificationId/read',
    requirePermission('notifications:read'),
    workspaceController.markNotificationRead
  )

  wsRouter.get('/audit', requirePermission('audit:read'), workspaceController.listAudit)

  router.use('/workspaces/:workspaceId', authMiddleware, loadWorkspaceMembership, wsRouter)

  app.use(router)
}

module.exports = registerWorkspaceRoutes
