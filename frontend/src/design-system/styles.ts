/** Shared class fragments for consistent interactive & surface styling */

export const focusRing =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background'

export const disabledStyles = 'disabled:pointer-events-none disabled:opacity-50'

export const surfaceBase =
  'rounded-lg border border-border/60 bg-card text-card-foreground shadow-sm'

export const surfaceMuted = 'rounded-lg border border-border/60 bg-muted/30'

export const inputBase =
  'flex w-full rounded-md border border-input bg-background px-3 text-sm shadow-xs transition-colors placeholder:text-muted-foreground'

export const overlayBase = 'fixed inset-0 z-50 bg-black/40 backdrop-blur-sm'

export const typographyStyles = {
  h1: 'text-3xl font-semibold tracking-tight text-foreground',
  h2: 'text-2xl font-semibold tracking-tight text-foreground',
  h3: 'text-lg font-semibold tracking-tight text-foreground',
  h4: 'text-base font-semibold tracking-tight text-foreground',
  body: 'text-sm text-foreground',
  bodyMuted: 'text-sm text-muted-foreground',
  caption: 'text-xs text-muted-foreground',
  label: 'text-sm font-medium text-foreground',
} as const
