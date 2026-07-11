import type { CopilotTask, CopilotWorkspaceSnapshot } from '@/lib/ai/types'
import type { Developer } from '@/types'

const SYSTEM_PROMPT = `You are an expert technical recruiting copilot for a GitHub developer discovery platform.
Use only the workspace data provided. Be specific, actionable, and concise.
Format with clear headings and bullet points. Never invent contact details not in the data.`

export function buildSystemPrompt(): string {
  return SYSTEM_PROMPT
}

export function buildTaskPrompt(
  task: CopilotTask,
  snapshot: CopilotWorkspaceSnapshot,
  developers: Developer[]
): string {
  const page = snapshot.page.pageLabel
  const devSummary = developers
    .map((d) => summarizeDeveloper(d))
    .join('\n')

  const prospectSummary = snapshot.prospects
    .slice(0, 20)
    .map(
      (p) =>
        `@${p.username} | ${p.status} | score context | company: ${p.company ?? '—'} | tags: ${p.tags.join(', ') || '—'}`
    )
    .join('\n')

  const discoverySummary = snapshot.developers
    .slice(0, 15)
    .map((d) => `@${d.username} | ${d.company ?? '—'} | ${d.location ?? '—'}`)
    .join('\n')

  const filterLine = snapshot.activeFilters
    ? `Active search: country=${snapshot.activeFilters.country}`
    : 'No active discovery filters'

  const taskInstructions: Record<CopilotTask, string> = {
    'candidate-summary': `Generate a recruiting brief with exactly these sections:
## Strengths
## Risks
## Hiring Recommendation
Recommend pursue, nurture, or pass with clear rationale.`,

    'compare-candidates': `Compare the selected candidates side by side.
Include skills overlap, contact reachability, activity signals, and a clear recommendation on who to prioritize.`,

    'outreach-linkedin': `Draft a LinkedIn connection note (under 300 characters) and a longer LinkedIn message (2 short paragraphs).
Label each clearly.`,

    'outreach-email': `Draft a professional cold email: subject line, body (3 short paragraphs), and a single clear CTA.`,

    'outreach-followup': `Draft a 3-step follow-up sequence (Day 3, Day 7, Day 14) with subject lines and brief bodies.`,

    'pipeline-recommendations': `Identify:
1. Candidates at risk of going cold
2. High-value candidates needing review
Give specific usernames and next actions.`,

    'search-recommendations': `Suggest:
1. Similar developers to prioritize from discovery results
2. Similar companies to explore
3. Missing skills to add to search filters
Be specific to the current workspace data.`,
  }

  return [
    `Task: ${task}`,
    `Page context: ${page}`,
    filterLine,
    '',
    taskInstructions[task],
    '',
    '--- Candidates in focus ---',
    devSummary || 'No candidates loaded',
    '',
    '--- Pipeline (sample) ---',
    prospectSummary || 'No saved prospects',
    '',
    '--- Discovery pool (sample) ---',
    discoverySummary || 'No discovery results',
  ].join('\n')
}

function summarizeDeveloper(d: Developer): string {
  const skills = [...new Set([d.primaryLanguage, ...d.languages].filter(Boolean))].slice(0, 6)
  return [
    `@${d.username}`,
    d.name ?? '',
    d.company ?? '',
    d.location ?? '',
    d.email ?? '',
    `followers:${d.followers}`,
    `repos:${d.publicRepos}`,
    skills.length ? `skills:${skills.join(',')}` : '',
    d.bio?.slice(0, 120) ?? '',
  ]
    .filter(Boolean)
    .join(' | ')
}
