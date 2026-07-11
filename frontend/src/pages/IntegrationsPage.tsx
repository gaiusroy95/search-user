import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Plug, RefreshCw } from 'lucide-react'

import { IntegrationCard } from '@/features/integrations/IntegrationCard'
import { JobQueuePanel } from '@/features/integrations/JobQueuePanel'
import { SyncHistoryPanel } from '@/features/integrations/SyncHistoryPanel'
import { Button } from '@/components/ui/button'
import { getIntegrationsErrorMessage } from '@/services/integrationsApi'
import { useIntegrations } from '@/hooks/useIntegrations'
import { usePermissions } from '@/hooks/usePermissions'
import { useAuthStore } from '@/stores/useAuthStore'
import { useWorkspaceStore } from '@/stores/useWorkspaceStore'
import { ROUTES } from '@/lib/routes'

export function IntegrationsPage() {
  const token = useAuthStore((s) => s.token)
  const workspace = useWorkspaceStore((s) => s.getActiveWorkspace())
  const [searchParams, setSearchParams] = useSearchParams()
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  const {
    integrations,
    syncRuns,
    jobs,
    loading,
    syncingProvider,
    refresh,
    connect,
    disconnect,
    sync,
    retryJob,
  } = useIntegrations()

  const { can } = usePermissions()
  const canWrite = can('integrations:write')
  const canSync = can('integrations:sync')

  useEffect(() => {
    const connected = searchParams.get('connected')
    const oauthError = searchParams.get('error')
    if (connected) {
      setNotice(`${connected} connected successfully.`)
      setSearchParams({}, { replace: true })
    } else if (oauthError) {
      setError(decodeURIComponent(oauthError))
      setSearchParams({}, { replace: true })
    }
  }, [searchParams, setSearchParams])

  if (!token) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <Plug className="mx-auto h-10 w-10 text-muted-foreground" />
        <h1 className="mt-4 text-xl font-semibold">Integrations</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Sign in to connect GitHub, ATS tools, email, and Slack to your workspace.
        </p>
        <Button asChild className="mt-6">
          <Link to={ROUTES.auth}>Sign in</Link>
        </Button>
      </div>
    )
  }

  const handleAction = async (action: () => Promise<void>) => {
    setError(null)
    setNotice(null)
    try {
      await action()
    } catch (err) {
      setError(getIntegrationsErrorMessage(err))
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Integrations</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            OAuth connections, sync engine, and retry queue for {workspace?.name ?? 'your workspace'}.
            Synced contacts appear in{' '}
            <Link to={ROUTES.contacts} className="text-primary hover:underline">
              Contacts
            </Link>{' '}
            and{' '}
            <Link to={ROUTES.pipeline} className="text-primary hover:underline">
              Pipeline
            </Link>
            .
          </p>
        </div>
        <Button variant="outline" size="sm" disabled={loading} onClick={() => void handleAction(refresh)}>
          <RefreshCw className={`mr-1.5 h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {notice && (
        <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-700 dark:text-emerald-300">
          {notice}
        </div>
      )}
      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-2 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {integrations.map((item) => (
          <IntegrationCard
            key={item.provider.id}
            item={item}
            busy={loading || syncingProvider === item.provider.id}
            canWrite={canWrite}
            canSync={canSync}
            onConnect={() => void handleAction(() => connect(item.provider.id))}
            onDisconnect={() => void handleAction(() => disconnect(item.provider.id))}
            onSync={() => void handleAction(() => sync(item.provider.id))}
          />
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <SyncHistoryPanel runs={syncRuns} />
        <JobQueuePanel
          jobs={jobs}
          canRetry={canSync}
          onRetry={(jobId) => void handleAction(() => retryJob(jobId))}
        />
      </div>
    </div>
  )
}
