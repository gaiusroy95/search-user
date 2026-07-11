import { Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCopilotStore } from '@/stores/useCopilotStore'
import { cn } from '@/lib/utils'

export function IntelligenceFab() {
  const panelOpen = useCopilotStore((s) => s.panelOpen)
  const togglePanel = useCopilotStore((s) => s.togglePanel)

  return (
    <Button
      type="button"
      size="icon"
      aria-label={panelOpen ? 'Close recruiting copilot' : 'Open recruiting copilot'}
      aria-expanded={panelOpen}
      onClick={togglePanel}
      className={cn(
        'fixed bottom-6 right-6 z-40 h-11 w-11 rounded-full shadow-lg',
        panelOpen && 'ring-2 ring-primary/40'
      )}
    >
      <Sparkles className="h-5 w-5" />
    </Button>
  )
}
