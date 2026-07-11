import type { CopilotPageContext } from '@/lib/ai/types'
import type { CopilotTask } from '@/lib/ai/types'

export function resolveCopilotContext(
  pathname: string,
  drawerUsername?: string | null
): CopilotPageContext {
  if (pathname.match(/^\/people\/[^/]+$/)) {
    const id = decodeURIComponent(pathname.split('/')[2] ?? '')
    return {
      pageLabel: `Person · @${id}`,
      pageKey: 'person',
      entityId: id,
      entityUsername: id,
    }
  }

  if (pathname.match(/^\/companies\/[^/]+$/)) {
    const id = decodeURIComponent(pathname.split('/')[2] ?? '')
    return {
      pageLabel: `Company · ${id}`,
      pageKey: 'company',
      entityId: id,
    }
  }

  if (pathname.startsWith('/contacts')) {
    return { pageLabel: 'Contacts', pageKey: 'contacts' }
  }

  if (pathname.startsWith('/discover')) {
    return { pageLabel: 'Discover', pageKey: 'discover' }
  }

  if (pathname.startsWith('/pipeline')) {
    return { pageLabel: 'Pipeline', pageKey: 'pipeline' }
  }

  if (pathname.startsWith('/activity')) {
    return { pageLabel: 'Activity', pageKey: 'activity' }
  }

  if (pathname.startsWith('/companies')) {
    return { pageLabel: 'Companies', pageKey: 'companies' }
  }

  if (pathname.startsWith('/people')) {
    return { pageLabel: 'People lookup', pageKey: 'people' }
  }

  if (drawerUsername) {
    return {
      pageLabel: `Profile · @${drawerUsername}`,
      pageKey: 'drawer',
      entityId: drawerUsername,
      entityUsername: drawerUsername,
    }
  }

  return { pageLabel: 'Workspace', pageKey: 'workspace' }
}

export function getSuggestedTasks(pageKey: string): CopilotTask[] {
  switch (pageKey) {
    case 'person':
    case 'drawer':
      return [
        'candidate-summary',
        'outreach-linkedin',
        'outreach-email',
        'outreach-followup',
        'compare-candidates',
      ]
    case 'pipeline':
    case 'contacts':
      return [
        'pipeline-recommendations',
        'compare-candidates',
        'outreach-email',
        'candidate-summary',
      ]
    case 'discover':
      return ['search-recommendations', 'compare-candidates', 'candidate-summary']
    case 'company':
      return ['search-recommendations', 'compare-candidates']
    default:
      return [
        'pipeline-recommendations',
        'search-recommendations',
        'compare-candidates',
      ]
  }
}

export const TASK_LABELS: Record<CopilotTask, string> = {
  'candidate-summary': 'Candidate summary',
  'compare-candidates': 'Compare candidates',
  'outreach-linkedin': 'LinkedIn draft',
  'outreach-email': 'Email outreach',
  'outreach-followup': 'Follow-up sequence',
  'pipeline-recommendations': 'Pipeline insights',
  'search-recommendations': 'Search suggestions',
}
