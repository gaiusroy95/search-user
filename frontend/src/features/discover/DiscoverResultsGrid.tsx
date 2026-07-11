import { useEffect, useRef } from 'react'
import { SearchX, Users } from 'lucide-react'
import { DiscoverProfileCard } from '@/features/discover/DiscoverProfileCard'
import { EmptyState } from '@/components/ui/empty-state'
import { SkeletonCard } from '@/components/ui/skeleton'
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
}: DiscoverResultsGridProps) {
  const sentinelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = sentinelRef.current
    if (!el || !hasNextPage) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !isFetchingNextPage) fetchNextPage()
      },
      { rootMargin: '240px' }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [fetchNextPage, hasNextPage, isFetchingNextPage])

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
      <EmptyState
        variant="dashed"
        icon={SearchX}
        title={hasClientFilters ? 'No matches for your filters' : 'No developers found'}
        description={
          hasClientFilters
            ? 'Try broadening your search or clearing filters to see more profiles.'
            : 'Adjust your country or GitHub filters and search again.'
        }
      />
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
            key={`${dev.username}-${i}`}
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

      {hasNextPage && !isFetchingNextPage && (
        <div ref={sentinelRef} className="flex justify-center py-6" aria-hidden>
          <div className="h-5 w-5 animate-pulse rounded-full bg-muted" />
        </div>
      )}
    </div>
  )
}
