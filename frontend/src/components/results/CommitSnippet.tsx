import { GitCommit } from 'lucide-react'
import type { ActivitySummary, CommitSummary } from '@/types'
import { formatDate } from '@/lib/utils'

function getLatestCommit(
  activity?: ActivitySummary | null,
  repoCommit?: CommitSummary | null
): CommitSummary | null {
  if (activity?.recentCommits?.[0]) return activity.recentCommits[0]
  if (repoCommit) return repoCommit
  if (activity?.lastCommitAt) {
    return {
      sha: '—',
      message: activity.lastCommitMessage ?? '',
      from: activity.lastCommitFrom,
      email: activity.lastCommitEmail,
      date: activity.lastCommitAt,
      url: activity.lastCommitUrl ?? '#',
      patchUrl: activity.lastCommitPatchUrl,
    }
  }
  return null
}

export function CommitSnippet({
  activity,
  accountCreatedAt,
  compact,
}: {
  activity?: ActivitySummary | null
  accountCreatedAt?: string
  compact?: boolean
}) {
  const commit = getLatestCommit(activity)

  if (!commit && !accountCreatedAt) return null

  return (
    <div
      className={`rounded-md border border-dashed border-border bg-muted/20 text-xs ${
        compact ? 'px-2 py-1.5' : 'px-3 py-2'
      }`}
    >
      {accountCreatedAt && (
        <p className="text-muted-foreground">
          <span className="font-medium text-foreground">Joined:</span>{' '}
          {formatDate(accountCreatedAt)}
        </p>
      )}
      {commit && (
        <>
          <p className={accountCreatedAt ? 'mt-1' : ''}>
            <GitCommit className="mr-1 inline h-3 w-3" />
            <span className="font-medium text-foreground">From:</span>{' '}
            {commit.from ?? 'Unknown'}
            {commit.email && (
              <span className="text-muted-foreground"> &lt;{commit.email}&gt;</span>
            )}
          </p>
          <p className="mt-0.5 text-muted-foreground">
            <span className="font-medium text-foreground">Date:</span>{' '}
            {formatDate(commit.date)}
          </p>
          {!compact && commit.message && (
            <p className="mt-0.5 truncate text-muted-foreground">{commit.message}</p>
          )}
        </>
      )}
    </div>
  )
}
