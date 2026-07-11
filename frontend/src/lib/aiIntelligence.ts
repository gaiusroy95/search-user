import { analyzeDeveloper } from '@/lib/developerAnalysis'
import {
  buildCompanyFromOrg,
  collectTechStack,
  inferHiringStatus,
} from '@/lib/companyProfile'
import { collectSkills, inferRole } from '@/lib/personProfile'
import type { Developer, RepositorySummary } from '@/types'
import { formatNumber } from '@/lib/utils'

export function generateProfileSummary(dev: Developer): string {
  const analysis = analyzeDeveloper(dev)
  const role = inferRole(dev)
  const skills = collectSkills(dev)
  const skillText = skills.length ? skills.slice(0, 6).join(', ') : 'mixed stack'

  const lines = [
    `${dev.name ?? dev.username} is a ${role}${dev.company ? ` at ${dev.company}` : ''}${dev.location ? ` based in ${dev.location}` : ''}.`,
    dev.bio ? dev.bio : `Public GitHub activity shows ${formatNumber(dev.followers)} followers and ${dev.publicRepos} repositories.`,
    `Primary technical signals: ${skillText}. Contact score ${analysis.score}/100 (${analysis.levelLabel}).`,
  ]

  if (analysis.contactEmail) {
    lines.push(`Reachable via ${analysis.contactEmail}.`)
  }

  if (dev.activity?.lastCommitAt) {
    lines.push(
      `Last commit activity recorded ${new Date(dev.activity.lastCommitAt).toLocaleDateString()}.`
    )
  }

  return lines.join('\n\n')
}

export function generateCompanySummary(
  org: Developer,
  repos: RepositorySummary[]
): string {
  const company = buildCompanyFromOrg(org.username, org, repos)
  const hiring = inferHiringStatus(org.bio)
  const stack = collectTechStack(repos)

  return [
    `${company.name} operates in ${company.industry}${company.location ? ` (${company.location})` : ''}.`,
    company.overview ?? 'No public organization description is available on GitHub.',
    stack.length
      ? `Technology signals from public repos include ${stack.slice(0, 8).join(', ')}.`
      : 'No public repository language data available.',
    `Hiring signal: ${hiring.status}. ${company.publicRepos} public repositories on GitHub.`,
    company.website ? `Website: ${company.website}` : '',
  ]
    .filter(Boolean)
    .join('\n\n')
}

export function generateOutreachMessage(dev: Developer): string {
  const role = inferRole(dev)
  const skills = collectSkills(dev)
  const topSkill = skills[0] ?? 'open source'
  const name = dev.name?.split(' ')[0] ?? dev.username
  const repo = dev.repositories[0]?.name

  const hook = repo
    ? `I noticed your work on ${repo} and your ${topSkill} experience.`
    : `I came across your GitHub profile and your work in ${topSkill}.`

  return `Hi ${name},

${hook}

I'm reaching out because we're exploring a ${role} collaboration and your background${dev.company ? ` at ${dev.company}` : ''} stood out.

Would you be open to a brief 15-minute conversation this week?

Best regards`
}

export function compareCandidates(a: Developer, b: Developer): string {
  const analysisA = analyzeDeveloper(a)
  const analysisB = analyzeDeveloper(b)
  const skillsA = collectSkills(a)
  const skillsB = collectSkills(b)
  const shared = skillsA.filter((s) => skillsB.includes(s))

  const rows = [
    `| | ${a.name ?? a.username} | ${b.name ?? b.username} |`,
    `| --- | --- | --- |`,
    `| Role | ${inferRole(a)} | ${inferRole(b)} |`,
    `| Company | ${a.company ?? '—'} | ${b.company ?? '—'} |`,
    `| Followers | ${formatNumber(a.followers)} | ${formatNumber(b.followers)} |`,
    `| Repos | ${a.publicRepos} | ${b.publicRepos} |`,
    `| Contact score | ${analysisA.score} (${analysisA.levelLabel}) | ${analysisB.score} (${analysisB.levelLabel}) |`,
    `| Email signal | ${analysisA.contactEmail ? 'Yes' : 'No'} | ${analysisB.contactEmail ? 'Yes' : 'No'} |`,
  ]

  const summary = [
    shared.length
      ? `Shared technologies: ${shared.join(', ')}.`
      : 'No overlapping language signals in public data.',
    analysisA.score > analysisB.score
      ? `@${a.username} has a stronger contact signal for outreach.`
      : analysisB.score > analysisA.score
        ? `@${b.username} has a stronger contact signal for outreach.`
        : 'Both candidates have similar contact scores.',
  ].join(' ')

  return `${rows.join('\n')}\n\n**Recommendation:** ${summary}`
}
