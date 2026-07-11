import { Link } from 'react-router-dom'
import { ROUTES } from '@/lib/routes'

const FOOTER_LINKS = [
  { to: ROUTES.discover, label: 'Discover' },
  { to: ROUTES.dashboard, label: 'Dashboard' },
  { to: ROUTES.settings, label: 'Settings' },
] as const

export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="mt-auto shrink-0 border-t border-border/60 bg-card/50">
      <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-fuchsia-500 text-xs font-bold text-primary-foreground">
              G
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">
                GitHub Developer Discovery
              </p>
              <p className="text-xs text-muted-foreground">
                © {year} All rights reserved
              </p>
            </div>
          </div>

          <nav
            className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm"
            aria-label="Footer"
          >
            {FOOTER_LINKS.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                {label}
              </Link>
            ))}
          </nav>

          <div className="flex flex-col gap-1 sm:items-end">
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-border/60 bg-muted/30 px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden />
              Powered by GitHub API
            </span>
            <p className="text-[11px] text-muted-foreground">
              Built by{' '}
              <span className="font-medium text-foreground/80">Kelvin Tanaka</span>
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
