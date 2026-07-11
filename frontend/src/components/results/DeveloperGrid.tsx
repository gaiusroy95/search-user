import { useEffect, useRef, useState } from 'react'
import { LayoutGrid, List, SearchX } from 'lucide-react'
import { DeveloperCard } from '@/components/results/DeveloperCard'
import { DeveloperListItem } from '@/components/results/DeveloperListItem'
import { Button } from '@/components/ui/button'
import { SkeletonCard, SkeletonListItem } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/ui/empty-state'
import type { Developer } from '@/types'

type ViewMode = 'card' | 'list'

interface DeveloperGridProps {
  developers: Developer[]
  country: string
  isLoading: boolean
  isFetchingNextPage: boolean
  hasNextPage: boolean
  fetchNextPage: () => void
  totalCount?: number
}

function SkeletonItem({ view }: { view: ViewMode }) {
  if (view === 'list') {
    return <SkeletonListItem />
  }
  return <SkeletonCard />
}

export function DeveloperGrid({
  developers,
  country,
  isLoading,
  isFetchingNextPage,
  hasNextPage,
  fetchNextPage,
  totalCount,
}: DeveloperGridProps) {
  const [view, setView] = useState<ViewMode>('card')
  const sentinelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = sentinelRef.current
    if (!el || !hasNextPage) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !isFetchingNextPage) fetchNextPage()
      },
      { rootMargin: '200px' }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [fetchNextPage, hasNextPage, isFetchingNextPage])

  if (isLoading) {
    return (
      <div className={view === 'card' ? 'grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3' : 'space-y-3'}>
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonItem key={i} view={view} />
        ))}
      </div>
    )
  }

  if (!developers.length) {
    return (
      <EmptyState
        variant="dashed"
        icon={SearchX}
        title="No developers found"
        description="Try adjusting your filters or selecting a different country."
      />
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {totalCount != null
            ? `Showing ${developers.length} of ${totalCount.toLocaleString()} developers`
            : `${developers.length} developers`}
        </p>
        <div className="flex rounded-lg border border-border p-1">
          <Button
            size="sm"
            variant={view === 'card' ? 'secondary' : 'ghost'}
            onClick={() => setView('card')}
            aria-label="Card view"
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant={view === 'list' ? 'secondary' : 'ghost'}
            onClick={() => setView('list')}
            aria-label="List view"
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {view === 'card' ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {developers.map((dev, i) => (
            <DeveloperCard
              key={`${dev.username}-${i}`}
              developer={dev}
              country={country}
              userNumber={i + 1}
              index={i}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {developers.map((dev, i) => (
            <DeveloperListItem
              key={`${dev.username}-${i}`}
              developer={dev}
              country={country}
              userNumber={i + 1}
            />
          ))}
        </div>
      )}

      {isFetchingNextPage && (
        <div className={view === 'card' ? 'grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3' : 'space-y-3'}>
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonItem key={i} view={view} />
          ))}
        </div>
      )}

      {hasNextPage && <div ref={sentinelRef} className="h-4" aria-hidden />}
    </div>
  )
}
