import { useState } from 'react'
import { BookmarkPlus, Search, SlidersHorizontal, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Modal,
  ModalContent,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from '@/components/ui/modal'
import { FilterToggle, FilterToolbarShell } from '@/features/filters/FilterToolbarShell'
import {
  CONTACT_STAGE_OPTIONS,
  type ContactsDirectoryFilters,
} from '@/lib/contactsDirectory'
import { CONTACT_SOURCE_OPTIONS } from '@/lib/contactSources'
import { COUNTRIES } from '@/types'
import { useContactsViewsStore } from '@/stores/useContactsViewsStore'
import { SavedViewsMenu } from '@/features/contacts/SavedViewsMenu'

interface ContactsToolbarProps {
  filters: ContactsDirectoryFilters
  totalCount: number
  hasActiveFilters: boolean
  skillOptions: string[]
  countryOptions: string[]
  onFiltersChange: (patch: Partial<ContactsDirectoryFilters>) => void
  onApplyFilters: (filters: ContactsDirectoryFilters) => void
  onReset: () => void
}

export function ContactsToolbar({
  filters,
  totalCount,
  hasActiveFilters,
  skillOptions,
  countryOptions,
  onFiltersChange,
  onApplyFilters,
  onReset,
}: ContactsToolbarProps) {
  const saveView = useContactsViewsStore((s) => s.saveView)
  const [saveOpen, setSaveOpen] = useState(false)
  const [viewName, setViewName] = useState('')

  const handleSaveView = () => {
    saveView(viewName, filters)
    setViewName('')
    setSaveOpen(false)
  }

  return (
    <>
      <FilterToolbarShell
        title="Contacts"
        description={`${totalCount.toLocaleString()} developer${totalCount === 1 ? '' : 's'} in your workspace`}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <SavedViewsMenu filters={filters} onApplyFilters={onApplyFilters} />
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-9"
              onClick={() => setSaveOpen(true)}
            >
              <BookmarkPlus className="h-3.5 w-3.5" />
              Save view
            </Button>
          </div>
        }
        search={
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search name, username, company, email, skills, tags…"
              value={filters.query}
              onChange={(e) => onFiltersChange({ query: e.target.value })}
              className="h-10 pl-9"
            />
          </div>
        }
        filters={
          <div className="flex flex-wrap items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-muted-foreground" aria-hidden />

            <Select
              value={filters.country}
              onValueChange={(value) => onFiltersChange({ country: value })}
            >
              <SelectTrigger className="h-9 w-[150px]">
                <SelectValue placeholder="Country" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All countries</SelectItem>
                {countryOptions.map((country) => (
                  <SelectItem key={country} value={country}>
                    {country}
                  </SelectItem>
                ))}
                {COUNTRIES.filter((c) => !countryOptions.includes(c)).map((country) => (
                  <SelectItem key={country} value={country}>
                    {country}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.skill}
              onValueChange={(value) => onFiltersChange({ skill: value })}
            >
              <SelectTrigger className="h-9 w-[140px]">
                <SelectValue placeholder="Skills" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All skills</SelectItem>
                {skillOptions.map((skill) => (
                  <SelectItem key={skill} value={skill}>
                    {skill}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.stage}
              onValueChange={(value) =>
                onFiltersChange({ stage: value as ContactsDirectoryFilters['stage'] })
              }
            >
              <SelectTrigger className="h-9 w-[160px]">
                <SelectValue placeholder="Pipeline stage" />
              </SelectTrigger>
              <SelectContent>
                {CONTACT_STAGE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.source}
              onValueChange={(value) => onFiltersChange({ source: value })}
            >
              <SelectTrigger className="h-9 w-[150px]">
                <SelectValue placeholder="Source" />
              </SelectTrigger>
              <SelectContent>
                {CONTACT_SOURCE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <FilterToggle
              label="Saved only"
              checked={filters.savedOnly}
              onChange={(savedOnly) => onFiltersChange({ savedOnly })}
            />

            <FilterToggle
              label="Contacted only"
              checked={filters.contactedOnly}
              onChange={(contactedOnly) => onFiltersChange({ contactedOnly })}
            />

            {hasActiveFilters && (
              <Button type="button" variant="ghost" size="sm" className="h-9" onClick={onReset}>
                <X className="h-3.5 w-3.5" />
                Clear filters
              </Button>
            )}
          </div>
        }
      />

      <Modal open={saveOpen} onOpenChange={setSaveOpen}>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>Save filter view</ModalTitle>
            <ModalDescription>
              Store your current filters as a preset you can apply later.
            </ModalDescription>
          </ModalHeader>
          <Input
            value={viewName}
            onChange={(e) => setViewName(e.target.value)}
            placeholder="e.g. US React leads"
            autoFocus
          />
          <ModalFooter>
            <Button type="button" variant="outline" onClick={() => setSaveOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={handleSaveView}>
              Save view
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}
