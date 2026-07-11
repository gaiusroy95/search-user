import { Link } from 'react-router-dom'
import {
  ArrowRight,
  Building2,
  Clock,
  Download,
  GitBranch,
  Search,
  Sparkles,
  UserPlus,
} from 'lucide-react'
import { DashboardCard } from '@/components/dashboard/DashboardCard'
import { EmptyState } from '@/components/ui/empty-state'
import { Skeleton } from '@/components/ui/skeleton'
import { formatRelativeTime, type DashboardActivityItem } from '@/lib/dashboardMetrics'
import { ROUTES } from '@/lib/routes'
import { cn } from '@/lib/utils'

const activityIcons = {
  search: Search,
  candidate_saved: UserPlus,
  pipeline_status: GitBranch,
  company_view: Building2,
  ai_action: Sparkles,
  export: Download,
} as const

interface RecentActivitySectionProps {
  items: DashboardActivityItem[]
  isLoading?: boolean
}

export function RecentActivitySection({ items, isLoading }: RecentActivitySectionProps) {
  return (
    <DashboardCard
      title="Recent activity"
      description="Searches, saves, pipeline updates, company views, AI, and exports."
      icon={Clock}
      padding="none"
      contentClassName="px-0 pb-0"
      action={
        <Link
          to={ROUTES.activity}
          className="text-xs font-medium text-primary hover:underline"
        >
          View all
        </Link>
      }
    >
      {isLoading ? (
        <div className="space-y-0 divide-y divide-border/60 px-5 pb-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="my-3 h-14 w-full rounded-lg" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="px-5 pb-5">
          <EmptyState
            variant="dashed"
            title="No activity yet"
            description="Run a discovery search or save a candidate to see updates here."
            className="py-10"
          />
        </div>
      ) : (
        <ul className="divide-y divide-border/60">
          {items.map((item) => {
            const Icon = activityIcons[item.type]
            const content = (
              <>
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted/60 text-muted-foreground">
                  <Icon className="h-4 w-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">{item.title}</span>
                  {item.description && (
                    <span className="block truncate text-xs text-muted-foreground">
                      {item.description}
                    </span>
                  )}
                </span>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {formatRelativeTime(item.at)}
                </span>
                {item.href && (
                  <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                )}
              </>
            )

            const className = cn(
              'group flex w-full items-center gap-3 px-5 py-3.5 text-left transition-colors',
              item.href && 'hover:bg-muted/30'
            )

            return (
              <li key={item.id}>
                {item.href ? (
                  <Link to={item.href} className={className}>
                    {content}
                  </Link>
                ) : (
                  <div className={className}>{content}</div>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </DashboardCard>
  )
}
