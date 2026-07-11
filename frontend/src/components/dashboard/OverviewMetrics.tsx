import { Activity } from 'lucide-react'
import { DashboardCard, MetricTile } from '@/components/dashboard/DashboardCard'
import { Skeleton } from '@/components/ui/skeleton'
import type { DashboardMetrics } from '@/lib/dashboardMetrics'
import { formatNumber } from '@/lib/utils'

interface OverviewMetricsProps {
  metrics: DashboardMetrics
  isLoading?: boolean
}

function MetricsSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-24 rounded-lg" />
      ))}
    </div>
  )
}

export function OverviewMetrics({ metrics, isLoading }: OverviewMetricsProps) {
  const apiStatusVariant =
    metrics.apiStatus === 'ready'
      ? 'success'
      : metrics.apiStatus === 'limited' || metrics.apiStatus === 'error'
        ? 'warning'
        : 'muted'

  return (
    <DashboardCard
      title="Overview"
      description="Workspace snapshot across discovery, pipeline, and API health."
      icon={Activity}
      padding="sm"
    >
      {isLoading ? (
        <MetricsSkeleton />
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
          <MetricTile
            label="Developers discovered"
            value={formatNumber(metrics.developersDiscovered)}
            hint="Latest session"
          />
          <MetricTile
            label="Saved candidates"
            value={formatNumber(metrics.savedCandidates)}
          />
          <MetricTile
            label="Active pipeline"
            value={formatNumber(metrics.activePipeline)}
            hint="Excludes closed"
          />
          <MetricTile
            label="Companies tracked"
            value={formatNumber(metrics.companiesTracked)}
          />
          <MetricTile
            label="Searches this week"
            value={formatNumber(metrics.searchesThisWeek)}
          />
          <MetricTile
            label="API status"
            value={
              metrics.apiStatus === 'loading'
                ? '…'
                : metrics.apiStatus === 'ready'
                  ? 'Ready'
                  : metrics.apiStatus === 'limited'
                    ? 'Limited'
                    : 'Error'
            }
            hint={metrics.apiStatusLabel}
            status={apiStatusVariant}
          />
        </div>
      )}
    </DashboardCard>
  )
}
