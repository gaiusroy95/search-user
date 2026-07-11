import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import type { Prospect, ProspectStatus } from '@/types'
import { PROSPECT_STATUSES, STATUS_LABELS } from '@/types'
import { useProspectStore } from '@/stores/useProspectStore'
import { formatNumber } from '@/lib/utils'
import { Trash2 } from 'lucide-react'

interface ListViewProps {
  prospects: Prospect[]
}

export function ListView({ prospects }: ListViewProps) {
  const updateStatus = useProspectStore((s) => s.updateStatus)
  const updateNotes = useProspectStore((s) => s.updateNotes)
  const removeProspect = useProspectStore((s) => s.removeProspect)

  if (!prospects.length) {
    return (
      <p className="py-12 text-center text-sm text-muted-foreground">
        No prospects match your filters.
      </p>
    )
  }

  return (
    <div className="space-y-3">
      {prospects.map((p, i) => (
        <div
          key={p.id}
          className="rounded-xl border border-border bg-card p-4 shadow-sm"
        >
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex gap-3">
              <img
                src={p.avatar ?? `https://github.com/${p.username}.png`}
                alt=""
                className="h-12 w-12 rounded-full"
              />
              <div>
                <p className="font-semibold">
                  <span className="mr-2 text-muted-foreground">#{i + 1}</span>
                  {p.name ?? p.username}
                </p>
                <p className="text-sm text-muted-foreground">
                  @{p.username} · {p.location ?? '—'} ·{' '}
                  {formatNumber(p.followers)} followers
                </p>
                {p.outreachDraft && (
                  <p className="mt-1 text-xs text-primary">
                    Draft: {p.outreachDraft.subject}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Select
                value={p.status}
                onValueChange={(v) => updateStatus(p.id, v as ProspectStatus)}
              >
                <SelectTrigger className="h-9 w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PROSPECT_STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {STATUS_LABELS[s]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeProspect(p.id)}
                aria-label={`Remove ${p.username}`}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="mt-4 grid gap-3 lg:grid-cols-2">
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">Notes</label>
              <Textarea
                value={p.notes}
                onChange={(e) => updateNotes(p.id, e.target.value)}
                placeholder="Add notes about this prospect..."
                className="min-h-[80px] text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">Tags</label>
              <Input
                value={p.tags.join(', ')}
                onChange={(e) =>
                  useProspectStore
                    .getState()
                    .updateTags(
                      p.id,
                      e.target.value
                        .split(',')
                        .map((t) => t.trim())
                        .filter(Boolean)
                    )
                }
                placeholder="react, senior, remote"
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
