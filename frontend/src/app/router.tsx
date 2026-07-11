import { createBrowserRouter, Navigate } from 'react-router-dom'

import { AppShell } from '@/components/layout/shell/AppShell'

import { RouteErrorFallback } from '@/app/RouteErrorFallback'

import { ROUTES } from '@/lib/routes'

import {

  CompaniesPage,

  ContactsPage,

  CompanyProfilePage,

  DashboardPage,

  ActivityPage,

  AuthPage,

  TeamPage,

  DiscoveryPage,

  IntelligencePage,

  NotFoundPage,

  PersonProfilePage,

  PipelinePage,

  SavedDataPage,

  IntegrationsPage,

  SettingsPage,

  UserLookupPage,

} from '@/app/lazy-pages'



export const router = createBrowserRouter([

  {

    path: '/',

    element: <AppShell />,

    errorElement: <RouteErrorFallback />,

    children: [

      { index: true, element: <Navigate to={ROUTES.dashboard} replace /> },

      { path: 'dashboard', element: <DashboardPage />, errorElement: <RouteErrorFallback /> },

      { path: 'activity', element: <ActivityPage />, errorElement: <RouteErrorFallback /> },

      { path: 'auth', element: <AuthPage />, errorElement: <RouteErrorFallback /> },

      { path: 'team', element: <TeamPage />, errorElement: <RouteErrorFallback /> },

      { path: 'discover', element: <DiscoveryPage />, errorElement: <RouteErrorFallback /> },

      { path: 'people', element: <UserLookupPage />, errorElement: <RouteErrorFallback /> },

      { path: 'people/:id', element: <PersonProfilePage />, errorElement: <RouteErrorFallback /> },

      { path: 'contacts', element: <ContactsPage />, errorElement: <RouteErrorFallback /> },

      { path: 'companies', element: <CompaniesPage />, errorElement: <RouteErrorFallback /> },

      { path: 'companies/:id', element: <CompanyProfilePage />, errorElement: <RouteErrorFallback /> },

      { path: 'pipeline', element: <PipelinePage />, errorElement: <RouteErrorFallback /> },

      { path: 'intelligence', element: <IntelligencePage />, errorElement: <RouteErrorFallback /> },

      { path: 'vault', element: <SavedDataPage />, errorElement: <RouteErrorFallback /> },

      { path: 'integrations', element: <IntegrationsPage />, errorElement: <RouteErrorFallback /> },

      { path: 'settings', element: <SettingsPage />, errorElement: <RouteErrorFallback /> },

      { path: '*', element: <NotFoundPage /> },

    ],

  },

])


