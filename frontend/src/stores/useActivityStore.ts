import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { ROUTES } from '@/lib/routes'

export type WorkspaceEventType =
  | 'search'
  | 'candidate_saved'
  | 'pipeline_status'
  | 'company_view'
  | 'ai_action'
  | 'export'

export interface WorkspaceEvent {
  id: string
  type: WorkspaceEventType
  at: string
  title: string
  description?: string
  href?: string
  meta?: Record<string, string>
}

export interface TrackedCompany {
  slug: string
  name: string
  viewedAt: string
}

type LogEventInput = Omit<WorkspaceEvent, 'id' | 'at'> & { at?: string }

interface ActivityState {
  events: WorkspaceEvent[]
  trackedCompanies: TrackedCompany[]
  logEvent: (event: LogEventInput) => void
  logSearch: (country: string, resultCount: number) => void
  logCompanyView: (slug: string, name: string) => void
  logCandidateSaved: (username: string, name: string | null) => void
  logPipelineStatus: (username: string, name: string | null, message: string) => void
  logAiAction: (taskLabel: string, context?: string) => void
  logExport: (label: string, itemCount: number, source?: string) => void
}

const MAX_EVENTS = 500

function makeId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return `evt-${Date.now()}`
}

function prependEvent(events: WorkspaceEvent[], event: WorkspaceEvent): WorkspaceEvent[] {
  return [event, ...events].slice(0, MAX_EVENTS)
}

export const useActivityStore = create<ActivityState>()(
  persist(
    (set, get) => ({
      events: [],
      trackedCompanies: [],

      logEvent: (input) => {
        const event: WorkspaceEvent = {
          ...input,
          id: makeId(),
          at: input.at ?? new Date().toISOString(),
        }
        set({ events: prependEvent(get().events, event) })
      },

      logSearch: (country, resultCount) => {
        get().logEvent({
          type: 'search',
          title: `GitHub search · ${country}`,
          description: `${resultCount.toLocaleString()} developers found`,
          href: ROUTES.discover,
          meta: { country, resultCount: String(resultCount) },
        })
      },

      logCompanyView: (slug, name) => {
        const at = new Date().toISOString()
        get().logEvent({
          type: 'company_view',
          at,
          title: `Viewed company · ${name}`,
          description: `@${slug}`,
          href: `/companies/${encodeURIComponent(slug)}`,
          meta: { slug, name },
        })
        const existing = get().trackedCompanies.filter((c) => c.slug !== slug)
        set({
          trackedCompanies: [{ slug, name, viewedAt: at }, ...existing].slice(0, 50),
        })
      },

      logCandidateSaved: (username, name) => {
        get().logEvent({
          type: 'candidate_saved',
          title: `Saved candidate · ${name ?? username}`,
          description: `@${username}`,
          href: `/people/${encodeURIComponent(username)}`,
          meta: { username },
        })
      },

      logPipelineStatus: (username, name, message) => {
        get().logEvent({
          type: 'pipeline_status',
          title: message,
          description: `@${username}${name && name !== username ? ` · ${name}` : ''}`,
          href: ROUTES.pipeline,
          meta: { username },
        })
      },

      logAiAction: (taskLabel, context) => {
        get().logEvent({
          type: 'ai_action',
          title: `AI · ${taskLabel}`,
          description: context ?? 'Generated in workspace assistant',
          href: ROUTES.intelligence,
          meta: { task: taskLabel },
        })
      },

      logExport: (label, itemCount, source) => {
        get().logEvent({
          type: 'export',
          title: `Exported · ${label}`,
          description: `${itemCount.toLocaleString()} item${itemCount === 1 ? '' : 's'}`,
          href: ROUTES.contacts,
          meta: { label, itemCount: String(itemCount), source: source ?? 'workspace' },
        })
      },
    }),
    { name: 'github-discovery-activity', version: 2 }
  )
)
