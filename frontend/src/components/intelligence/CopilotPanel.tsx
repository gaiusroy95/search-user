import { Copy, Loader2, Sparkles, Trash2 } from 'lucide-react'
import {
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { copyToClipboard } from '@/lib/clipboard'
import { TASK_LABELS } from '@/lib/copilotContext'
import type { CopilotTask } from '@/lib/ai/types'
import { useCopilot } from '@/hooks/useCopilot'
import { useCopilotStore } from '@/stores/useCopilotStore'
import { cn } from '@/lib/utils'
import { formatRelativeTime } from '@/lib/activityCenter'

const CATEGORY_LABELS = {
  candidate: 'Candidate',
  outreach: 'Outreach',
  pipeline: 'Pipeline',
  search: 'Search',
} as const

export function CopilotPanel() {
  const panelOpen = useCopilotStore((s) => s.panelOpen)
  const setPanelOpen = useCopilotStore((s) => s.setPanelOpen)

  const {
    pageContext,
    messages,
    candidateOptions,
    compareUsernames,
    setCompareSlot,
    runTask,
    clearHistory,
    isTaskDisabled,
    isStreaming,
    suggestedTasks,
  } = useCopilot()

  const grouped = suggestedTasks.reduce(
    (acc, task) => {
      acc[task.category].push(task)
      return acc
    },
    {
      candidate: [] as typeof suggestedTasks,
      outreach: [] as typeof suggestedTasks,
      pipeline: [] as typeof suggestedTasks,
      search: [] as typeof suggestedTasks,
    }
  )

  return (
    <Drawer open={panelOpen} onOpenChange={setPanelOpen} modal={false}>
      <DrawerContent side="right" size="md" overlay={false} className="shadow-2xl">
        <DrawerHeader className="pb-3">
          <div className="flex items-center justify-between gap-2 pr-6">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <DrawerTitle>Recruiting Copilot</DrawerTitle>
            </div>
            {messages.length > 0 && (
              <Button
                type="button"
                variant="ghost"
                size="xs"
                onClick={clearHistory}
                disabled={isStreaming}
              >
                <Trash2 className="h-3 w-3" />
                Clear
              </Button>
            )}
          </div>
          <DrawerDescription>{pageContext.pageLabel}</DrawerDescription>
        </DrawerHeader>

        <DrawerBody className="flex min-h-0 flex-1 flex-col gap-4 pt-0">
          {(Object.keys(grouped) as Array<keyof typeof grouped>).map((category) => (
            <div key={category} className="space-y-2">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                {CATEGORY_LABELS[category]}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {grouped[category].map(({ task, label }) => (
                  <Button
                    key={task}
                    type="button"
                    size="sm"
                    variant="outline"
                    className="h-8 text-xs"
                    disabled={isTaskDisabled(task)}
                    onClick={() => runTask(task)}
                  >
                    {isStreaming ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : null}
                    {label}
                  </Button>
                ))}
              </div>
            </div>
          ))}

          <div className="space-y-2 rounded-lg border border-border/60 bg-muted/20 p-3">
            <p className="text-xs font-medium text-muted-foreground">Compare candidates</p>
            <div className="grid gap-2 sm:grid-cols-2">
              {[0, 1].map((index) => (
                <Select
                  key={index}
                  value={compareUsernames[index] || undefined}
                  onValueChange={(v) => setCompareSlot(index, v)}
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder={`Candidate ${index + 1}`} />
                  </SelectTrigger>
                  <SelectContent>
                    {candidateOptions.map((c) => (
                      <SelectItem key={`${index}-${c.username}`} value={c.username}>
                        @{c.username}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ))}
            </div>
            <Button
              type="button"
              size="sm"
              variant="secondary"
              className="w-full"
              disabled={isTaskDisabled('compare-candidates')}
              onClick={() => runTask('compare-candidates')}
            >
              Compare selected
            </Button>
          </div>

          <div className="min-h-0 flex-1 space-y-3 overflow-y-auto">
            {messages.length === 0 ? (
              <p className="rounded-lg border border-dashed border-border/60 bg-muted/10 px-3 py-4 text-xs text-muted-foreground">
                Turn discovery data into recruiting actions — summaries, outreach drafts,
                pipeline alerts, and search suggestions. Responses stream here and persist
                across sessions.
              </p>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    'rounded-lg border px-3 py-2.5 text-sm',
                    message.role === 'user'
                      ? 'border-primary/20 bg-primary/5'
                      : 'border-border/60 bg-card'
                  )}
                >
                  <div className="mb-1.5 flex items-center justify-between gap-2">
                    <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                      {message.role === 'user' ? 'You' : 'Copilot'}
                      {message.task !== 'freeform' && ` · ${TASK_LABELS[message.task as CopilotTask]}`}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {formatRelativeTime(message.at)}
                    </span>
                  </div>
                  {message.role === 'assistant' ? (
                    <AssistantMessage content={message.content} streaming={message.isStreaming} />
                  ) : (
                    <p className="text-xs text-muted-foreground">{message.content}</p>
                  )}
                </div>
              ))
            )}
          </div>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  )
}

function AssistantMessage({
  content,
  streaming,
}: {
  content: string
  streaming?: boolean
}) {
  const handleCopy = async () => {
    if (!content) return
    await copyToClipboard(content)
  }

  if (!content && streaming) {
    return (
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Loader2 className="h-3 w-3 animate-spin" />
        Generating…
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <pre className="max-h-[32vh] overflow-y-auto whitespace-pre-wrap text-xs leading-relaxed">
        {content}
        {streaming && <span className="inline-block animate-pulse">▍</span>}
      </pre>
      {content && !streaming && (
        <Button type="button" size="xs" variant="ghost" onClick={handleCopy}>
          <Copy className="h-3 w-3" />
          Copy
        </Button>
      )}
    </div>
  )
}

export function IntelligencePanel() {
  return <CopilotPanel />
}
