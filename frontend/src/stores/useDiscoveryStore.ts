import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Developer, SearchFilters } from '@/types'

interface DiscoveryState {
  activeFilters: SearchFilters | null
  searchEnabled: boolean
  developers: Developer[]
  lastSearchTotalCount: number | null
  setSearchSession: (filters: SearchFilters) => void
  setDevelopers: (developers: Developer[]) => void
  setLastSearchTotalCount: (count: number) => void
  clearSearch: () => void
}

export const useDiscoveryStore = create<DiscoveryState>()(
  persist(
    (set) => ({
      activeFilters: null,
      searchEnabled: false,
      developers: [],
      lastSearchTotalCount: null,

      setSearchSession: (filters) =>
        set({ activeFilters: filters, searchEnabled: true, lastSearchTotalCount: null }),

      setDevelopers: (developers) => set({ developers }),

      setLastSearchTotalCount: (count) => set({ lastSearchTotalCount: count }),

      clearSearch: () =>
        set({
          activeFilters: null,
          searchEnabled: false,
          developers: [],
          lastSearchTotalCount: null,
        }),
    }),
    { name: 'github-discovery-session' }
  )
)
