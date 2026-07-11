import { LayoutGrid, List, Search, Table2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { PROSPECT_STATUSES, STATUS_LABELS } from '@/types'
import type { ProspectStatus } from '@/types'

export type ProspectView = 'kanban' | 'list' | 'table'
export type ProspectSort = 'savedAt' | 'followers' | 'name'

interface ProspectsToolbarProps {
  search: string
  onSearchChange: (v: string) => void
  statusFilter: ProspectStatus | 'ALL'
  onStatusFilterChange: (v: ProspectStatus | 'ALL') => void
  sort: ProspectSort
  onSortChange: (v: ProspectSort) => void
  view: ProspectView
  onViewChange: (v: ProspectView) => void
  total: number
}

export function ProspectsToolbar({
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  sort,
  onSortChange,
  view,
  onViewChange,
  total,
}: ProspectsToolbarProps) {
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-4 sm:flex-row sm:flex-wrap sm:items-center">
      <div className="relative min-w-[200px] flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search prospects..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>

      <Select value={statusFilter} onValueChange={(v) => onStatusFilterChange(v as ProspectStatus | 'ALL')}>
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">All statuses</SelectItem>
          {PROSPECT_STATUSES.map((s) => (
            <SelectItem key={s} value={s}>
              {STATUS_LABELS[s]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={sort} onValueChange={(v) => onSortChange(v as ProspectSort)}>
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="Sort" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="savedAt">Recently saved</SelectItem>
          <SelectItem value="followers">Most followers</SelectItem>
          <SelectItem value="name">Name A–Z</SelectItem>
        </SelectContent>
      </Select>

      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">{total} prospects</span>
        <div className="flex rounded-lg border border-border p-1">
          {([
            ['kanban', LayoutGrid],
            ['list', List],
            ['table', Table2],
          ] as const).map(([id, Icon]) => (
            <Button
              key={id}
              size="sm"
              variant={view === id ? 'secondary' : 'ghost'}
              onClick={() => onViewChange(id)}
              aria-label={`${id} view`}
            >
              <Icon className="h-4 w-4" />
            </Button>
          ))}
        </div>
      </div>
    </div>
  )
}
