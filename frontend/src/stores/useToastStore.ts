import { create } from 'zustand'

interface ToastItem {
  id: string
  title?: string
  description?: string
  variant?: 'default' | 'destructive'
  open: boolean
}

interface ToastState {
  toasts: ToastItem[]
  toast: (item: Omit<ToastItem, 'id' | 'open'>) => void
  dismiss: (id: string) => void
}

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],

  toast: (item) => {
    const id = crypto.randomUUID()
    set((s) => ({
      toasts: [...s.toasts, { ...item, id, open: true }],
    }))
    setTimeout(() => {
      set((s) => ({
        toasts: s.toasts.map((t) => (t.id === id ? { ...t, open: false } : t)),
      }))
    }, 4000)
  },

  dismiss: (id) =>
    set((s) => ({
      toasts: s.toasts.map((t) => (t.id === id ? { ...t, open: false } : t)),
    })),
}))

export function toast(item: Omit<ToastItem, 'id' | 'open'>) {
  useToastStore.getState().toast(item)
}
