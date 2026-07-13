import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { DeveloperStack, MessageTemplate, SearchType } from '@/types'
import { COUNTRIES, DEFAULT_COUNTRY } from '@/types'

interface SearchFormState {
  country: string
  stack: DeveloperStack | ''
  maxFollowers: string
  maxRepos: string
  maxFollowing: string
  type: SearchType
  messageTemplate: MessageTemplate
  setField: <K extends keyof SearchFormState>(
    key: K,
    value: SearchFormState[K]
  ) => void
  setMessageTemplate: (template: Partial<MessageTemplate>) => void
  reset: () => void
}

const defaultTemplate: MessageTemplate = {
  subject: 'Opportunity for {{name}}',
  content: `Hi {{name}},

I came across your GitHub profile (@{{github_username}}) and was impressed by your work from {{country}} with {{followers}} followers.

I'd love to connect about a potential opportunity.

Best regards`,
}

const defaultForm = {
  country: DEFAULT_COUNTRY,
  stack: '' as DeveloperStack | '',
  maxFollowers: '',
  maxRepos: '',
  maxFollowing: '',
  type: 'user' as SearchType,
  messageTemplate: defaultTemplate,
}

const EUROPE_SET = new Set<string>(COUNTRIES)

export const useSearchStore = create<SearchFormState>()(
  persist(
    (set) => ({
      ...defaultForm,

      setField: (key, value) => set({ [key]: value }),

      setMessageTemplate: (template) =>
        set((s) => ({
          messageTemplate: { ...s.messageTemplate, ...template },
        })),

      reset: () => set(defaultForm),
    }),
    {
      name: 'github-discovery-search-form',
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<SearchFormState>
        const country =
          p.country && EUROPE_SET.has(p.country) ? p.country : DEFAULT_COUNTRY
        return { ...current, ...p, country }
      },
    }
  )
)
