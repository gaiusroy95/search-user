import { analyzeDeveloper } from '@/lib/developerAnalysis'
import { collectSkills, inferRole } from '@/lib/personProfile'
import { parseCompanySlug } from '@/lib/companyProfile'
import type { CopilotTask, CopilotWorkspaceSnapshot } from '@/lib/ai/types'
import type { Developer, Prospect, ProspectStatus } from '@/types'
import { STATUS_LABELS } from '@/types'
import { formatNumber } from '@/lib/utils'

const MS_PER_DAY = 86_400_000
const CONTACTED_STATUSES: ProspectStatus[] = [
  'CONTACTED',
  'INTERESTED',
  'MEETING',
  'OPPORTUNITY',
]

function daysSince(iso: string | null | undefined): number | null {
  if (!iso) return null
  return Math.floor((Date.now() - new Date(iso).getTime()) / MS_PER_DAY)
}

function lastPipelineTouch(prospect: Prospect): string {
  return prospect.activityHistory[0]?.at ?? prospect.savedAt
}

export function generateCandidateSummary(dev: Developer): string {
  const analysis = analyzeDeveloper(dev)
  const role = inferRole(dev)
  const skills = collectSkills(dev)

  const strengths: string[] = []
  if (analysis.badges.includes('active-commit')) strengths.push('Recent GitHub commit activity')
  if (analysis.badges.includes('established')) strengths.push('Established GitHub presence')
  if (analysis.badges.includes('high-followers')) {
    strengths.push(`Strong visibility (${formatNumber(dev.followers)} followers)`)
  }
  if (dev.publicRepos >= 8) strengths.push(`Active OSS portfolio (${dev.publicRepos} repos)`)
  if (analysis.contactEmail) strengths.push(`Reachable contact signal (${analysis.contactEmail})`)
  if (skills.length >= 3) strengths.push(`Multi-stack profile: ${skills.slice(0, 5).join(', ')}`)
  if (analysis.level === 'gold' || analysis.level === 'platinum') {
    strengths.push(`${analysis.levelLabel} contact score (${analysis.score}/100)`)
  }
  if (strengths.length === 0) {
    strengths.push('Public profile available for further qualification')
  }

  const risks: string[] = []
  if (!analysis.contactEmail) risks.push('No public email — outreach may require alternate channel')
  if (!dev.company) risks.push('Employer not listed — harder to assess seniority context')
  if (skills.length < 2) risks.push('Limited language signals in public repos')
  const commitDays = daysSince(dev.activity?.lastCommitAt)
  if (commitDays != null && commitDays > 180) {
    risks.push(`Low recent activity (last commit ~${commitDays}d ago)`)
  }
  if (analysis.score < 40) risks.push('Weak contact score — validate fit before heavy investment')
  if (risks.length === 0) risks.push('No major red flags from public GitHub data')

  let recommendation: string
  if (analysis.score >= 70 && analysis.contactEmail) {
    recommendation = `**Pursue** — Strong ${role} signal with reachable contact. Schedule intro within 48h and reference a specific repo.`
  } else if (analysis.score >= 45) {
    recommendation = `**Nurture** — Worth engaging but validate stack fit and timing. Start with a lightweight GitHub or LinkedIn touch.`
  } else {
    recommendation = `**Pass for now** — Limited signals for active outreach. Revisit if discovery context improves or they enter your target company list.`
  }

  return [
    `# ${dev.name ?? dev.username} — Recruiting Brief`,
    `${role}${dev.company ? ` @ ${dev.company}` : ''}${dev.location ? ` · ${dev.location}` : ''}`,
    '',
    '## Strengths',
    ...strengths.map((s) => `- ${s}`),
    '',
    '## Risks',
    ...risks.map((r) => `- ${r}`),
    '',
    '## Hiring Recommendation',
    recommendation,
  ].join('\n')
}

export function compareMultipleCandidates(developers: Developer[]): string {
  if (developers.length < 2) {
    return 'Select at least two candidates to compare.'
  }

  const headers = ['Metric', ...developers.map((d) => d.name ?? d.username)]
  const rows: string[][] = [
    headers,
    ['---', ...developers.map(() => '---')],
    ['Role', ...developers.map((d) => inferRole(d))],
    ['Company', ...developers.map((d) => d.company ?? '—')],
    ['Location', ...developers.map((d) => d.location ?? '—')],
    ['Followers', ...developers.map((d) => formatNumber(d.followers))],
    ['Repos', ...developers.map((d) => String(d.publicRepos))],
    [
      'Contact score',
      ...developers.map((d) => {
        const a = analyzeDeveloper(d)
        return `${a.score} (${a.levelLabel})`
      }),
    ],
    [
      'Email signal',
      ...developers.map((d) => (analyzeDeveloper(d).contactEmail ? 'Yes' : 'No')),
    ],
    [
      'Top skills',
      ...developers.map((d) => collectSkills(d).slice(0, 4).join(', ') || '—'),
    ],
  ]

  const table = rows.map((row) => `| ${row.join(' | ')} |`).join('\n')

  const ranked = [...developers].sort(
    (a, b) => analyzeDeveloper(b).score - analyzeDeveloper(a).score
  )
  const top = ranked[0]
  const sharedSkills =
    developers.length >= 2
      ? collectSkills(developers[0]).filter((s) =>
          developers.slice(1).every((d) => collectSkills(d).includes(s))
        )
      : []

  const summary = [
    sharedSkills.length
      ? `Shared stack: ${sharedSkills.join(', ')}.`
      : 'Limited skill overlap across profiles.',
    `Priority outreach: **@${top.username}** (${analyzeDeveloper(top).score}/100 contact score).`,
  ].join(' ')

  return `${table}\n\n**Comparison takeaway:** ${summary}`
}

