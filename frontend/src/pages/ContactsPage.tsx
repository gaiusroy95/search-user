import { useCallback, useMemo, useState } from 'react'
import {
  ContactDrawer,
  ContactsBulkBar,
  ContactsTable,
  ContactsToolbar,
} from '@/features/contacts'
import { useContactsDirectory } from '@/hooks/useContactsDirectory'
import { useStoreHydrated } from '@/hooks/useStoreHydrated'
import { SkeletonPageHeader } from '@/components/ui/skeleton'
import type { ContactEntry } from '@/lib/contactsDirectory'
import { useDiscoveryStore } from '@/stores/useDiscoveryStore'
import { useProspectStore } from '@/stores/useProspectStore'

function ContactsPageSkeleton() {
  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <SkeletonPageHeader />
      <div className="space-y-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-14 animate-pulse rounded-lg bg-muted/80" />
        ))}
      </div>
    </div>
  )
}

export function ContactsPage() {
  const discoveryHydrated = useStoreHydrated(useDiscoveryStore.persist)
  const prospectHydrated = useStoreHydrated(useProspectStore.persist)

  const {
    filters,
    setFilters,
    applyFilters,
    resetFilters,
    filtered,
    totalCount,
    isEmpty,
    isFilteredEmpty,
    hasActiveFilters,
    skillOptions,
    countryOptions,
  } = useContactsDirectory()

  const [selectedUsernames, setSelectedUsernames] = useState<Set<string>>(new Set())
  const [drawerUsername, setDrawerUsername] = useState<string | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)

  const drawerContact = useMemo(
    () =>
      drawerUsername
        ? filtered.find((c) => c.username === drawerUsername) ?? null
        : null,
    [filtered, drawerUsername]
  )

  const selectedContacts = useMemo(
    () => filtered.filter((c) => selectedUsernames.has(c.username)),
    [filtered, selectedUsernames]
  )

  const toggleSelect = useCallback((username: string) => {
    setSelectedUsernames((prev) => {
      const next = new Set(prev)
      if (next.has(username)) next.delete(username)
      else next.add(username)
      return next
    })
  }, [])

  const toggleSelectAll = useCallback((usernames: string[]) => {
    setSelectedUsernames(new Set(usernames))
  }, [])

  const openContact = useCallback((contact: ContactEntry) => {
    setDrawerUsername(contact.username)
    setDrawerOpen(true)
  }, [])

  const clearSelection = useCallback(() => {
    setSelectedUsernames(new Set())
  }, [])

  if (!discoveryHydrated || !prospectHydrated) {
    return <ContactsPageSkeleton />
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 pb-24 sm:px-6 lg:px-8">
      <ContactsToolbar
        filters={filters}
        totalCount={totalCount}
        hasActiveFilters={hasActiveFilters}
        skillOptions={skillOptions}
        countryOptions={countryOptions}
        onFiltersChange={setFilters}
        onApplyFilters={applyFilters}
        onReset={resetFilters}
      />

      <ContactsTable
        contacts={filtered}
        selectedUsernames={selectedUsernames}
        onToggleSelect={toggleSelect}
        onToggleSelectAll={toggleSelectAll}
        onSelectContact={openContact}
        isEmpty={isEmpty}
        isFilteredEmpty={isFilteredEmpty}
      />

      <ContactsBulkBar selected={selectedContacts} onClearSelection={clearSelection} />

      <ContactDrawer
        contact={drawerContact}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
      />
    </div>
  )
}
