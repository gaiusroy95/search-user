import { useEffect, useState } from 'react'
import { Clock, StickyNote, Tag } from 'lucide-react'
import {
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { formatActivityTime } from '@/lib/pipeline'
import { ProspectComments } from '@/components/collaboration/ProspectComments'
import { usePermissions } from '@/hooks/usePermissions'
import { useProspectStore } from '@/stores/useProspectStore'
import type { Prospect, ProspectStatus } from '@/types'
import { PROSPECT_STATUSES, STATUS_LABELS } from '@/types'

interface LeadDrawerProps {
  lead: Prospect | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function LeadDrawer({ lead, open, onOpenChange }: LeadDrawerProps) {
  const updateStatus = useProspectStore((s) => s.updateStatus)
  const updateNotes = useProspectStore((s) => s.updateNotes)
  const updateTags = useProspectStore((s) => s.updateTags)
  const { canWriteProspects, isViewer } = usePermissions()
  const [notesDraft, setNotesDraft] = useState('')
  const [tagsDraft, setTagsDraft] = useState('')

  useEffect(() => {
    if (lead) {
      setNotesDraft(lead.notes)
      setTagsDraft(lead.tags.join(', '))
    }
  }, [lead])

  if (!lead) return null

  const saveNotes = () => updateNotes(lead.id, notesDraft)
  const saveTags = () =>
    updateTags(
      lead.id,
      tagsDraft
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean)
    )

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent side="right" size="md">
        <DrawerHeader>
          <div className="flex items-center gap-3 pr-8">
            <Avatar size="md">
              <AvatarImage
                src={lead.avatar ?? `https://github.com/${lead.username}.png`}
                alt=""
              />
              <AvatarFallback>{lead.username.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <DrawerTitle>{lead.name ?? lead.username}</DrawerTitle>
              <DrawerDescription>@{lead.username}</DrawerDescription>
            </div>
          </div>
        </DrawerHeader>

        <DrawerBody className="space-y-6">
          <div className="space-y-2">
            <Label>Status</Label>
            <Select
              value={lead.status}
              onValueChange={(v) => updateStatus(lead.id, v as ProspectStatus)}
              disabled={!canWriteProspects}
            >
              <SelectTrigger>
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
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-1.5">
              <StickyNote className="h-3.5 w-3.5" />
              Notes
            </Label>
            <Textarea
              value={notesDraft}
              onChange={(e) => setNotesDraft(e.target.value)}
              onBlur={saveNotes}
              placeholder="Conversation notes, next steps…"
              className="min-h-[100px]"
              readOnly={!canWriteProspects}
            />
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-1.5">
              <Tag className="h-3.5 w-3.5" />
              Tags
            </Label>
            <Input
              value={tagsDraft}
              onChange={(e) => setTagsDraft(e.target.value)}
              onBlur={saveTags}
              placeholder="senior, react, remote"
              readOnly={!canWriteProspects}
            />
            {lead.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {lead.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <ProspectComments prospectId={lead.id} />

          {isViewer && (
            <p className="text-xs text-muted-foreground">
              You have viewer access — pipeline fields are read-only.
            </p>
          )}

          <div className="space-y-3">
            <Label className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              Activity
            </Label>
            {lead.activityHistory.length === 0 ? (
              <p className="text-sm text-muted-foreground">No activity yet.</p>
            ) : (
              <ul className="space-y-2">
                {lead.activityHistory.map((entry) => (
                  <li
                    key={entry.id}
                    className="rounded-lg border border-border/60 bg-muted/20 px-3 py-2 text-sm"
                  >
                    <p>{entry.message}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {formatActivityTime(entry.at)}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  )
}
