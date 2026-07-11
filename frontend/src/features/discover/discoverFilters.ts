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

export function filterDiscoverResults(
  developers: Developer[],
  filters: DiscoverClientFilters
): Developer[] {
  return developers.filter((dev) => {
    if (filters.query.trim()) {
      const q = filters.query.trim().toLowerCase()
      const haystack = [
        dev.name,
        dev.username,
        dev.bio,
        dev.company,
        dev.email,
        dev.location,
        dev.primaryLanguage,
        ...dev.languages,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      if (!haystack.includes(q)) return false
    }

    if (filters.skill.trim()) {
      const skill = filters.skill.trim().toLowerCase()
      const langs = [dev.primaryLanguage, ...dev.languages].filter(Boolean) as string[]
      if (!langs.some((l) => l.toLowerCase().includes(skill))) return false
    }

    if (filters.tech.trim()) {
      const tech = filters.tech.trim().toLowerCase()
      const langs = [dev.primaryLanguage, ...dev.languages].filter(Boolean) as string[]
      const repos = dev.repositories.map((r) => r.language).filter(Boolean) as string[]
      if (
        ![...langs, ...repos].some((t) => t.toLowerCase().includes(tech)) &&
        !dev.bio?.toLowerCase().includes(tech)
      ) {
        return false
      }
    }

    if (filters.role.trim()) {
      const role = filters.role.trim().toLowerCase()
      if (
        !includesText(dev.bio, role) &&
        !includesText(dev.company, role) &&
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
