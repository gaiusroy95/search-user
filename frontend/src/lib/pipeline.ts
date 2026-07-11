import type { LeadActivity, LeadActivityType, Prospect, ProspectStatus } from '@/types'
import { PROSPECT_STATUSES } from '@/types'

const LEGACY_STATUS_MAP: Record<string, ProspectStatus> = {
  REVIEWING: 'NEW',
  RESPONDED: 'INTERESTED',
  INTERVIEWING: 'MEETING',
  HIRED: 'CLOSED',
  ARCHIVED: 'CLOSED',
}

export function migrateLeadStatus(status: string): ProspectStatus {
  if (PROSPECT_STATUSES.includes(status as ProspectStatus)) {
    return status as ProspectStatus
  }
  return LEGACY_STATUS_MAP[status] ?? 'NEW'
}

export function createActivity(
  type: LeadActivityType,
  message: string
): LeadActivity {
  return {
    id: crypto.randomUUID(),
    type,
    message,
    at: new Date().toISOString(),
  }
}

export function normalizeProspect(raw: Prospect): Prospect {
  return {
    ...raw,
    status: migrateLeadStatus(raw.status),
    tags: raw.tags ?? [],
    notes: raw.notes ?? '',
    activityHistory: raw.activityHistory ?? [],
  }
}

export function formatActivityTime(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
