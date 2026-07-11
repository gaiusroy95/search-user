import { ActivityFeed, ActivityToolbar } from '@/features/activity'
import { useActivityCenter } from '@/hooks/useActivityCenter'
import { useStoreHydrated } from '@/hooks/useStoreHydrated'
import { SkeletonPageHeader } from '@/components/ui/skeleton'
import { useActivityStore } from '@/stores/useActivityStore'
import { useProspectStore } from '@/stores/useProspectStore'

function ActivityPageSkeleton() {
  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <SkeletonPageHeader />
      <div className="space-y-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-16 animate-pulse rounded-lg bg-muted/80" />
        ))}
      </div>
    </div>
  )
}

export function ActivityPage() {
  const activityHydrated = useStoreHydrated(useActivityStore.persist)
  const prospectHydrated = useStoreHydrated(useProspectStore.persist)

  const {
    filters,
    setFilters,
    resetFilters,
    visible,
    totalCount,
    hasMore,
    loadMore,
    isFetchingMore,
    isEmpty,
    isFilteredEmpty,
    hasActiveFilters,
  } = useActivityCenter()

  if (!activityHydrated || !prospectHydrated) {
    return <ActivityPageSkeleton />
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <ActivityToolbar
        filters={filters}
        totalCount={totalCount}
        hasActiveFilters={hasActiveFilters}
        onFiltersChange={setFilters}
        onReset={resetFilters}
      />

      <ActivityFeed
        items={visible}
        isEmpty={isEmpty}
        isFilteredEmpty={isFilteredEmpty}
        hasMore={hasMore}
        onLoadMore={loadMore}
        isFetchingMore={isFetchingMore}
      />
    </div>
  )
}
