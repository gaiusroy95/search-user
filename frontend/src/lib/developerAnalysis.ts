import type { Developer } from '@/types'

export type DeveloperBadgeId =
  | 'public-email'
  | 'gmail'
  | 'commit-email'
  | 'website'
  | 'active-commit'
  | 'established'
  | 'high-followers'

export type DeveloperLevel = 'bronze' | 'silver' | 'gold' | 'platinum'

export const BADGE_LABELS: Record<DeveloperBadgeId, string> = {
  'public-email': 'Public Email',
  gmail: 'Gmail',
  'commit-email': 'Commit Email',
  website: 'Website',
  'active-commit': 'Active',
  established: 'Established',
  'high-followers': 'Influencer',
}

export const LEVEL_LABELS: Record<DeveloperLevel, string> = {
  bronze: 'Bronze',
  silver: 'Silver',
  gold: 'Gold',
  platinum: 'Platinum',
}

export interface DeveloperAnalysis {
  badges: DeveloperBadgeId[]
  level: DeveloperLevel
  levelLabel: string
  score: number
  hasGmail: boolean
  hasPublicEmail: boolean
  contactEmail: string | null
  signals: { label: string; value: string }[]
}

function daysSince(date: string | null | undefined): number | null {
  if (!date) return null
  const ms = Date.now() - new Date(date).getTime()
  return Math.floor(ms / (1000 * 60 * 60 * 24))
}

export function analyzeDeveloper(dev: Developer): DeveloperAnalysis {
  const badges: DeveloperBadgeId[] = []
  let score = 0

  const publicEmail = dev.email?.trim() || null
  const commitEmail =
    dev.activity?.lastCommitEmail?.trim() ||
    dev.activity?.recentCommits?.[0]?.email?.trim() ||
    null
  const contactEmail = publicEmail || commitEmail
  const hasGmail =
    Boolean(publicEmail?.toLowerCase().includes('@gmail.com')) ||
    Boolean(commitEmail?.toLowerCase().includes('@gmail.com'))

  if (publicEmail) {
    badges.push('public-email')
    score += 25
  }
  if (hasGmail) {
    badges.push('gmail')
    score += 15
  }
  if (commitEmail) {
    badges.push('commit-email')
    score += 20
  }
  if (dev.website) {
    badges.push('website')
    score += 10
  }

  const lastCommitDays = daysSince(dev.activity?.lastCommitAt)
  if (lastCommitDays != null && lastCommitDays <= 90) {
    badges.push('active-commit')
    score += 15
  }

  const accountDays = daysSince(dev.createdAt || dev.activity?.accountCreatedAt)
  if (accountDays != null && accountDays >= 365) {
    badges.push('established')
    score += 10
  }

  if (dev.followers >= 500) {
    badges.push('high-followers')
    score += 5
  }

  let level: DeveloperLevel = 'bronze'
  if (score >= 70) level = 'platinum'
  else if (score >= 50) level = 'gold'
  else if (score >= 30) level = 'silver'

  const signals: { label: string; value: string }[] = [
    { label: 'Contact score', value: `${score}/100` },
    { label: 'Level', value: LEVEL_LABELS[level] },
    { label: 'Public email', value: publicEmail ? 'Yes' : 'No' },
    { label: 'Gmail', value: hasGmail ? 'Yes' : 'No' },
    { label: 'Commit email', value: commitEmail ? 'Yes' : 'No' },
    { label: 'Website', value: dev.website ? 'Yes' : 'No' },
    {
      label: 'Last commit',
      value:
        lastCommitDays == null
          ? 'Unknown'
          : lastCommitDays === 0
            ? 'Today'
            : `${lastCommitDays}d ago`,
    },
    {
      label: 'Account age',
      value:
        accountDays == null
          ? 'Unknown'
          : accountDays >= 365
            ? `${Math.floor(accountDays / 365)}y+`
            : `${accountDays}d`,
    },
  ]

  return {
    badges,
    level,
    levelLabel: LEVEL_LABELS[level],
    score,
    hasGmail,
    hasPublicEmail: Boolean(publicEmail),
    contactEmail,
    signals,
  }
}

export type DeveloperSortKey =
  | 'name'
  | 'followers'
  | 'following'
  | 'email'
  | 'createdAt'

export type GmailFilter = 'all' | 'has-gmail' | 'no-gmail'
export type BadgeFilter = 'all' | DeveloperBadgeId

export function sortDevelopers(
  developers: Developer[],
  sort: DeveloperSortKey
): Developer[] {
  const list = [...developers]
  list.sort((a, b) => {
    switch (sort) {
      case 'name': {
        const an = (a.name || a.username).toLowerCase()
        const bn = (b.name || b.username).toLowerCase()
        return an.localeCompare(bn)
      }
      case 'followers':
        return b.followers - a.followers
      case 'following':
        return b.following - a.following
      case 'email': {
        const ae = analyzeDeveloper(a).contactEmail?.toLowerCase() || 'zzz'
        const be = analyzeDeveloper(b).contactEmail?.toLowerCase() || 'zzz'
        return ae.localeCompare(be)
      }
      case 'createdAt': {
        const ad = a.createdAt || a.activity?.accountCreatedAt || ''
        const bd = b.createdAt || b.activity?.accountCreatedAt || ''
        return new Date(bd).getTime() - new Date(ad).getTime()
      }
      default:
        return 0
    }
  })
  return list
}

export function filterDevelopers(
  developers: Developer[],
  gmailFilter: GmailFilter,
  badgeFilter: BadgeFilter
): Developer[] {
  return developers.filter((dev) => {
    const analysis = analyzeDeveloper(dev)
    if (gmailFilter === 'has-gmail' && !analysis.hasGmail) return false
    if (gmailFilter === 'no-gmail' && analysis.hasGmail) return false
    if (badgeFilter !== 'all' && !analysis.badges.includes(badgeFilter)) {
      return false
    }
    return true
  })
}
