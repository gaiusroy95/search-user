export type IntelligenceTask =
  | 'profile-summary'
  | 'company-summary'
  | 'outreach'
  | 'compare'

export interface AiPageContext {
  pageLabel: string
  pageKey: string
  entityId?: string
  availableTasks: IntelligenceTask[]
}

export function resolveAiContext(
  pathname: string,
  drawerUsername?: string | null
): AiPageContext {
  if (pathname.match(/^\/people\/[^/]+$/)) {
    const id = pathname.split('/')[2]
    return {
      pageLabel: `Person · @${decodeURIComponent(id ?? '')}`,
      pageKey: 'person',
      entityId: decodeURIComponent(id ?? ''),
      availableTasks: ['profile-summary', 'outreach', 'compare'],
    }
  }

  if (pathname.match(/^\/companies\/[^/]+$/)) {
    const id = pathname.split('/')[2]
    return {
      pageLabel: `Company · ${decodeURIComponent(id ?? '')}`,
      pageKey: 'company',
      entityId: decodeURIComponent(id ?? ''),
      availableTasks: ['company-summary', 'compare'],
    }
  }

  if (pathname.startsWith('/discover')) {
    return {
      pageLabel: 'Discover',
      pageKey: 'discover',
      availableTasks: ['compare'],
    }
  }

  if (pathname.startsWith('/pipeline')) {
    return {
      pageLabel: 'Pipeline',
      pageKey: 'pipeline',
      availableTasks: ['compare', 'outreach'],
    }
  }

  if (pathname.startsWith('/people')) {
    return {
      pageLabel: 'People',
      pageKey: 'people',
      availableTasks: ['compare'],
    }
  }

  if (drawerUsername) {
    return {
      pageLabel: `Profile · @${drawerUsername}`,
      pageKey: 'drawer',
      entityId: drawerUsername,
      availableTasks: ['profile-summary', 'outreach'],
    }
  }

  return {
    pageLabel: 'Workspace',
    pageKey: 'other',
    availableTasks: ['compare'],
  }
}

export const TASK_LABELS: Record<IntelligenceTask, string> = {
  'profile-summary': 'Profile summary',
  'company-summary': 'Company summary',
  outreach: 'Outreach message',
  compare: 'Compare candidates',
}
