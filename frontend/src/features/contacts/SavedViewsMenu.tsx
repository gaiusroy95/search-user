import { Bookmark, Trash2 } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { ContactsDirectoryFilters } from '@/lib/contactsDirectory'
import { useContactsViewsStore } from '@/stores/useContactsViewsStore'

interface SavedViewsMenuProps {
  filters: ContactsDirectoryFilters
  onApplyFilters: (filters: ContactsDirectoryFilters) => void
}

export function SavedViewsMenu({ onApplyFilters }: SavedViewsMenuProps) {
  const savedViews = useContactsViewsStore((s) => s.savedViews)
  const deleteView = useContactsViewsStore((s) => s.deleteView)

  if (savedViews.length === 0) {
    return null
  }

  return (
    <div className="flex items-center gap-1">
      <Select
        onValueChange={(id) => {
          const view = savedViews.find((v) => v.id === id)
          if (view) onApplyFilters(view.filters)
        }}
      >
        <SelectTrigger className="h-9 w-[180px]">
          <Bookmark className="mr-1.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          <SelectValue placeholder="Saved views" />
        </SelectTrigger>
        <SelectContent>
          {savedViews.map((view) => (
            <SelectItem key={view.id} value={view.id}>
              {view.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        onValueChange={(id) => {
          if (id) deleteView(id)
        }}
      >
        <SelectTrigger className="h-9 w-9 px-0" aria-label="Manage saved views">
          <Trash2 className="mx-auto h-3.5 w-3.5 text-muted-foreground" />
        </SelectTrigger>
        <SelectContent align="end">
          {savedViews.map((view) => (
            <SelectItem key={view.id} value={view.id}>
              Delete “{view.name}”
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
