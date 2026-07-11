import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ContactsDirectoryFilters } from '@/lib/contactsDirectory'

export interface SavedContactView {
  id: string
  name: string
  filters: ContactsDirectoryFilters
  createdAt: string
}

interface ContactsViewsState {
  savedViews: SavedContactView[]
  saveView: (name: string, filters: ContactsDirectoryFilters) => SavedContactView
  deleteView: (id: string) => void
  renameView: (id: string, name: string) => void
}

export const useContactsViewsStore = create<ContactsViewsState>()(
  persist(
    (set) => ({
      savedViews: [],

      saveView: (name, filters) => {
        const view: SavedContactView = {
          id: crypto.randomUUID(),
          name: name.trim() || 'Untitled view',
          filters: { ...filters },
          createdAt: new Date().toISOString(),
        }
        set((s) => ({ savedViews: [view, ...s.savedViews].slice(0, 20) }))
        return view
      },

      deleteView: (id) =>
        set((s) => ({
          savedViews: s.savedViews.filter((view) => view.id !== id),
        })),

      renameView: (id, name) =>
        set((s) => ({
          savedViews: s.savedViews.map((view) =>
            view.id === id ? { ...view, name: name.trim() || view.name } : view
          ),
        })),
    }),
    { name: 'github-discovery-contact-views', version: 1 }
  )
)
