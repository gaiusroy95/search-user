import type { Developer } from '@/types'
import type { DeveloperAnalysis } from '@/lib/developerAnalysis'

export interface PersonContactInfo {
  businessEmail: string | null
  companyWebsite: string | null
  linkedIn: string | null
}

const ROLE_PATTERNS: { pattern: RegExp; role: string }[] = [
  { pattern: /\b(staff|principal|senior|lead)\s+software engineer/i, role: 'Senior Software Engineer' },
  { pattern: /\bsoftware engineer/i, role: 'Software Engineer' },
  { pattern: /\bfull[\s-]?stack/i, role: 'Full Stack Developer' },
  { pattern: /\bfront[\s-]?end/i, role: 'Frontend Developer' },
  { pattern: /\bback[\s-]?end/i, role: 'Backend Developer' },
  { pattern: /\bdevops/i, role: 'DevOps Engineer' },
  { pattern: /\bdata engineer/i, role: 'Data Engineer' },
  { pattern: /\bmachine learning|ml engineer/i, role: 'ML Engineer' },
  { pattern: /\bengineer/i, role: 'Engineer' },
  { pattern: /\bdeveloper/i, role: 'Developer' },
  { pattern: /\barchitect/i, role: 'Software Architect' },
  { pattern: /\bdesigner/i, role: 'Designer' },
  { pattern: /\bproduct manager/i, role: 'Product Manager' },
]

export function inferRole(dev: Developer): string {
  const haystack = [dev.bio, dev.company].filter(Boolean).join(' ')
  for (const { pattern, role } of ROLE_PATTERNS) {
    if (pattern.test(haystack)) return role
  }
  if (dev.primaryLanguage) return `${dev.primaryLanguage} Developer`
  return 'Software Developer'
}

function normalizeUrl(url: string): string {
  return url.startsWith('http') ? url : `https://${url}`
}

export function extractLinkedIn(website: string | null): string | null {
  if (!website?.toLowerCase().includes('linkedin.com')) return null
  return normalizeUrl(website)
}

export function extractCompanyWebsite(website: string | null): string | null {
  if (!website?.trim()) return null
  if (website.toLowerCase().includes('linkedin.com')) return null
  return normalizeUrl(website)
}

export function getPersonContact(
  dev: Developer,
  analysis: DeveloperAnalysis
): PersonContactInfo {
  return {
    businessEmail: dev.email?.trim() || analysis.contactEmail,
    companyWebsite: extractCompanyWebsite(dev.website),
    linkedIn: extractLinkedIn(dev.website),
  }
}

export function collectSkills(dev: Developer): string[] {
  const skills = new Set<string>()
  if (dev.primaryLanguage) skills.add(dev.primaryLanguage)
  dev.languages.forEach((l) => skills.add(l))
  dev.repositories.forEach((r) => {
    if (r.language) skills.add(r.language)
  })
  return Array.from(skills).slice(0, 12)
}

export interface PersonAiInsights {
  skillSummary: string
  strengthAnalysis: string
  outreachSuggestion: string
}

export function generatePersonInsights(
  dev: Developer,
  analysis: DeveloperAnalysis
): PersonAiInsights {
  const skills = collectSkills(dev)
  const skillList = skills.length ? skills.slice(0, 5).join(', ') : 'general software development'
  const role = inferRole(dev)

  const skillSummary =
    skills.length >= 3
      ? `Strong ${skillList} profile with ${skills.length} technologies observed across repositories and profile data.`
      : skills.length > 0
        ? `Focused on ${skillList}. Depth may be concentrated in a primary stack.`
        : 'Limited public language signals — review repositories for stack details.'

  const strengths: string[] = []
  if (analysis.badges.includes('active-commit')) strengths.push('recent GitHub activity')
  if (analysis.badges.includes('established')) strengths.push('long-standing account')
  if (analysis.badges.includes('high-followers')) strengths.push('strong community presence')
  if (dev.publicRepos >= 10) strengths.push('active open-source portfolio')
  if (analysis.hasPublicEmail || analysis.contactEmail) strengths.push('reachable contact signals')
  if (analysis.level === 'gold' || analysis.level === 'platinum') {
    strengths.push(`${analysis.levelLabel} contact score (${analysis.score}/100)`)
  }

  const strengthAnalysis =
    strengths.length > 0
      ? `Notable strengths: ${strengths.join(', ')}.`
      : `Early-stage signal profile — ${analysis.levelLabel} tier with room to validate fit through direct conversation.`

  const companyPart = dev.company ? ` at ${dev.company}` : ''
  const locationPart = dev.location ? ` based in ${dev.location}` : ''
  const outreachSuggestion = analysis.contactEmail
    ? `Open with a concise note referencing their ${role} work${companyPart}${locationPart}. Mention a specific repo or recent commit to show genuine research. Keep the ask clear: intro call, collaboration, or role discussion.`
    : `No public email detected — consider engaging via GitHub profile or company channel. Reference their ${skillList} work and a concrete reason for reaching out.`

  return { skillSummary, strengthAnalysis, outreachSuggestion }
}
