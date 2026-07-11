import { create } from 'zustand'
import { VAULT_PASSWORD } from '@/config/vault'

const UNLOCK_KEY = 'vault-unlocked'
const PASSWORD_KEY = 'vault-password'

export function getVaultSessionPassword(): string | null {
  return sessionStorage.getItem(PASSWORD_KEY)
}

interface VaultAuthState {
  unlocked: boolean
  unlock: (password: string) => boolean
  lock: () => void
  hydrate: () => void
}

export const useVaultAuthStore = create<VaultAuthState>((set) => ({
  unlocked: sessionStorage.getItem(UNLOCK_KEY) === '1',

  hydrate: () => {
    set({ unlocked: sessionStorage.getItem(UNLOCK_KEY) === '1' })
  },

  unlock: (password) => {
    if (password !== VAULT_PASSWORD) return false
    sessionStorage.setItem(UNLOCK_KEY, '1')
    sessionStorage.setItem(PASSWORD_KEY, password)
    set({ unlocked: true })
    return true
  },

  lock: () => {
    sessionStorage.removeItem(UNLOCK_KEY)
    sessionStorage.removeItem(PASSWORD_KEY)
    set({ unlocked: false })
  },
}))
