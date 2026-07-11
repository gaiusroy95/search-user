/**
 * Design system tokens — single source of truth for spacing, typography,
 * radius, and color semantics. Values mirror CSS custom properties in index.css.
 */

/** 4px base grid */
export const spacing = {
  0: '0',
  1: '0.25rem', // 4px
  2: '0.5rem', // 8px
  3: '0.75rem', // 12px
  4: '1rem', // 16px
  5: '1.25rem', // 20px
  6: '1.5rem', // 24px
  8: '2rem', // 32px
  10: '2.5rem', // 40px
  12: '3rem', // 48px
  16: '4rem', // 64px
} as const

export const radius = {
  sm: '0.375rem', // 6px — badges, chips
  md: '0.5rem', // 8px — buttons, inputs
  lg: '0.75rem', // 12px — cards, panels
  xl: '1rem', // 16px — modals, drawers
  full: '9999px',
} as const

export const typography = {
  xs: { size: '0.6875rem', lineHeight: '1rem', letterSpacing: '0.01em' },
  sm: { size: '0.8125rem', lineHeight: '1.25rem', letterSpacing: '0' },
  base: { size: '0.875rem', lineHeight: '1.25rem', letterSpacing: '0' },
  lg: { size: '1rem', lineHeight: '1.5rem', letterSpacing: '-0.01em' },
  xl: { size: '1.25rem', lineHeight: '1.75rem', letterSpacing: '-0.02em' },
  '2xl': { size: '1.5rem', lineHeight: '2rem', letterSpacing: '-0.02em' },
  '3xl': { size: '1.875rem', lineHeight: '2.25rem', letterSpacing: '-0.03em' },
} as const

/** Neutral + primary only — semantic aliases */
export const colors = {
  background: 'var(--color-background)',
  foreground: 'var(--color-foreground)',
  muted: 'var(--color-muted)',
  mutedForeground: 'var(--color-muted-foreground)',
  border: 'var(--color-border)',
  primary: 'var(--color-primary)',
  primaryForeground: 'var(--color-primary-foreground)',
  destructive: 'var(--color-destructive)',
} as const

export const zIndex = {
  dropdown: 40,
  sticky: 50,
  overlay: 50,
  modal: 50,
  toast: 60,
} as const

export const motion = {
  fast: '150ms',
  base: '200ms',
  slow: '300ms',
} as const
