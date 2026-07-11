import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  fetchMe,
  loginUser,
  registerUser,
  setCollaborationAuthToken,
} from '@/services/collaborationApi'
import type { AuthUser } from '@/types/collaboration'

interface AuthState {
  token: string | null
  user: AuthUser | null
  hydrated: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, name: string, password: string) => Promise<void>
  logout: () => void
  restoreSession: () => Promise<void>
  setHydrated: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      hydrated: false,

      login: async (email, password) => {
        const data = await loginUser({ email, password })
        setCollaborationAuthToken(data.token)
        set({ token: data.token, user: data.user })
      },

      register: async (email, name, password) => {
        const data = await registerUser({ email, name, password })
        setCollaborationAuthToken(data.token)
        set({ token: data.token, user: data.user })
      },

      logout: () => {
        setCollaborationAuthToken(null)
        set({ token: null, user: null })
      },

      restoreSession: async () => {
        const token = get().token
        if (!token) return
        setCollaborationAuthToken(token)
        try {
          const data = await fetchMe()
          set({ user: data.user })
        } catch {
          get().logout()
        }
      },

      setHydrated: () => set({ hydrated: true }),
    }),
    {
      name: 'github-discovery-auth',
      partialize: (s) => ({ token: s.token, user: s.user }),
      onRehydrateStorage: () => (state) => {
        if (state?.token) setCollaborationAuthToken(state.token)
        state?.setHydrated()
      },
    }
  )
)
