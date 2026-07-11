import type { CompanyProfile } from '@/lib/companyProfile'
import {
  inferHiringStatus,
  inferIndustry,
  parseCompanySlug,
} from '@/lib/companyProfile'
import type { Developer, Prospect } from '@/types'

export const COMPANIES_PAGE_SIZE = 12

export type CompanySort = 'active' | 'recent' | 'employees' | 'alpha'

export type TeamSizeFilter = 'ALL' | 'unknown' | '1-10' | '11-50' | '51-200' | '201+'

export type HiringFilter = 'ALL' | 'actively_hiring' | 'not_hiring' | 'no_signal'

export interface CompanyDirectoryEntry {
  slug: string
  name: string
  githubOrg: string
  domain: string | null
  industry: string
  teamSizeLabel: string
  employeeCount: number
  openRoles: number
  hiringStatus: string
  activelyHiring: boolean
  country: string | null
  avatar: string | null
  viewedAt: string | null
  activityScore: number
  publicRepos: number
  enriched: boolean
}

export interface CompaniesDirectoryFilters {
  query: string
  industry: string
  teamSize: TeamSizeFilter
  hiring: HiringFilter
  country: string
  sort: CompanySort
}

export const EMPTY_COMPANIES_FILTERS: CompaniesDirectoryFilters = {
  query: '',
  industry: 'ALL',
  teamSize: 'ALL',
  hiring: 'ALL',
  country: 'ALL',
  sort: 'recent',
}

export const COMPANY_SORT_OPTIONS: { value: CompanySort; label: string }[] = [
  { value: 'active', label: 'Most active' },
  { value: 'recent', label: 'Recently viewed' },
  { value: 'employees', label: 'Most employees' },
  { value: 'alpha', label: 'Alphabetical' },
]

export const TEAM_SIZE_OPTIONS: { value: TeamSizeFilter; label: string }[] = [
  { value: 'ALL', label: 'All team sizes' },
  { value: 'unknown', label: 'Unknown' },
  { value: '1-10', label: '1–10' },
  { value: '11-50', label: '11–50' },
  { value: '51-200', label: '51–200' },
  { value: '201+', label: '201+' },
]

export const HIRING_OPTIONS: { value: HiringFilter; label: string }[] = [
  { value: 'ALL', label: 'All hiring status' },
  { value: 'actively_hiring', label: 'Actively hiring' },
  { value: 'not_hiring', label: 'Not hiring' },
  { value: 'no_signal', label: 'No public signal' },
]

export const INDUSTRY_OPTIONS = [
  'ALL',
  'Technology',
  'AI & Data',
  'Cloud & Infrastructure',
  'Cybersecurity',
  'Financial Services',
  'Healthcare & Life Sciences',
  'Retail & E-commerce',
  'Education',
  'Gaming',
] as const

export function extractDomain(url: string | null | undefined): string | null {
  if (!url?.trim()) return null
  try {
    const normalized = url.startsWith('http') ? url : `https://${url}`
    return new URL(normalized).hostname.replace(/^www\./, '')
  } catch {
    return null
  }
}

export function parseCountryFromLocation(location: string | null | undefined): string | null {
  if (!location?.trim()) return null
  const parts = location.split(',').map((p) => p.trim())
  return parts[parts.length - 1] || null
}

export function teamSizeBucket(count: number): TeamSizeFilter {
  if (count <= 0) return 'unknown'
  if (count <= 10) return '1-10'
  if (count <= 50) return '11-50'
  if (count <= 200) return '51-200'
  return '201+'
}

export function formatTeamSizeLabel(count: number): string {
  if (count <= 0) return 'Unknown'
  if (count === 1) return '1 known member'
  return `${count} known members`
}

function computeActivityScore(
  publicRepos: number,
  employeeCount: number,
  enriched: boolean
): number {
  return publicRepos * 2 + employeeCount + (enriched ? 10 : 0)
}

