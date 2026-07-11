export type ProspectStatus =
  | 'NEW'
  | 'CONTACTED'
  | 'INTERESTED'
  | 'MEETING'
  | 'OPPORTUNITY'
  | 'CLOSED'

export type LeadActivityType = 'created' | 'status' | 'note' | 'tag'

export interface LeadActivity {
  id: string
  type: LeadActivityType
  message: string
  at: string
}

export interface CommitSummary {
  sha: string
  fullSha?: string
  message: string
  from: string | null
  email: string | null
  date: string | null
  url: string
  patchUrl: string | null
}

export interface ActivitySummary {
  accountCreatedAt: string
  lastCommitAt: string | null
  lastCommitFrom: string | null
  lastCommitEmail: string | null
  lastCommitMessage: string | null
  lastCommitUrl: string | null
  lastCommitPatchUrl: string | null
  recentCommits: CommitSummary[]
}

export interface RepositorySummary {
  name: string
  language: string | null
  stars: number
  url: string
  description: string | null
  createdAt?: string
  pushedAt?: string
  latestCommit?: CommitSummary | null
}

export interface Developer {
  username: string
  name: string | null
  profile: string
  avatar: string | null
  bio: string | null
  location: string | null
  email: string | null
  company: string | null
  twitter: string | null
  website: string | null
  followers: number
  following: number
  publicRepos: number
  primaryLanguage: string | null
  languages: string[]
  repositories: RepositorySummary[]
  createdAt?: string
  activity?: ActivitySummary | null
}

export type SearchType = 'user' | 'users' | 'group'

export interface SearchFilters {
  country: string
  maxFollowers?: number
  maxRepos?: number
  maxFollowing?: number
  type: SearchType
  limit?: number
}

export interface LookupResponse {
  user: Developer
  projects: RepositorySummary[]
  cached?: boolean
}

export interface SearchResponse {
  count: number
  totalCount: number
  page: number
  perPage: number
  hasMore: boolean
  nextPage: number | null
  users: Developer[]
  cached?: boolean
}

export interface Prospect extends Developer {
  id: string
  status: ProspectStatus
  notes: string
  tags: string[]
  savedAt: string
  activityHistory: LeadActivity[]
  outreachDraft?: {
    subject: string
    content: string
  }
  /** Integration that imported this contact (linkedin, greenhouse, etc.) */
  source?: string
  externalId?: string
  importedAt?: string
}

export interface MessageTemplate {
  subject: string
  content: string
}

export const DEFAULT_COUNTRY = 'United States'

export const COUNTRIES = [
  'United States',
  'United Kingdom',
  'Canada',
  'Vietnam',
  'India',
  'Japan',
  'Singapore',
  'Germany',
  'France',
  'Australia',
  'Netherlands',
  'Brazil',
  'South Korea',
  'Philippines',
  'Indonesia',
  'Malaysia',
  'Thailand',
  'China',
  'Poland',
  'Spain',
  'Italy',
  'Sweden',
  'Sri Lanka',
] as const

export type VaultFieldType = 'line' | 'textarea'

export interface VaultFieldDef {
  id: string
  name: string
  type?: VaultFieldType
}

export interface VaultFieldInput {
  name: string
  type: VaultFieldType
}

export interface VaultCategory {
  id: string
  name: string
  fields: VaultFieldDef[]
  createdAt: string
}

export interface VaultRecord {
  id: string
  categoryId: string
  values: Record<string, string>
  createdAt: string
  updatedAt: string
}

export const PROSPECT_STATUSES: ProspectStatus[] = [
  'NEW',
  'CONTACTED',
  'INTERESTED',
  'MEETING',
  'OPPORTUNITY',
  'CLOSED',
]

export const STATUS_LABELS: Record<ProspectStatus, string> = {
  NEW: 'New',
  CONTACTED: 'Contacted',
  INTERESTED: 'Interested',
  MEETING: 'Meeting',
  OPPORTUNITY: 'Opportunity',
  CLOSED: 'Closed',
}
