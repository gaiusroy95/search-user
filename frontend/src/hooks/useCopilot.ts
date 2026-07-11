import { useCallback, useMemo, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import {
  COPILOT_TASKS,
  resolveFocusDevelopers,
  streamCopilotResponse,
} from '@/lib/ai/copilotService'
import type { CopilotTask, CopilotWorkspaceSnapshot } from '@/lib/ai/types'
import { resolveCopilotContext, TASK_LABELS } from '@/lib/copilotContext'
import { getUserDetails } from '@/services/api'
import { useActivityStore } from '@/stores/useActivityStore'
import { createCopilotMessage, useCopilotStore } from '@/stores/useCopilotStore'
import { useDiscoveryStore } from '@/stores/useDiscoveryStore'
import { useProspectStore } from '@/stores/useProspectStore'
import { useUIStore } from '@/stores/useUIStore'
import type { Developer } from '@/types'

function makeId(): string {
  return typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `msg-${Date.now()}`
}

export function useCopilot() {
  const { pathname } = useLocation()
  const selectedDeveloper = useUIStore((s) => s.selectedDeveloper)
  const drawerOpen = useUIStore((s) => s.drawerOpen)

  const developers = useDiscoveryStore((s) => s.developers)
  const activeFilters = useDiscoveryStore((s) => s.activeFilters)
  const prospects = useProspectStore((s) => s.prospects)

  const messages = useCopilotStore((s) => s.messages)
  const compareUsernames = useCopilotStore((s) => s.compareUsernames)
  const activeStreamingId = useCopilotStore((s) => s.activeStreamingId)
  const addMessage = useCopilotStore((s) => s.addMessage)
  const updateMessage = useCopilotStore((s) => s.updateMessage)
  const setActiveStreamingId = useCopilotStore((s) => s.setActiveStreamingId)
  const clearHistory = useCopilotStore((s) => s.clearHistory)
  const setCompareSlot = useCopilotStore((s) => s.setCompareSlot)

  const abortRef = useRef(false)

  const drawerUsername = drawerOpen ? selectedDeveloper?.username : null
  const pageContext = useMemo(
    () => resolveCopilotContext(pathname, drawerUsername),
    [pathname, drawerUsername]
  )

  const candidateOptions = useMemo(() => {
    const map = new Map<string, string>()
    for (const p of prospects) map.set(p.username, p.name ?? p.username)
    for (const d of developers) {
      if (!map.has(d.username)) map.set(d.username, d.name ?? d.username)
    }
    return [...map.entries()]
      .map(([username, label]) => ({ username, label }))
      .sort((a, b) => a.label.localeCompare(b.label))
  }, [prospects, developers])

  const workspaceSnapshot = useMemo(
    (): CopilotWorkspaceSnapshot => ({
      developers,
      prospects,
      activeFilters,
      page: pageContext,
      compareUsernames: compareUsernames.filter(Boolean),
    }),
    [developers, prospects, activeFilters, pageContext, compareUsernames]
  )

  const resolveEntityDeveloper = useCallback(async (): Promise<Developer | null> => {
    if (drawerUsername && selectedDeveloper) return selectedDeveloper
    const entityId =
      pageContext.entityUsername ??
      pageContext.entityId ??
      compareUsernames.find(Boolean)
    if (!entityId) return null
    const fromPool =
      prospects.find((p) => p.username === entityId) ??
      developers.find((d) => d.username === entityId)
    if (fromPool) return fromPool
    try {
      const lookup = await getUserDetails(entityId)
      return lookup.user
    } catch {
      return null
    }
  }, [drawerUsername, selectedDeveloper, pageContext, prospects, developers, compareUsernames])

  const resolveCompareDevelopers = useCallback(async (): Promise<Developer[]> => {
    const usernames = compareUsernames.filter(Boolean)
    const resolved: Developer[] = []
    for (const username of usernames) {
      const local =
        prospects.find((p) => p.username === username) ??
        developers.find((d) => d.username === username)
      if (local) {
        resolved.push(local)
        continue
      }
      try {
        const lookup = await getUserDetails(username)
        resolved.push(lookup.user)
      } catch {
        // skip missing
      }
    }
    return resolved
  }, [compareUsernames, prospects, developers])

  const runTask = useCallback(
    async (task: CopilotTask) => {
      if (activeStreamingId) return

      abortRef.current = false
      const contextLabel = pageContext.pageLabel

      addMessage(
        createCopilotMessage('user', task, TASK_LABELS[task], contextLabel)
      )

      const assistantId = makeId()
      addMessage({
        id: assistantId,
        role: 'assistant',
        task,
        content: '',
        at: new Date().toISOString(),
        contextLabel,
        isStreaming: true,
      })
      setActiveStreamingId(assistantId)

      try {
        const entityDev = await resolveEntityDeveloper()
        const compareDevs = await resolveCompareDevelopers()
        const focusDevelopers = resolveFocusDevelopers(
          workspaceSnapshot,
          entityDev,
          compareDevs.length > 0 ? compareDevs : entityDev ? [entityDev] : []
        )

        const history = messages
          .slice(0, 12)
          .reverse()
          .map((m) => ({ role: m.role, content: m.content }))

        const stream = streamCopilotResponse(
          { task, context: workspaceSnapshot, history },
          focusDevelopers
        )

        let accumulated = ''
        for await (const chunk of stream) {
          if (abortRef.current) break
          accumulated += chunk
          updateMessage(assistantId, { content: accumulated })
        }

        updateMessage(assistantId, { isStreaming: false })
        if (accumulated && !accumulated.startsWith('Open') && !accumulated.startsWith('Select')) {
          useActivityStore.getState().logAiAction(TASK_LABELS[task], contextLabel)
        }
      } catch (err) {
        updateMessage(assistantId, {
          content: err instanceof Error ? err.message : 'Generation failed.',
          isStreaming: false,
        })
      } finally {
        setActiveStreamingId(null)
      }
    },
    [
      activeStreamingId,
      pageContext,
      addMessage,
      updateMessage,
      setActiveStreamingId,
      resolveEntityDeveloper,
      resolveCompareDevelopers,
      workspaceSnapshot,
      messages,
    ]
  )

  const cancelStream = useCallback(() => {
    abortRef.current = true
    setActiveStreamingId(null)
  }, [setActiveStreamingId])

  const isTaskDisabled = useCallback(
    (task: CopilotTask): boolean => {
      if (activeStreamingId) return true
      const meta = COPILOT_TASKS.find((t) => t.task === task)
      if (meta?.requiresEntity && !pageContext.entityId && !drawerUsername) {
        return task !== 'pipeline-recommendations' && task !== 'search-recommendations'
      }
      if (meta?.requiresCompare) {
        const filled = compareUsernames.filter(Boolean)
        return filled.length < 2
      }
      if (
        (task === 'outreach-linkedin' ||
          task === 'outreach-email' ||
          task === 'outreach-followup' ||
          task === 'candidate-summary') &&
        !pageContext.entityId &&
        !drawerUsername &&
        !compareUsernames.find(Boolean)
      ) {
        return true
      }
      return false
    },
    [activeStreamingId, pageContext, drawerUsername, compareUsernames]
  )

  return {
    pageContext,
    messages,
    candidateOptions,
    compareUsernames,
    setCompareSlot,
    runTask,
    cancelStream,
    clearHistory,
    isTaskDisabled,
    isStreaming: Boolean(activeStreamingId),
    suggestedTasks: COPILOT_TASKS,
  }
}
