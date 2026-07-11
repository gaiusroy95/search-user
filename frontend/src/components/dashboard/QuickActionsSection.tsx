import { Link } from 'react-router-dom'
import {
  Building2,
  Kanban,
  Search,
  Sparkles,
} from 'lucide-react'
import { DashboardCard } from '@/components/dashboard/DashboardCard'
import { Button } from '@/components/ui/button'
import { ROUTES } from '@/lib/routes'
import { useCopilotStore } from '@/stores/useCopilotStore'

const actions = [
  {
    label: 'Start Discovery',
    description: 'Search GitHub by location',
    icon: Search,
    href: ROUTES.discover,
    variant: 'default' as const,
  },
  {
    label: 'Search Companies',
    description: 'Explore org profiles',
    icon: Building2,
    href: ROUTES.companies,
    variant: 'outline' as const,
  },
  {
    label: 'Open Pipeline',
    description: 'Manage your leads',
    icon: Kanban,
    href: ROUTES.pipeline,
    variant: 'outline' as const,
  },
]

export function QuickActionsSection() {
  const setPanelOpen = useCopilotStore((s) => s.setPanelOpen)

  return (
    <DashboardCard
      title="Quick actions"
      description="Jump straight into your most common workflows."
      icon={Sparkles}
      padding="sm"
    >
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {actions.map(({ label, description, icon: Icon, href, variant }) => (
          <Button
            key={label}
            variant={variant}
            className="h-auto justify-start gap-3 px-4 py-3 text-left"
            asChild
          >
            <Link to={href}>
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-background/80">
                <Icon className="h-4 w-4" />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-medium">{label}</span>
                <span className="block text-xs font-normal text-muted-foreground">
                  {description}
                </span>
              </span>
            </Link>
          </Button>
        ))}
        <Button
          variant="outline"
          className="h-auto justify-start gap-3 px-4 py-3 text-left sm:col-span-2"
          onClick={() => setPanelOpen(true)}
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
            <Sparkles className="h-4 w-4" />
          </span>
          <span className="min-w-0">
            <span className="block text-sm font-medium">Open Recruiting Copilot</span>
            <span className="block text-xs font-normal text-muted-foreground">
              Summaries, outreach drafts, pipeline and search recommendations
            </span>
          </span>
        </Button>
      </div>
    </DashboardCard>
  )
}
