import { create } from 'zustand'

import { persist } from 'zustand/middleware'

import type { Developer } from '@/types'



interface UIState {

  darkMode: boolean

  sidebarCollapsed: boolean

  mobileNavOpen: boolean

  selectedDeveloper: Developer | null

  drawerOpen: boolean

  contactWorkflowEnabled: boolean

  toggleDarkMode: () => void

  toggleSidebar: () => void

  setSidebarCollapsed: (collapsed: boolean) => void

  setMobileNavOpen: (open: boolean) => void

  openDeveloperDrawer: (developer: Developer) => void

  closeDeveloperDrawer: () => void

  setContactWorkflowEnabled: (enabled: boolean) => void

}



export const useUIStore = create<UIState>()(

  persist(

    (set) => ({

      darkMode: true,

      sidebarCollapsed: false,

      mobileNavOpen: false,

      selectedDeveloper: null,

      drawerOpen: false,

      contactWorkflowEnabled: false,



      toggleDarkMode: () =>

        set((s) => {

          const next = !s.darkMode

          document.documentElement.classList.toggle('dark', next)

          return { darkMode: next }

        }),



      toggleSidebar: () =>

        set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),



      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),



      setMobileNavOpen: (open) => set({ mobileNavOpen: open }),



      openDeveloperDrawer: (developer) =>

        set({ selectedDeveloper: developer, drawerOpen: true }),



      closeDeveloperDrawer: () =>

        set({ drawerOpen: false, selectedDeveloper: null }),



      setContactWorkflowEnabled: (enabled) =>

        set({ contactWorkflowEnabled: enabled }),

    }),

    {

      name: 'github-discovery-ui',

      partialize: (s) => ({

        darkMode: s.darkMode,

        sidebarCollapsed: s.sidebarCollapsed,

      }),

      onRehydrateStorage: () => (state) => {

        if (state?.darkMode) {

          document.documentElement.classList.add('dark')

        }

      },

    }

  )

)


