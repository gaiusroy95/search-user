import { memo } from 'react'

import { Link } from 'react-router-dom'

import { PanelLeftClose, PanelLeftOpen } from 'lucide-react'

import { Button } from '@/components/ui/button'

import { cn } from '@/lib/utils'

import { APP_NAV, ROUTES } from '@/lib/routes'

import { SidebarNavItem } from './SidebarNavItem'



interface AppSidebarProps {

  collapsed: boolean

  onToggleCollapse: () => void

  showCollapseToggle?: boolean

  className?: string

  onNavigate?: () => void

}



export const AppSidebar = memo(function AppSidebar({

  collapsed,

  onToggleCollapse,

  showCollapseToggle = true,

  className,

  onNavigate,

}: AppSidebarProps) {

  return (

    <aside

      className={cn(

        'flex h-full shrink-0 flex-col border-r border-border/60 bg-card/40 backdrop-blur-sm transition-[width] duration-200 ease-out',

        collapsed ? 'w-[68px]' : 'w-60',

        className

      )}

    >

      <div

        className={cn(

          'flex h-14 shrink-0 items-center border-b border-border/60',

          collapsed ? 'justify-center px-2' : 'justify-between px-4'

        )}

      >

        <Link

          to={ROUTES.dashboard}

          onClick={onNavigate}

          className={cn(

            'flex items-center gap-2.5 rounded-lg transition-opacity hover:opacity-80',

            collapsed && 'justify-center'

          )}

          aria-label="Go to dashboard"

        >

          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-fuchsia-500 text-xs font-bold text-primary-foreground shadow-sm">

            G

          </div>

          {!collapsed && (

            <div className="min-w-0 text-left">

              <p className="truncate text-sm font-semibold leading-none">Discovery</p>

              <p className="truncate text-[11px] text-muted-foreground">Platform</p>

            </div>

          )}

        </Link>

      </div>



      <nav className="flex-1 space-y-0.5 overflow-y-auto p-3" aria-label="Sidebar">

        {APP_NAV.map((item) => (

          <SidebarNavItem

            key={item.to}

            item={item}

            collapsed={collapsed}

            onNavigate={onNavigate}

          />

        ))}

      </nav>



      {showCollapseToggle && (

        <div className="shrink-0 border-t border-border/60 p-3">

          <Button

            variant="ghost"

            size={collapsed ? 'icon' : 'sm'}

            className={cn('w-full text-muted-foreground', !collapsed && 'justify-start')}

            onClick={onToggleCollapse}

            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}

          >

            {collapsed ? (

              <PanelLeftOpen className="h-4 w-4" />

            ) : (

              <>

                <PanelLeftClose className="h-4 w-4" />

                <span>Collapse</span>

              </>

            )}

          </Button>

        </div>

      )}

    </aside>

  )

})


