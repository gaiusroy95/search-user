import { analyzeDeveloper, type DeveloperAnalysis } from '@/lib/developerAnalysis'
import {
  readBooleanParam,
  readEnumParam,
  readStringParam,
  writeBooleanParam,
  writeEnumParam,
  writeStringParam,
} from '@/lib/filterUrlSync'
import {
  collectSkills,
  generatePersonInsights,
  getPersonContact,
  type PersonAiInsights,
  type PersonContactInfo,
} from '@/lib/personProfile'
import { parseCountryFromLocation } from '@/lib/companiesDirectory'
import { contactSourceLabel } from '@/lib/contactSources'
import type { Developer, LeadActivity, Prospect, ProspectStatus } from '@/types'
import { PROSPECT_STATUSES, STATUS_LABELS } from '@/types'

export type ContactStageFilter = 'ALL' | 'UNSAVED' | ProspectStatus

export interface ContactEntry {
  username: string
  name: string | null
  avatar: string | null
  company: string | null
  country: string | null
  location: string | null
  email: string | null
  skills: string[]
  pipelineStage: ProspectStatus | null
  pipelineLabel: string
  isSaved: boolean
  isContacted: boolean
  lastActivityAt: string | null
  lastActivityLabel: string | null
  tags: string[]
  notes: string
  prospectId: string | null
  savedAt: string | null
  source: string | null
  sourceLabel: string | null
  developer: Developer
  analysis: DeveloperAnalysis
  contactInfo: PersonContactInfo
  aiInsights: PersonAiInsights
  activityHistory: LeadActivity[]
}

export interface ContactsDirectoryFilters {
  query: string
  country: string
  skill: string
  stage: ContactStageFilter
  source: string
  savedOnly: boolean
  contactedOnly: boolean
}

export const EMPTY_CONTACTS_FILTERS: ContactsDirectoryFilters = {
  query: '',
  country: 'ALL',
  skill: 'ALL',
  stage: 'ALL',
  source: 'ALL',
  savedOnly: false,
  contactedOnly: false,
}

export const CONTACT_STAGE_OPTIONS: { value: ContactStageFilter; label: string }[] = [
  { value: 'ALL', label: 'All stages' },
  { value: 'UNSAVED', label: 'Not in pipeline' },
  ...PROSPECT_STATUSES.map((status) => ({
    value: status as ContactStageFilter,
    label: STATUS_LABELS[status],
  })),
]

const CONTACTED_STATUSES: ProspectStatus[] = [
  'CONTACTED',
  'INTERESTED',
  'MEETING',
  'OPPORTUNITY',
  'CLOSED',
]

function buildContactEntry(developer: Developer, prospect: Prospect | null): ContactEntry {
  const analysis = analyzeDeveloper(developer)
  const contactInfo = getPersonContact(developer, analysis)
  const aiInsights = generatePersonInsights(developer, analysis)
  const skills = collectSkills(developer)
  const email = contactInfo.businessEmail ?? developer.email
  const lastActivity = prospect?.activityHistory[0]

  return {
    username: developer.username,
    name: developer.name,
    avatar: developer.avatar,
    company: developer.company,
    country: parseCountryFromLocation(developer.location),
    location: developer.location,
    email,
    skills,
    pipelineStage: prospect?.status ?? null,
    pipelineLabel: prospect ? STATUS_LABELS[prospect.status] : 'Not saved',
    isSaved: Boolean(prospect),
    isContacted: prospect ? CONTACTED_STATUSES.includes(prospect.status) : false,
    lastActivityAt: lastActivity?.at ?? prospect?.savedAt ?? null,
    lastActivityLabel: lastActivity?.message ?? null,
    tags: prospect?.tags ?? [],
    notes: prospect?.notes ?? '',
    prospectId: prospect?.id ?? null,
    savedAt: prospect?.savedAt ?? null,
    source: prospect?.source ?? null,
    sourceLabel: contactSourceLabel(prospect?.source),
    developer,
    analysis,
    contactInfo,
    aiInsights,
    activityHistory: prospect?.activityHistory ?? [],
  }
}

export function mergeContactEntries(
  developers: Developer[],
  prospects: Prospect[]
): ContactEntry[] {
  const seen = new Set<string>()
  const entries: ContactEntry[] = []

  for (const prospect of prospects) {
    seen.add(prospect.username)
    entries.push(buildContactEntry(prospect, prospect))
  }

  for (const developer of developers) {
    if (seen.has(developer.username)) continue
    seen.add(developer.username)
    entries.push(buildContactEntry(developer, null))
  }

  return entries.sort((a, b) => {
    const aTime = a.lastActivityAt ? new Date(a.lastActivityAt).getTime() : 0
    const bTime = b.lastActivityAt ? new Date(b.lastActivityAt).getTime() : 0
    return bTime - aTime || (a.name ?? a.username).localeCompare(b.name ?? b.username)
  })
}

