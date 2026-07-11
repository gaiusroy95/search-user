import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { Prospect, ProspectStatus } from '@/types'
import { PROSPECT_STATUSES, STATUS_LABELS } from '@/types'
import { useProspectStore } from '@/stores/useProspectStore'
import { formatNumber } from '@/lib/utils'

interface KanbanViewProps {
  prospects: Prospect[]
}

export function KanbanView({ prospects }: KanbanViewProps) {
  const updateStatus = useProspectStore((s) => s.updateStatus)

  const columns = PROSPECT_STATUSES.map((status) => ({
    status,
    label: STATUS_LABELS[status],
    items: prospects.filter((p) => p.status === status),
  }))

  if (!prospects.length) {
    return (
      <p className="py-12 text-center text-sm text-muted-foreground">
        No prospects match your filters.
      </p>
    )
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {columns.map((col) => (
        <div
          key={col.status}
          className="flex min-h-[320px] min-w-[240px] max-w-[300px] flex-1 flex-col rounded-xl border border-border bg-muted/20 p-3"
        >
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold">{col.label}</h3>
            <Badge variant="secondary">{col.items.length}</Badge>
          </div>
          <div className="flex-1 space-y-3 overflow-y-auto pr-1">
            {col.items.map((p, idx) => (
              <motion.div
                key={p.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <Card className="shadow-sm">
                  <CardHeader className="p-3 pb-2">
                    <CardTitle className="text-sm">
                      <span className="mr-1 text-muted-foreground">#{idx + 1}</span>
                      {p.name ?? p.username}
                    </CardTitle>
                    <p className="text-xs text-muted-foreground">@{p.username}</p>
                  </CardHeader>
                  <CardContent className="space-y-2 p-3 pt-0">
                    <p className="text-xs text-muted-foreground">
                      {formatNumber(p.followers)} followers · {p.location ?? '—'}
                    </p>
                    <Select
                      value={p.status}
                      onValueChange={(v) =>
                        updateStatus(p.id, v as ProspectStatus)
                      }
                    >
                      <SelectTrigger className="h-8 text-xs">
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
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
