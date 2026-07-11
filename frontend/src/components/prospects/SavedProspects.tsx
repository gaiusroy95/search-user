import { useMemo, useState } from 'react'
import { KanbanView } from '@/components/prospects/KanbanView'
import { ListView } from '@/components/prospects/ListView'
import { TableView } from '@/components/prospects/TableView'
import {
  ProspectsToolbar,
  type ProspectSort,
  type ProspectView,
} from '@/components/prospects/ProspectsToolbar'
import { useProspectStore } from '@/stores/useProspectStore'
import type { Prospect, ProspectStatus } from '@/types'

function filterAndSort(
  prospects: Prospect[],
  search: string,
  statusFilter: ProspectStatus | 'ALL',
  sort: ProspectSort
) {
  let result = prospects

  if (statusFilter !== 'ALL') {
    result = result.filter((p) => p.status === statusFilter)
  }

  if (search.trim()) {
    const q = search.toLowerCase()
    result = result.filter(
      (p) =>
        p.username.toLowerCase().includes(q) ||
        (p.name?.toLowerCase().includes(q) ?? false) ||
        (p.location?.toLowerCase().includes(q) ?? false)
    )
  }

  return [...result].sort((a, b) => {
    if (sort === 'followers') return b.followers - a.followers
    if (sort === 'name') {
      return (a.name ?? a.username).localeCompare(b.name ?? b.username)
    }
    return new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime()
  })
}

export function SavedProspects() {
  const prospects = useProspectStore((s) => s.prospects)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<ProspectStatus | 'ALL'>('ALL')
  const [sort, setSort] = useState<ProspectSort>('savedAt')
  const [view, setView] = useState<ProspectView>('kanban')

  const filtered = useMemo(
    () => filterAndSort(prospects, search, statusFilter, sort),
    [prospects, search, statusFilter, sort]
  )

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Saved Prospects</h2>
        <p className="text-sm text-muted-foreground">
          Flexible pipeline — search, filter, sort, and switch views.
        </p>
      </div>

      <ProspectsToolbar
        search={search}
        onSearchChange={setSearch}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        sort={sort}
        onSortChange={setSort}
        view={view}
        onViewChange={setView}
        total={filtered.length}
      />

      {view === 'kanban' && <KanbanView prospects={filtered} />}
      {view === 'list' && <ListView prospects={filtered} />}
      {view === 'table' && <TableView prospects={filtered} />}
    </div>
  )
}
