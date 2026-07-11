import {
  Briefcase,
  Code2,
  Mail,
  MessageSquare,
  RefreshCw,
  Unplug,
  Users,
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CATEGORY_LABELS, type WorkspaceIntegration } from '@/types/integrations'

const PROVIDER_ICONS = {
  github: Code2,
  linkedin: Users,
  greenhouse: Briefcase,
  lever: Briefcase,
  slack: MessageSquare,
  gmail: Mail,
  outlook: Mail,
} as const

function statusVariant(status: string): 'default' | 'secondary' | 'outline' {
  if (status === 'connected') return 'default'
  if (status === 'error') return 'secondary'
  return 'outline'
}

interface IntegrationCardProps {
  item: WorkspaceIntegration
  busy: boolean
  canWrite: boolean
  canSync: boolean
  onConnect: () => void
  onDisconnect: () => void
  onSync: () => void
}

export function IntegrationCard({
  item,
  busy,
  canWrite,
  canSync,
  onConnect,
  onDisconnect,
  onSync,
}: IntegrationCardProps) {
  const Icon = PROVIDER_ICONS[item.provider.id] ?? Code2
  const connected = item.status === 'connected'
  const conn = item.connection

  return (
    <Card className="border-border/60">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-base">{item.provider.name}</CardTitle>
              <CardDescription className="text-xs">
                {CATEGORY_LABELS[item.provider.category]}
              </CardDescription>
            </div>
          </div>
          <Badge variant={statusVariant(item.status)}>{item.status}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">{item.provider.description}</p>

        {conn?.lastSyncAt && (
          <p className="text-xs text-muted-foreground">
            Last sync: {new Date(conn.lastSyncAt).toLocaleString()}
          </p>
        )}
        {conn?.lastError && (
          <p className="text-xs text-destructive">{conn.lastError}</p>
        )}

        <div className="flex flex-wrap gap-2">
          {!connected && canWrite && (
            <Button size="sm" disabled={busy} onClick={onConnect}>
              Connect
            </Button>
          )}
          {connected && canSync && item.provider.supportsSync && (
            <Button size="sm" variant="secondary" disabled={busy} onClick={onSync}>
              <RefreshCw className={`mr-1.5 h-3.5 w-3.5 ${busy ? 'animate-spin' : ''}`} />
              Sync now
            </Button>
          )}
          {connected && canWrite && (
            <Button size="sm" variant="outline" disabled={busy} onClick={onDisconnect}>
              <Unplug className="mr-1.5 h-3.5 w-3.5" />
              Disconnect
            </Button>
          )}
        </div>

        {!item.provider.oauthConfigured && !connected && (
          <p className="text-xs text-muted-foreground">
            OAuth not configured — demo connect available for testing.
          </p>
        )}
      </CardContent>
    </Card>
  )
}
