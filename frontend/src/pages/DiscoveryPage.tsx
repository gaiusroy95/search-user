import { useEffect, useMemo, useRef } from 'react'
import { Compass, GitBranch, Mail, Target } from 'lucide-react'
import { DiscoverSearchBar } from '@/features/discover/DiscoverSearchBar'
import { DiscoverResultsGrid } from '@/features/discover/DiscoverResultsGrid'
import { useDevelopers } from '@/hooks/useDevelopers'
import { toast } from '@/stores/useToastStore'
import { useDiscoveryStore } from '@/stores/useDiscoveryStore'
import { useActivityStore } from '@/stores/useActivityStore'
import { getApiErrorMessage } from '@/services/api'
import type { SearchFilters } from '@/types'

const FEATURES = [
  {
    icon: Target,
    title: 'GitHub-style filters',
    desc: 'Skills, role, tech, and company are sent to GitHub Search when you click Search.',
  },
  {
    icon: Mail,
    title: 'Name + public email',
    desc: 'Results focus on contact signals: display name and public profile email.',
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

  const {
    data,
    isLoading,
    isFetching,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    error,
    isError,
    isFetched,
  } = useDevelopers(activeFilters, searchEnabled)

  const queryDevelopers = useMemo(
    () => data?.pages.flatMap((p) => p.users ?? []).filter(Boolean) ?? [],
    [data?.pages]
  )

  // While a new search is in flight, ignore stale persisted cards so the UI
  // shows one clean loading state instead of appending old + new results.
  const awaitingFirstPage =
    searchEnabled && isFetching && !isFetchingNextPage && !isFetched
  const allDevelopers = awaitingFirstPage
    ? []
    : queryDevelopers.length > 0
      ? queryDevelopers
      : searchEnabled
        ? persistedDevelopers
        : []

  const totalCount = data?.pages[0]?.totalCount
  const lastErrorRef = useRef<string | null>(null)
  const lastLoggedSearchRef = useRef<string | null>(null)
  const showInitialLoading =
    (isLoading || awaitingFirstPage) && allDevelopers.length === 0

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
    const searchKey = [
      activeFilters.country,
      activeFilters.stack ?? 'any',
      activeFilters.type,
      activeFilters.query ?? '',
      activeFilters.skill ?? '',
      activeFilters.role ?? '',
      activeFilters.tech ?? '',
      activeFilters.company ?? '',
    ].join('|')
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
    lastErrorRef.current = null
    setPersistedDevelopers([])
    setSearchSession(next)
  }

  return (
    <div className="min-h-full">
      <DiscoverSearchBar
        activeFilters={activeFilters}
        onSearch={handleSearch}
        isLoading={showInitialLoading || (isFetching && !isFetchingNextPage)}
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
                Set country, optional skills/role/tech, then hit Search GitHub.
              </p>
            </div>
          </div>
        ) : (
          <DiscoverResultsGrid
            developers={allDevelopers}
            country={activeFilters?.country ?? ''}
            isLoading={showInitialLoading}
            isFetchingNextPage={isFetchingNextPage}
            hasNextPage={hasNextPage ?? false}
            fetchNextPage={() => fetchNextPage()}
            totalCount={totalCount}
            hasClientFilters={false}
          />
        )}
      </section>
    </div>
  )
}
