import { buildSystemPrompt, buildTaskPrompt } from '@/lib/ai/prompts'
import { generateLocalCopilotResponse } from '@/lib/ai/recruitingIntelligence'
import { simulateTextStream } from '@/lib/ai/streamText'
import type {
  CopilotGenerateRequest,
  CopilotTask,
  CopilotWorkspaceSnapshot,
} from '@/lib/ai/types'
import type { Developer } from '@/types'
import { streamCopilotFromApi } from '@/services/copilotApi'

export const COPILOT_TASKS = [
  {
    task: 'candidate-summary' as const,
    label: 'Candidate summary',
    description: 'Strengths, risks, and hiring recommendation',
    category: 'candidate' as const,
    requiresEntity: true,
  },
  {
    task: 'compare-candidates' as const,
    label: 'Compare candidates',
    description: 'Side-by-side developer comparison',
    category: 'candidate' as const,
    requiresCompare: true,
  },
  {
    task: 'outreach-linkedin' as const,
    label: 'LinkedIn draft',
    description: 'Connection note and message',
    category: 'outreach' as const,
    requiresEntity: true,
  },
  {
    task: 'outreach-email' as const,
    label: 'Email outreach',
    description: 'Subject, body, and CTA',
    category: 'outreach' as const,
    requiresEntity: true,
  },
  {
    task: 'outreach-followup' as const,
    label: 'Follow-up sequence',
    description: 'Day 3, 7, and 14 touchpoints',
    category: 'outreach' as const,
    requiresEntity: true,
  },
  {
    task: 'pipeline-recommendations' as const,
    label: 'Pipeline insights',
    description: 'At-risk and high-value leads',
    category: 'pipeline' as const,
  },
  {
    task: 'search-recommendations' as const,
    label: 'Search suggestions',
    description: 'Similar devs, companies, skills',
    category: 'search' as const,
  },
]

export function resolveFocusDevelopers(
  snapshot: CopilotWorkspaceSnapshot,
  entityDev: Developer | null,
  compareDevs: Developer[]
): Developer[] {
  if (snapshot.compareUsernames.length >= 2) {
    return compareDevs.filter((d) => snapshot.compareUsernames.includes(d.username))
  }
  if (entityDev) return [entityDev]
  return compareDevs.slice(0, 2)
}

async function* streamLocal(
  task: CopilotTask,
  snapshot: CopilotWorkspaceSnapshot,
  focusDevelopers: Developer[]
): AsyncGenerator<string> {
  const text = generateLocalCopilotResponse(task, snapshot, focusDevelopers)
  yield* simulateTextStream(text)
}

export async function* streamCopilotResponse(
  request: CopilotGenerateRequest,
  focusDevelopers: Developer[]
): AsyncGenerator<string> {
  const prompt = buildTaskPrompt(request.task, request.context, focusDevelopers)
  const system = buildSystemPrompt()

  try {
    const remote = streamCopilotFromApi({
      task: request.task,
      system,
      prompt,
      history: request.history,
    })
    let received = false
    for await (const chunk of remote) {
      received = true
      yield chunk
    }
    if (received) return
  } catch {
    // fall through to local engine
  }

  yield* streamLocal(request.task, request.context, focusDevelopers)
}
