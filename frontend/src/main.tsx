import { lazy, StrictMode, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from 'react-router-dom'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { Toaster } from '@/components/ui/toaster'
import { router } from '@/app/router'
import { createQueryClient } from '@/lib/queryClient'
import './index.css'

const queryClient = createQueryClient()

const DeveloperDetailsDrawer = lazy(() =>
  import('@/components/results/DeveloperDetailsDrawer').then((m) => ({
    default: m.DeveloperDetailsDrawer,
  }))
)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <RouterProvider router={router} />
        <Suspense fallback={null}>
          <DeveloperDetailsDrawer />
        </Suspense>
        <Toaster />
      </ErrorBoundary>
    </QueryClientProvider>
  </StrictMode>
)
