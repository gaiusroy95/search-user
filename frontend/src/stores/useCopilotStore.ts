import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CopilotMessage, CopilotTask } from '@/lib/ai/types'

const MAX_MESSAGES = 80

interface CopilotState {
  panelOpen: boolean
  compareUsernames: string[]
  messages: CopilotMessage[]
  activeStreamingId: string | null
  togglePanel: () => void
  setPanelOpen: (open: boolean) => void
  setCompareUsernames: (usernames: string[]) => void
  setCompareSlot: (index: number, username: string) => void
  addMessage: (message: CopilotMessage) => void
  updateMessage: (id: string, patch: Partial<CopilotMessage>) => void
  setActiveStreamingId: (id: string | null) => void
  clearHistory: () => void
}

function makeId(): string {
  return typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `msg-${Date.now()}`
}

export const useCopilotStore = create<CopilotState>()(
  persist(
    (set) => ({
      panelOpen: false,
      compareUsernames: ['', ''],
      messages: [],
      activeStreamingId: null,

      togglePanel: () => set((s) => ({ panelOpen: !s.panelOpen })),

      setPanelOpen: (open) => set({ panelOpen: open }),

      setCompareUsernames: (usernames) =>
        set({ compareUsernames: usernames.slice(0, 4) }),

      setCompareSlot: (index, username) =>
        set((s) => {
          const next = [...s.compareUsernames]
          while (next.length <= index) next.push('')
          next[index] = username
          return { compareUsernames: next.slice(0, 4) }
        }),

      addMessage: (message) =>
        set((s) => ({
          messages: [message, ...s.messages].slice(0, MAX_MESSAGES),
        })),

      updateMessage: (id, patch) =>
        set((s) => ({
          messages: s.messages.map((m) => (m.id === id ? { ...m, ...patch } : m)),
        })),

      setActiveStreamingId: (id) => set({ activeStreamingId: id }),

      clearHistory: () => set({ messages: [] }),
    }),
    {
      name: 'github-discovery-copilot',
      version: 1,
      partialize: (state) => ({
        compareUsernames: state.compareUsernames,
        messages: state.messages,
      }),
    }
  )
)

export function createCopilotMessage(
  role: CopilotMessage['role'],
  task: CopilotTask | 'freeform',
  content: string,
  contextLabel?: string
): CopilotMessage {
  return {
    id: makeId(),
    role,
    task,
    content,
    at: new Date().toISOString(),
    contextLabel,
  }
}
