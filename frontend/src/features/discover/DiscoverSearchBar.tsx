import { useEffect, useMemo, useState } from 'react'
import {
  Building2,
  ChevronDown,
  Code2,
  Layers,
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
import {
  COUNTRIES,
  DEVELOPER_STACKS,
  STACK_LABELS,
  type DeveloperStack,
  type SearchFilters,
} from '@/types'

export interface DiscoverFormFilters {
  query: string
  skill: string
  role: string
  tech: string
  company: string
}

export const EMPTY_DISCOVER_FORM: DiscoverFormFilters = {
  query: '',
  skill: '',
  role: '',
  tech: '',
  company: '',
}

function countDraftFilters(filters: DiscoverFormFilters): number {
  return Object.values(filters).filter((v) => v.trim().length > 0).length
}

function submittedFilterChips(filters: SearchFilters | null): string[] {
  if (!filters) return []
  const chips: string[] = []
  if (filters.country) chips.push(filters.country)
  if (filters.stack) chips.push(STACK_LABELS[filters.stack] ?? filters.stack)
  if (filters.query?.trim()) chips.push(`q: ${filters.query.trim()}`)
  if (filters.skill?.trim()) chips.push(`skill: ${filters.skill.trim()}`)
  if (filters.role?.trim()) chips.push(`role: ${filters.role.trim()}`)
  if (filters.tech?.trim()) chips.push(`tech: ${filters.tech.trim()}`)
  if (filters.company?.trim()) chips.push(`company: ${filters.company.trim()}`)
  if (filters.maxFollowers) chips.push(`≤${filters.maxFollowers} followers`)
  if (filters.maxRepos) chips.push(`≤${filters.maxRepos} repos`)
  if (filters.maxFollowing) chips.push(`≤${filters.maxFollowing} following`)
  if (filters.type && filters.type !== 'user') chips.push(filters.type)
  return chips
}

interface DiscoverSearchBarProps {
  /** Last submitted GitHub search filters (for chips). */
  activeFilters: SearchFilters | null
  onSearch: (filters: SearchFilters) => void
  isLoading?: boolean
  searchEnabled: boolean
}

export function DiscoverSearchBar({
  activeFilters,
  onSearch,
  isLoading,
  searchEnabled,
}: DiscoverSearchBarProps) {
  const { country, stack, maxFollowers, maxRepos, maxFollowing, type, setField } =
    useSearchStore()
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState<DiscoverFormFilters>(() => ({
    query: activeFilters?.query ?? '',
    skill: activeFilters?.skill ?? '',
    role: activeFilters?.role ?? '',
    tech: activeFilters?.tech ?? '',
    company: activeFilters?.company ?? '',
  }))

  // Hydrate draft fields when a persisted search session is restored.
  useEffect(() => {
    if (!activeFilters) return
    setForm({
      query: activeFilters.query ?? '',
      skill: activeFilters.skill ?? '',
      role: activeFilters.role ?? '',
      tech: activeFilters.tech ?? '',
      company: activeFilters.company ?? '',
    })
  }, [
    activeFilters?.query,
    activeFilters?.skill,
    activeFilters?.role,
    activeFilters?.tech,
    activeFilters?.company,
  ])

  const draftCount = countDraftFilters(form)
  const chips = useMemo(() => submittedFilterChips(activeFilters), [activeFilters])

  const updateForm = (key: keyof DiscoverFormFilters, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const clearDraft = () => {
    setForm(EMPTY_DISCOVER_FORM)
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
      stack: stack || undefined,
      query: form.query.trim() || undefined,
      skill: form.skill.trim() || undefined,
      role: form.role.trim() || undefined,
      tech: form.tech.trim() || undefined,
      company: form.company.trim() || undefined,
      maxFollowers: maxFollowers ? Number(maxFollowers) : undefined,
      maxRepos: maxRepos ? Number(maxRepos) : undefined,
      maxFollowing: maxFollowing ? Number(maxFollowing) : undefined,
      type,
      limit: 24,
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
              Enter skills, role, or tech, then click Search GitHub — same style as
              GitHub user search.
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" aria-label="Discover search">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Keywords (name, bio…) — applied on Search"
              value={form.query}
              onChange={(e) => updateForm('query', e.target.value)}
              className="h-11 border-border/60 bg-muted/30 pl-11 text-base shadow-xs"
              inputSize="lg"
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="relative">
              <Code2 className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Skills (e.g. TypeScript)"
                value={form.skill}
                onChange={(e) => updateForm('skill', e.target.value)}
                className="h-9 pl-9"
                inputSize="sm"
              />
            </div>
            <div className="relative">
              <User className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Role (e.g. engineer)"
                value={form.role}
                onChange={(e) => updateForm('role', e.target.value)}
                className="h-9 pl-9"
                inputSize="sm"
              />
            </div>
            <div className="relative">
              <Sparkles className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Tech (e.g. React, Go)"
                value={form.tech}
                onChange={(e) => updateForm('tech', e.target.value)}
                className="h-9 pl-9"
                inputSize="sm"
              />
            </div>
            <div className="relative">
              <Building2 className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Company"
                value={form.company}
                onChange={(e) => updateForm('company', e.target.value)}
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

            <Select
              value={stack || 'any'}
              onValueChange={(v) =>
                setField('stack', v === 'any' ? '' : (v as DeveloperStack))
              }
            >
              <SelectTrigger
                className="h-9 w-[160px] border-border/60 bg-muted/20"
                aria-label="Engineering stack"
              >
                <Layers className="mr-1.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                <SelectValue placeholder="Stack" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any stack</SelectItem>
                {DEVELOPER_STACKS.map((s) => (
                  <SelectItem key={s} value={s}>
                    {STACK_LABELS[s]}
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

            {draftCount > 0 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-9 text-muted-foreground"
                onClick={clearDraft}
              >
                <X className="h-3.5 w-3.5" />
                Clear fields ({draftCount})
              </Button>
            )}
          </div>

          {chips.length > 0 && (
            <div className="flex flex-wrap items-center gap-2" aria-label="Active GitHub filters">
              <span className="text-xs text-muted-foreground">Applied on last search:</span>
              {chips.map((chip) => (
                <Badge key={chip} variant="secondary" className="text-xs font-normal">
                  {chip}
                </Badge>
              ))}
            </div>
          )}

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
