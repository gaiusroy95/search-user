import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { Building2, SearchX } from 'lucide-react'
import { CompanyCard, CompanyCardSkeleton } from '@/features/companies/CompanyCard'
import { EmptyState } from '@/components/ui/empty-state'
import { Button } from '@/components/ui/button'
import type { CompanyDirectoryEntry } from '@/lib/companiesDirectory'
import { companyRoute, ROUTES } from '@/lib/routes'

interface CompaniesGridProps {
  companies: CompanyDirectoryEntry[]
  isLoading?: boolean
  isEmpty?: boolean
  isFilteredEmpty?: boolean
  hasMore?: boolean
  onLoadMore?: () => void
  isFetchingMore?: boolean
}

export function CompaniesGrid({
  companies,
  isLoading,
  isEmpty,
  isFilteredEmpty,
  hasMore,
  onLoadMore,
  isFetchingMore,
}: CompaniesGridProps) {
  const sentinelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = sentinelRef.current
    if (!el || !hasMore || !onLoadMore) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !isFetchingMore) onLoadMore()
      },
      { rootMargin: '240px' }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [hasMore, onLoadMore, isFetchingMore])

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 9 }).map((_, i) => (
          <CompanyCardSkeleton key={i} />
        ))}
      </div>
    )
  }

  if (isEmpty) {
    return (
      <EmptyState
        variant="dashed"
        icon={Building2}
        title="No companies in your directory yet"
        description="Companies are added when you run discovery (employers on developer profiles), save pipeline leads with a company, or open a GitHub organization profile at /companies/{org}."
        action={
          <div className="flex flex-wrap justify-center gap-2">
            <Button asChild>
              <Link to={ROUTES.discover}>Start discovery</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to={companyRoute('github')}>Open GitHub org example</Link>
            </Button>
          </div>
        }
        className="py-16"
      />
    )
  }

  if (isFilteredEmpty) {
    return (
      <EmptyState
        variant="dashed"
        icon={SearchX}
        title="No companies match your filters"
        description="Try adjusting search terms or clearing filters to see more organizations."
        className="py-16"
      />
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {companies.map((company) => (
          <CompanyCard key={company.slug} company={company} />
        ))}
      </div>

      {isFetchingMore && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <CompanyCardSkeleton key={i} />
          ))}
        </div>
      )}

      {hasMore && !isFetchingMore && (
        <div ref={sentinelRef} className="flex justify-center py-4" aria-hidden>
          <div className="h-2 w-2 animate-pulse rounded-full bg-muted-foreground/50" />
        </div>
      )}
    </div>
  )
}
