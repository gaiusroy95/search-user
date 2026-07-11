import { memo } from 'react'

import { NavLink } from 'react-router-dom'

import { cn } from '@/lib/utils'

import type { NavItem } from '@/lib/routes'



interface SidebarNavItemProps {

  item: NavItem

  collapsed: boolean

  onNavigate?: () => void

}



export const SidebarNavItem = memo(function SidebarNavItem({

  item,

  collapsed,

  onNavigate,

}: SidebarNavItemProps) {

  const Icon = item.icon



  return (

    <NavLink

      to={item.to}

      onClick={onNavigate}

      title={collapsed ? item.label : undefined}

      className={({ isActive }) =>

        cn(

          'group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150',

          collapsed && 'justify-center px-2',

          isActive

            ? 'bg-accent text-accent-foreground shadow-sm before:absolute before:left-0 before:top-1/2 before:h-5 before:w-0.5 before:-translate-y-1/2 before:rounded-full before:bg-primary'

            : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'

        )

      }

    >

      <Icon className="h-4 w-4 shrink-0 transition-colors group-[.active]:text-primary" />

      {!collapsed && <span className="truncate">{item.label}</span>}

    </NavLink>

  )

})