export function generateLinkedInOutreach(dev: Developer): string {
  const role = inferRole(dev)
  const skills = collectSkills(dev)
  const topSkill = skills[0] ?? 'software'
  const name = dev.name?.split(' ')[0] ?? dev.username
  const repo = dev.repositories[0]?.name

  const connectionNote = repo
    ? `Hi ${name} — impressed by your ${topSkill} work on ${repo}. Would love to connect.`
    : `Hi ${name} — your ${topSkill} background stood out. Would love to connect.`

  const message = `Hi ${name},

I came across your profile while researching ${role} talent${dev.company ? ` in the ${dev.company} ecosystem` : ''}. ${repo ? `Your work on **${repo}** caught my attention.` : `Your public work in **${topSkill}** aligns with roles we're building.`}

We're exploring a conversation about collaboration — not a generic recruiter blast. Would you be open to a brief 15-minute chat this week?

Best,
[Your name]`

  return `### LinkedIn connection note (≤300 chars)\n${connectionNote.slice(0, 300)}\n\n### LinkedIn message\n${message}`
}

export function generateEmailOutreach(dev: Developer): string {
  const role = inferRole(dev)
  const name = dev.name?.split(' ')[0] ?? dev.username
  const repo = dev.repositories[0]?.name
  const hook = repo
    ? `your open-source work on ${repo}`
    : `your GitHub profile and ${role} background`

  return `**Subject:** Quick intro — ${role} opportunity

Hi ${name},

I hope this finds you well. I'm reaching out because ${hook}${dev.company ? ` at ${dev.company}` : ''} stood out while we were mapping talent for an active search.

We're hiring for a ${role} role where your experience would be directly relevant. I'd value a short call to share context and hear what you're exploring professionally — no pressure if timing isn't right.

Would Thursday or Friday work for a 15-minute intro?

Best regards,
[Your name]
[Company]`
}

export function generateFollowUpSequence(dev: Developer): string {
  const name = dev.name?.split(' ')[0] ?? dev.username
  const role = inferRole(dev)

  return `### Day 3 — Gentle bump
**Subject:** Re: ${role} intro

Hi ${name}, wanted to bump my note in case it got buried. Still happy to share more about the ${role} opportunity if useful.

---

### Day 7 — Value add
**Subject:** Thought you'd find this relevant

Hi ${name}, sharing a bit more context on the team and stack. If you're open to it, I can send a one-pager — or we can skip straight to a 10-minute call.

---

### Day 14 — Close the loop
**Subject:** Closing the loop

Hi ${name}, I'll assume timing isn't right for now. If your situation changes, feel free to reply — I'd welcome reconnecting later.`
}

export function generatePipelineRecommendations(
  prospects: Prospect[],
  developers: Developer[]
): string {
  const lines: string[] = ['# Pipeline Recommendations', '']

  const atRisk = prospects.filter((p) => {
    if (!CONTACTED_STATUSES.includes(p.status)) return false
    const days = daysSince(lastPipelineTouch(p))
    return days != null && days >= 7
  })

  lines.push('## Candidates at risk of going cold')
  if (atRisk.length === 0) {
    lines.push('- No contacted leads stale beyond 7 days. Good pipeline hygiene.')
  } else {
    for (const p of atRisk.slice(0, 8)) {
      const days = daysSince(lastPipelineTouch(p))
      lines.push(
        `- **@${p.username}** (${STATUS_LABELS[p.status]}) — ${days}d since last activity. _Action: send follow-up or move stage._`
      )
    }
  }

  lines.push('', '## High-value candidates needing review')

  const highValue = prospects
    .map((p) => ({ p, analysis: analyzeDeveloper(p) }))
    .filter(
      ({ p, analysis }) =>
        analysis.score >= 65 &&
        (p.status === 'NEW' || p.status === 'CONTACTED') &&
        !p.notes.trim()
    )
    .sort((a, b) => b.analysis.score - a.analysis.score)

  if (highValue.length === 0) {
    lines.push('- No high-score saved leads awaiting review. Check discovery for unsaved talent.')
  } else {
    for (const { p, analysis } of highValue.slice(0, 8)) {
      lines.push(
        `- **@${p.username}** — ${analysis.score}/100, ${STATUS_LABELS[p.status]}, no notes. _Action: qualify and draft outreach._`
      )
    }
  }

  const unsaved = developers
    .filter((d) => !prospects.some((p) => p.username === d.username))
    .map((d) => ({ d, analysis: analyzeDeveloper(d) }))
    .filter(({ analysis }) => analysis.score >= 60)
    .sort((a, b) => b.analysis.score - a.analysis.score)

  if (unsaved.length > 0) {
    lines.push('', '## Unsaved discovery talent worth saving')
    for (const { d, analysis } of unsaved.slice(0, 5)) {
      lines.push(`- **@${d.username}** — ${analysis.score}/100 in latest discovery results`)
    }
  }

  return lines.join('\n')
}

