import { cn } from '@/lib/utils'
import { Avatar } from '@/components/ui/avatar'

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-muted/80', className)}
      aria-hidden
      {...props}
    />
  )
}

interface SkeletonTextProps extends React.HTMLAttributes<HTMLDivElement> {
  lines?: number
}

export function SkeletonText({ lines = 3, className, ...props }: SkeletonTextProps) {
  return (
    <div className={cn('space-y-2', className)} aria-hidden {...props}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn('h-3', i === lines - 1 ? 'w-2/3' : 'w-full')}
        />
      ))}
    </div>
  )
}

interface SkeletonAvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'xs' | 'sm' | 'md' | 'lg'
}

export function SkeletonAvatar({ size = 'md', className, ...props }: SkeletonAvatarProps) {
  return (
    <Avatar size={size} className={cn('animate-pulse bg-muted/80', className)} {...props} />
  )
}

export function SkeletonCard({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'rounded-lg border border-border/60 bg-card p-4 space-y-3',
        className
      )}
      aria-hidden
      {...props}
    >
      <div className="flex gap-3">
        <SkeletonAvatar size="md" />
        <div className="flex-1 space-y-2 pt-1">
          <Skeleton className="h-3.5 w-2/3" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
      <Skeleton className="h-12 w-full" />
    </div>
  )
}

export function SkeletonListItem({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <Skeleton className={cn('h-20 w-full rounded-lg', className)} {...props} />
}

export function SkeletonPageHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('space-y-3', className)} aria-hidden {...props}>
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-4 w-72 max-w-full" />
    </div>
  )
}
