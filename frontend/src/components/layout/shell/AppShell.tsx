import { lazy, Suspense, useEffect } from 'react'

import { Outlet, useLocation } from 'react-router-dom'

import { AppSidebar } from './AppSidebar'

import { AppTopBar } from './AppTopBar'

import { MobileNavDrawer } from './MobileNavDrawer'

import { ApiSetupBanner } from '@/components/layout/ApiSetupBanner'

import { Footer } from '@/components/layout/Footer'

import { TeamBootstrap } from '@/components/collaboration/TeamBootstrap'
import { IntelligenceFab } from '@/components/intelligence/IntelligenceFab'

import { RoutePageFallback } from '@/components/loading'

import { useUIStore } from '@/stores/useUIStore'

import { useMediaQuery } from '@/hooks/useMediaQuery'



const CopilotPanel = lazy(() =>
  import('@/components/intelligence/CopilotPanel').then((m) => ({
    default: m.CopilotPanel,
  }))
)



export function AppShell() {

  const location = useLocation()

  const isMobile = useMediaQuery('(max-width: 767px)')



  const sidebarCollapsed = useUIStore((s) => s.sidebarCollapsed)

  const mobileNavOpen = useUIStore((s) => s.mobileNavOpen)

  const toggleSidebar = useUIStore((s) => s.toggleSidebar)

  const setMobileNavOpen = useUIStore((s) => s.setMobileNavOpen)

  const darkMode = useUIStore((s) => s.darkMode)



  useEffect(() => {

    document.documentElement.classList.toggle('dark', darkMode)

  }, [darkMode])



  useEffect(() => {

    setMobileNavOpen(false)

  }, [location.pathname, setMobileNavOpen])



  return (

    <div className="flex h-screen overflow-hidden bg-background">

      {!isMobile && (

        <AppSidebar

          collapsed={sidebarCollapsed}

          onToggleCollapse={toggleSidebar}

        />

      )}



      <MobileNavDrawer open={mobileNavOpen} onOpenChange={setMobileNavOpen} />



      <div className="flex min-w-0 flex-1 flex-col">

        <AppTopBar

          onMenuClick={() => setMobileNavOpen(true)}

          showMenuButton={isMobile}

        />

        <ApiSetupBanner />



        <main className="flex min-h-0 flex-1 flex-col overflow-y-auto">

          <div className="flex-1">

            <Suspense fallback={<RoutePageFallback />}>

              <Outlet />

            </Suspense>

          </div>

          <Footer />

        </main>

      </div>



      <Suspense fallback={null}>
        <CopilotPanel />
      </Suspense>
      <TeamBootstrap />
      <IntelligenceFab />
    </div>
  )
}

