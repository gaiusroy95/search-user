import { formatRelativeTime } from '@/lib/dashboardMetrics'
import {
  readEnumParam,
  readStringParam,
  writeEnumParam,
  writeStringParam,
} from '@/lib/filterUrlSync'
import { ROUTES } from '@/lib/routes'
import type { WorkspaceEvent, WorkspaceEventType } from '@/stores/useActivityStore'
import type { LeadActivity, Prospect } from '@/types'
import { STATUS_LABELS } from '@/types'

export { formatRelativeTime }

export const ACTIVITY_PAGE_SIZE = 20

export type ActivityTypeFilter = 'ALL' | WorkspaceEventType

export type ActivityDateRange = 'all' | 'today' | '7d' | '30d' | '90d'

export interface ActivityFeedItem {
  id: string
  type: WorkspaceEventType
  at: string
  title: string
  description?: string
  href?: string
  meta?: Record<string, string>
}

export interface ActivityCenterFilters {
  query: string
  type: ActivityTypeFilter
  range: ActivityDateRange
}

export const EMPTY_ACTIVITY_FILTERS: ActivityCenterFilters = {
  query: '',
  type: 'ALL',
  range: 'all',
}

export const ACTIVITY_TYPE_OPTIONS: { value: ActivityTypeFilter; label: string }[] = [
  { value: 'ALL', label: 'All activity' },
  { value: 'search', label: 'Searches' },
  { value: 'candidate_saved', label: 'Candidate saves' },
  { value: 'pipeline_status', label: 'Pipeline movements' },
  { value: 'company_view', label: 'Company views' },
  { value: 'ai_action', label: 'AI actions' },
  { value: 'export', label: 'Exports' },
]

export const ACTIVITY_RANGE_OPTIONS: { value: ActivityDateRange; label: string }[] = [
  { value: 'all', label: 'All time' },
  { value: 'today', label: 'Today' },
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: '90d', label: 'Last 90 days' },
]

export const ACTIVITY_TYPE_LABELS: Record<WorkspaceEventType, string> = {
  search: 'Search',
  candidate_saved: 'Save',
  pipeline_status: 'Pipeline',
  company_view: 'Company',
  ai_action: 'AI',
  export: 'Export',
}

function mapLeadActivity(prospect: Prospect, entry: LeadActivity): ActivityFeedItem | null {
  switch (entry.type) {
    case 'status':
      return {
        id: entry.id,
        type: 'pipeline_status',
        at: entry.at,
        title: entry.message,
        description: `@${prospect.username} · ${STATUS_LABELS[prospect.status]}`,
        href: ROUTES.pipeline,
        meta: { username: prospect.username },
      }
    case 'created':
      return {
        id: entry.id,
        type: 'candidate_saved',
        at: entry.at,
        title: entry.message,
        description: `@${prospect.username}`,
        href: `/people/${encodeURIComponent(prospect.username)}`,
        meta: { username: prospect.username },
      }
    case 'note':
    case 'tag':
      return {
        id: entry.id,
        type: 'pipeline_status',
        at: entry.at,
        title: entry.message,
        description: `@${prospect.username}`,
        href: ROUTES.pipeline,
        meta: { username: prospect.username },
      }
    default:
      return null
  }
}

function dedupeKey(item: ActivityFeedItem): string {
  return `${item.type}-${item.at}-${item.title}-${item.description ?? ''}`
}

export function aggregateActivityFeed(
  events: WorkspaceEvent[],
  prospects: Prospect[]
): ActivityFeedItem[] {
  const fromProspects: ActivityFeedItem[] = []

  for (const prospect of prospects) {
    for (const entry of prospect.activityHistory) {
      const mapped = mapLeadActivity(prospect, entry)
      if (mapped) fromProspects.push(mapped)
    }
  }

  const merged: ActivityFeedItem[] = [...events, ...fromProspects]
  const seen = new Set<string>()

  return merged
    .filter((item) => {
      const key = dedupeKey(item)
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
    .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
}

function startOfToday(): Date {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
}

export function matchesDateRange(at: string, range: ActivityDateRange): boolean {
  if (range === 'all') return true
  const time = new Date(at).getTime()
  const now = Date.now()

  if (range === 'today') {
    return time >= startOfToday().getTime()
  }

  const days = range === '7d' ? 7 : range === '30d' ? 30 : 90
  return now - time <= days * 86_400_000
}

function matchesQuery(item: ActivityFeedItem, query: string): boolean {
  const q = query.trim().toLowerCase()
  if (!q) return true

  const haystack = [item.title, item.description, item.type, ACTIVITY_TYPE_LABELS[item.type]]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()

  return haystack.includes(q)
}

export function filterActivityFeed(
  items: ActivityFeedItem[],
  filters: ActivityCenterFilters
): ActivityFeedItem[] {
  return items.filter((item) => {
    if (!matchesQuery(item, filters.query)) return false
    if (filters.type !== 'ALL' && item.type !== filters.type) return false
    if (!matchesDateRange(item.at, filters.range)) return false
    return true
  })
}

export function paginateActivityFeed(
  items: ActivityFeedItem[],
  page: number,
  pageSize = ACTIVITY_PAGE_SIZE
): ActivityFeedItem[] {
  return items.slice(0, page * pageSize)
}

export function groupActivityByDay(
  items: ActivityFeedItem[]
): { label: string; dateKey: string; items: ActivityFeedItem[] }[] {
  const groups = new Map<string, ActivityFeedItem[]>()

  for (const item of items) {
    const date = new Date(item.at)
    const dateKey = date.toISOString().slice(0, 10)
    const existing = groups.get(dateKey) ?? []
    existing.push(item)
    groups.set(dateKey, existing)
  }

  const todayKey = new Date().toISOString().slice(0, 10)
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayKey = yesterday.toISOString().slice(0, 10)

  return Array.from(groups.entries())
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([dateKey, groupItems]) => {
      let label: string
      if (dateKey === todayKey) label = 'Today'
      else if (dateKey === yesterdayKey) label = 'Yesterday'
      else {
        label = new Date(dateKey).toLocaleDateString(undefined, {
          weekday: 'long',
          month: 'long',
          day: 'numeric',
        })
      }
      return { label, dateKey, items: groupItems }
    })
}

export function filtersFromSearchParams(params: URLSearchParams): ActivityCenterFilters {
  const type = readEnumParam(
    params,
    'type',
    ACTIVITY_TYPE_OPTIONS.map((o) => o.value),
    'ALL'
  )
  const range = readEnumParam(
    params,
    'range',
    ACTIVITY_RANGE_OPTIONS.map((o) => o.value),
    'all'
  )

  return {
    query: readStringParam(params, 'q'),
    type,
    range,
  }
}

export function filtersToSearchParams(filters: ActivityCenterFilters): URLSearchParams {
  const params = new URLSearchParams()
  writeStringParam(params, 'q', filters.query)
  writeEnumParam(params, 'type', filters.type, 'ALL')
  writeEnumParam(params, 'range', filters.range, 'all')
  return params
}

export function hasActiveActivityFilters(filters: ActivityCenterFilters): boolean {
  return (
    filters.query.trim() !== '' ||
    filters.type !== EMPTY_ACTIVITY_FILTERS.type ||
    filters.range !== EMPTY_ACTIVITY_FILTERS.range
  )
}

export function selectRecentActivity(
  events: WorkspaceEvent[],
  prospects: Prospect[],
  limit = 12
): ActivityFeedItem[] {
  return aggregateActivityFeed(events, prospects).slice(0, limit)
}
