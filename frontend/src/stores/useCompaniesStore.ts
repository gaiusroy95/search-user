import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CompanyProfile } from '@/lib/companyProfile'
import {
  buildEntryFromProfile,
  buildMinimalFromTracked,
  buildStubFromDeveloper,
  collectCompanySlugCounts,
  mergeCompanyEntry,
  type CompanyDirectoryEntry,
} from '@/lib/companiesDirectory'
import type { TrackedCompany } from '@/stores/useActivityStore'
import type { Developer, Prospect } from '@/types'

interface CompaniesState {
  entries: Record<string, CompanyDirectoryEntry>
  upsertEntry: (entry: CompanyDirectoryEntry) => void
  enrichFromProfile: (
    profile: CompanyProfile,
    employeeCount: number,
    viewedAt?: string | null
  ) => void
  markViewed: (slug: string, viewedAt: string) => void
  syncFromWorkspace: (developers: Developer[], prospects: Prospect[]) => void
  syncFromTrackedViews: (tracked: TrackedCompany[]) => void
}

export const useCompaniesStore = create<CompaniesState>()(
  persist(
    (set, get) => ({
      entries: {},

      upsertEntry: (entry) =>
        set((s) => ({
          entries: {
            ...s.entries,
            [entry.slug]: mergeCompanyEntry(s.entries[entry.slug], entry),
          },
        })),

      enrichFromProfile: (profile, employeeCount, viewedAt = null) => {
        const entry = buildEntryFromProfile(profile, employeeCount, viewedAt)
        get().upsertEntry(entry)
      },

      markViewed: (slug, viewedAt) =>
        set((s) => {
          const existing = s.entries[slug]
          if (!existing) return s
          return {
            entries: {
              ...s.entries,
              [slug]: { ...existing, viewedAt },
            },
          }
        }),

      syncFromWorkspace: (developers, prospects) => {
        const counts = collectCompanySlugCounts(developers, prospects)
        if (counts.size === 0) return

        set((s) => {
          const next = { ...s.entries }
          for (const { slug, count, sample } of counts.values()) {
            const stub = buildStubFromDeveloper(sample, count)
            next[slug] = mergeCompanyEntry(next[slug], stub)
          }
          return { entries: next }
        })
      },

      syncFromTrackedViews: (tracked) => {
        if (!tracked.length) return
        set((s) => {
          const next = { ...s.entries }
          for (const item of tracked) {
            const stub = buildMinimalFromTracked(item.slug, item.name, item.viewedAt)
            next[item.slug] = mergeCompanyEntry(next[item.slug], stub)
          }
          return { entries: next }
        })
      },
    }),
    { name: 'github-discovery-companies', version: 1 }
  )
)
