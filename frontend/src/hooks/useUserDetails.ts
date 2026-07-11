import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '@/lib/queryKeys'
import { getUserDetails } from '@/services/api'

export function useUserDetails(username: string | undefined, enabled = true) {
  const normalized = username?.trim() ?? ''

  return useQuery({
    queryKey: queryKeys.users.detail(normalized),
    queryFn: () => getUserDetails(normalized),
    enabled: enabled && Boolean(normalized),
    staleTime: 10 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
  })
}
