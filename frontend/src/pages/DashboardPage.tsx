import {
  OverviewMetrics,
  QuickActionsSection,
  RecentActivitySection,
  RecommendedActionsSection,
} from '@/components/dashboard'
import { SkeletonPageHeader } from '@/components/ui/skeleton'
import { useDashboardMetrics } from '@/hooks/useDashboardMetrics'
import { useStoreHydrated } from '@/hooks/useStoreHydrated'
import { useActivityStore } from '@/stores/useActivityStore'
import { useDiscoveryStore } from '@/stores/useDiscoveryStore'
import { useProspectStore } from '@/stores/useProspectStore'

function DashboardSkeleton() {
  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <SkeletonPageHeader />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="h-40 animate-pulse rounded-lg bg-muted/80" />
          <div className="h-64 animate-pulse rounded-lg bg-muted/80" />
        </div>
        <div className="space-y-6">
          <div className="h-56 animate-pulse rounded-lg bg-muted/80" />
          <div className="h-48 animate-pulse rounded-lg bg-muted/80" />
        </div>
      </div>
    </div>
  )
}

export function DashboardPage() {
  const discoveryHydrated = useStoreHydrated(useDiscoveryStore.persist)
  const prospectHydrated = useStoreHydrated(useProspectStore.persist)
  const activityHydrated = useStoreHydrated(useActivityStore.persist)

  const storesReady = discoveryHydrated && prospectHydrated && activityHydrated
  const { metrics, recentActivity, recommendedActions, isLoading } = useDashboardMetrics()

  if (!storesReady) {
    return <DashboardSkeleton />
  }

  const showLoading = isLoading && !metrics.hasWorkspaceData

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <header className="space-y-1">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Workspace
        </p>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Dashboard</h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          {metrics.hasWorkspaceData
            ? 'Recent activity, pipeline health, and recommended next steps.'
            : 'Get started with discovery to populate your recruitment workspace.'}
        </p>
      </header>

      <OverviewMetrics metrics={metrics} isLoading={showLoading} />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <RecentActivitySection items={recentActivity} isLoading={showLoading} />
          <RecommendedActionsSection actions={recommendedActions} isLoading={showLoading} />
        </div>
        <div className="space-y-6">
          <QuickActionsSection />
        </div>
      </div>
    </div>
  )
}
