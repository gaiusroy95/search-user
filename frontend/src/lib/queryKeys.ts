import type { SearchFilters } from '@/types'

export const queryKeys = {
  all: ['github-discovery'] as const,
  health: () => [...queryKeys.all, 'health'] as const,
  users: {
    all: () => [...queryKeys.all, 'users'] as const,
    detail: (username: string) =>
      [...queryKeys.users.all(), username.trim().toLowerCase()] as const,
  },
  search: {
    developers: (filters: SearchFilters | null) =>
      [...queryKeys.all, 'search', 'developers', filters] as const,
  },
} as const
