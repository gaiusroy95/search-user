import { Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useProspectStore } from '@/stores/useProspectStore'
import { formatActivityTime } from '@/lib/pipeline'
import type { Prospect, ProspectStatus } from '@/types'
import { PROSPECT_STATUSES, STATUS_LABELS } from '@/types'

interface PipelineTableProps {
  leads: Prospect[]
  onSelectLead: (lead: Prospect) => void
}

export function PipelineTable({ leads, onSelectLead }: PipelineTableProps) {
  const updateStatus = useProspectStore((s) => s.updateStatus)
  const removeProspect = useProspectStore((s) => s.removeProspect)

  if (!leads.length) {
    return (
      <p className="py-16 text-center text-sm text-muted-foreground">
        No leads match your filters.
      </p>
    )
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-border/60">
      <table className="w-full text-sm">
        <thead className="border-b border-border/60 bg-muted/30">
          <tr>
            <th className="px-4 py-3 text-left font-medium">Lead</th>
            <th className="hidden px-4 py-3 text-left font-medium md:table-cell">Company</th>
            <th className="px-4 py-3 text-left font-medium">Status</th>
            <th className="hidden px-4 py-3 text-left font-medium lg:table-cell">Tags</th>
            <th className="hidden px-4 py-3 text-left font-medium sm:table-cell">Activity</th>
            <th className="px-4 py-3 text-right font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {leads.map((lead) => {
            const lastActivity = lead.activityHistory[0]
            return (
              <tr
                key={lead.id}
                className="cursor-pointer border-b border-border/40 last:border-0 hover:bg-muted/20"
                onClick={() => onSelectLead(lead)}
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <Avatar size="sm">
                      <AvatarImage
                        src={lead.avatar ?? `https://github.com/${lead.username}.png`}
                        alt=""
                      />
                      <AvatarFallback>
                        {lead.username.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="truncate font-medium">{lead.name ?? lead.username}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        @{lead.username}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">
                  {lead.company ?? '—'}
                </td>
                <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                  <Select
                    value={lead.status}
                    onValueChange={(v) => updateStatus(lead.id, v as ProspectStatus)}
                  >
                    <SelectTrigger className="h-8 w-[130px]">
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
                </td>
                <td className="hidden px-4 py-3 lg:table-cell">
                  <div className="flex flex-wrap gap-1">
                    {lead.tags.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-[10px]">
                        {tag}
                      </Badge>
                    ))}
                    {lead.tags.length === 0 && (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </div>
                </td>
                <td className="hidden px-4 py-3 text-xs text-muted-foreground sm:table-cell">
                  {lastActivity ? formatActivityTime(lastActivity.at) : '—'}
                </td>
                <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => removeProspect(lead.id)}
                    aria-label={`Remove ${lead.username}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
