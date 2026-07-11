import { hasPermission, type WorkspaceRole } from '@/types/collaboration'
import { useWorkspaceStore } from '@/stores/useWorkspaceStore'

export function usePermissions() {
  const role = useWorkspaceStore((s) => s.getActiveRole())

  return {
    role,
    can: (permission: string) => (role ? hasPermission(role, permission) : true),
    canWriteProspects: role ? hasPermission(role, 'prospects:write') : true,
    canDeleteProspects: role ? hasPermission(role, 'prospects:delete') : true,
    canInviteMembers: role ? hasPermission(role, 'members:invite') : false,
    canManageMembers: role ? hasPermission(role, 'members:update') : false,
    canWriteComments: role ? hasPermission(role, 'comments:write') : true,
    canReadAudit: role ? hasPermission(role, 'audit:read') : false,
    canManageIntegrations: role ? hasPermission(role, 'integrations:write') : true,
    canSyncIntegrations: role ? hasPermission(role, 'integrations:sync') : true,
    isViewer: role === 'viewer',
  }
}

export function useRole(): WorkspaceRole | null {
  return useWorkspaceStore((s) => s.getActiveRole())
}
