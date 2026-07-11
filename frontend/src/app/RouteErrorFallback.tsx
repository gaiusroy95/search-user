import { useRouteError, isRouteErrorResponse, Link } from 'react-router-dom'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ROUTES } from '@/lib/routes'

export function RouteErrorFallback() {
  const error = useRouteError()
  const isChunkError =
    error instanceof Error &&
    (error.message.includes('Failed to fetch dynamically imported module') ||
      error.message.includes('Importing a module script failed'))

  let title = 'Something went wrong'
  let description = 'An unexpected error occurred while loading this page.'

  if (isRouteErrorResponse(error)) {
    title = `${error.status} ${error.statusText}`
    description = error.data?.message ?? description
  } else if (error instanceof Error) {
    description = error.message
  }

  const handleReload = () => {
    window.location.reload()
  }

  return (
    <div className="mx-auto flex min-h-[50vh] max-w-lg flex-col items-center justify-center px-4 py-16 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-destructive/10">
        <AlertTriangle className="h-6 w-6 text-destructive" />
      </div>
      <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
      {isChunkError && (
        <p className="mt-2 text-xs text-muted-foreground">
          This usually happens after a dev server update. Reload to fetch the latest code.
        </p>
      )}
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        <Button onClick={handleReload}>
          <RefreshCw className="h-4 w-4" />
          Reload page
        </Button>
        <Button variant="outline" asChild>
          <Link to={ROUTES.dashboard}>Go to Dashboard</Link>
        </Button>
      </div>
    </div>
  )
}
