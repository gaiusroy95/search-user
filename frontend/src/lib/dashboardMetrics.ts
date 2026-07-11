import { analyzeDeveloper } from '@/lib/developerAnalysis'
import { selectRecentActivity, type ActivityFeedItem } from '@/lib/activityCenter'
import { ROUTES } from '@/lib/routes'
import type { TrackedCompany, WorkspaceEvent } from '@/stores/useActivityStore'
import type { Developer, Prospect, ProspectStatus } from '@/types'

export type ApiStatus = 'ready' | 'limited' | 'loading' | 'error'

export interface DashboardMetrics {
  developersDiscovered: number
  savedCandidates: number
  activePipeline: number
  companiesTracked: number
  searchesThisWeek: number
  apiStatus: ApiStatus
  apiStatusLabel: string
  hasWorkspaceData: boolean
}

export interface DashboardActivityItem extends ActivityFeedItem {}
export interface RecommendedAction {
  id: string
  priority: 'high' | 'medium' | 'low'
  title: string
  description: string
  href: string
  cta: string
}

const ACTIVE_STATUSES: ProspectStatus[] = [
  'NEW',
  'CONTACTED',
  'INTERESTED',
  'MEETING',
  'OPPORTUNITY',
]

const MS_PER_DAY = 86_400_000

export function formatRelativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const minutes = Math.floor(diff / 60_000)
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

function isWithinDays(iso: string, days: number): boolean {
  return Date.now() - new Date(iso).getTime() <= days * MS_PER_DAY
}

function startOfWeek(): Date {
  const now = new Date()
  const day = now.getDay()
  const diff = day === 0 ? 6 : day - 1
  const start = new Date(now)
  start.setHours(0, 0, 0, 0)
  start.setDate(start.getDate() - diff)
  return start
}

export function selectDashboardMetrics(input: {
  developers: Developer[]
  prospects: Prospect[]
  events: WorkspaceEvent[]
  trackedCompanies: TrackedCompany[]
  companiesCount: number
  healthLoading: boolean
  healthError: boolean
  tokenConfigured?: boolean
  lastSearchTotalCount?: number
}): DashboardMetrics {
  const {
    developers,
    prospects,
    events,
    trackedCompanies,
    companiesCount,
    healthLoading,
    healthError,
    tokenConfigured,
    lastSearchTotalCount,
  } = input

  const weekStart = startOfWeek()
  const searchesThisWeek = events.filter(
    (e) => e.type === 'search' && new Date(e.at) >= weekStart
  ).length

  let apiStatus: ApiStatus = 'loading'
  let apiStatusLabel = 'Checking API…'

  if (!healthLoading) {
    if (healthError) {
      apiStatus = 'error'
      apiStatusLabel = 'API unreachable'
    } else if (tokenConfigured) {
      apiStatus = 'ready'
      apiStatusLabel = 'GitHub API ready'
    } else {
      apiStatus = 'limited'
      apiStatusLabel = 'Rate limited (no token)'
    }
  }

  const developersDiscovered =
    lastSearchTotalCount && lastSearchTotalCount > 0
      ? lastSearchTotalCount
      : developers.length

  const savedCandidates = prospects.length
  const activePipeline = prospects.filter((p) => ACTIVE_STATUSES.includes(p.status)).length
  const companiesTracked = Math.max(companiesCount, trackedCompanies.length)

  const hasWorkspaceData =
    developers.length > 0 ||
    prospects.length > 0 ||
    events.length > 0 ||
    trackedCompanies.length > 0

  return {
    developersDiscovered,
    savedCandidates,
    activePipeline,
    companiesTracked,
    searchesThisWeek,
    apiStatus,
    apiStatusLabel,
    hasWorkspaceData,
  }
}

export function selectRecentActivityForDashboard(
  events: WorkspaceEvent[],
  prospects: Prospect[],
  limit = 12
): DashboardActivityItem[] {
  return selectRecentActivity(events, prospects, limit)
}
function lastStatusChangeAt(prospect: Prospect): string {
  const statusEntry = prospect.activityHistory.find((e) => e.type === 'status')
  return statusEntry?.at ?? prospect.savedAt
}

export function selectRecommendedActions(input: {
  developers: Developer[]
  prospects: Prospect[]
  savedUsernames: Set<string>
}): RecommendedAction[] {
  const { developers, prospects, savedUsernames } = input
  const actions: RecommendedAction[] = []

  const staleContacted = prospects.filter(
    (p) =>
      p.status === 'CONTACTED' &&
      !isWithinDays(lastStatusChangeAt(p), 7)
  )
  if (staleContacted.length > 0) {
    actions.push({
      id: 'follow-up-contacted',
      priority: 'high',
      title: `Follow up with ${staleContacted.length} contacted candidate${staleContacted.length === 1 ? '' : 's'}`,
      description: 'No pipeline movement in over 7 days since last contact update.',
      href: ROUTES.pipeline,
      cta: 'Open pipeline',
    })
  }

  const unsavedDiscovery = developers.filter((d) => !savedUsernames.has(d.username))
  if (unsavedDiscovery.length > 0) {
    actions.push({
      id: 'review-discovery',
      priority: 'medium',
      title: `Review ${Math.min(unsavedDiscovery.length, 99)} new discovery result${unsavedDiscovery.length === 1 ? '' : 's'}`,
      description: 'Candidates from your latest search are not yet in the pipeline.',
      href: ROUTES.discover,
      cta: 'Review candidates',
    })
  }

  const incomplete = prospects.filter((p) => {
    const analysis = analyzeDeveloper(p)
    const missingEmail = !p.email && !analysis.contactEmail
    const missingNotes = !p.notes.trim()
    return missingEmail || missingNotes
  })
  if (incomplete.length > 0) {
    actions.push({
      id: 'complete-profiles',
      priority: 'medium',
      title: `Complete ${incomplete.length} candidate profile${incomplete.length === 1 ? '' : 's'}`,
      description: 'Missing contact signals or notes — add details before outreach.',
      href: ROUTES.pipeline,
      cta: 'Review leads',
    })
  }

  if (prospects.some((p) => p.status === 'NEW')) {
    const newCount = prospects.filter((p) => p.status === 'NEW').length
    actions.push({
      id: 'qualify-new',
      priority: 'low',
      title: `Qualify ${newCount} new lead${newCount === 1 ? '' : 's'}`,
      description: 'Move new candidates from New to Contacted or Interested.',
      href: ROUTES.pipeline,
      cta: 'View new leads',
    })
  }

  if (developers.length === 0 && prospects.length === 0) {
    actions.push({
      id: 'start-discovery',
      priority: 'high',
      title: 'Run your first GitHub discovery search',
      description: 'Find developers by country and build your candidate pipeline.',
      href: ROUTES.discover,
      cta: 'Start discovery',
    })
  }

  const priorityOrder = { high: 0, medium: 1, low: 2 }
  return actions.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])
}

export function selectSavedUsernames(prospects: Prospect[]): Set<string> {
  return new Set(prospects.map((p) => p.username))
}
