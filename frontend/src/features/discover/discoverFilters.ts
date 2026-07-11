import type { Developer } from '@/types'

export interface DiscoverClientFilters {
  query: string
  skill: string
  role: string
  tech: string
  company: string
}

export const EMPTY_DISCOVER_FILTERS: DiscoverClientFilters = {
  query: '',
  skill: '',
  role: '',
  tech: '',
  company: '',
}

function includesText(value: string | null | undefined, needle: string): boolean {
  if (!needle.trim()) return true
  if (!value) return false
  return value.toLowerCase().includes(needle.trim().toLowerCase())
}

function profileHaystack(dev: Developer): string {
  return [
    dev.name,
    dev.username,
    dev.bio,
    dev.company,
    dev.email,
    dev.location,
    dev.primaryLanguage,
    ...dev.languages,
    ...dev.repositories.map((r) => r.language),
    ...dev.repositories.map((r) => r.name),
    ...dev.repositories.map((r) => r.description),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
}

function languagePool(dev: Developer): string[] {
  return [
    dev.primaryLanguage,
    ...dev.languages,
    ...dev.repositories.map((r) => r.language),
  ].filter(Boolean) as string[]
}

export function filterDiscoverResults(
  developers: Developer[],
  filters: DiscoverClientFilters
): Developer[] {
  return developers.filter((dev) => {
    const haystack = profileHaystack(dev)

    if (filters.query.trim()) {
      const q = filters.query.trim().toLowerCase()
      if (!haystack.includes(q)) return false
    }

    if (filters.skill.trim()) {
      const skill = filters.skill.trim().toLowerCase()
      const langs = languagePool(dev)
      const langHit = langs.some((l) => l.toLowerCase().includes(skill))
      // Also match bio/name when language labels don't contain the skill keyword
      if (!langHit && !haystack.includes(skill)) return false
    }

    if (filters.tech.trim()) {
      const tech = filters.tech.trim().toLowerCase()
      if (!haystack.includes(tech)) return false
    }

    if (filters.role.trim()) {
      const role = filters.role.trim().toLowerCase()
      if (
        !includesText(dev.bio, role) &&
        !includesText(dev.company, role) &&
        !includesText(dev.name, role) &&
        !dev.username.toLowerCase().includes(role)
      ) {
        return false
      }
    }

    if (filters.company.trim()) {
      if (!includesText(dev.company, filters.company)) return false
    }

    return true
  })
}

export function countActiveFilters(filters: DiscoverClientFilters): number {
  return Object.values(filters).filter((v) => v.trim().length > 0).length
}

export function hasClientFilters(filters: DiscoverClientFilters): boolean {
  return countActiveFilters(filters) > 0
}
