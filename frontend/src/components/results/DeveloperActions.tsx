import { Bookmark, Code2, ExternalLink, MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Developer } from '@/types'
import { useProspectStore } from '@/stores/useProspectStore'
import { useUIStore } from '@/stores/useUIStore'
import { useSearchStore } from '@/stores/useSearchStore'
import { toast } from '@/stores/useToastStore'
import { applyTemplate } from '@/lib/utils'

interface DeveloperActionsProps {
  developer: Developer
  country: string
  compact?: boolean
}

export function DeveloperActions({
  developer,
  country,
  compact,
}: DeveloperActionsProps) {
  const saveProspect = useProspectStore((s) => s.saveProspect)
  const isSaved = useProspectStore((s) => s.isSaved(developer.username))
  const openDrawer = useUIStore((s) => s.openDeveloperDrawer)
  const contactEnabled = useUIStore((s) => s.contactWorkflowEnabled)
  const messageTemplate = useSearchStore((s) => s.messageTemplate)

  const handleSave = () => {
    saveProspect(developer)
    toast({ title: 'Prospect saved', description: `${developer.username} added.` })
  }

  const handleOutreach = () => {
    const vars = {
      name: developer.name ?? developer.username,
      github_username: developer.username,
      country: developer.location ?? country,
      followers: developer.followers,
    }
    if (!isSaved) saveProspect(developer)
    const prospect = useProspectStore
      .getState()
      .prospects.find((p) => p.username === developer.username)
    if (prospect) {
      useProspectStore.getState().setOutreachDraft(prospect.id, {
        subject: applyTemplate(messageTemplate.subject, vars),
        content: applyTemplate(messageTemplate.content, vars),
      })
    }
    toast({ title: 'Outreach draft created', description: `Draft for ${developer.username}.` })
  }

  const stop = (e: React.MouseEvent) => e.stopPropagation()

  return (
    <div className={`flex ${compact ? 'gap-1' : 'flex-wrap gap-2'}`}>
      <Button
        size="sm"
        variant={isSaved ? 'secondary' : 'outline'}
        onClick={(e) => { stop(e); handleSave() }}
        disabled={isSaved}
      >
        <Bookmark className="h-3.5 w-3.5" />
        {!compact && (isSaved ? 'Saved' : 'Save')}
      </Button>
      <Button size="sm" variant="ghost" onClick={(e) => { stop(e); openDrawer(developer) }}>
        {!compact && 'Details'}
      </Button>
      {contactEnabled && (
        <Button size="sm" variant="ghost" onClick={(e) => { stop(e); handleOutreach() }}>
          <MessageSquare className="h-3.5 w-3.5" />
        </Button>
      )}
      <Button size="sm" variant="ghost" asChild onClick={stop}>
        <a href={developer.profile} target="_blank" rel="noopener noreferrer" onClick={stop}>
          <Code2 className="h-3.5 w-3.5" />
          <ExternalLink className="h-3 w-3" />
        </a>
      </Button>
    </div>
  )
}
