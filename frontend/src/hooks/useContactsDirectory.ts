import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  collectCountryOptions,
  collectSkillOptions,
  filterContacts,
  filtersFromSearchParams,
  filtersToSearchParams,
  hasActiveContactFilters,
  mergeContactEntries,
  type ContactEntry,
  type ContactsDirectoryFilters,
} from '@/lib/contactsDirectory'
import { useDiscoveryStore } from '@/stores/useDiscoveryStore'
import { useProspectStore } from '@/stores/useProspectStore'

export function useContactsDirectory() {
  const [searchParams, setSearchParams] = useSearchParams()
  const developers = useDiscoveryStore((s) => s.developers)
  const prospects = useProspectStore((s) => s.prospects)

  const filters = useMemo(
    () => filtersFromSearchParams(searchParams),
    [searchParams]
  )

  const entries = useMemo(
    () => mergeContactEntries(developers, prospects),
    [developers, prospects]
  )

  const filtered = useMemo(
    () => filterContacts(entries, filters),
    [entries, filters]
  )

  const skillOptions = useMemo(() => collectSkillOptions(entries), [entries])
  const countryOptions = useMemo(() => collectCountryOptions(entries), [entries])

  const setFilters = useCallback(
    (patch: Partial<ContactsDirectoryFilters>) => {
      const next = { ...filters, ...patch }
      setSearchParams(filtersToSearchParams(next), { replace: true })
    },
    [filters, setSearchParams]
  )

  const applyFilters = useCallback(
    (next: ContactsDirectoryFilters) => {
      setSearchParams(filtersToSearchParams(next), { replace: true })
    },
    [setSearchParams]
  )

  const resetFilters = useCallback(() => {
    setSearchParams(new URLSearchParams(), { replace: true })
  }, [setSearchParams])

  return {
    filters,
    setFilters,
    applyFilters,
    resetFilters,
    entries,
    filtered,
    totalCount: filtered.length,
    isEmpty: entries.length === 0,
    isFilteredEmpty: entries.length > 0 && filtered.length === 0,
    hasActiveFilters: hasActiveContactFilters(filters),
    skillOptions,
    countryOptions,
  }
}

export type { ContactEntry, ContactsDirectoryFilters }
