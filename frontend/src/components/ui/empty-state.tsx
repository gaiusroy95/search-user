import * as React from 'react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: LucideIcon | React.ReactNode
  title: string
  description?: string
  action?: React.ReactNode
  variant?: 'default' | 'dashed'
}

export function EmptyState({
  icon: IconOrNode,
  title,
  description,
  action,
  variant = 'default',
  className,
  ...props
}: EmptyStateProps) {
  const renderIcon = () => {
    if (!IconOrNode) return null
    if (React.isValidElement(IconOrNode)) return IconOrNode
    const Icon = IconOrNode as LucideIcon
    return (
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-muted/60">
        <Icon className="h-6 w-6 text-muted-foreground" aria-hidden />
      </div>
    )
  }

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-lg px-6 py-16 text-center',
        variant === 'dashed'
          ? 'border border-dashed border-border/60 bg-muted/20'
          : 'border border-border/60 bg-card',
        className
      )}
      {...props}
    >
      {renderIcon()}
      <h3 className="text-lg font-semibold tracking-tight text-foreground">{title}</h3>
      {description && (
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">{description}</p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  )
}
