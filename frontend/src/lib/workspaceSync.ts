import { useAuthStore } from '@/stores/useAuthStore'
import { useWorkspaceStore } from '@/stores/useWorkspaceStore'
import type { Prospect } from '@/types'

export function isTeamModeActive(): boolean {
  return Boolean(useAuthStore.getState().token && useWorkspaceStore.getState().activeWorkspaceId)
}

export async function syncProspectToTeam(
  action: 'create' | 'update' | 'delete',
  prospect?: Prospect,
  id?: string,
  patch?: Partial<Prospect>
) {
  if (!useAuthStore.getState().token) return
  const ws = useWorkspaceStore.getState()
  if (!ws.activeWorkspaceId) return

  try {
    if (action === 'create' && prospect) await ws.pushProspect(prospect)
    if (action === 'update' && id && patch) await ws.pushProspectPatch(id, patch)
    if (action === 'delete' && id) await ws.pushProspectRemove(id)
  } catch {
    // Local state remains; user can retry sync
  }
}
