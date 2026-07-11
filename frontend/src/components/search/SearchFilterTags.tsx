import { Badge } from '@/components/ui/badge'
import { useDiscoveryStore } from '@/stores/useDiscoveryStore'
import { STACK_LABELS } from '@/types'

/** Chips for the last submitted GitHub Discover search. */
export function SearchFilterTags() {
  const filters = useDiscoveryStore((s) => s.activeFilters)
  if (!filters) return null

  const tags: string[] = []
  if (filters.country) tags.push(filters.country)
  if (filters.stack) tags.push(STACK_LABELS[filters.stack] ?? filters.stack)
  if (filters.query?.trim()) tags.push(`q: ${filters.query.trim()}`)
  if (filters.skill?.trim()) tags.push(`skill: ${filters.skill.trim()}`)
  if (filters.role?.trim()) tags.push(`role: ${filters.role.trim()}`)
  if (filters.tech?.trim()) tags.push(`tech: ${filters.tech.trim()}`)
  if (filters.company?.trim()) tags.push(`company: ${filters.company.trim()}`)
  if (filters.maxFollowers) tags.push(`≤${filters.maxFollowers} followers`)
  if (filters.maxRepos) tags.push(`≤${filters.maxRepos} repos`)
  if (filters.maxFollowing) tags.push(`≤${filters.maxFollowing} following`)

  if (!tags.length) return null

  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag) => (
        <Badge key={tag} variant="secondary" className="text-xs">
          {tag}
        </Badge>
      ))}
    </div>
  )
}
