import { RotateCcw } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { formatRelativeTime } from '@/lib/activityCenter'
import type { IntegrationJob } from '@/types/integrations'

function jobStatusVariant(status: string): 'default' | 'secondary' | 'outline' {
  if (status === 'completed') return 'default'
  if (status === 'failed') return 'secondary'
  if (status === 'processing') return 'secondary'
  return 'outline'
}

interface JobQueuePanelProps {
  jobs: IntegrationJob[]
  canRetry: boolean
  onRetry: (jobId: string) => void
}

export function JobQueuePanel({ jobs, canRetry, onRetry }: JobQueuePanelProps) {
  const active = jobs.filter((j) => j.status === 'pending' || j.status === 'processing')
  const failed = jobs.filter((j) => j.status === 'failed')

  return (
    <Card className="border-border/60">
      <CardHeader>
        <CardTitle className="text-base">Background jobs</CardTitle>
        <CardDescription>
          Retry queue with exponential backoff ({active.length} active, {failed.length} failed).
        </CardDescription>
      </CardHeader>
      <CardContent>
        {jobs.length === 0 ? (
          <p className="text-sm text-muted-foreground">No jobs in queue.</p>
        ) : (
          <div className="space-y-2">
            {jobs.slice(0, 20).map((job) => (
              <div
                key={job.id}
                className="flex flex-col gap-2 rounded-lg border border-border/60 px-3 py-2 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium capitalize">{job.provider}</span>
                    <Badge variant={jobStatusVariant(job.status)}>{job.status}</Badge>
                    <span className="text-xs text-muted-foreground">
                      attempt {job.attempts}/{job.maxAttempts}
                    </span>
                  </div>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">
                    {job.lastError ?? `Scheduled ${formatRelativeTime(job.scheduledAt)}`}
                  </p>
                </div>
                {job.status === 'failed' && canRetry && (
                  <Button size="sm" variant="outline" onClick={() => onRetry(job.id)}>
                    <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
                    Retry
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
