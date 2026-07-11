import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface FilterToolbarShellProps {
  title: string
  description: string
  actions?: ReactNode
  search: ReactNode
  filters: ReactNode
  className?: string
}

export function FilterToolbarShell({
  title,
  description,
  actions,
  search,
  filters,
  className,
}: FilterToolbarShellProps) {
  return (
    <div className={cn('space-y-4 rounded-xl border border-border/60 bg-card p-4 sm:p-5', className)}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>
        {actions}
      </div>
      {search}
      {filters}
    </div>
  )
}

interface FilterToggleProps {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
}

export function FilterToggle({ label, checked, onChange }: FilterToggleProps) {
  return (
    <label className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-md border border-border/60 bg-background px-3 text-sm">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 rounded border-border accent-primary"
      />
      {label}
    </label>
  )
}
