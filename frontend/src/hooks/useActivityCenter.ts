import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  ACTIVITY_PAGE_SIZE,
  aggregateActivityFeed,
  filterActivityFeed,
  filtersFromSearchParams,
  filtersToSearchParams,
  hasActiveActivityFilters,
  paginateActivityFeed,
  type ActivityCenterFilters,
  type ActivityFeedItem,
} from '@/lib/activityCenter'
import { useActivityStore } from '@/stores/useActivityStore'
import { useProspectStore } from '@/stores/useProspectStore'

export function useActivityCenter() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [page, setPage] = useState(1)
  const [isFetchingMore, setIsFetchingMore] = useState(false)

  const events = useActivityStore((s) => s.events)
  const prospects = useProspectStore((s) => s.prospects)

  const filters = useMemo(
    () => filtersFromSearchParams(searchParams),
    [searchParams]
  )

  useEffect(() => {
    setPage(1)
  }, [searchParams])

  const allItems = useMemo(
    () => aggregateActivityFeed(events, prospects),
    [events, prospects]
  )

  const filtered = useMemo(
    () => filterActivityFeed(allItems, filters),
    [allItems, filters]
  )

  const visible = useMemo(
    () => paginateActivityFeed(filtered, page, ACTIVITY_PAGE_SIZE),
    [filtered, page]
  )

  const hasMore = visible.length < filtered.length

  const loadMore = useCallback(() => {
    if (!hasMore) return
    setIsFetchingMore(true)
    setPage((p) => p + 1)
    requestAnimationFrame(() => setIsFetchingMore(false))
  }, [hasMore])

  const setFilters = useCallback(
    (patch: Partial<ActivityCenterFilters>) => {
      const next = { ...filters, ...patch }
      setSearchParams(filtersToSearchParams(next), { replace: true })
    },
    [filters, setSearchParams]
  )

  const resetFilters = useCallback(() => {
    setSearchParams(new URLSearchParams(), { replace: true })
  }, [setSearchParams])

  return {
    filters,
    setFilters,
    resetFilters,
    allItems,
    filtered,
    visible,
    totalCount: filtered.length,
    hasMore,
    loadMore,
    isFetchingMore,
    isEmpty: allItems.length === 0,
    isFilteredEmpty: allItems.length > 0 && filtered.length === 0,
    hasActiveFilters: hasActiveActivityFilters(filters),
  }
}

export type { ActivityCenterFilters, ActivityFeedItem }
