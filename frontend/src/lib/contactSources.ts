import type { IntegrationProviderId } from '@/types/integrations'

export const CONTACT_SOURCE_LABELS: Record<string, string> = {
  github: 'GitHub',
  linkedin: 'LinkedIn',
  greenhouse: 'Greenhouse',
  lever: 'Lever',
  gmail: 'Gmail',
  outlook: 'Outlook',
  discovery: 'Discover',
}

export const CONTACT_SOURCE_OPTIONS: { value: string; label: string }[] = [
  { value: 'ALL', label: 'All sources' },
  { value: 'discovery', label: 'Discover / manual' },
  ...(['github', 'linkedin', 'greenhouse', 'lever', 'gmail', 'outlook'] as IntegrationProviderId[]).map(
    (id) => ({ value: id, label: CONTACT_SOURCE_LABELS[id] })
  ),
]

export function contactSourceLabel(source: string | null | undefined): string | null {
  if (!source) return null
  return CONTACT_SOURCE_LABELS[source] ?? source
}

export function isImportedContact(username: string, source?: string | null): boolean {
  return Boolean(source) || username.includes(':')
}

export function contactHandle(entry: { username: string; source?: string | null; email?: string | null }): string {
  if (entry.source && entry.username.includes(':')) {
    return entry.email ?? entry.username.split(':').slice(1).join(':')
  }
  return `@${entry.username}`
}
