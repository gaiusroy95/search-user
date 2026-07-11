import { Link } from 'react-router-dom'
import { AlertCircle, ArrowRight, CheckCircle2, Lightbulb } from 'lucide-react'
import { DashboardCard } from '@/components/dashboard/DashboardCard'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import type { RecommendedAction } from '@/lib/dashboardMetrics'
import { cn } from '@/lib/utils'

const priorityStyles = {
  high: 'border-l-amber-500 bg-amber-500/5',
  medium: 'border-l-primary bg-primary/5',
  low: 'border-l-border bg-muted/20',
} as const

interface RecommendedActionsSectionProps {
  actions: RecommendedAction[]
  isLoading?: boolean
}

export function RecommendedActionsSection({
  actions,
  isLoading,
}: RecommendedActionsSectionProps) {
  return (
    <DashboardCard
      title="Recommended actions"
      description="Prioritized next steps based on your pipeline and discovery data."
      icon={Lightbulb}
      padding="sm"
    >
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-lg" />
          ))}
        </div>
      ) : actions.length === 0 ? (
        <div className="flex items-start gap-3 rounded-lg border border-dashed border-border/60 bg-muted/10 p-4">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" />
          <div>
            <p className="text-sm font-medium">You&apos;re all caught up</p>
            <p className="mt-1 text-xs text-muted-foreground">
              No urgent follow-ups. Run discovery or review your pipeline when ready.
            </p>
          </div>
        </div>
      ) : (
        <ul className="space-y-3">
          {actions.slice(0, 5).map((action) => (
            <li
              key={action.id}
              className={cn(
                'flex flex-col gap-3 rounded-lg border border-border/60 border-l-[3px] p-4 sm:flex-row sm:items-center sm:justify-between',
                priorityStyles[action.priority]
              )}
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  {action.priority === 'high' && (
                    <AlertCircle className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
                  )}
                  <p className="text-sm font-medium">{action.title}</p>
                </div>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  {action.description}
                </p>
              </div>
              <Button variant="outline" size="sm" className="shrink-0" asChild>
                <Link to={action.href}>
                  {action.cta}
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </Button>
            </li>
          ))}
        </ul>
      )}
    </DashboardCard>
  )
}
