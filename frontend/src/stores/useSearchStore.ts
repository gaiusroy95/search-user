import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { DeveloperStack, MessageTemplate, SearchType } from '@/types'
import { DEFAULT_COUNTRY } from '@/types'

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
    { name: 'github-discovery-search-form' }
  )
)
