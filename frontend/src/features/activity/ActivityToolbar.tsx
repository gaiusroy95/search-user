import { Search, SlidersHorizontal, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { FilterToolbarShell } from '@/features/filters/FilterToolbarShell'
import {
  ACTIVITY_RANGE_OPTIONS,
  ACTIVITY_TYPE_OPTIONS,
  type ActivityCenterFilters,
} from '@/lib/activityCenter'

interface ActivityToolbarProps {
  filters: ActivityCenterFilters
  totalCount: number
  hasActiveFilters: boolean
  onFiltersChange: (patch: Partial<ActivityCenterFilters>) => void
  onReset: () => void
}

export function ActivityToolbar({
  filters,
  totalCount,
  hasActiveFilters,
  onFiltersChange,
  onReset,
}: ActivityToolbarProps) {
  return (
    <FilterToolbarShell
      title="Activity"
      description={`${totalCount.toLocaleString()} event${totalCount === 1 ? '' : 's'} in your workspace timeline`}
      search={
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search activity titles, descriptions, types…"
            value={filters.query}
            onChange={(e) => onFiltersChange({ query: e.target.value })}
            className="h-10 pl-9"
          />
        </div>
      }
      filters={
        <div className="flex flex-wrap items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-muted-foreground" aria-hidden />

          <Select
            value={filters.type}
            onValueChange={(value) =>
              onFiltersChange({ type: value as ActivityCenterFilters['type'] })
            }
          >
            <SelectTrigger className="h-9 w-[170px]">
              <SelectValue placeholder="Activity type" />
            </SelectTrigger>
            <SelectContent>
              {ACTIVITY_TYPE_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.range}
            onValueChange={(value) =>
              onFiltersChange({ range: value as ActivityCenterFilters['range'] })
            }
          >
            <SelectTrigger className="h-9 w-[150px]">
              <SelectValue placeholder="Date range" />
            </SelectTrigger>
            <SelectContent>
              {ACTIVITY_RANGE_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {hasActiveFilters && (
            <Button type="button" variant="ghost" size="sm" className="h-9" onClick={onReset}>
              <X className="h-3.5 w-3.5" />
              Clear filters
            </Button>
          )}
        </div>
      }
    />
  )
}
