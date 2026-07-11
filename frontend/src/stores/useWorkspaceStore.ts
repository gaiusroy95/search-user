import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  createWorkspace,
  createWorkspaceProspect,
  deleteWorkspaceProspect,
  fetchAuditLogs,
  fetchMembers,
  fetchNotifications,
  fetchWorkspaceProspects,
  fetchWorkspaces,
  inviteMember,
  markAllNotificationsRead,
  markNotificationRead,
  patchWorkspaceProspect,
  removeMember,
  updateMemberRole,
} from '@/services/collaborationApi'
import { normalizeProspect } from '@/lib/pipeline'
import { useProspectStore } from '@/stores/useProspectStore'
import type {
  AuditLogEntry,
  Workspace,
  WorkspaceMember,
  WorkspaceNotification,
  WorkspaceRole,
} from '@/types/collaboration'
import type { Prospect } from '@/types'

interface WorkspaceState {
  workspaces: Workspace[]
  activeWorkspaceId: string | null
  members: WorkspaceMember[]
  notifications: WorkspaceNotification[]
  auditLogs: AuditLogEntry[]
  syncing: boolean
  setActiveWorkspace: (workspaceId: string) => Promise<void>
  loadWorkspaces: () => Promise<void>
  createTeamWorkspace: (name: string) => Promise<void>
  syncSharedPipeline: () => Promise<void>
  pushProspect: (prospect: Prospect) => Promise<void>
  pushProspectPatch: (id: string, patch: Partial<Prospect>) => Promise<void>
  pushProspectRemove: (id: string) => Promise<void>
  loadMembers: () => Promise<void>
  inviteTeamMember: (email: string, role: WorkspaceRole) => Promise<void>
  changeMemberRole: (memberId: string, role: WorkspaceRole) => Promise<void>
  removeTeamMember: (memberId: string) => Promise<void>
  refreshNotifications: () => Promise<void>
  readNotification: (id: string) => Promise<void>
  readAllNotifications: () => Promise<void>
  loadAuditLogs: () => Promise<void>
  getActiveWorkspace: () => Workspace | null
  getActiveRole: () => WorkspaceRole | null
}

export const useWorkspaceStore = create<WorkspaceState>()(
  persist(
    (set, get) => ({
      workspaces: [],
      activeWorkspaceId: null,
      members: [],
      notifications: [],
      auditLogs: [],
      syncing: false,

      getActiveWorkspace: () => {
        const { workspaces, activeWorkspaceId } = get()
        return workspaces.find((w) => w.id === activeWorkspaceId) ?? null
      },

      getActiveRole: () => get().getActiveWorkspace()?.role ?? null,

      setActiveWorkspace: async (workspaceId) => {
        set({ activeWorkspaceId: workspaceId })
        await get().syncSharedPipeline()
        await get().refreshNotifications()
        await get().loadMembers()
      },

      loadWorkspaces: async () => {
        const workspaces = await fetchWorkspaces()
        set({ workspaces })
        const { activeWorkspaceId } = get()
        if (!activeWorkspaceId && workspaces[0]) {
          await get().setActiveWorkspace(workspaces[0].id)
        } else if (activeWorkspaceId) {
          await get().syncSharedPipeline()
        }
      },

      createTeamWorkspace: async (name) => {
        const workspace = await createWorkspace(name)
        set((s) => ({
          workspaces: [{ ...workspace, role: 'owner' as WorkspaceRole }, ...s.workspaces],
          activeWorkspaceId: workspace.id,
        }))
        await get().syncSharedPipeline()
      },

      syncSharedPipeline: async () => {
        const workspaceId = get().activeWorkspaceId
        if (!workspaceId) return
        set({ syncing: true })
        try {
          const prospects = await fetchWorkspaceProspects(workspaceId)
          useProspectStore.setState({
            prospects: prospects.map((p) => normalizeProspect(p)),
          })
        } finally {
          set({ syncing: false })
        }
      },

      pushProspect: async (prospect) => {
        const workspaceId = get().activeWorkspaceId
        if (!workspaceId) return
        await createWorkspaceProspect(workspaceId, prospect)
        await get().syncSharedPipeline()
      },

      pushProspectPatch: async (id, patch) => {
        const workspaceId = get().activeWorkspaceId
        if (!workspaceId) return
        await patchWorkspaceProspect(workspaceId, id, patch)
        await get().syncSharedPipeline()
      },

      pushProspectRemove: async (id) => {
        const workspaceId = get().activeWorkspaceId
        if (!workspaceId) return
        await deleteWorkspaceProspect(workspaceId, id)
        await get().syncSharedPipeline()
      },

      loadMembers: async () => {
        const workspaceId = get().activeWorkspaceId
        if (!workspaceId) return
        const members = await fetchMembers(workspaceId)
        set({ members })
      },

      inviteTeamMember: async (email, role) => {
        const workspaceId = get().activeWorkspaceId
        if (!workspaceId) return
        await inviteMember(workspaceId, email, role)
        await get().loadMembers()
      },

      changeMemberRole: async (memberId, role) => {
        const workspaceId = get().activeWorkspaceId
        if (!workspaceId) return
        await updateMemberRole(workspaceId, memberId, role)
        await get().loadMembers()
      },

      removeTeamMember: async (memberId) => {
        const workspaceId = get().activeWorkspaceId
        if (!workspaceId) return
        await removeMember(workspaceId, memberId)
        await get().loadMembers()
      },

      refreshNotifications: async () => {
        const workspaceId = get().activeWorkspaceId
        if (!workspaceId) return
        const notifications = await fetchNotifications(workspaceId)
        set({ notifications })
      },

      readNotification: async (id) => {
        const workspaceId = get().activeWorkspaceId
        if (!workspaceId) return
        await markNotificationRead(workspaceId, id)
        await get().refreshNotifications()
      },

      readAllNotifications: async () => {
        const workspaceId = get().activeWorkspaceId
        if (!workspaceId) return
        await markAllNotificationsRead(workspaceId)
        await get().refreshNotifications()
      },

      loadAuditLogs: async () => {
        const workspaceId = get().activeWorkspaceId
        if (!workspaceId) return
        const logs = await fetchAuditLogs(workspaceId)
        set({ auditLogs: logs })
      },
    }),
    {
      name: 'github-discovery-workspace',
      partialize: (s) => ({
        activeWorkspaceId: s.activeWorkspaceId,
      }),
    }
  )
)
