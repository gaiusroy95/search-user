import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  COMPANIES_PAGE_SIZE,
  EMPTY_COMPANIES_FILTERS,
  filterCompanies,
  filtersFromSearchParams,
  filtersToSearchParams,
  paginateCompanies,
  sortCompanies,
  type CompaniesDirectoryFilters,
  type CompanyDirectoryEntry,
} from '@/lib/companiesDirectory'
import { useCompaniesStore } from '@/stores/useCompaniesStore'
import { useActivityStore } from '@/stores/useActivityStore'
import { useDiscoveryStore } from '@/stores/useDiscoveryStore'
import { useProspectStore } from '@/stores/useProspectStore'

export function useCompaniesDirectory() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [page, setPage] = useState(1)
  const [isFetchingMore, setIsFetchingMore] = useState(false)

  const entries = useCompaniesStore((s) => s.entries)
  const syncFromWorkspace = useCompaniesStore((s) => s.syncFromWorkspace)
  const syncFromTrackedViews = useCompaniesStore((s) => s.syncFromTrackedViews)
  const trackedCompanies = useActivityStore((s) => s.trackedCompanies)
  const developers = useDiscoveryStore((s) => s.developers)
  const prospects = useProspectStore((s) => s.prospects)

  const filters = useMemo(
    () => filtersFromSearchParams(searchParams),
    [searchParams]
  )

  useEffect(() => {
    syncFromWorkspace(developers, prospects)
  }, [developers, prospects, syncFromWorkspace])

  useEffect(() => {
    syncFromTrackedViews(trackedCompanies)
  }, [trackedCompanies, syncFromTrackedViews])

  useEffect(() => {
    setPage(1)
  }, [searchParams])

  const setFilters = useCallback(
    (patch: Partial<CompaniesDirectoryFilters>) => {
      const next = { ...filters, ...patch }
      setSearchParams(filtersToSearchParams(next), { replace: true })
    },
    [filters, setSearchParams]
  )

  const resetFilters = useCallback(() => {
    setSearchParams(new URLSearchParams(), { replace: true })
  }, [setSearchParams])

  const entryList = useMemo(() => Object.values(entries), [entries])

  const filtered = useMemo(
    () => sortCompanies(filterCompanies(entryList, filters), filters.sort),
    [entryList, filters]
  )

  const visible = useMemo(
    () => paginateCompanies(filtered, page, COMPANIES_PAGE_SIZE),
    [filtered, page]
  )

  const hasMore = visible.length < filtered.length

  const loadMore = useCallback(() => {
    if (!hasMore) return
    setIsFetchingMore(true)
    setPage((p) => p + 1)
    requestAnimationFrame(() => setIsFetchingMore(false))
  }, [hasMore])

  const hasActiveFilters =
    filters.query.trim() !== '' ||
    filters.industry !== EMPTY_COMPANIES_FILTERS.industry ||
    filters.teamSize !== EMPTY_COMPANIES_FILTERS.teamSize ||
    filters.hiring !== EMPTY_COMPANIES_FILTERS.hiring ||
    filters.country !== EMPTY_COMPANIES_FILTERS.country

  return {
    filters,
    setFilters,
    resetFilters,
    visible,
    totalCount: filtered.length,
    hasMore,
    loadMore,
    isFetchingMore,
    isEmpty: entryList.length === 0,
    isFilteredEmpty: entryList.length > 0 && filtered.length === 0,
    hasActiveFilters,
  }
}

export type { CompanyDirectoryEntry, CompaniesDirectoryFilters }
