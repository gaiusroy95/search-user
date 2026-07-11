import type { Developer, RepositorySummary } from '@/types'

export interface CompanyProfile {
  slug: string
  name: string
  overview: string | null
  industry: string
  teamSize: string | null
  techStack: string[]
  website: string | null
  contactPageUrl: string | null
  location: string | null
  avatar: string | null
  profileUrl: string | null
  hiringStatus: string
  activelyHiring: boolean
  publicRepos: number
}

export interface CompanyKeyPerson {
  username: string
  name: string | null
  avatar: string | null
  role: string | null
}

const INDUSTRY_PATTERNS: { pattern: RegExp; industry: string }[] = [
  { pattern: /\bfintech|financial|banking|payments/i, industry: 'Financial Services' },
  { pattern: /\bhealth|medical|biotech|pharma/i, industry: 'Healthcare & Life Sciences' },
  { pattern: /\be-commerce|retail|marketplace/i, industry: 'Retail & E-commerce' },
  { pattern: /\beducation|learning|edtech/i, industry: 'Education' },
  { pattern: /\bgaming|game studio/i, industry: 'Gaming' },
  { pattern: /\bsecurity|cybersecurity/i, industry: 'Cybersecurity' },
  { pattern: /\bcloud|infrastructure|devops|platform/i, industry: 'Cloud & Infrastructure' },
  { pattern: /\bai|machine learning|ml|data platform/i, industry: 'AI & Data' },
  { pattern: /\bsaas|software|technology|tech/i, industry: 'Technology' },
]

function normalizeUrl(url: string): string {
  return url.startsWith('http') ? url : `https://${url}`
}

export function slugifyCompany(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export function parseCompanySlug(company: string): string {
  const trimmed = company.trim()
  if (trimmed.startsWith('@')) return trimmed.slice(1).toLowerCase()
  return slugifyCompany(trimmed)
}

export function inferIndustry(text: string, repos: RepositorySummary[]): string {
  const haystack = [text, ...repos.map((r) => r.description ?? '')].join(' ')
  for (const { pattern, industry } of INDUSTRY_PATTERNS) {
    if (pattern.test(haystack)) return industry
  }
  return 'Technology'
}

export function inferHiringStatus(text: string | null): {
  status: string
  activelyHiring: boolean
} {
  if (!text) {
    return { status: 'No public signal', activelyHiring: false }
  }
  const lower = text.toLowerCase()
  if (/not hiring|no open roles/i.test(lower)) {
    return { status: 'Not hiring', activelyHiring: false }
  }
  if (/hiring|join us|open roles|we're hiring|careers@|work with us/i.test(lower)) {
    return { status: 'Actively hiring', activelyHiring: true }
  }
  return { status: 'No public signal', activelyHiring: false }
}

export function collectTechStack(repos: RepositorySummary[]): string[] {
  const stack = new Set<string>()
  repos.forEach((repo) => {
    if (repo.language) stack.add(repo.language)
  })
  return Array.from(stack).slice(0, 14)
}

export function deriveContactPageUrl(website: string | null): string | null {
  if (!website?.trim()) return null
  try {
    const url = new URL(normalizeUrl(website))
    return `${url.origin}/contact`
  } catch {
    return null
  }
}

export function buildCompanyFromOrg(
  slug: string,
  org: Developer,
  repos: RepositorySummary[]
): CompanyProfile {
  const overview = org.bio
  const { status, activelyHiring } = inferHiringStatus(overview)
  const website = org.website ? normalizeUrl(org.website) : null

  return {
    slug,
    name: org.name ?? org.username,
    overview,
    industry: inferIndustry(overview ?? '', repos),
    teamSize: null,
    techStack: collectTechStack(repos),
    website,
    contactPageUrl: deriveContactPageUrl(org.website),
    location: org.location,
    avatar: org.avatar,
    profileUrl: org.profile,
    hiringStatus: status,
    activelyHiring,
    publicRepos: org.publicRepos,
  }
}

export function findKeyPeople(
  developers: Developer[],
  companyName: string,
  slug: string,
  limit = 8
): CompanyKeyPerson[] {
  const needle = companyName.toLowerCase()
  const slugNorm = slug.toLowerCase()

  return developers
    .filter((dev) => {
      if (!dev.company) return false
      const c = dev.company.toLowerCase()
      return (
        c.includes(needle) ||
        slugifyCompany(dev.company) === slugNorm ||
        c.replace(/^@/, '') === slugNorm
      )
    })
    .slice(0, limit)
    .map((dev) => ({
      username: dev.username,
      name: dev.name,
      avatar: dev.avatar,
      role: dev.bio?.split('\n')[0]?.slice(0, 80) ?? dev.primaryLanguage ?? null,
    }))
}

export function formatTeamSize(
  company: CompanyProfile,
  keyPeopleCount: number
): string {
  if (company.teamSize) return company.teamSize
  if (keyPeopleCount > 0) {
    return `${keyPeopleCount}+ known on platform`
  }
  return 'Not publicly available'
}
