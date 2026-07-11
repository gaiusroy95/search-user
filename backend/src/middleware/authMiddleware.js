const { verifyToken } = require('../services/authService')
const { getMembership } = require('../services/collaborationStore')
const { hasPermission } = require('../constants/permissions')
const { AppError } = require('../utils/errors')

function authMiddleware(req, res, next) {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null
  if (!token) {
    return next(new AppError('Authentication required', 401))
  }
  const payload = verifyToken(token)
  if (!payload) {
    return next(new AppError('Invalid or expired token', 401))
  }
  req.user = { id: payload.userId }
  next()
}

function optionalAuth(req, _res, next) {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null
  if (token) {
    const payload = verifyToken(token)
    if (payload) req.user = { id: payload.userId }
  }
  next()
}

function loadWorkspaceMembership(req, res, next) {
  const workspaceId = req.params.workspaceId
  if (!req.user?.id) {
    return next(new AppError('Authentication required', 401))
  }
  const membership = getMembership(workspaceId, req.user.id)
  if (!membership) {
    return next(new AppError('Workspace access denied', 403))
  }
  req.workspaceId = workspaceId
  req.membership = membership
  next()
}

function requirePermission(permission) {
  return (req, res, next) => {
    if (!req.membership) {
      return next(new AppError('Workspace membership required', 403))
    }
    if (!hasPermission(req.membership.role, permission)) {
      return next(new AppError('Insufficient permissions', 403))
    }
    next()
  }
}

module.exports = {
  authMiddleware,
  optionalAuth,
  loadWorkspaceMembership,
  requirePermission,
}
