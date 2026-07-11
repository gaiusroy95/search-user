import { create } from 'zustand'

import {
  connectIntegration,
  disconnectIntegration,
  fetchIntegrationJobs,
  fetchSyncHistory,
  fetchWorkspaceIntegrations,
  retryIntegrationJob,
  triggerIntegrationSync,
} from '@/services/integrationsApi'
import { useWorkspaceStore } from '@/stores/useWorkspaceStore'
import type { IntegrationJob, SyncRun, WorkspaceIntegration } from '@/types/integrations'

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

async function waitForProviderJob(workspaceId: string, provider: string) {
  for (let i = 0; i < 20; i += 1) {
    const jobs = await fetchIntegrationJobs(workspaceId)
    const relevant = jobs.filter((j) => j.provider === provider)
    const active = relevant.some((j) => j.status === 'pending' || j.status === 'processing')
    if (!active && relevant.length > 0) return
    if (!active && i > 2) return
    await sleep(1500)
  }
}

interface IntegrationsState {
  integrations: WorkspaceIntegration[]
  syncRuns: SyncRun[]
  jobs: IntegrationJob[]
  loading: boolean
  syncingProvider: string | null
  loadIntegrations: (workspaceId: string) => Promise<void>
  loadSyncHistory: (workspaceId: string) => Promise<void>
  loadJobs: (workspaceId: string) => Promise<void>
  connect: (workspaceId: string, provider: string) => Promise<void>
  disconnect: (workspaceId: string, provider: string) => Promise<void>
  sync: (workspaceId: string, provider: string) => Promise<void>
  retryJob: (workspaceId: string, jobId: string) => Promise<void>
  refreshAll: (workspaceId: string) => Promise<void>
}

export const useIntegrationsStore = create<IntegrationsState>((set, get) => ({
  integrations: [],
  syncRuns: [],
  jobs: [],
  loading: false,
  syncingProvider: null,

  async loadIntegrations(workspaceId) {
    set({ loading: true })
    try {
      const integrations = await fetchWorkspaceIntegrations(workspaceId)
      set({ integrations })
    } finally {
      set({ loading: false })
    }
  },

  async loadSyncHistory(workspaceId) {
    const syncRuns = await fetchSyncHistory(workspaceId)
    set({ syncRuns })
  },

  async loadJobs(workspaceId) {
    const jobs = await fetchIntegrationJobs(workspaceId)
    set({ jobs })
  },

  async connect(workspaceId, provider) {
    const result = await connectIntegration(workspaceId, provider)
    if (result.mode === 'oauth' && result.authUrl) {
      window.location.href = result.authUrl
      return
    }
    await get().loadIntegrations(workspaceId)
  },

  async disconnect(workspaceId, provider) {
    await disconnectIntegration(workspaceId, provider)
    await get().refreshAll(workspaceId)
  },

  async sync(workspaceId, provider) {
    set({ syncingProvider: provider })
    try {
      await triggerIntegrationSync(workspaceId, provider)
      await waitForProviderJob(workspaceId, provider)
      await useWorkspaceStore.getState().syncSharedPipeline()
      await get().refreshAll(workspaceId)
    } finally {
      set({ syncingProvider: null })
    }
  },

  async retryJob(workspaceId, jobId) {
    await retryIntegrationJob(workspaceId, jobId)
    await get().refreshAll(workspaceId)
  },

  async refreshAll(workspaceId) {
    await Promise.all([
      get().loadIntegrations(workspaceId),
      get().loadSyncHistory(workspaceId),
      get().loadJobs(workspaceId),
    ])
  },
}))
