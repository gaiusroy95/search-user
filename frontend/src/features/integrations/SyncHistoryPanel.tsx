import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { formatRelativeTime } from '@/lib/activityCenter'
import type { SyncRun } from '@/types/integrations'

function runStatusVariant(status: string): 'default' | 'secondary' | 'outline' {
  if (status === 'completed') return 'default'
  if (status === 'failed') return 'secondary'
  if (status === 'running') return 'secondary'
  return 'outline'
}

interface SyncHistoryPanelProps {
  runs: SyncRun[]
}

export function SyncHistoryPanel({ runs }: SyncHistoryPanelProps) {
  return (
    <Card className="border-border/60">
      <CardHeader>
        <CardTitle className="text-base">Sync history</CardTitle>
        <CardDescription>Recent sync runs across all connected integrations.</CardDescription>
      </CardHeader>
      <CardContent>
        {runs.length === 0 ? (
          <p className="text-sm text-muted-foreground">No sync runs yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/60 text-left text-muted-foreground">
                  <th className="pb-2 pr-4 font-medium">Provider</th>
                  <th className="pb-2 pr-4 font-medium">Status</th>
                  <th className="pb-2 pr-4 font-medium">Records</th>
                  <th className="pb-2 pr-4 font-medium">When</th>
                  <th className="pb-2 font-medium">Details</th>
                </tr>
              </thead>
              <tbody>
                {runs.map((run) => (
                  <tr key={run.id} className="border-b border-border/40 last:border-0">
                    <td className="py-2.5 pr-4 capitalize">{run.provider}</td>
                    <td className="py-2.5 pr-4">
                      <Badge variant={runStatusVariant(run.status)}>{run.status}</Badge>
                    </td>
                    <td className="py-2.5 pr-4 tabular-nums">{run.recordsProcessed}</td>
                    <td className="py-2.5 pr-4 text-muted-foreground">
                      {formatRelativeTime(run.startedAt)}
                    </td>
                    <td className="py-2.5 text-muted-foreground">
                      {run.error ??
                        (run.details?.importStats
                          ? `${run.summary} (${(run.details.importStats as { created?: number; updated?: number }).created ?? 0} new, ${(run.details.importStats as { updated?: number }).updated ?? 0} updated)`
                          : run.summary) ??
                        '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
