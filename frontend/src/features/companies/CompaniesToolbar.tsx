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
import {
  COMPANY_SORT_OPTIONS,
  HIRING_OPTIONS,
  INDUSTRY_OPTIONS,
  TEAM_SIZE_OPTIONS,
  type CompaniesDirectoryFilters,
} from '@/lib/companiesDirectory'
import { COUNTRIES } from '@/types'

interface CompaniesToolbarProps {
  filters: CompaniesDirectoryFilters
  totalCount: number
  hasActiveFilters: boolean
  onFiltersChange: (patch: Partial<CompaniesDirectoryFilters>) => void
  onReset: () => void
}

export function CompaniesToolbar({
  filters,
  totalCount,
  hasActiveFilters,
  onFiltersChange,
  onReset,
}: CompaniesToolbarProps) {
  return (
    <div className="space-y-4 rounded-xl border border-border/60 bg-card p-4 sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Companies</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {totalCount.toLocaleString()} organization{totalCount === 1 ? '' : 's'} in your
            directory
          </p>
        </div>
        <Select
          value={filters.sort}
          onValueChange={(value) =>
            onFiltersChange({ sort: value as CompaniesDirectoryFilters['sort'] })
          }
        >
          <SelectTrigger className="h-9 w-full sm:w-[180px]">
            <SelectValue placeholder="Sort" />
          </SelectTrigger>
          <SelectContent>
            {COMPANY_SORT_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search name, GitHub org, or domain…"
          value={filters.query}
          onChange={(e) => onFiltersChange({ query: e.target.value })}
          className="h-10 pl-9"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <SlidersHorizontal className="h-4 w-4 text-muted-foreground" aria-hidden />

        <Select
          value={filters.industry}
          onValueChange={(value) => onFiltersChange({ industry: value })}
        >
          <SelectTrigger className="h-9 w-[160px]">
            <SelectValue placeholder="Industry" />
          </SelectTrigger>
          <SelectContent>
            {INDUSTRY_OPTIONS.map((industry) => (
              <SelectItem key={industry} value={industry}>
                {industry === 'ALL' ? 'All industries' : industry}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.teamSize}
          onValueChange={(value) =>
            onFiltersChange({ teamSize: value as CompaniesDirectoryFilters['teamSize'] })
          }
        >
          <SelectTrigger className="h-9 w-[150px]">
            <SelectValue placeholder="Team size" />
          </SelectTrigger>
          <SelectContent>
            {TEAM_SIZE_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.hiring}
          onValueChange={(value) =>
            onFiltersChange({ hiring: value as CompaniesDirectoryFilters['hiring'] })
          }
        >
          <SelectTrigger className="h-9 w-[160px]">
            <SelectValue placeholder="Hiring" />
          </SelectTrigger>
          <SelectContent>
            {HIRING_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.country}
          onValueChange={(value) => onFiltersChange({ country: value })}
        >
          <SelectTrigger className="h-9 w-[150px]">
            <SelectValue placeholder="Country" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All countries</SelectItem>
            {COUNTRIES.map((country) => (
              <SelectItem key={country} value={country}>
                {country}
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
    </div>
  )
}
