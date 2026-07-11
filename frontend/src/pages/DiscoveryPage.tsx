import { useEffect, useMemo, useRef, useState } from 'react'
import { Compass, GitBranch, Mail, Target } from 'lucide-react'
import { DiscoverSearchBar } from '@/features/discover/DiscoverSearchBar'
import { DiscoverResultsGrid } from '@/features/discover/DiscoverResultsGrid'
import {
  EMPTY_DISCOVER_FILTERS,
  filterDiscoverResults,
  hasClientFilters,
} from '@/features/discover/discoverFilters'
import { useDevelopers } from '@/hooks/useDevelopers'
import { toast } from '@/stores/useToastStore'
import { useDiscoveryStore } from '@/stores/useDiscoveryStore'
import { useActivityStore } from '@/stores/useActivityStore'
import { getApiErrorMessage } from '@/services/api'
import type { SearchFilters } from '@/types'

const FEATURES = [
  {
    icon: Target,
    title: 'Location-first search',
    desc: 'Target developers by country with GitHub API filters.',
  },
  {
    icon: Mail,
    title: 'Contact signals',
    desc: 'Public emails, commit metadata, and badge scoring on every card.',
  },
  {
    icon: GitBranch,
    title: 'Infinite scroll',
    desc: 'Load more profiles automatically as you browse results.',
  },
]

export function DiscoveryPage() {
  const activeFilters = useDiscoveryStore((s) => s.activeFilters)
  const searchEnabled = useDiscoveryStore((s) => s.searchEnabled)
  const persistedDevelopers = useDiscoveryStore((s) => s.developers)
  const setSearchSession = useDiscoveryStore((s) => s.setSearchSession)
  const setPersistedDevelopers = useDiscoveryStore((s) => s.setDevelopers)
  const setLastSearchTotalCount = useDiscoveryStore((s) => s.setLastSearchTotalCount)
  const logSearch = useActivityStore((s) => s.logSearch)

  const [clientFilters, setClientFilters] = useState(EMPTY_DISCOVER_FILTERS)

  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    error,
    isError,
  } = useDevelopers(activeFilters, searchEnabled)

  const queryDevelopers = useMemo(
    () => data?.pages.flatMap((p) => p.users ?? []).filter(Boolean) ?? [],
    [data?.pages]
  )
  const allDevelopers =
    queryDevelopers.length > 0
      ? queryDevelopers
      : searchEnabled
        ? persistedDevelopers
        : []

  const filteredDevelopers = useMemo(
    () => filterDiscoverResults(allDevelopers, clientFilters),
    [allDevelopers, clientFilters]
  )

  const totalCount = data?.pages[0]?.totalCount
  const lastErrorRef = useRef<string | null>(null)
  const lastLoggedSearchRef = useRef<string | null>(null)
  const clientFiltersActive = hasClientFilters(clientFilters)

  useEffect(() => {
    if (queryDevelopers.length > 0) {
      setPersistedDevelopers(queryDevelopers)
    }
  }, [queryDevelopers, setPersistedDevelopers])

  useEffect(() => {
    if (!searchEnabled || !activeFilters?.country || !data?.pages[0]) return
    const total = data.pages[0].totalCount ?? queryDevelopers.length
    setLastSearchTotalCount(total)

    if (data.pages.length !== 1) return
    const searchKey = `${activeFilters.country}-${activeFilters.type}`
    if (lastLoggedSearchRef.current === searchKey) return
    lastLoggedSearchRef.current = searchKey
    logSearch(activeFilters.country, total)
  }, [
    searchEnabled,
    activeFilters,
    data?.pages,
    queryDevelopers.length,
    setLastSearchTotalCount,
    logSearch,
  ])

  useEffect(() => {
    if (isError && error) {
      const msg = getApiErrorMessage(error)
      if (lastErrorRef.current !== msg) {
        lastErrorRef.current = msg
        toast({
          title: 'Search failed',
          description: msg,
          variant: 'destructive',
        })
      }
    }
  }, [isError, error])

  const handleSearch = (next: SearchFilters) => {
    lastLoggedSearchRef.current = null
    setSearchSession(next)
  }

  return (
    <div className="min-h-full">
      <DiscoverSearchBar
        clientFilters={clientFilters}
        onClientFiltersChange={setClientFilters}
        onSearch={handleSearch}
        isLoading={isLoading && searchEnabled}
        searchEnabled={searchEnabled}
      />

      <section
        className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8"
        aria-label="Discover results"
      >
        {!searchEnabled ? (
          <div className="mx-auto max-w-3xl">
            <div className="grid gap-4 sm:grid-cols-3">
              {FEATURES.map(({ icon: Icon, title, desc }) => (
                <div
                  key={title}
                  className="rounded-xl border border-border/60 bg-card p-5 transition-colors hover:bg-muted/20"
                >
                  <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="h-4 w-4" />
                  </div>
                  <p className="text-sm font-semibold">{title}</p>
                  <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{desc}</p>
                </div>
              ))}
            </div>
            <div className="mt-10 flex flex-col items-center rounded-xl border border-dashed border-border/60 bg-muted/10 py-16 text-center">
              <Compass className="mb-4 h-10 w-10 text-muted-foreground/60" />
              <p className="text-sm font-medium">Ready when you are</p>
              <p className="mt-1 max-w-sm text-xs text-muted-foreground">
                Choose a country and hit Search GitHub to load developer profiles.
              </p>
            </div>
          </div>
        ) : (
          <DiscoverResultsGrid
            developers={filteredDevelopers}
            country={activeFilters?.country ?? ''}
            isLoading={isLoading && allDevelopers.length === 0}
            isFetchingNextPage={isFetchingNextPage}
            hasNextPage={hasNextPage ?? false}
            fetchNextPage={() => fetchNextPage()}
            totalCount={totalCount}
            hasClientFilters={clientFiltersActive}
          />
        )}
      </section>
    </div>
  )
}
