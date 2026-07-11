import { useEffect, useMemo, useRef } from 'react'
import { Link } from 'react-router-dom'
import {
  Activity,
  Building2,
  Download,
  GitBranch,
  Search,
  Sparkles,
  UserPlus,
  type LucideIcon,
} from 'lucide-react'
import { EmptyState } from '@/components/ui/empty-state'
import { Skeleton } from '@/components/ui/skeleton'
import {
  ACTIVITY_TYPE_LABELS,
  formatRelativeTime,
  groupActivityByDay,
  type ActivityFeedItem,
} from '@/lib/activityCenter'
import type { WorkspaceEventType } from '@/stores/useActivityStore'
import { cn } from '@/lib/utils'

const ACTIVITY_ICONS: Record<WorkspaceEventType, LucideIcon> = {
  search: Search,
  candidate_saved: UserPlus,
  pipeline_status: GitBranch,
  company_view: Building2,
  ai_action: Sparkles,
  export: Download,
}

const ACTIVITY_ACCENT: Record<WorkspaceEventType, string> = {
  search: 'border-l-sky-500',
  candidate_saved: 'border-l-emerald-500',
  pipeline_status: 'border-l-violet-500',
  company_view: 'border-l-amber-500',
  ai_action: 'border-l-primary',
  export: 'border-l-orange-500',
}

const ICON_BG: Record<WorkspaceEventType, string> = {
  search: 'bg-sky-500/10 text-sky-600 dark:text-sky-400',
  candidate_saved: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  pipeline_status: 'bg-violet-500/10 text-violet-600 dark:text-violet-400',
  company_view: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  ai_action: 'bg-primary/10 text-primary',
  export: 'bg-orange-500/10 text-orange-600 dark:text-orange-400',
}

interface ActivityFeedProps {
  items: ActivityFeedItem[]
  isLoading?: boolean
  isEmpty?: boolean
  isFilteredEmpty?: boolean
  hasMore?: boolean
  onLoadMore?: () => void
  isFetchingMore?: boolean
}

function ActivityFeedRow({ item }: { item: ActivityFeedItem }) {
  const Icon = ACTIVITY_ICONS[item.type]
  const content = (
    <>
      <span
        className={cn(
          'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg',
          ICON_BG[item.type]
        )}
      >
        <Icon className="h-4 w-4" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
          <span className="text-sm font-medium">{item.title}</span>
          <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
            {ACTIVITY_TYPE_LABELS[item.type]}
          </span>
        </span>
        {item.description && (
          <span className="mt-0.5 block text-sm text-muted-foreground">{item.description}</span>
        )}
      </span>
      <span className="shrink-0 text-xs text-muted-foreground" title={new Date(item.at).toLocaleString()}>
        {formatRelativeTime(item.at)}
      </span>
    </>
  )

  const className = cn(
    'group flex items-start gap-3 border-l-[3px] px-4 py-3.5 transition-colors',
    ACTIVITY_ACCENT[item.type],
    item.href && 'hover:bg-muted/30'
  )

  if (item.href) {
    return (
      <Link to={item.href} className={className}>
        {content}
      </Link>
    )
  }

  return <div className={className}>{content}</div>
}

export function ActivityFeed({
  items,
  isLoading,
  isEmpty,
  isFilteredEmpty,
  hasMore,
  onLoadMore,
  isFetchingMore,
}: ActivityFeedProps) {
  const sentinelRef = useRef<HTMLDivElement>(null)
  const groups = useMemo(() => groupActivityByDay(items), [items])

  useEffect(() => {
    const el = sentinelRef.current
    if (!el || !hasMore || !onLoadMore) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !isFetchingMore) onLoadMore()
      },
      { rootMargin: '240px' }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [hasMore, onLoadMore, isFetchingMore])

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-lg" />
        ))}
      </div>
    )
  }

  if (isEmpty) {
    return (
      <EmptyState
        variant="dashed"
        icon={Activity}
        title="No activity yet"
        description="Searches, saves, pipeline updates, company views, AI generations, and exports will appear here as you work."
        className="py-16"
      />
    )
  }

  if (isFilteredEmpty) {
    return (
      <EmptyState
        variant="dashed"
        icon={Search}
        title="No activity matches your filters"
        description="Try a broader date range or clear your filters."
        className="py-16"
      />
    )
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border/60 bg-card">
      {groups.map((group) => (
        <section key={group.dateKey}>
          <div className="sticky top-0 z-10 border-b border-border/40 bg-muted/40 px-4 py-2 backdrop-blur-sm">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {group.label}
            </h2>
          </div>
          <div className="divide-y divide-border/40">
            {group.items.map((item) => (
              <ActivityFeedRow key={item.id} item={item} />
            ))}
          </div>
        </section>
      ))}

      {hasMore && (
        <div ref={sentinelRef} className="flex justify-center border-t border-border/40 py-4">
          {isFetchingMore ? (
            <span className="text-xs text-muted-foreground">Loading more…</span>
          ) : (
            <span className="text-xs text-muted-foreground">Scroll for more</span>
          )}
        </div>
      )}
    </div>
  )
}
