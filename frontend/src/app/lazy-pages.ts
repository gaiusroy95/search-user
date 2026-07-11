import { lazy } from 'react'

export const DashboardPage = lazy(() =>
  import('@/pages/DashboardPage').then((m) => ({ default: m.DashboardPage }))
)

export const ActivityPage = lazy(() =>
  import('@/pages/ActivityPage').then((m) => ({ default: m.ActivityPage }))
)

export const AuthPage = lazy(() =>
  import('@/pages/AuthPage').then((m) => ({ default: m.AuthPage }))
)

export const TeamPage = lazy(() =>
  import('@/pages/TeamPage').then((m) => ({ default: m.TeamPage }))
)

export const DiscoveryPage = lazy(() =>
  import('@/pages/DiscoveryPage').then((m) => ({ default: m.DiscoveryPage }))
)

export const UserLookupPage = lazy(() =>
  import('@/pages/UserLookupPage').then((m) => ({ default: m.UserLookupPage }))
)

export const PersonProfilePage = lazy(() =>
  import('@/pages/people/PersonProfilePage').then((m) => ({
    default: m.PersonProfilePage,
  }))
)

export const CompanyProfilePage = lazy(() =>
  import('@/pages/companies/CompanyProfilePage').then((m) => ({
    default: m.CompanyProfilePage,
  }))
)

export const CompaniesPage = lazy(() =>
  import('@/pages/CompaniesPage').then((m) => ({ default: m.CompaniesPage }))
)

export const ContactsPage = lazy(() =>
  import('@/pages/ContactsPage').then((m) => ({ default: m.ContactsPage }))
)

export const PipelinePage = lazy(() =>
  import('@/pages/PipelinePage').then((m) => ({ default: m.PipelinePage }))
)

export const IntelligencePage = lazy(() =>
  import('@/pages/IntelligencePage').then((m) => ({ default: m.IntelligencePage }))
)

export const SavedDataPage = lazy(() =>
  import('@/pages/SavedDataPage').then((m) => ({ default: m.SavedDataPage }))
)

export const IntegrationsPage = lazy(() =>
  import('@/pages/IntegrationsPage').then((m) => ({ default: m.IntegrationsPage }))
)

export const SettingsPage = lazy(() =>
  import('@/pages/SettingsPage').then((m) => ({ default: m.SettingsPage }))
)

export const NotFoundPage = lazy(() =>
  import('@/pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage }))
)
