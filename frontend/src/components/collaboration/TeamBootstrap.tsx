import { useEffect } from 'react'
import { useAuthStore } from '@/stores/useAuthStore'
import { useWorkspaceStore } from '@/stores/useWorkspaceStore'

export function TeamBootstrap() {
  const token = useAuthStore((s) => s.token)
  const hydrated = useAuthStore((s) => s.hydrated)
  const restoreSession = useAuthStore((s) => s.restoreSession)
  const loadWorkspaces = useWorkspaceStore((s) => s.loadWorkspaces)
  const refreshNotifications = useWorkspaceStore((s) => s.refreshNotifications)

  useEffect(() => {
    if (!hydrated) return
    if (!token) return
    void (async () => {
      await restoreSession()
      await loadWorkspaces()
      await refreshNotifications()
    })()
  }, [hydrated, token, restoreSession, loadWorkspaces, refreshNotifications])

  useEffect(() => {
    if (!token) return
    const interval = setInterval(() => {
      void refreshNotifications()
    }, 60_000)
    return () => clearInterval(interval)
  }, [token, refreshNotifications])

  return null
}
