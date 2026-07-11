import { apiClient, getCollaborationErrorMessage } from '@/services/collaborationApi'
import type {
  IntegrationConnection,
  IntegrationJob,
  IntegrationProvider,
  SyncRun,
  WorkspaceIntegration,
} from '@/types/integrations'

export { getCollaborationErrorMessage as getIntegrationsErrorMessage }

export async function fetchIntegrationProviders() {
  const { data } = await apiClient.get<{ providers: IntegrationProvider[] }>(
    '/integrations/providers'
  )
  return data.providers
}

export async function fetchWorkspaceIntegrations(workspaceId: string) {
  const { data } = await apiClient.get<{ integrations: WorkspaceIntegration[] }>(
    `/workspaces/${workspaceId}/integrations`
  )
  return data.integrations
}

export async function connectIntegration(workspaceId: string, provider: string) {
  const { data } = await apiClient.post<{
    connection?: IntegrationConnection
    authUrl?: string
    mode: 'demo' | 'oauth'
    alreadyConnected?: boolean
  }>(`/workspaces/${workspaceId}/integrations/${provider}/connect`)
  return data
}

export async function disconnectIntegration(workspaceId: string, provider: string) {
  await apiClient.delete(`/workspaces/${workspaceId}/integrations/${provider}`)
}

export async function triggerIntegrationSync(workspaceId: string, provider: string) {
  const { data } = await apiClient.post<{ job: IntegrationJob; message: string }>(
    `/workspaces/${workspaceId}/integrations/${provider}/sync`
  )
  return data
}

export async function fetchSyncHistory(workspaceId: string, limit = 50) {
  const { data } = await apiClient.get<{ runs: SyncRun[] }>(
    `/workspaces/${workspaceId}/integrations/sync-history`,
    { params: { limit } }
  )
  return data.runs
}

export async function fetchIntegrationJobs(workspaceId: string, status?: string) {
  const { data } = await apiClient.get<{ jobs: IntegrationJob[] }>(
    `/workspaces/${workspaceId}/integrations/jobs`,
    { params: status ? { status } : undefined }
  )
  return data.jobs
}

export async function retryIntegrationJob(workspaceId: string, jobId: string) {
  const { data } = await apiClient.post<{ job: IntegrationJob }>(
    `/workspaces/${workspaceId}/integrations/jobs/${jobId}/retry`
  )
  return data.job
}
