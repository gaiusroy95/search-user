import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import type { Prospect, ProspectStatus } from '@/types'
import { PROSPECT_STATUSES, STATUS_LABELS } from '@/types'
import { useProspectStore } from '@/stores/useProspectStore'
import { formatNumber } from '@/lib/utils'
import { Trash2 } from 'lucide-react'

interface TableViewProps {
  prospects: Prospect[]
}

export function TableView({ prospects }: TableViewProps) {
  const updateStatus = useProspectStore((s) => s.updateStatus)
  const removeProspect = useProspectStore((s) => s.removeProspect)

  if (!prospects.length) {
    return (
      <p className="py-12 text-center text-sm text-muted-foreground">
        No prospects match your filters.
      </p>
    )
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <table className="w-full text-sm">
        <thead className="border-b border-border bg-muted/30">
          <tr>
            <th className="px-4 py-3 text-left font-medium">#</th>
            <th className="px-4 py-3 text-left font-medium">Developer</th>
            <th className="px-4 py-3 text-left font-medium">Location</th>
            <th className="px-4 py-3 text-left font-medium">Followers</th>
            <th className="px-4 py-3 text-left font-medium">Status</th>
            <th className="px-4 py-3 text-right font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {prospects.map((p, i) => (
            <tr key={p.id} className="border-b border-border last:border-0 hover:bg-muted/20">
              <td className="px-4 py-3 text-muted-foreground">{i + 1}</td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <img
                    src={p.avatar ?? `https://github.com/${p.username}.png`}
                    alt=""
                    className="h-8 w-8 rounded-full"
                  />
                  <div>
                    <p className="font-medium">{p.name ?? p.username}</p>
                    <p className="text-xs text-muted-foreground">@{p.username}</p>
                  </div>
                </div>
              </td>
              <td className="px-4 py-3 text-muted-foreground">{p.location ?? '—'}</td>
              <td className="px-4 py-3">{formatNumber(p.followers)}</td>
              <td className="px-4 py-3">
                <Select
                  value={p.status}
                  onValueChange={(v) => updateStatus(p.id, v as ProspectStatus)}
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
              <td className="px-4 py-3 text-right">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeProspect(p.id)}
                  aria-label={`Remove ${p.username}`}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
