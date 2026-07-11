import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export interface DashboardCardProps {
  title: string
  description?: string
  icon?: LucideIcon
  action?: React.ReactNode
  children: React.ReactNode
  className?: string
  contentClassName?: string
  padding?: 'none' | 'sm' | 'md'
}

export function DashboardCard({
  title,
  description,
  icon: Icon,
  action,
  children,
  className,
  contentClassName,
  padding = 'md',
}: DashboardCardProps) {
  return (
    <Card className={cn('border-border/60 shadow-xs', className)}>
      <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0 pb-3">
        <div className="min-w-0 space-y-1">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold">
            {Icon && (
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                <Icon className="h-3.5 w-3.5" />
              </span>
            )}
            <span className="truncate">{title}</span>
          </CardTitle>
          {description && (
            <CardDescription className="text-xs leading-relaxed">{description}</CardDescription>
          )}
        </div>
        {action}
      </CardHeader>
      <CardContent
        className={cn(
          padding === 'none' && 'p-0 pt-0',
          padding === 'sm' && 'px-4 pb-4 pt-0',
          padding === 'md' && 'px-5 pb-5 pt-0',
          contentClassName
        )}
      >
        {children}
      </CardContent>
    </Card>
  )
}

interface MetricTileProps {
  label: string
  value: string | number
  hint?: string
  status?: 'default' | 'success' | 'warning' | 'muted'
}

const statusStyles = {
  default: 'text-foreground',
  success: 'text-emerald-600 dark:text-emerald-400',
  warning: 'text-amber-600 dark:text-amber-400',
  muted: 'text-muted-foreground',
}

export function MetricTile({ label, value, hint, status = 'default' }: MetricTileProps) {
  return (
    <div className="rounded-lg border border-border/60 bg-muted/20 p-4">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className={cn('mt-1 text-2xl font-semibold tabular-nums tracking-tight', statusStyles[status])}>
        {value}
      </p>
      {hint && <p className="mt-1 text-[11px] text-muted-foreground">{hint}</p>}
    </div>
  )
}
