import { useCallback, useEffect, useRef } from 'react'

import { useIntegrationsStore } from '@/stores/useIntegrationsStore'
import { useWorkspaceStore } from '@/stores/useWorkspaceStore'

const POLL_MS = 4000

export function useIntegrations(options?: { poll?: boolean }) {
  const workspaceId = useWorkspaceStore((s) => s.activeWorkspaceId)
  const integrations = useIntegrationsStore((s) => s.integrations)
  const syncRuns = useIntegrationsStore((s) => s.syncRuns)
  const jobs = useIntegrationsStore((s) => s.jobs)
  const loading = useIntegrationsStore((s) => s.loading)
  const syncingProvider = useIntegrationsStore((s) => s.syncingProvider)
  const refreshAll = useIntegrationsStore((s) => s.refreshAll)
  const connect = useIntegrationsStore((s) => s.connect)
  const disconnect = useIntegrationsStore((s) => s.disconnect)
  const sync = useIntegrationsStore((s) => s.sync)
  const retryJob = useIntegrationsStore((s) => s.retryJob)

  const poll = options?.poll ?? true
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const refresh = useCallback(() => {
    if (!workspaceId) return Promise.resolve()
    return refreshAll(workspaceId)
  }, [workspaceId, refreshAll])

  useEffect(() => {
    if (!workspaceId) return
    void refreshAll(workspaceId)
  }, [workspaceId, refreshAll])

  useEffect(() => {
    if (!workspaceId || !poll) return

    pollRef.current = setInterval(() => {
      const state = useIntegrationsStore.getState()
      const hasActiveJobs = state.jobs.some(
        (j) => j.status === 'pending' || j.status === 'processing'
      )
      if (hasActiveJobs) {
        void state.loadJobs(workspaceId)
        void state.loadSyncHistory(workspaceId)
        void state.loadIntegrations(workspaceId)
      }
    }, POLL_MS)

    return () => {
      if (pollRef.current) clearInterval(pollRef.current)
    }
  }, [workspaceId, poll])

  return {
    workspaceId,
    integrations,
    syncRuns,
    jobs,
    loading,
    syncingProvider,
    refresh,
    connect: (provider: string) => (workspaceId ? connect(workspaceId, provider) : Promise.resolve()),
    disconnect: (provider: string) =>
      workspaceId ? disconnect(workspaceId, provider) : Promise.resolve(),
    sync: (provider: string) => (workspaceId ? sync(workspaceId, provider) : Promise.resolve()),
    retryJob: (jobId: string) => (workspaceId ? retryJob(workspaceId, jobId) : Promise.resolve()),
  }
}
