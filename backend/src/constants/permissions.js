const ROLES = ['owner', 'admin', 'recruiter', 'viewer']

const ROLE_PERMISSIONS = {
  owner: ['*'],
  admin: [
    'workspace:read',
    'workspace:update',
    'members:read',
    'members:invite',
    'members:update',
    'members:remove',
    'prospects:read',
    'prospects:write',
    'prospects:delete',
    'comments:read',
    'comments:write',
    'comments:delete',
    'notifications:read',
    'audit:read',
    'integrations:read',
    'integrations:write',
    'integrations:sync',
  ],
  recruiter: [
    'workspace:read',
    'members:read',
    'prospects:read',
    'prospects:write',
    'comments:read',
    'comments:write',
    'notifications:read',
    'integrations:read',
    'integrations:sync',
  ],
  viewer: [
    'workspace:read',
    'members:read',
    'prospects:read',
    'comments:read',
    'notifications:read',
    'audit:read',
    'integrations:read',
  ],
}

function hasPermission(role, permission) {
  const allowed = ROLE_PERMISSIONS[role] ?? []
  if (allowed.includes('*')) return true
  if (allowed.includes(permission)) return true
  const [resource] = permission.split(':')
  return allowed.includes(`${resource}:*`)
}

function canManageRole(actorRole, targetRole) {
  if (actorRole === 'owner') return targetRole !== 'owner'
  if (actorRole === 'admin') return targetRole === 'recruiter' || targetRole === 'viewer'
  return false
}

module.exports = { ROLES, ROLE_PERMISSIONS, hasPermission, canManageRole }