export function collectSkillOptions(entries: ContactEntry[]): string[] {
  const skills = new Set<string>()
  for (const entry of entries) {
    entry.skills.forEach((skill) => skills.add(skill))
  }
  return Array.from(skills).sort((a, b) => a.localeCompare(b))
}

export function collectCountryOptions(entries: ContactEntry[]): string[] {
  const countries = new Set<string>()
  for (const entry of entries) {
    if (entry.country) countries.add(entry.country)
  }
  return Array.from(countries).sort((a, b) => a.localeCompare(b))
}

function matchesQuery(entry: ContactEntry, query: string): boolean {
  const q = query.trim().toLowerCase()
  if (!q) return true

  const haystack = [
    entry.name,
    entry.username,
    entry.company,
    entry.country,
    entry.location,
    entry.email,
    entry.pipelineLabel,
    entry.notes,
    ...entry.tags,
    ...entry.skills,
    entry.contactInfo.linkedIn,
    entry.contactInfo.companyWebsite,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()

  return haystack.includes(q)
}

export function filterContacts(
  entries: ContactEntry[],
  filters: ContactsDirectoryFilters
): ContactEntry[] {
  return entries.filter((entry) => {
    if (!matchesQuery(entry, filters.query)) return false

    if (filters.country !== 'ALL') {
      const country = entry.country ?? 'Unknown'
      if (country !== filters.country) return false
    }

    if (filters.skill !== 'ALL') {
      const skill = filters.skill.toLowerCase()
      if (!entry.skills.some((s) => s.toLowerCase() === skill)) return false
    }

    if (filters.stage === 'UNSAVED' && entry.isSaved) return false
    if (
      filters.stage !== 'ALL' &&
      filters.stage !== 'UNSAVED' &&
      entry.pipelineStage !== filters.stage
    ) {
      return false
    }

    if (filters.savedOnly && !entry.isSaved) return false
    if (filters.contactedOnly && !entry.isContacted) return false

    if (filters.source !== 'ALL') {
      if (filters.source === 'discovery') {
        if (entry.source) return false
      } else if (entry.source !== filters.source) {
        return false
      }
    }

    return true
  })
}

export function filtersFromSearchParams(params: URLSearchParams): ContactsDirectoryFilters {
  const stage = readEnumParam(
    params,
    'stage',
    CONTACT_STAGE_OPTIONS.map((o) => o.value),
    'ALL'
  )

  return {
    query: readStringParam(params, 'q'),
    country: readStringParam(params, 'country', 'ALL'),
    skill: readStringParam(params, 'skill', 'ALL'),
    stage,
    source: readStringParam(params, 'source', 'ALL'),
    savedOnly: readBooleanParam(params, 'saved'),
    contactedOnly: readBooleanParam(params, 'contacted'),
  }
}

export function filtersToSearchParams(filters: ContactsDirectoryFilters): URLSearchParams {
  const params = new URLSearchParams()
  writeStringParam(params, 'q', filters.query)
  writeStringParam(params, 'country', filters.country, 'ALL')
  writeStringParam(params, 'skill', filters.skill, 'ALL')
  writeEnumParam(params, 'stage', filters.stage, 'ALL')
  writeStringParam(params, 'source', filters.source, 'ALL')
  writeBooleanParam(params, 'saved', filters.savedOnly)
  writeBooleanParam(params, 'contacted', filters.contactedOnly)
  return params
}

export function hasActiveContactFilters(filters: ContactsDirectoryFilters): boolean {
  return (
    filters.query.trim() !== '' ||
    filters.country !== EMPTY_CONTACTS_FILTERS.country ||
    filters.skill !== EMPTY_CONTACTS_FILTERS.skill ||
    filters.stage !== EMPTY_CONTACTS_FILTERS.stage ||
    filters.source !== EMPTY_CONTACTS_FILTERS.source ||
    filters.savedOnly ||
    filters.contactedOnly
  )
}

export function exportContactRows(entries: ContactEntry[]) {
  return entries.map((entry) => ({
    name: entry.name ?? entry.username,
    username: entry.username,
    company: entry.company ?? '',
    country: entry.country ?? '',
    email: entry.email ?? '',
    stage: entry.pipelineLabel,
    source: entry.sourceLabel ?? 'Discover',
    tags: entry.tags.join('; '),
    skills: entry.skills.join('; '),
    score: entry.analysis.score,
    lastActivity: entry.lastActivityAt ?? '',
  }))
}