export function buildStubFromDeveloper(dev: Developer, employeeCount: number): CompanyDirectoryEntry {
  const company = dev.company!.trim()
  const slug = parseCompanySlug(company)
  const hiring = inferHiringStatus(dev.bio)

  return {
    slug,
    name: company.replace(/^@/, ''),
    githubOrg: slug,
    domain: extractDomain(dev.website),
    industry: inferIndustry(dev.bio ?? '', dev.repositories),
    teamSizeLabel: formatTeamSizeLabel(employeeCount),
    employeeCount,
    openRoles: hiring.activelyHiring ? 1 : 0,
    hiringStatus: hiring.status,
    activelyHiring: hiring.activelyHiring,
    country: parseCountryFromLocation(dev.location),
    avatar: dev.avatar,
    viewedAt: null,
    activityScore: computeActivityScore(dev.publicRepos, employeeCount, false),
    publicRepos: dev.publicRepos,
    enriched: false,
  }
}

export function buildEntryFromProfile(
  profile: CompanyProfile,
  employeeCount: number,
  viewedAt: string | null
): CompanyDirectoryEntry {
  return {
    slug: profile.slug,
    name: profile.name,
    githubOrg: profile.slug,
    domain: extractDomain(profile.website),
    industry: profile.industry,
    teamSizeLabel:
      employeeCount > 0 ? formatTeamSizeLabel(employeeCount) : profile.teamSize ?? 'Unknown',
    employeeCount,
    openRoles: profile.activelyHiring ? 1 : 0,
    hiringStatus: profile.hiringStatus,
    activelyHiring: profile.activelyHiring,
    country: parseCountryFromLocation(profile.location),
    avatar: profile.avatar,
    viewedAt,
    activityScore: computeActivityScore(profile.publicRepos, employeeCount, true),
    publicRepos: profile.publicRepos,
    enriched: true,
  }
}

export function mergeCompanyEntry(
  existing: CompanyDirectoryEntry | undefined,
  incoming: CompanyDirectoryEntry
): CompanyDirectoryEntry {
  if (!existing) return incoming

  const employeeCount = Math.max(existing.employeeCount, incoming.employeeCount)

  return {
    ...existing,
    ...incoming,
    name: incoming.enriched ? incoming.name : existing.name || incoming.name,
    domain: incoming.domain ?? existing.domain,
    industry: incoming.enriched ? incoming.industry : existing.industry || incoming.industry,
    avatar: incoming.avatar ?? existing.avatar,
    viewedAt: incoming.viewedAt ?? existing.viewedAt,
    employeeCount,
    teamSizeLabel: employeeCount > 0 ? formatTeamSizeLabel(employeeCount) : existing.teamSizeLabel,
    publicRepos: Math.max(existing.publicRepos, incoming.publicRepos),
    activityScore: Math.max(existing.activityScore, incoming.activityScore),
    enriched: existing.enriched || incoming.enriched,
    activelyHiring: incoming.enriched
      ? incoming.activelyHiring
      : existing.activelyHiring || incoming.activelyHiring,
    hiringStatus: incoming.enriched ? incoming.hiringStatus : existing.hiringStatus,
    openRoles: incoming.enriched
      ? incoming.openRoles
      : Math.max(existing.openRoles, incoming.openRoles),
    country: incoming.country ?? existing.country,
  }
}

export function collectCompanySlugCounts(
  developers: Developer[],
  prospects: Prospect[]
): Map<string, { slug: string; count: number; sample: Developer }> {
  const map = new Map<string, { slug: string; count: number; sample: Developer }>()

  const add = (dev: Developer) => {
    if (!dev.company?.trim()) return
    const slug = parseCompanySlug(dev.company)
    if (!slug) return
    const current = map.get(slug)
    if (current) {
      current.count += 1
    } else {
      map.set(slug, { slug, count: 1, sample: dev })
    }
  }

  developers.forEach(add)
  prospects.forEach(add)
  return map
}

export function filtersFromSearchParams(params: URLSearchParams): CompaniesDirectoryFilters {
  const sort = params.get('sort')
  const validSort = COMPANY_SORT_OPTIONS.some((o) => o.value === sort)

  return {
    query: params.get('q') ?? '',
    industry: params.get('industry') ?? 'ALL',
    teamSize: (TEAM_SIZE_OPTIONS.some((o) => o.value === params.get('teamSize'))
      ? params.get('teamSize')
      : 'ALL') as TeamSizeFilter,
    hiring: (HIRING_OPTIONS.some((o) => o.value === params.get('hiring'))
      ? params.get('hiring')
      : 'ALL') as HiringFilter,
    country: params.get('country') ?? 'ALL',
    sort: validSort ? (sort as CompanySort) : 'recent',
  }
}

