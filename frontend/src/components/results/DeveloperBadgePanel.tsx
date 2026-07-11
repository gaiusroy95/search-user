import { Badge } from '@/components/ui/badge'
import {
  BADGE_LABELS,
  LEVEL_LABELS,
  type DeveloperAnalysis,
} from '@/lib/developerAnalysis'
import { cn } from '@/lib/utils'

interface DeveloperBadgePanelProps {
  analysis: DeveloperAnalysis
  compact?: boolean
  className?: string
}

export function DeveloperBadgePanel({
  analysis,
  compact = false,
  className,
}: DeveloperBadgePanelProps) {
  if (analysis.badges.length === 0 && compact) {
    return (
      <span className={cn('text-xs text-muted-foreground', className)}>
        {LEVEL_LABELS[analysis.level]} · {analysis.score}/100
      </span>
    )
  }

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex flex-wrap items-center gap-1.5">
        <Badge variant="default" className="text-[10px]">
          {analysis.levelLabel} · {analysis.score}
        </Badge>
        {analysis.badges.map((id) => (
          <Badge key={id} variant="secondary" className="text-[10px]">
            {BADGE_LABELS[id]}
          </Badge>
        ))}
      </div>

      {!compact && (
        <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
          {analysis.signals.map(({ label, value }) => (
            <div key={label} className="flex justify-between gap-2">
              <dt className="text-muted-foreground">{label}</dt>
              <dd className="font-medium">{value}</dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  )
}
