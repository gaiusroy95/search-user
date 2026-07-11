import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Clock,
  ExternalLink,
  Globe,
  Mail,
  Sparkles,
  StickyNote,
  Tag,
} from 'lucide-react'
import {
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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
import { CopyableText } from '@/components/results/CopyableText'
import { BADGE_LABELS } from '@/lib/developerAnalysis'
import { formatActivityTime } from '@/lib/pipeline'
import { inferRole } from '@/lib/personProfile'
import type { ContactEntry } from '@/lib/contactsDirectory'
import { personRoute } from '@/lib/routes'
import { useProspectStore } from '@/stores/useProspectStore'
import { PROSPECT_STATUSES, STATUS_LABELS, type ProspectStatus } from '@/types'

interface ContactDrawerProps {
  contact: ContactEntry | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ContactDrawer({ contact, open, onOpenChange }: ContactDrawerProps) {
  const saveProspect = useProspectStore((s) => s.saveProspect)
  const updateStatus = useProspectStore((s) => s.updateStatus)
  const updateNotes = useProspectStore((s) => s.updateNotes)
  const updateTags = useProspectStore((s) => s.updateTags)
  const [notesDraft, setNotesDraft] = useState('')
  const [tagsDraft, setTagsDraft] = useState('')

  useEffect(() => {
    if (contact) {
      setNotesDraft(contact.notes)
      setTagsDraft(contact.tags.join(', '))
    }
  }, [contact])

  if (!contact) return null

  const role = inferRole(contact.developer)
  const canEdit = contact.isSaved && contact.prospectId

  const saveNotes = () => {
    if (canEdit) updateNotes(contact.prospectId!, notesDraft)
  }

  const saveTags = () => {
    if (!canEdit) return
    updateTags(
      contact.prospectId!,
      tagsDraft
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean)
    )
  }

  const handleSaveToPipeline = () => {
    if (!contact.isSaved) {
      saveProspect(contact.developer)
    }
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent side="right" size="lg">
        <DrawerHeader>
          <div className="flex items-start gap-3 pr-8">
            <Avatar size="lg">
              <AvatarImage
                src={contact.avatar ?? `https://github.com/${contact.username}.png`}
                alt=""
              />
              <AvatarFallback>{contact.username.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <DrawerTitle>{contact.name ?? contact.username}</DrawerTitle>
              <DrawerDescription>@{contact.username} · {role}</DrawerDescription>
              <div className="mt-2 flex flex-wrap gap-1.5">
                <Badge variant="secondary">{contact.pipelineLabel}</Badge>
                <Badge variant="outline">{contact.analysis.levelLabel}</Badge>
                {contact.analysis.badges.slice(0, 3).map((badge) => (
                  <Badge key={badge} variant="outline" className="text-[10px] font-normal">
                    {BADGE_LABELS[badge]}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </DrawerHeader>

        <DrawerBody className="space-y-6">
          <section className="space-y-2">
            <h3 className="text-sm font-medium">Profile summary</h3>
            <p className="text-sm text-muted-foreground">
              {contact.developer.bio?.trim() ||
                `${role}${contact.company ? ` at ${contact.company}` : ''}${contact.location ? ` · ${contact.location}` : ''}.`}
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              <Button variant="outline" size="sm" asChild>
                <Link to={personRoute(contact.username)}>Full profile</Link>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <a href={contact.developer.profile} target="_blank" rel="noreferrer">
                  <ExternalLink className="h-3.5 w-3.5" />
                  GitHub
                </a>
              </Button>
              {!contact.isSaved && (
                <Button size="sm" onClick={handleSaveToPipeline}>
                  Save to pipeline
                </Button>
              )}
            </div>
          </section>

          <section className="space-y-3 rounded-lg border border-border/60 bg-muted/20 p-4">
            <h3 className="flex items-center gap-1.5 text-sm font-medium">
              <Mail className="h-3.5 w-3.5" />
              Contact information
            </h3>
            <dl className="space-y-2 text-sm">
              <div>
                <dt className="text-xs text-muted-foreground">Email</dt>
                <dd>
                  {contact.email ? (
                    <CopyableText value={contact.email} />
                  ) : (
                    <span className="text-muted-foreground">Not available</span>
                  )}
                </dd>
              </div>
              {contact.contactInfo.companyWebsite && (
                <div>
                  <dt className="text-xs text-muted-foreground">Website</dt>
                  <dd className="flex items-center gap-1 truncate">
                    <Globe className="h-3.5 w-3.5 shrink-0" />
                    <a
                      href={contact.contactInfo.companyWebsite}
                      target="_blank"
                      rel="noreferrer"
                      className="truncate text-primary hover:underline"
                    >
                      {contact.contactInfo.companyWebsite}
                    </a>
                  </dd>
                </div>
              )}
              {contact.contactInfo.linkedIn && (
                <div>
                  <dt className="text-xs text-muted-foreground">LinkedIn</dt>
                  <dd>
                    <a
                      href={contact.contactInfo.linkedIn}
                      target="_blank"
                      rel="noreferrer"
                      className="text-primary hover:underline"
                    >
                      View profile
                    </a>
                  </dd>
                </div>
              )}
            </dl>
          </section>

          {canEdit && (
            <>
              <div className="space-y-2">
                <Label>Pipeline stage</Label>
                <Select
                  value={contact.pipelineStage ?? 'NEW'}
                  onValueChange={(v) =>
                    updateStatus(contact.prospectId!, v as ProspectStatus)
                  }
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
                />
              </div>
            </>
          )}

          {!canEdit && (
            <p className="rounded-lg border border-dashed border-border/60 bg-muted/10 px-3 py-2 text-sm text-muted-foreground">
              Save this developer to your pipeline to add notes, tags, and track activity.
            </p>
          )}

          <section className="space-y-3">
            <Label className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              Activity history
            </Label>
            {contact.activityHistory.length === 0 ? (
              <p className="text-sm text-muted-foreground">No pipeline activity yet.</p>
            ) : (
              <ul className="space-y-2">
                {contact.activityHistory.map((entry) => (
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
          </section>

          <section className="space-y-3 rounded-lg border border-primary/20 bg-primary/5 p-4">
            <h3 className="flex items-center gap-1.5 text-sm font-medium">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              AI insights
            </h3>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-xs font-medium text-muted-foreground">Skills</p>
                <p>{contact.aiInsights.skillSummary}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">Strengths</p>
                <p>{contact.aiInsights.strengthAnalysis}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">Outreach</p>
                <p>{contact.aiInsights.outreachSuggestion}</p>
              </div>
            </div>
          </section>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  )
}
