import {
  Activity,
  BarChart3,
  BookUser,
  Building2,
  Database,
  Kanban,
  LayoutDashboard,
  Search,
  Settings,
  UserCog,
  Users,
  type LucideIcon,
} from 'lucide-react'

export const ROUTES = {
  dashboard: '/dashboard',
  activity: '/activity',
  auth: '/auth',
  team: '/team',
  discover: '/discover',
  people: '/people',
  contacts: '/contacts',
  companies: '/companies',
  pipeline: '/pipeline',
  intelligence: '/intelligence',
  vault: '/vault',
  integrations: '/integrations',
  settings: '/settings',
} as const

export function personRoute(id: string): string {
  return `/people/${encodeURIComponent(id)}`
}

export function companyRoute(id: string): string {
  return `/companies/${encodeURIComponent(id)}`
}

export type AppRoute = (typeof ROUTES)[keyof typeof ROUTES]

export interface NavItem {
  to: AppRoute
  label: string
  icon: LucideIcon
  matchPrefix?: boolean
}

export const APP_NAV: NavItem[] = [
  { to: ROUTES.dashboard, label: 'Dashboard', icon: LayoutDashboard },
  { to: ROUTES.activity, label: 'Activity', icon: Activity },
  { to: ROUTES.discover, label: 'Discover', icon: Search, matchPrefix: true },
  { to: ROUTES.contacts, label: 'Contacts', icon: BookUser, matchPrefix: true },
  { to: ROUTES.team, label: 'Team', icon: UserCog },
  { to: ROUTES.people, label: 'People', icon: Users, matchPrefix: true },
  { to: ROUTES.companies, label: 'Companies', icon: Building2, matchPrefix: true },
  { to: ROUTES.pipeline, label: 'Pipeline', icon: Kanban },
  { to: ROUTES.intelligence, label: 'Intelligence', icon: BarChart3 },
  { to: ROUTES.vault, label: 'Vault', icon: Database },
  { to: ROUTES.settings, label: 'Settings', icon: Settings },
]

export function isNavActive(
  pathname: string,
  to: string,
  matchPrefix = false
): boolean {
  if (matchPrefix) {
    return pathname === to || pathname.startsWith(`${to}/`)
  }
  return pathname === to
}
