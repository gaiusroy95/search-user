import { useEffect, useState } from 'react'
import { MessageSquare, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { fetchComments, postComment } from '@/services/collaborationApi'
import { getCollaborationErrorMessage } from '@/services/collaborationApi'
import { formatRelativeTime } from '@/lib/activityCenter'
import { usePermissions } from '@/hooks/usePermissions'
import { useAuthStore } from '@/stores/useAuthStore'
import { useWorkspaceStore } from '@/stores/useWorkspaceStore'
import type { ProspectComment } from '@/types/collaboration'

interface ProspectCommentsProps {
  prospectId: string
}

export function ProspectComments({ prospectId }: ProspectCommentsProps) {
  const token = useAuthStore((s) => s.token)
  const workspaceId = useWorkspaceStore((s) => s.activeWorkspaceId)
  const members = useWorkspaceStore((s) => s.members)
  const { canWriteComments } = usePermissions()
  const [comments, setComments] = useState<ProspectComment[]>([])
  const [draft, setDraft] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!token || !workspaceId) return
    void (async () => {
      try {
        const data = await fetchComments(workspaceId, prospectId)
        setComments(data)
      } catch {
        setComments([])
      }
    })()
  }, [token, workspaceId, prospectId])

  if (!token || !workspaceId) {
    return (
      <p className="text-xs text-muted-foreground">
        Sign in to a team workspace to use shared comments and @mentions.
      </p>
    )
  }

  const handleSubmit = async () => {
    if (!draft.trim() || !workspaceId) return
    setLoading(true)
    setError(null)
    try {
      const comment = await postComment(workspaceId, prospectId, draft.trim())
      setComments((prev) => [comment, ...prev])
      setDraft('')
      void useWorkspaceStore.getState().refreshNotifications()
    } catch (err) {
      setError(getCollaborationErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  const mentionHint =
    members.length > 0
      ? `Mention teammates with @${members[0].user?.email?.split('@')[0] ?? 'name'}`
      : 'Use @email-prefix to mention teammates'

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-1.5 text-sm font-medium">
        <MessageSquare className="h-3.5 w-3.5" />
        Team comments
      </div>

      {canWriteComments && (
        <div className="space-y-2">
          <Textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={`Add a comment… ${mentionHint}`}
            className="min-h-[72px] text-sm"
          />
          {error && <p className="text-xs text-destructive">{error}</p>}
          <Button
            type="button"
            size="sm"
            disabled={loading || !draft.trim()}
            onClick={() => void handleSubmit()}
          >
            <Send className="h-3.5 w-3.5" />
            Post comment
          </Button>
        </div>
      )}

      {comments.length === 0 ? (
        <p className="text-xs text-muted-foreground">No comments yet.</p>
      ) : (
        <ul className="space-y-2">
          {comments.map((comment) => (
            <li
              key={comment.id}
              className="rounded-lg border border-border/60 bg-muted/20 px-3 py-2 text-sm"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-medium">
                  {comment.author?.name ?? 'Teammate'}
                </span>
                <span className="text-[10px] text-muted-foreground">
                  {formatRelativeTime(comment.createdAt)}
                </span>
              </div>
              <p className="mt-1 whitespace-pre-wrap text-sm">{comment.body}</p>
              {comment.mentions.length > 0 && (
                <p className="mt-1 text-[10px] text-muted-foreground">
                  Mentioned {comment.mentions.length} teammate
                  {comment.mentions.length === 1 ? '' : 's'}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
