import { memo } from 'react'
import { Link } from 'react-router-dom'
import { Menu, Moon, Search, Sun } from 'lucide-react'
import { NotificationsMenu } from '@/components/collaboration/NotificationsMenu'
import { WorkspaceSwitcher } from '@/components/collaboration/WorkspaceSwitcher'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ROUTES } from '@/lib/routes'
import { useAuthStore } from '@/stores/useAuthStore'
import { useWorkspaceStore } from '@/stores/useWorkspaceStore'
import { useUIStore } from '@/stores/useUIStore'



interface AppTopBarProps {

  onMenuClick: () => void

  showMenuButton?: boolean

}



function ThemeToggle() {

  const darkMode = useUIStore((s) => s.darkMode)

  const toggleDarkMode = useUIStore((s) => s.toggleDarkMode)



  return (

    <Button

      variant="ghost"

      size="icon"

      className="h-9 w-9"

      onClick={toggleDarkMode}

      aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}

    >

      {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}

    </Button>

  )

}



export const AppTopBar = memo(function AppTopBar({
  onMenuClick,
  showMenuButton = false,
}: AppTopBarProps) {
  const user = useAuthStore((s) => s.user)
  const workspace = useWorkspaceStore((s) => s.getActiveWorkspace())

  return (

    <header className="flex h-14 shrink-0 items-center gap-3 border-b border-border/60 bg-background/80 px-4 backdrop-blur-xl sm:px-6">

      {showMenuButton && (

        <Button

          variant="ghost"

          size="icon"

          className="shrink-0 md:hidden"

          onClick={onMenuClick}

          aria-label="Open navigation menu"

        >

          <Menu className="h-5 w-5" />

        </Button>

      )}



      <div className="relative min-w-0 flex-1 max-w-xl">

        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

        <Input

          type="search"

          readOnly

          placeholder="Search developers, companies…"

          aria-label="Global search"

          className="h-9 border-border/60 bg-muted/30 pl-9 text-sm placeholder:text-muted-foreground/70 focus-visible:ring-1"

        />

      </div>



      <div className="flex shrink-0 items-center gap-1">
        <WorkspaceSwitcher />
        <NotificationsMenu />
        <ThemeToggle />

        <Link
          to={user ? ROUTES.team : ROUTES.auth}
          className="ml-1 flex items-center gap-2 rounded-lg border border-border/60 bg-muted/30 py-1 pl-1 pr-3 transition-colors hover:bg-muted/50"
        >
          <Avatar size="sm">
            <AvatarFallback>{user?.name?.slice(0, 1) ?? 'G'}</AvatarFallback>
          </Avatar>
          <div className="hidden text-left sm:block">
            <p className="text-xs font-medium leading-none">{user?.name ?? 'Guest'}</p>
            <p className="text-[10px] text-muted-foreground">
              {workspace?.name ?? 'Local workspace'}
            </p>
          </div>
        </Link>
      </div>

    </header>

  )

})