export function filtersToSearchParams(filters: CompaniesDirectoryFilters): URLSearchParams {
  const params = new URLSearchParams()
  if (filters.query.trim()) params.set('q', filters.query.trim())
  if (filters.industry !== 'ALL') params.set('industry', filters.industry)
  if (filters.teamSize !== 'ALL') params.set('teamSize', filters.teamSize)
  if (filters.hiring !== 'ALL') params.set('hiring', filters.hiring)
  if (filters.country !== 'ALL') params.set('country', filters.country)
  if (filters.sort !== 'recent') params.set('sort', filters.sort)
  return params
}

function matchesQuery(entry: CompanyDirectoryEntry, query: string): boolean {
  const q = query.trim().toLowerCase()
  if (!q) return true
  return (
    entry.name.toLowerCase().includes(q) ||
    entry.githubOrg.toLowerCase().includes(q) ||
    entry.slug.toLowerCase().includes(q) ||
    (entry.domain?.toLowerCase().includes(q) ?? false)
  )
}

function matchesHiring(entry: CompanyDirectoryEntry, hiring: HiringFilter): boolean {
  if (hiring === 'ALL') return true
  if (hiring === 'actively_hiring') return entry.activelyHiring
  if (hiring === 'not_hiring') return entry.hiringStatus === 'Not hiring'
  return entry.hiringStatus === 'No public signal'
}

export function filterCompanies(
  entries: CompanyDirectoryEntry[],
  filters: CompaniesDirectoryFilters
): CompanyDirectoryEntry[] {
  return entries.filter((entry) => {
    if (!matchesQuery(entry, filters.query)) return false
    if (filters.industry !== 'ALL' && entry.industry !== filters.industry) return false
    if (filters.teamSize !== 'ALL' && teamSizeBucket(entry.employeeCount) !== filters.teamSize) {
      return false
    }
    if (!matchesHiring(entry, filters.hiring)) return false
    if (filters.country !== 'ALL') {
      const country = entry.country ?? 'Unknown'
      if (country !== filters.country) return false
    }
    return true
  })
}

export function sortCompanies(
  entries: CompanyDirectoryEntry[],
  sort: CompanySort
): CompanyDirectoryEntry[] {
  const list = [...entries]

  switch (sort) {
    case 'active':
      return list.sort(
        (a, b) => b.activityScore - a.activityScore || a.name.localeCompare(b.name)
      )
    case 'recent':
      return list.sort((a, b) => {
        const aTime = a.viewedAt ? new Date(a.viewedAt).getTime() : 0
        const bTime = b.viewedAt ? new Date(b.viewedAt).getTime() : 0
        return bTime - aTime || a.name.localeCompare(b.name)
      })
    case 'employees':
      return list.sort(
        (a, b) => b.employeeCount - a.employeeCount || b.publicRepos - a.publicRepos
      )
    case 'alpha':
      return list.sort((a, b) => a.name.localeCompare(b.name))
    default:
      return list
  }
}

export function paginateCompanies<T>(
  items: T[],
  page: number,
  pageSize = COMPANIES_PAGE_SIZE
): T[] {
  return items.slice(0, page * pageSize)
}

export function buildMinimalFromTracked(
  slug: string,
  name: string,
  viewedAt: string
): CompanyDirectoryEntry {
  return {
    slug,
    name,
    githubOrg: slug,
    domain: null,
    industry: 'Technology',
    teamSizeLabel: 'Unknown',
    employeeCount: 0,
    openRoles: 0,
    hiringStatus: 'No public signal',
    activelyHiring: false,
    country: null,
    avatar: `https://github.com/${slug}.png`,
    viewedAt,
    activityScore: 1,
    publicRepos: 0,
    enriched: false,
  }
}
