export type IntegrationProviderId =
  | 'github'
  | 'linkedin'
  | 'greenhouse'
  | 'lever'
  | 'slack'
  | 'gmail'
  | 'outlook'

export type IntegrationCategory = 'source' | 'ats' | 'communication'

export type ConnectionStatus = 'connected' | 'disconnected' | 'error'

export type SyncRunStatus = 'pending' | 'running' | 'completed' | 'failed'

export type JobStatus = 'pending' | 'processing' | 'completed' | 'failed'

export interface IntegrationProvider {
  id: IntegrationProviderId
  name: string
  description: string
  category: IntegrationCategory
  authType: string
  scopes: string[]
  supportsSync: boolean
  supportsWebhook: boolean
  oauthConfigured: boolean
}

export interface IntegrationConnection {
  id: string
  workspaceId: string
  userId: string
  provider: IntegrationProviderId
  status: ConnectionStatus
  hasToken: boolean
  expiresAt: string | null
  scopes: string[]
  metadata: Record<string, unknown>
  connectedAt: string
  lastSyncAt: string | null
  lastError: string | null
}

export interface WorkspaceIntegration {
  provider: IntegrationProvider
  connection: IntegrationConnection | null
  status: ConnectionStatus
}

export interface SyncRun {
  id: string
  connectionId: string
  workspaceId: string
  provider: IntegrationProviderId
  status: SyncRunStatus
  startedAt: string
  finishedAt: string | null
  recordsProcessed: number
  summary: string | null
  error: string | null
  details: Record<string, unknown>
  retryCount: number
}

export interface IntegrationJob {
  id: string
  type: string
  connectionId: string
  workspaceId: string
  provider: IntegrationProviderId
  payload: Record<string, unknown>
  status: JobStatus
  attempts: number
  maxAttempts: number
  scheduledAt: string
  lastError: string | null
  createdAt: string
  startedAt: string | null
  finishedAt: string | null
}

export const CATEGORY_LABELS: Record<IntegrationCategory, string> = {
  source: 'Data sources',
  ats: 'Applicant tracking',
  communication: 'Communication',
}
