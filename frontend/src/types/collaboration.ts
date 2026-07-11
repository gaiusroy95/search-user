export type WorkspaceRole = 'owner' | 'admin' | 'recruiter' | 'viewer'

export interface AuthUser {
  id: string
  email: string
  name: string
  createdAt: string
}

export interface Workspace {
  id: string
  name: string
  slug: string
  ownerId: string
  createdAt: string
  role?: WorkspaceRole
  memberCount?: number
}

export interface WorkspaceMember {
  id: string
  workspaceId: string
  userId: string
  role: WorkspaceRole
  joinedAt: string
  user: AuthUser | null
}

export interface ProspectComment {
  id: string
  workspaceId: string
  prospectId: string
  userId: string
  body: string
  mentions: string[]
  createdAt: string
  author?: AuthUser | null
}

export interface WorkspaceNotification {
  id: string
  workspaceId: string
  userId: string
  type: string
  title: string
  body: string
  href?: string
  read: boolean
  createdAt: string
}

export interface AuditLogEntry {
  id: string
  workspaceId: string
  userId: string
  action: string
  resource: string
  resourceId: string
  details: Record<string, unknown>
  at: string
  actor?: AuthUser | null
}

export const ROLE_LABELS: Record<WorkspaceRole, string> = {
  owner: 'Owner',
  admin: 'Admin',
  recruiter: 'Recruiter',
  viewer: 'Viewer',
}

export const PERMISSIONS = {
  owner: ['*'],
  admin: [
    'prospects:write',
    'prospects:delete',
    'members:invite',
    'members:update',
    'comments:write',
    'audit:read',
    'integrations:read',
    'integrations:write',
    'integrations:sync',
  ],
  recruiter: ['prospects:write', 'comments:write', 'integrations:read', 'integrations:sync'],
  viewer: ['integrations:read'],
} as const

export function hasPermission(role: WorkspaceRole, permission: string): boolean {
  if (role === 'owner') return true
  const list = PERMISSIONS[role] as readonly string[]
  if (list.includes(permission)) return true
  const [resource] = permission.split(':')
  return list.includes(`${resource}:*`)
}
