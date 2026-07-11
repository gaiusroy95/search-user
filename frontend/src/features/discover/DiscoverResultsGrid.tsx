import { useEffect, useRef } from 'react'
import { Loader2, SearchX, Users } from 'lucide-react'
import { DiscoverProfileCard } from '@/features/discover/DiscoverProfileCard'
import { EmptyState } from '@/components/ui/empty-state'
import { SkeletonCard } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import type { Developer } from '@/types'

interface DiscoverResultsGridProps {
  developers: Developer[]
  country: string
  isLoading: boolean
  isFetchingNextPage: boolean
  hasNextPage: boolean
  fetchNextPage: () => void
  totalCount?: number
  hasClientFilters: boolean
  /** Auto infinite-scroll only when refining filters are off */
  autoLoadMore?: boolean
}

export function DiscoverResultsGrid({
  developers,
  country,
  isLoading,
  isFetchingNextPage,
  hasNextPage,
  fetchNextPage,
  totalCount,
  hasClientFilters,
  autoLoadMore = true,
}: DiscoverResultsGridProps) {
  const sentinelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!autoLoadMore || hasClientFilters) return
    const el = sentinelRef.current
    if (!el || !hasNextPage || isLoading || isFetchingNextPage) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !isFetchingNextPage) {
          fetchNextPage()
        }
      },
      { rootMargin: '120px', threshold: 0.1 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [
    autoLoadMore,
    fetchNextPage,
    hasClientFilters,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  ])

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 9 }).map((_, i) => (
          <SkeletonCard key={i} className="min-h-[320px]" />
        ))}
      </div>
    )
  }

  if (!developers.length) {
    return (
      <div className="space-y-6">
        <EmptyState
          variant="dashed"
          icon={SearchX}
          title="No developers found"
          description="Adjust country, skills, role, or tech and click Search GitHub again."
        />
        {hasClientFilters && hasNextPage && (
          <div className="flex justify-center">
            <Button
              type="button"
              variant="outline"
              disabled={isFetchingNextPage}
              onClick={() => fetchNextPage()}
            >
              {isFetchingNextPage ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : null}
              Load more from GitHub
            </Button>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="h-4 w-4" />
          <span>
            {totalCount != null
              ? `${developers.length.toLocaleString()} shown · ${totalCount.toLocaleString()} total`
              : `${developers.length.toLocaleString()} profiles`}
          </span>
        </div>
        {hasClientFilters && (
          <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
            Filtered locally
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {developers.map((dev, i) => (
          <DiscoverProfileCard
            key={dev.username}
            developer={dev}
            country={country}
            index={i}
          />
        ))}
      </div>

      {isFetchingNextPage && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonCard key={i} className="min-h-[320px]" />
          ))}
        </div>
      )}

      {hasNextPage && !isFetchingNextPage && autoLoadMore && !hasClientFilters && (
        <div ref={sentinelRef} className="flex justify-center py-6" aria-hidden>
          <div className="h-5 w-5 animate-pulse rounded-full bg-muted" />
        </div>
      )}

      {hasNextPage && (hasClientFilters || !autoLoadMore) && (
        <div className="flex justify-center pb-2">
          <Button
            type="button"
            variant="outline"
            disabled={isFetchingNextPage}
            onClick={() => fetchNextPage()}
          >
            {isFetchingNextPage ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : null}
            Load more profiles
          </Button>
        </div>
      )}
    </div>
  )
}
