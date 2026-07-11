import { useInfiniteQuery } from '@tanstack/react-query'
import { queryKeys } from '@/lib/queryKeys'
import { searchDevelopers } from '@/services/api'
import type { SearchFilters } from '@/types'

export function useDevelopers(filters: SearchFilters | null, enabled: boolean) {
  return useInfiniteQuery({
    queryKey: queryKeys.search.developers(filters),
    queryFn: ({ pageParam }) => searchDevelopers(filters!, pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? (lastPage.nextPage ?? lastPage.page + 1) : undefined,
    enabled: enabled && Boolean(filters?.country),
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    placeholderData: (previousData) => previousData,
  })
}
