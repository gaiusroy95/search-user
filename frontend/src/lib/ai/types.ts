import type { Developer, Prospect, SearchFilters } from '@/types'

export type CopilotTask =
  | 'candidate-summary'
  | 'compare-candidates'
  | 'outreach-linkedin'
  | 'outreach-email'
  | 'outreach-followup'
  | 'pipeline-recommendations'
  | 'search-recommendations'

export type CopilotMessageRole = 'user' | 'assistant'

export interface CopilotMessage {
  id: string
  role: CopilotMessageRole
  task: CopilotTask | 'freeform'
  content: string
  at: string
  contextLabel?: string
  isStreaming?: boolean
}

export interface CopilotPageContext {
  pageLabel: string
  pageKey: string
  entityId?: string
  entityUsername?: string
}

export interface CopilotWorkspaceSnapshot {
  developers: Developer[]
  prospects: Prospect[]
  activeFilters: SearchFilters | null
  page: CopilotPageContext
  compareUsernames: string[]
}

export interface CopilotGenerateRequest {
  task: CopilotTask
  context: CopilotWorkspaceSnapshot
  history: Array<{ role: CopilotMessageRole; content: string }>
}

export interface CopilotTaskMeta {
  task: CopilotTask
  label: string
  description: string
  category: 'candidate' | 'outreach' | 'pipeline' | 'search'
  requiresEntity?: boolean
  requiresCompare?: boolean
}
