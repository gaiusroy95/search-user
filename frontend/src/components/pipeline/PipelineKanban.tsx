import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import type { Prospect, ProspectStatus } from '@/types'
import { PROSPECT_STATUSES, STATUS_LABELS } from '@/types'

interface PipelineKanbanProps {
  leads: Prospect[]
  onSelectLead: (lead: Prospect) => void
}

const COLUMN_ACCENT: Record<ProspectStatus, string> = {
  NEW: 'border-t-blue-500',
  CONTACTED: 'border-t-violet-500',
  INTERESTED: 'border-t-amber-500',
  MEETING: 'border-t-orange-500',
  OPPORTUNITY: 'border-t-emerald-500',
  CLOSED: 'border-t-slate-400',
}

export function PipelineKanban({ leads, onSelectLead }: PipelineKanbanProps) {
  if (!leads.length) {
    return (
      <p className="py-16 text-center text-sm text-muted-foreground">
        No leads match your filters. Save developers from Discover to get started.
      </p>
    )
  }

  return (
    <div className="flex gap-3 overflow-x-auto pb-2">
      {PROSPECT_STATUSES.map((status) => {
        const items = leads.filter((l) => l.status === status)
        return (
          <div
            key={status}
            className={`flex min-h-[360px] w-[220px] shrink-0 flex-col rounded-lg border border-border/60 border-t-2 bg-muted/20 ${COLUMN_ACCENT[status]}`}
          >
            <div className="flex items-center justify-between px-3 py-2.5">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {STATUS_LABELS[status]}
              </h3>
              <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">
                {items.length}
              </Badge>
            </div>
            <div className="flex-1 space-y-2 overflow-y-auto px-2 pb-2">
              {items.map((lead) => (
                <Card
                  key={lead.id}
                  className="cursor-pointer border-border/60 shadow-xs transition-colors hover:bg-accent/30"
                  onClick={() => onSelectLead(lead)}
                >
                  <CardContent className="p-3">
                    <p className="truncate text-sm font-medium">
                      {lead.name ?? lead.username}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      @{lead.username}
                    </p>
                    {lead.company && (
                      <p className="mt-1 truncate text-xs text-muted-foreground">
                        {lead.company}
                      </p>
                    )}
                    {lead.tags.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {lead.tags.slice(0, 2).map((tag) => (
                          <Badge key={tag} variant="outline" className="text-[10px]">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
