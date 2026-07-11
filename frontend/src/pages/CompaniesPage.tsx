import { CompaniesGrid, CompaniesToolbar } from '@/features/companies'
import { useCompaniesDirectory } from '@/hooks/useCompaniesDirectory'
import { useStoreHydrated } from '@/hooks/useStoreHydrated'
import { useCompaniesStore } from '@/stores/useCompaniesStore'
import { useDiscoveryStore } from '@/stores/useDiscoveryStore'
import { useProspectStore } from '@/stores/useProspectStore'
import { SkeletonPageHeader } from '@/components/ui/skeleton'

function CompaniesPageSkeleton() {
  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <SkeletonPageHeader />
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-72 animate-pulse rounded-lg bg-muted/80" />
        ))}
      </div>
    </div>
  )
}

export function CompaniesPage() {
  const companiesHydrated = useStoreHydrated(useCompaniesStore.persist)
  const discoveryHydrated = useStoreHydrated(useDiscoveryStore.persist)
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
  } = useCompaniesDirectory()

  if (!companiesHydrated || !discoveryHydrated || !prospectHydrated) {
    return <CompaniesPageSkeleton />
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <CompaniesToolbar
        filters={filters}
        totalCount={totalCount}
        hasActiveFilters={hasActiveFilters}
        onFiltersChange={setFilters}
        onReset={resetFilters}
      />

      <CompaniesGrid
        companies={visible}
        isEmpty={isEmpty}
        isFilteredEmpty={isFilteredEmpty}
        hasMore={hasMore}
        onLoadMore={loadMore}
        isFetchingMore={isFetchingMore}
      />
    </div>
  )
}
