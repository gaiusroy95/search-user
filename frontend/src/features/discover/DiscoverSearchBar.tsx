import { useState } from 'react'
import {
  Building2,
  ChevronDown,
  Code2,
  Loader2,
  Search,
  SlidersHorizontal,
  Sparkles,
  User,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { useSearchStore } from '@/stores/useSearchStore'
import { COUNTRIES } from '@/types'
import type { SearchFilters } from '@/types'
import {
  countActiveFilters,
  EMPTY_DISCOVER_FILTERS,
  type DiscoverClientFilters,
} from '@/features/discover/discoverFilters'

interface DiscoverSearchBarProps {
  clientFilters: DiscoverClientFilters
  onClientFiltersChange: (filters: DiscoverClientFilters) => void
  onSearch: (filters: SearchFilters) => void
  isLoading?: boolean
  searchEnabled: boolean
}

export function DiscoverSearchBar({
  clientFilters,
  onClientFiltersChange,
  onSearch,
  isLoading,
  searchEnabled,
}: DiscoverSearchBarProps) {
  const { country, maxFollowers, maxRepos, maxFollowing, type, setField } = useSearchStore()
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [error, setError] = useState('')

  const activeFilterCount = countActiveFilters(clientFilters)

  const updateClient = (key: keyof DiscoverClientFilters, value: string) => {
    onClientFiltersChange({ ...clientFilters, [key]: value })
  }

  const clearClientFilters = () => {
    onClientFiltersChange(EMPTY_DISCOVER_FILTERS)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!country) {
      setError('Select a target country to search GitHub.')
      return
    }
    setError('')
    onSearch({
      country,
      maxFollowers: maxFollowers ? Number(maxFollowers) : undefined,
      maxRepos: maxRepos ? Number(maxRepos) : undefined,
      maxFollowing: maxFollowing ? Number(maxFollowing) : undefined,
      type,
      limit: 10,
    })
  }

  return (
    <div className="border-b border-border/60 bg-background/95 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
        {!searchEnabled && (
          <div className="mb-5 text-center">
            <span className="mb-3 inline-flex items-center gap-2 rounded-full border border-border/60 bg-muted/40 px-3 py-1 text-xs font-medium text-muted-foreground">
              <Sparkles className="h-3 w-3" />
              Developer discovery
            </span>
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Find your next <span className="text-gradient">technical hire</span>
            </h1>
            <p className="mx-auto mt-2 max-w-lg text-sm text-muted-foreground">
              Search GitHub by location, then refine with skills, role, tech stack, and company.
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" aria-label="Discover search">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search by name, username, bio, or email…"
              value={clientFilters.query}
              onChange={(e) => updateClient('query', e.target.value)}
              className="h-11 border-border/60 bg-muted/30 pl-11 text-base shadow-xs"
              inputSize="lg"
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="relative">
              <Code2 className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Skills"
                value={clientFilters.skill}
                onChange={(e) => updateClient('skill', e.target.value)}
                className="h-9 pl-9"
                inputSize="sm"
              />
            </div>
            <div className="relative">
              <User className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Role"
                value={clientFilters.role}
                onChange={(e) => updateClient('role', e.target.value)}
                className="h-9 pl-9"
                inputSize="sm"
              />
            </div>
            <div className="relative">
              <Sparkles className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Tech stack"
                value={clientFilters.tech}
                onChange={(e) => updateClient('tech', e.target.value)}
                className="h-9 pl-9"
                inputSize="sm"
              />
            </div>
            <div className="relative">
              <Building2 className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Company"
                value={clientFilters.company}
                onChange={(e) => updateClient('company', e.target.value)}
                className="h-9 pl-9"
                inputSize="sm"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Select value={country} onValueChange={(v) => setField('country', v)}>
              <SelectTrigger className="h-9 w-[180px] border-border/60 bg-muted/20">
                <SelectValue placeholder="Country" />
              </SelectTrigger>
              <SelectContent>
                {COUNTRIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button type="submit" disabled={isLoading} className="h-9">
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
              {searchEnabled ? 'Refresh results' : 'Search GitHub'}
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-9"
              onClick={() => setShowAdvanced((v) => !v)}
            >
              <SlidersHorizontal className="h-4 w-4" />
              Advanced
              <ChevronDown
                className={`h-3.5 w-3.5 transition-transform ${showAdvanced ? 'rotate-180' : ''}`}
              />
            </Button>

            {activeFilterCount > 0 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-9 text-muted-foreground"
                onClick={clearClientFilters}
              >
                <X className="h-3.5 w-3.5" />
                Clear filters ({activeFilterCount})
              </Button>
            )}

            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="hidden sm:inline-flex">
                {activeFilterCount} active filter{activeFilterCount !== 1 ? 's' : ''}
              </Badge>
            )}
          </div>

          {showAdvanced && (
            <div className="grid grid-cols-1 gap-4 rounded-lg border border-border/60 bg-muted/20 p-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-1.5">
                <Label htmlFor="disc-max-followers" className="text-xs">
                  Max followers
                </Label>
                <Input
                  id="disc-max-followers"
                  type="number"
                  min={0}
                  placeholder="Any"
                  value={maxFollowers}
                  onChange={(e) => setField('maxFollowers', e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="disc-max-repos" className="text-xs">
                  Max repos
                </Label>
                <Input
                  id="disc-max-repos"
                  type="number"
                  min={0}
                  placeholder="Any"
                  value={maxRepos}
                  onChange={(e) => setField('maxRepos', e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="disc-max-following" className="text-xs">
                  Max following
                </Label>
                <Input
                  id="disc-max-following"
                  type="number"
                  min={0}
                  placeholder="Any"
                  value={maxFollowing}
                  onChange={(e) => setField('maxFollowing', e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="disc-type" className="text-xs">
                  Account type
                </Label>
                <Select value={type} onValueChange={(v) => setField('type', v as typeof type)}>
                  <SelectTrigger id="disc-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="users">Users</SelectItem>
                    <SelectItem value="group">Group</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}
        </form>
      </div>
    </div>
  )
}
