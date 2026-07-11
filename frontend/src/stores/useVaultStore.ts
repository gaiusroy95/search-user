import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { fetchVault, getApiErrorMessage, saveVault } from '@/services/api'
import { getVaultSessionPassword } from '@/stores/useVaultAuthStore'
import type {
  VaultCategory,
  VaultFieldDef,
  VaultFieldInput,
  VaultRecord,
} from '@/types'

interface VaultState {
  categories: VaultCategory[]
  records: VaultRecord[]
  synced: boolean
  syncing: boolean
  syncError: string | null
  loadFromServer: () => Promise<void>
  hydrateVault: (categories: VaultCategory[], records: VaultRecord[]) => void
  addCategory: (name: string, fields: VaultFieldInput[]) => VaultCategory
  removeCategory: (id: string) => void
  addFieldToCategory: (categoryId: string, field: VaultFieldInput) => void
  addRecord: (categoryId: string, values: Record<string, string>) => VaultRecord
  updateRecord: (id: string, values: Record<string, string>) => void
  removeRecord: (id: string) => void
}

function makeId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `id-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

function makeField(input: VaultFieldInput): VaultFieldDef {
  return { id: makeId(), name: input.name.trim(), type: input.type }
}

let saveTimer: ReturnType<typeof setTimeout> | null = null

function scheduleServerSave() {
  const password = getVaultSessionPassword()
  if (!password) return

  if (saveTimer) clearTimeout(saveTimer)
  saveTimer = setTimeout(async () => {
    const { categories, records } = useVaultStore.getState()
    try {
      await saveVault(password, { categories, records })
      useVaultStore.setState({ synced: true, syncError: null })
    } catch (err) {
      useVaultStore.setState({
        synced: false,
        syncError: getApiErrorMessage(err),
      })
    } finally {
      useVaultStore.setState({ syncing: false })
    }
  }, 400)
}

function afterMutation() {
  useVaultStore.setState({ synced: false, syncing: true })
  scheduleServerSave()
}

export const useVaultStore = create<VaultState>()(
  persist(
    (set) => ({
      categories: [],
      records: [],
      synced: false,
      syncing: false,
      syncError: null,

      loadFromServer: async () => {
        const password = getVaultSessionPassword()
        if (!password) return
        const local = useVaultStore.getState()
        set({ syncing: true, syncError: null })
        try {
          const data = await fetchVault(password)
          const serverEmpty =
            !data.categories?.length && !data.records?.length
          const localHasData =
            local.categories.length > 0 || local.records.length > 0

          if (serverEmpty && localHasData) {
            await saveVault(password, {
              categories: local.categories,
              records: local.records,
            })
            set({ synced: true, syncing: false, syncError: null })
            return
          }

          set({
            categories: data.categories ?? [],
            records: data.records ?? [],
            synced: true,
            syncing: false,
            syncError: null,
          })
        } catch (err) {
          set({
            syncing: false,
            syncError: getApiErrorMessage(err),
          })
        }
      },

      hydrateVault: (categories, records) =>
        set({ categories, records, synced: true }),

      addCategory: (name, fields) => {
        const category: VaultCategory = {
          id: makeId(),
          name: name.trim(),
          fields: fields.filter((f) => f.name.trim()).map(makeField),
          createdAt: new Date().toISOString(),
        }
        set((s) => ({ categories: [...s.categories, category] }))
        afterMutation()
        return category
      },

      removeCategory: (id) => {
        set((s) => ({
          categories: s.categories.filter((c) => c.id !== id),
          records: s.records.filter((r) => r.categoryId !== id),
        }))
        afterMutation()
      },

      addFieldToCategory: (categoryId, field) => {
        const trimmed = field.name.trim()
        if (!trimmed) return
        set((s) => ({
          categories: s.categories.map((c) =>
            c.id === categoryId
              ? {
                  ...c,
                  fields: c.fields.some(
                    (f) => f.name.toLowerCase() === trimmed.toLowerCase()
                  )
                    ? c.fields
                    : [...c.fields, makeField(field)],
                }
              : c
          ),
        }))
        afterMutation()
      },

      addRecord: (categoryId, values) => {
        const now = new Date().toISOString()
        const record: VaultRecord = {
          id: makeId(),
          categoryId,
          values,
          createdAt: now,
          updatedAt: now,
        }
        set((s) => ({ records: [record, ...s.records] }))
        afterMutation()
        return record
      },

      updateRecord: (id, values) => {
        set((s) => ({
          records: s.records.map((r) =>
            r.id === id
              ? { ...r, values, updatedAt: new Date().toISOString() }
              : r
          ),
        }))
        afterMutation()
      },

      removeRecord: (id) => {
        set((s) => ({ records: s.records.filter((r) => r.id !== id) }))
        afterMutation()
      },
    }),
    {
      name: 'github-discovery-vault',
      partialize: (s) => ({
        categories: s.categories,
        records: s.records,
      }),
    }
  )
)