export function generateSearchRecommendations(
  developers: Developer[],
  prospects: Prospect[],
  activeFilters: CopilotWorkspaceSnapshot['activeFilters']
): string {
  const lines: string[] = ['# Search Recommendations', '']

  if (developers.length === 0 && prospects.length === 0) {
    return '# Search Recommendations\n\nRun a discovery search first to unlock similar developer and company suggestions.'
  }

  const pool = developers.length > 0 ? developers : prospects
  const skillCounts = new Map<string, number>()
  const companyCounts = new Map<string, number>()
  const locationCounts = new Map<string, number>()

  for (const d of pool) {
    collectSkills(d).forEach((s) => skillCounts.set(s, (skillCounts.get(s) ?? 0) + 1))
    if (d.company) {
      const slug = parseCompanySlug(d.company)
      companyCounts.set(slug, (companyCounts.get(slug) ?? 0) + 1)
    }
    if (d.location) {
      const loc = d.location.split(',').pop()?.trim() ?? d.location
      locationCounts.set(loc, (locationCounts.get(loc) ?? 0) + 1)
    }
  }

  const topSkills = [...skillCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
  const topCompanies = [...companyCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)

  lines.push('## Similar developers to prioritize')
  const ranked = [...pool]
    .map((d) => ({ d, analysis: analyzeDeveloper(d) }))
    .sort((a, b) => b.analysis.score - a.analysis.score)
  for (const { d, analysis } of ranked.slice(0, 5)) {
    lines.push(
      `- **@${d.username}** — ${collectSkills(d).slice(0, 3).join(', ') || 'mixed'} · score ${analysis.score}`
    )
  }

  lines.push('', '## Similar companies to explore')
  if (topCompanies.length === 0) {
    lines.push('- Add company filters on discovery or enrich profiles to surface employer clusters.')
  } else {
    for (const [slug, count] of topCompanies) {
      lines.push(`- **${slug}** — ${count} developer${count === 1 ? '' : 's'} in workspace`)
    }
  }

  lines.push('', '## Missing skills to consider')
  const commonStacks = ['TypeScript', 'Python', 'Go', 'Rust', 'Java', 'React']
  const present = new Set(skillCounts.keys())
  const missing = commonStacks.filter((s) => !present.has(s))
  if (missing.length > 0) {
    lines.push(`- Broaden discovery with: **${missing.slice(0, 4).join(', ')}**`)
  } else {
    lines.push('- Your pool already covers common stacks. Try narrowing by role or company next.')
  }

  if (activeFilters?.country) {
    lines.push('', `## Active search context`)
    lines.push(`- Country filter: **${activeFilters.country}**`)
    if (activeFilters.stack) {
      lines.push(`- Stack filter: **${activeFilters.stack}**`)
    }
    const topLoc = [...locationCounts.entries()].sort((a, b) => b[1] - a[1])[0]
    if (topLoc) {
      lines.push(`- Dominant location signal: **${topLoc[0]}** (${topLoc[1]} profiles)`)
    }
  }

  if (topSkills.length > 0) {
    lines.push(`- Top skills in pool: **${topSkills.map(([s]) => s).join(', ')}**`)
  }

  return lines.join('\n')
}

export function generateLocalCopilotResponse(
  task: CopilotTask,
  snapshot: CopilotWorkspaceSnapshot,
  focusDevelopers: Developer[]
): string {
  switch (task) {
    case 'candidate-summary': {
      const dev = focusDevelopers[0]
      if (!dev) return 'Open a person profile or select a candidate to generate a summary.'
      return generateCandidateSummary(dev)
    }
    case 'compare-candidates':
      return compareMultipleCandidates(focusDevelopers)
    case 'outreach-linkedin': {
      const dev = focusDevelopers[0]
      if (!dev) return 'Select a candidate to draft LinkedIn outreach.'
      return generateLinkedInOutreach(dev)
    }
    case 'outreach-email': {
      const dev = focusDevelopers[0]
      if (!dev) return 'Select a candidate to draft email outreach.'
      return generateEmailOutreach(dev)
    }
    case 'outreach-followup': {
      const dev = focusDevelopers[0]
      if (!dev) return 'Select a candidate to draft a follow-up sequence.'
      return generateFollowUpSequence(dev)
    }
    case 'pipeline-recommendations':
      return generatePipelineRecommendations(snapshot.prospects, snapshot.developers)
    case 'search-recommendations':
      return generateSearchRecommendations(
        snapshot.developers,
        snapshot.prospects,
        snapshot.activeFilters
      )
    default:
      return 'Unknown task.'
  }
}
