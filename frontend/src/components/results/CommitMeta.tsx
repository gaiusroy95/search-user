import { ExternalLink } from 'lucide-react'
import type { CommitSummary } from '@/types'
import { formatDate } from '@/lib/utils'

export function CommitMeta({ commit }: { commit: CommitSummary }) {
  return (
    <div className="mt-2 rounded-md border border-border bg-muted/30 p-3 font-mono text-xs">
      <p>
        <span className="text-muted-foreground">From:</span>{' '}
        {commit.from ?? 'Unknown'}
        {commit.email && (
          <span className="text-muted-foreground"> &lt;{commit.email}&gt;</span>
        )}
      </p>
      <p className="mt-1">
        <span className="text-muted-foreground">Date:</span> {formatDate(commit.date)}
      </p>
      <p className="mt-1 truncate text-muted-foreground">{commit.message}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        <a
          href={commit.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-primary hover:underline"
        >
          Commit {commit.sha}
          <ExternalLink className="h-3 w-3" />
        </a>
        {commit.patchUrl && (
          <a
            href={commit.patchUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 hover:underline"
          >
            .patch
            <ExternalLink className="h-3 w-3" />
          </a>
        )}
      </div>
    </div>
  )
}
