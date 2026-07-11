import { useMemo, useState } from 'react'
import { LayoutGrid, Search, Table2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { PipelineKanban } from '@/components/pipeline/PipelineKanban'
import { PipelineTable } from '@/components/pipeline/PipelineTable'
import { LeadDrawer } from '@/components/pipeline/LeadDrawer'
import { useProspectStore } from '@/stores/useProspectStore'
import type { Prospect, ProspectStatus } from '@/types'
import { PROSPECT_STATUSES, STATUS_LABELS } from '@/types'

type PipelineView = 'kanban' | 'table'

function filterLeads(
  leads: Prospect[],
  search: string,
  statusFilter: ProspectStatus | 'ALL'
): Prospect[] {
  let result = leads
  if (statusFilter !== 'ALL') {
    result = result.filter((l) => l.status === statusFilter)
  }
  if (search.trim()) {
    const q = search.toLowerCase()
    result = result.filter(
      (l) =>
        l.username.toLowerCase().includes(q) ||
        (l.name?.toLowerCase().includes(q) ?? false) ||
        (l.company?.toLowerCase().includes(q) ?? false) ||
        l.tags.some((t) => t.toLowerCase().includes(q))
    )
  }
  return result
}

export function PipelineModule() {
  const leads = useProspectStore((s) => s.prospects)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<ProspectStatus | 'ALL'>('ALL')
  const [view, setView] = useState<PipelineView>('kanban')
  const [selectedLead, setSelectedLead] = useState<Prospect | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)

  const filtered = useMemo(
    () => filterLeads(leads, search, statusFilter),
    [leads, search, statusFilter]
  )

  const openLead = (lead: Prospect) => {
    setSelectedLead(lead)
    setDrawerOpen(true)
  }

  const liveLead = selectedLead
    ? leads.find((l) => l.id === selectedLead.id) ?? selectedLead
    : null

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Pipeline</h1>
        <p className="text-sm text-muted-foreground">
          Lightweight CRM — track leads, notes, and activity.
        </p>
      </div>

      <div className="flex flex-col gap-3 rounded-lg border border-border/60 bg-card p-3 sm:flex-row sm:items-center">
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search leads…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 pl-9"
          />
        </div>

        <Select
          value={statusFilter}
          onValueChange={(v) => setStatusFilter(v as ProspectStatus | 'ALL')}
        >
          <SelectTrigger className="h-9 w-full sm:w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All statuses</SelectItem>
            {PROSPECT_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {STATUS_LABELS[s]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex items-center justify-between gap-2 sm:justify-end">
          <span className="text-xs text-muted-foreground">{filtered.length} leads</span>
          <div className="flex rounded-md border border-border/60 p-0.5">
            <Button
              size="sm"
              variant={view === 'kanban' ? 'secondary' : 'ghost'}
              className="h-8 px-2.5"
              onClick={() => setView('kanban')}
              aria-label="Kanban view"
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant={view === 'table' ? 'secondary' : 'ghost'}
              className="h-8 px-2.5"
              onClick={() => setView('table')}
              aria-label="Table view"
            >
              <Table2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {view === 'kanban' ? (
        <PipelineKanban leads={filtered} onSelectLead={openLead} />
      ) : (
        <PipelineTable leads={filtered} onSelectLead={openLead} />
      )}

      <LeadDrawer
        lead={liveLead}
        open={drawerOpen}
        onOpenChange={(open) => {
          setDrawerOpen(open)
          if (!open) setSelectedLead(null)
        }}
      />
    </div>
  )
}
