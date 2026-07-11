import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { createActivity, migrateLeadStatus, normalizeProspect } from '@/lib/pipeline'
import { syncProspectToTeam } from '@/lib/workspaceSync'
import { useActivityStore } from '@/stores/useActivityStore'
import type { Developer, Prospect, ProspectStatus } from '@/types'
import { STATUS_LABELS } from '@/types'

interface ProspectState {
  prospects: Prospect[]
  saveProspect: (developer: Developer) => void
  removeProspect: (id: string) => void
  updateStatus: (id: string, status: ProspectStatus) => void
  updateNotes: (id: string, notes: string) => void
  updateTags: (id: string, tags: string[]) => void
  addActivity: (id: string, type: Prospect['activityHistory'][0]['type'], message: string) => void
  setOutreachDraft: (
    id: string,
    draft: { subject: string; content: string }
  ) => void
  isSaved: (username: string) => boolean
}

function appendActivity(
  prospect: Prospect,
  type: Prospect['activityHistory'][0]['type'],
  message: string
): Prospect {
  return {
    ...prospect,
    activityHistory: [createActivity(type, message), ...prospect.activityHistory].slice(
      0,
      50
    ),
  }
}

export const useProspectStore = create<ProspectState>()(
  persist(
    (set, get) => ({
      prospects: [],

      saveProspect: (developer) => {
        if (get().isSaved(developer.username)) return
        const prospect: Prospect = {
          ...developer,
          id: crypto.randomUUID(),
          status: 'NEW',
          notes: '',
          tags: [],
          savedAt: new Date().toISOString(),
          activityHistory: [createActivity('created', 'Lead added to pipeline')],
        }
        set((s) => ({ prospects: [prospect, ...s.prospects] }))
        useActivityStore
          .getState()
          .logCandidateSaved(developer.username, developer.name)
        void syncProspectToTeam('create', prospect)
      },

      removeProspect: (id) => {
        void syncProspectToTeam('delete', undefined, id)
        set((s) => ({
          prospects: s.prospects.filter((p) => p.id !== id),
        }))
      },

      updateStatus: (id, status) =>
        set((s) => ({
          prospects: s.prospects.map((p) => {
            if (p.id !== id || p.status === status) return p
            const updated = appendActivity(
              { ...p, status },
              'status',
              `Status → ${STATUS_LABELS[status]}`
            )
            useActivityStore
              .getState()
              .logPipelineStatus(p.username, p.name, `Status → ${STATUS_LABELS[status]}`)
            void syncProspectToTeam('update', undefined, id, {
              status,
              activityHistory: updated.activityHistory,
            })
            return updated
          }),
        })),

      updateNotes: (id, notes) =>
        set((s) => ({
          prospects: s.prospects.map((p) => {
            if (p.id !== id || p.notes === notes) return p
            const next = { ...p, notes }
            const updated = notes.trim()
              ? appendActivity(next, 'note', 'Notes updated')
              : next
            void syncProspectToTeam('update', undefined, id, {
              notes,
              activityHistory: updated.activityHistory,
            })
            return updated
          }),
        })),

      updateTags: (id, tags) =>
        set((s) => ({
          prospects: s.prospects.map((p) => {
            if (p.id !== id) return p
            const prev = p.tags.join(', ')
            const next = tags.join(', ')
            if (prev === next) return p
            const updated = { ...p, tags }
            const result = tags.length
              ? appendActivity(updated, 'tag', `Tags → ${tags.join(', ')}`)
              : updated
            void syncProspectToTeam('update', undefined, id, {
              tags,
              activityHistory: result.activityHistory,
            })
            return result
          }),
        })),

      addActivity: (id, type, message) =>
        set((s) => ({
          prospects: s.prospects.map((p) =>
            p.id === id ? appendActivity(p, type, message) : p
          ),
        })),

      setOutreachDraft: (id, draft) =>
        set((s) => ({
          prospects: s.prospects.map((p) =>
            p.id === id ? { ...p, outreachDraft: draft } : p
          ),
        })),

      isSaved: (username) =>
        get().prospects.some((p) => p.username === username),
    }),
    {
      name: 'github-discovery-prospects',
      version: 2,
      migrate: (persisted: unknown) => {
        const state = persisted as { prospects?: Prospect[] }
        if (!state?.prospects) return { prospects: [] }
        return {
          prospects: state.prospects.map((p) => {
            const normalized = normalizeProspect({
              ...p,
              status: migrateLeadStatus(p.status as string),
              activityHistory: p.activityHistory ?? [],
            })
            if (!normalized.activityHistory.length) {
              normalized.activityHistory = [
                createActivity('created', 'Lead imported to pipeline'),
              ]
            }
            return normalized
          }),
        }
      },
    }
  )
)
