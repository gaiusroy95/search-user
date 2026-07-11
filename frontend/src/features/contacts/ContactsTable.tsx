import { useRef } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import { Users } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/ui/empty-state'
import { formatActivityTime } from '@/lib/pipeline'
import { contactHandle } from '@/lib/contactSources'
import type { ContactEntry } from '@/lib/contactsDirectory'
import { cn } from '@/lib/utils'

const ROW_HEIGHT = 56

const GRID_COLS =
  'grid-cols-[40px_minmax(180px,1.2fr)_minmax(120px,0.9fr)_minmax(90px,0.6fr)_minmax(120px,0.9fr)_minmax(100px,0.7fr)_minmax(160px,1fr)_minmax(120px,0.8fr)_minmax(140px,0.9fr)]'

interface ContactsTableProps {
  contacts: ContactEntry[]
  selectedUsernames: Set<string>
  onToggleSelect: (username: string) => void
  onToggleSelectAll: (usernames: string[]) => void
  onSelectContact: (contact: ContactEntry) => void
  isEmpty?: boolean
  isFilteredEmpty?: boolean
}

function ContactsTableSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="h-14 animate-pulse rounded-lg bg-muted/60" />
      ))}
    </div>
  )
}

export function ContactsTable({
  contacts,
  selectedUsernames,
  onToggleSelect,
  onToggleSelectAll,
  onSelectContact,
  isEmpty,
  isFilteredEmpty,
}: ContactsTableProps) {
  const parentRef = useRef<HTMLDivElement>(null)

  const rowVirtualizer = useVirtualizer({
    count: contacts.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 12,
  })

  const allSelected =
    contacts.length > 0 && contacts.every((c) => selectedUsernames.has(c.username))
  const someSelected = contacts.some((c) => selectedUsernames.has(c.username))

  if (isEmpty) {
    return (
      <EmptyState
        variant="dashed"
        icon={Users}
        title="No contacts yet"
        description="Developers appear here from Discover, saved pipeline leads, and integration syncs (LinkedIn, ATS, email). Connect platforms on Integrations and run Sync."
        className="py-16"
      />
    )
  }

  if (isFilteredEmpty) {
    return (
      <EmptyState
        variant="dashed"
        icon={Users}
        title="No contacts match your filters"
        description="Try clearing filters or broadening your search."
        className="py-16"
      />
    )
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border/60">
      <div
        className={cn(
          'hidden border-b border-border/60 bg-muted/30 px-3 py-3 text-xs font-medium text-muted-foreground lg:grid',
          GRID_COLS
        )}
      >
        <div className="flex items-center">
          <input
            type="checkbox"
            checked={allSelected}
            ref={(el) => {
              if (el) el.indeterminate = someSelected && !allSelected
            }}
            onChange={() =>
              onToggleSelectAll(allSelected ? [] : contacts.map((c) => c.username))
            }
            className="h-4 w-4 rounded border-border accent-primary"
            aria-label="Select all contacts"
          />
        </div>
        <div>Name</div>
        <div>Handle</div>
        <div>Source</div>
        <div>Company</div>
        <div>Country</div>
        <div>Email</div>
        <div>Stage</div>
        <div>Last activity</div>
      </div>

      <div ref={parentRef} className="max-h-[calc(100vh-22rem)] overflow-auto">
        <div
          style={{
            height: `${rowVirtualizer.getTotalSize()}px`,
            width: '100%',
            position: 'relative',
          }}
        >
          {rowVirtualizer.getVirtualItems().map((virtualRow) => {
            const contact = contacts[virtualRow.index]
            const selected = selectedUsernames.has(contact.username)

            return (
              <div
                key={contact.username}
                data-index={virtualRow.index}
                ref={rowVirtualizer.measureElement}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  transform: `translateY(${virtualRow.start}px)`,
                }}
                className={cn(
                  'grid min-h-14 cursor-pointer items-center border-b border-border/40 px-3 text-sm transition-colors hover:bg-muted/20',
                  GRID_COLS,
                  selected && 'bg-primary/5'
                )}
                onClick={() => onSelectContact(contact)}
              >
                <div className="flex items-center" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={selected}
                    onChange={() => onToggleSelect(contact.username)}
                    className="h-4 w-4 rounded border-border accent-primary"
                    aria-label={`Select ${contact.username}`}
                  />
                </div>

                <div className="flex min-w-0 items-center gap-2.5">
                  <Avatar size="sm">
                    <AvatarImage
                      src={
                        contact.source
                          ? undefined
                          : contact.avatar ?? `https://github.com/${contact.username}.png`
                      }
                      alt=""
                    />
                    <AvatarFallback>
                      {(contact.name ?? contact.username).slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="truncate font-medium">{contact.name ?? contact.username}</span>
                </div>

                <div className="truncate text-muted-foreground">{contactHandle(contact)}</div>
                <div>
                  {contact.sourceLabel ? (
                    <Badge variant="outline" className="text-[10px] font-normal">
                      {contact.sourceLabel}
                    </Badge>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </div>
                <div className="truncate text-muted-foreground">{contact.company ?? '—'}</div>
                <div className="truncate text-muted-foreground">{contact.country ?? '—'}</div>
                <div className="truncate text-muted-foreground">{contact.email ?? '—'}</div>
                <div>
                  <Badge
                    variant={contact.isSaved ? 'secondary' : 'outline'}
                    className="text-[10px] font-normal"
                  >
                    {contact.pipelineLabel}
                  </Badge>
                </div>
                <div className="truncate text-xs text-muted-foreground">
                  {contact.lastActivityAt
                    ? formatActivityTime(contact.lastActivityAt)
                    : '—'}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export { ContactsTableSkeleton }
