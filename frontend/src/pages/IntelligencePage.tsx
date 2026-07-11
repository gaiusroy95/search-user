import { lazy, Suspense } from 'react'
import { AnalyticsPageSkeleton } from '@/components/loading'
import { useDiscoveryStore } from '@/stores/useDiscoveryStore'

const AnalyticsDashboard = lazy(() =>
  import('@/components/analytics/AnalyticsDashboard').then((m) => ({
    default: m.AnalyticsDashboard,
  }))
)

export function IntelligencePage() {
  const developers = useDiscoveryStore((s) => s.developers)

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <Suspense fallback={<AnalyticsPageSkeleton />}>
        <AnalyticsDashboard developers={developers} />
      </Suspense>
    </div>
  )
}
