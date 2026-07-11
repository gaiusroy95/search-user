const {
  listWorkspacesForUser,
  createWorkspace,
  getWorkspace,
  listMembers,
  inviteMember,
  updateMemberRole,
  removeMember,
  listProspects,
  addProspect,
  updateProspect,
  deleteProspect,
  listComments,
  addComment,
  listNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  listAuditLogs,
} = require('../services/collaborationStore')
const { canManageRole } = require('../constants/permissions')

function createWorkspaceController() {
  return {
    listMine(req, res, next) {
      try {
        res.json({ workspaces: listWorkspacesForUser(req.user.id) })
      } catch (err) {
        next(err)
      }
    },

    create(req, res, next) {
      try {
        const { name } = req.body || {}
        if (!name?.trim()) return res.status(400).json({ error: 'Workspace name required' })
        const workspace = createWorkspace({ name: name.trim(), ownerId: req.user.id })
        res.status(201).json({ workspace })
      } catch (err) {
        next(err)
      }
    },

    get(req, res, next) {
      try {
        const workspace = getWorkspace(req.workspaceId)
        if (!workspace) return res.status(404).json({ error: 'Workspace not found' })
        res.json({ workspace, role: req.membership.role })
      } catch (err) {
        next(err)
      }
    },

    listMembers(req, res, next) {
      try {
        res.json({ members: listMembers(req.workspaceId) })
      } catch (err) {
        next(err)
      }
    },

    inviteMember(req, res, next) {
      try {
        const { email, role = 'recruiter' } = req.body || {}
        if (!email?.trim()) return res.status(400).json({ error: 'Email required' })
        if (!canManageRole(req.membership.role, role)) {
          return res.status(403).json({ error: 'Cannot assign this role' })
        }
        const member = inviteMember({
          workspaceId: req.workspaceId,
          email: email.trim(),
          role,
          actorId: req.user.id,
        })
        res.status(201).json({ member })
      } catch (err) {
        next(err)
      }
    },

    updateMember(req, res, next) {
      try {
        const { role } = req.body || {}
        if (!role) return res.status(400).json({ error: 'Role required' })
        if (!canManageRole(req.membership.role, role)) {
          return res.status(403).json({ error: 'Cannot assign this role' })
        }
        const member = updateMemberRole({
          workspaceId: req.workspaceId,
          membershipId: req.params.memberId,
          role,
          actorId: req.user.id,
        })
        res.json({ member })
      } catch (err) {
        next(err)
      }
    },

    removeMember(req, res, next) {
      try {
        removeMember({
          workspaceId: req.workspaceId,
          membershipId: req.params.memberId,
          actorId: req.user.id,
        })
        res.json({ ok: true })
      } catch (err) {
        next(err)
      }
    },

    listProspects(req, res, next) {
      try {
        res.json({ prospects: listProspects(req.workspaceId) })
      } catch (err) {
        next(err)
      }
    },

    addProspect(req, res, next) {
      try {
        const { prospect } = req.body || {}
        if (!prospect?.username) return res.status(400).json({ error: 'Prospect data required' })
        const saved = addProspect({
          workspaceId: req.workspaceId,
          prospect,
          actorId: req.user.id,
        })
        res.status(201).json({ prospect: saved })
      } catch (err) {
        next(err)
      }
    },

    updateProspect(req, res, next) {
      try {
        const prospect = updateProspect({
          workspaceId: req.workspaceId,
          prospectId: req.params.prospectId,
          patch: req.body || {},
          actorId: req.user.id,
        })
        res.json({ prospect })
      } catch (err) {
        next(err)
      }
    },

    deleteProspect(req, res, next) {
      try {
        deleteProspect({
          workspaceId: req.workspaceId,
          prospectId: req.params.prospectId,
          actorId: req.user.id,
        })
        res.json({ ok: true })
      } catch (err) {
        next(err)
      }
    },

    listComments(req, res, next) {
      try {
        res.json({
          comments: listComments(req.workspaceId, req.params.prospectId),
        })
      } catch (err) {
        next(err)
      }
    },

    addComment(req, res, next) {
      try {
        const { body } = req.body || {}
        if (!body?.trim()) return res.status(400).json({ error: 'Comment body required' })
        const comment = addComment({
          workspaceId: req.workspaceId,
          prospectId: req.params.prospectId,
          userId: req.user.id,
          body: body.trim(),
        })
        res.status(201).json({ comment })
      } catch (err) {
        next(err)
      }
    },

    listNotifications(req, res, next) {
      try {
        res.json({
          notifications: listNotifications(req.workspaceId, req.user.id),
        })
      } catch (err) {
        next(err)
      }
    },

    markNotificationRead(req, res, next) {
      try {
        const notification = markNotificationRead(
          req.workspaceId,
          req.user.id,
          req.params.notificationId
        )
        res.json({ notification })
      } catch (err) {
        next(err)
      }
    },

    markAllNotificationsRead(req, res, next) {
      try {
        markAllNotificationsRead(req.workspaceId, req.user.id)
        res.json({ ok: true })
      } catch (err) {
        next(err)
      }
    },

    listAudit(req, res, next) {
      try {
        res.json({ logs: listAuditLogs(req.workspaceId) })
      } catch (err) {
        next(err)
      }
    },
  }
}

module.exports = { createWorkspaceController }
