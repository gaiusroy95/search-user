import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import {
  selectDashboardMetrics,
  selectRecentActivityForDashboard,
  selectRecommendedActions,
  selectSavedUsernames,
  type DashboardActivityItem,
  type DashboardMetrics,
  type RecommendedAction,
} from '@/lib/dashboardMetrics'
import { queryKeys } from '@/lib/queryKeys'
import { useActivityStore } from '@/stores/useActivityStore'
import { useCompaniesStore } from '@/stores/useCompaniesStore'
import { useDiscoveryStore } from '@/stores/useDiscoveryStore'
import { useProspectStore } from '@/stores/useProspectStore'

async function fetchHealth() {
  const { data } = await axios.get<{ status: string; tokenConfigured: boolean }>(
    '/api/health'
  )
  return data
}

export interface DashboardData {
  metrics: DashboardMetrics
  recentActivity: DashboardActivityItem[]
  recommendedActions: RecommendedAction[]
  isLoading: boolean
}

export function useDashboardMetrics(): DashboardData {
  const developers = useDiscoveryStore((s) => s.developers)
  const lastSearchTotalCount = useDiscoveryStore((s) => s.lastSearchTotalCount)
  const searchEnabled = useDiscoveryStore((s) => s.searchEnabled)
  const prospects = useProspectStore((s) => s.prospects)
  const events = useActivityStore((s) => s.events)
  const trackedCompanies = useActivityStore((s) => s.trackedCompanies)
  const companiesCount = useCompaniesStore((s) => Object.keys(s.entries).length)

  const {
    data: health,
    isLoading: healthLoading,
    isError: healthError,
  } = useQuery({
    queryKey: queryKeys.health(),
    queryFn: fetchHealth,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  })

  return useMemo(() => {
    const savedUsernames = selectSavedUsernames(prospects)

    const metrics = selectDashboardMetrics({
      developers,
      prospects,
      events,
      trackedCompanies,
      companiesCount,
      healthLoading,
      healthError,
      tokenConfigured: health?.tokenConfigured,
      lastSearchTotalCount: lastSearchTotalCount ?? undefined,
    })

    const recentActivity = selectRecentActivityForDashboard(events, prospects)
    const recommendedActions = selectRecommendedActions({
      developers,
      prospects,
      savedUsernames,
    })

    return {
      metrics,
      recentActivity,
      recommendedActions,
      isLoading: healthLoading,
    }
  }, [
    developers,
    searchEnabled,
    prospects,
    events,
    trackedCompanies,
    companiesCount,
    healthLoading,
    healthError,
    health?.tokenConfigured,
    lastSearchTotalCount,
  ])
}
