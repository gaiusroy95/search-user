import { useState } from 'react'
import { Download, Save, Tag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Modal,
  ModalContent,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from '@/components/ui/modal'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { downloadCsv, rowsToCsv } from '@/lib/exportCsv'
import type { ContactEntry } from '@/lib/contactsDirectory'
import { exportContactRows } from '@/lib/contactsDirectory'
import { useProspectStore } from '@/stores/useProspectStore'
import { useActivityStore } from '@/stores/useActivityStore'
import { toast } from '@/stores/useToastStore'
import { PROSPECT_STATUSES, STATUS_LABELS, type ProspectStatus } from '@/types'

interface ContactsBulkBarProps {
  selected: ContactEntry[]
  onClearSelection: () => void
}

export function ContactsBulkBar({ selected, onClearSelection }: ContactsBulkBarProps) {
  const saveProspect = useProspectStore((s) => s.saveProspect)
  const updateStatus = useProspectStore((s) => s.updateStatus)
  const updateTags = useProspectStore((s) => s.updateTags)
  const prospects = useProspectStore((s) => s.prospects)

  const [tagOpen, setTagOpen] = useState(false)
  const [tagInput, setTagInput] = useState('')
  const [stage, setStage] = useState<ProspectStatus>('CONTACTED')

  if (selected.length === 0) return null

  const handleSave = () => {
    let saved = 0
    for (const contact of selected) {
      if (!contact.isSaved) {
        saveProspect(contact.developer)
        saved += 1
      }
    }
    toast({
      title: saved > 0 ? `${saved} contact${saved === 1 ? '' : 's'} saved` : 'Already saved',
      description: 'Selected developers were added to your pipeline.',
    })
  }

  const handleMoveStage = () => {
    let moved = 0
    for (const contact of selected) {
      const prospect = prospects.find((p) => p.username === contact.username)
      if (prospect && prospect.status !== stage) {
        updateStatus(prospect.id, stage)
        moved += 1
      }
    }
    toast({
      title: moved > 0 ? `Updated ${moved} contact${moved === 1 ? '' : 's'}` : 'No changes',
      description: `Pipeline stage set to ${STATUS_LABELS[stage]}.`,
    })
  }

  const handleExport = () => {
    const rows = exportContactRows(selected)
    const csv = rowsToCsv(rows, [
      { header: 'Name', value: (r) => r.name },
      { header: 'GitHub Username', value: (r) => r.username },
      { header: 'Company', value: (r) => r.company },
      { header: 'Country', value: (r) => r.country },
      { header: 'Email', value: (r) => r.email },
      { header: 'Pipeline Stage', value: (r) => r.stage },
      { header: 'Tags', value: (r) => r.tags },
      { header: 'Skills', value: (r) => r.skills },
      { header: 'Contact Score', value: (r) => r.score },
      { header: 'Last Activity', value: (r) => r.lastActivity },
    ])
    downloadCsv(`contacts-${new Date().toISOString().slice(0, 10)}.csv`, csv)
    useActivityStore.getState().logExport('Contacts CSV', selected.length, 'contacts')
    toast({
      title: 'Export complete',
      description: `${selected.length} contact${selected.length === 1 ? '' : 's'} exported to CSV.`,
    })
  }

  const handleAddTags = () => {
    const newTags = tagInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)
    if (newTags.length === 0) return

    let updated = 0
    for (const contact of selected) {
      const prospect = prospects.find((p) => p.username === contact.username)
      if (!prospect) continue
      const merged = Array.from(new Set([...prospect.tags, ...newTags]))
      if (merged.join(',') !== prospect.tags.join(',')) {
        updateTags(prospect.id, merged)
        updated += 1
      }
    }

    toast({
      title: updated > 0 ? `Tags added to ${updated} contact${updated === 1 ? '' : 's'}` : 'No saved contacts',
      description: updated === 0 ? 'Save contacts to pipeline before adding tags.' : undefined,
    })
    setTagInput('')
    setTagOpen(false)
  }

  return (
    <>
      <div className="sticky bottom-4 z-20 mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-3 rounded-xl border border-border/60 bg-card/95 p-3 shadow-lg backdrop-blur">
        <p className="text-sm font-medium">
          {selected.length} selected
          <button
            type="button"
            className="ml-2 text-xs font-normal text-muted-foreground underline-offset-2 hover:underline"
            onClick={onClearSelection}
          >
            Clear
          </button>
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" variant="outline" size="sm" onClick={handleSave}>
            <Save className="h-3.5 w-3.5" />
            Save
          </Button>
          <Select value={stage} onValueChange={(v) => setStage(v as ProspectStatus)}>
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
          <Button type="button" variant="outline" size="sm" onClick={handleMoveStage}>
            Move stage
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={() => setTagOpen(true)}>
            <Tag className="h-3.5 w-3.5" />
            Add tags
          </Button>
          <Button type="button" size="sm" onClick={handleExport}>
            <Download className="h-3.5 w-3.5" />
            Export CSV
          </Button>
        </div>
      </div>

      <Modal open={tagOpen} onOpenChange={setTagOpen}>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>Add tags</ModalTitle>
            <ModalDescription>
              Tags are merged onto saved pipeline contacts. Separate multiple tags with commas.
            </ModalDescription>
          </ModalHeader>
          <Input
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            placeholder="senior, react, remote"
            autoFocus
          />
          <ModalFooter>
            <Button type="button" variant="outline" onClick={() => setTagOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={handleAddTags}>
              Add tags
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}
