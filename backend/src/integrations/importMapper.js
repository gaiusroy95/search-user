/**
 * Builds normalized import records from integration sync runs.
 * Replace demo generators with real API mappers as OAuth credentials are configured.
 */

const DEMO_POOL = {
  linkedin: [
    { externalId: 'li-001', name: 'Sarah Chen', title: 'Staff Engineer', company: 'Stripe', email: 'sarah.chen@example.com', location: 'San Francisco, CA' },
    { externalId: 'li-002', name: 'Marcus Webb', title: 'Senior Backend Engineer', company: 'Notion', email: 'marcus.webb@example.com', location: 'New York, NY' },
    { externalId: 'li-003', name: 'Priya Nair', title: 'Engineering Manager', company: 'Datadog', email: 'priya.nair@example.com', location: 'Boston, MA' },
  ],
  greenhouse: [
    { externalId: 'gh-101', name: 'Alex Rivera', title: 'Full Stack Developer', company: 'Acme Corp', email: 'alex.rivera@example.com', stage: 'INTERVIEW' },
    { externalId: 'gh-102', name: 'Jordan Lee', title: 'Platform Engineer', company: 'Acme Corp', email: 'jordan.lee@example.com', stage: 'APPLICATION' },
    { externalId: 'gh-103', name: 'Taylor Brooks', title: 'DevOps Engineer', company: 'Acme Corp', email: 'taylor.brooks@example.com', stage: 'OFFER' },
  ],
  lever: [
    { externalId: 'lv-201', name: 'Chris Okonkwo', title: 'Mobile Engineer', company: 'Fintech Co', email: 'chris.o@example.com', stage: 'Screen' },
    { externalId: 'lv-202', name: 'Emily Hart', title: 'Data Engineer', company: 'Fintech Co', email: 'emily.hart@example.com', stage: 'On-site' },
  ],
  gmail: [
    { externalId: 'gm-301', name: 'David Kim', email: 'david.kim.recruit@gmail.com', company: 'Independent' },
    { externalId: 'gm-302', name: 'Rachel Nguyen', email: 'rachel.nguyen@gmail.com', company: 'Freelance' },
  ],
  outlook: [
    { externalId: 'ol-401', name: 'Sam Patel', email: 'sam.patel@outlook.com', company: 'Consulting' },
    { externalId: 'ol-402', name: 'Morgan Ellis', email: 'morgan.ellis@company.com', company: 'Enterprise Inc' },
  ],
  github: [
    { externalId: 'octocat', name: 'The Octocat', title: 'Developer', company: 'GitHub', githubUsername: 'octocat' },
    { externalId: 'defunkt', name: 'Chris Wanstrath', title: 'Co-founder', company: 'GitHub', githubUsername: 'defunkt' },
  ],
}

const ATS_STAGE_MAP = {
  APPLICATION: 'NEW',
  NEW: 'NEW',
  SCREEN: 'CONTACTED',
  INTERVIEW: 'MEETING',
  'ON-SITE': 'MEETING',
  OFFER: 'OPPORTUNITY',
  HIRED: 'CLOSED',
}

function mapStage(raw) {
  if (!raw) return 'NEW'
  const key = String(raw).toUpperCase()
  return ATS_STAGE_MAP[key] ?? 'NEW'
}

function slugUsername(source, externalId) {
  const safe = String(externalId).toLowerCase().replace(/[^a-z0-9._-]/g, '-')
  return `${source}:${safe}`
}

function normalizeImport(source, raw) {
  const externalId = raw.externalId || raw.id || makeFallbackId(raw)
  const username =
    raw.githubUsername && source === 'github'
      ? raw.githubUsername
      : slugUsername(source, externalId)

  return {
    externalId: String(externalId),
    source,
    username,
    name: raw.name || raw.fullName || 'Unknown',
    email: raw.email || null,
    company: raw.company || raw.organization || null,
    title: raw.title || raw.role || null,
    location: raw.location || null,
    profileUrl: raw.profileUrl || raw.linkedinUrl || null,
    status: mapStage(raw.stage),
    tags: [source, ...(raw.tags || [])],
    notes: raw.notes || `Imported from ${source} on ${new Date().toISOString().slice(0, 10)}`,
  }
}

function makeFallbackId(raw) {
  return (raw.email || raw.name || 'unknown').replace(/[^a-z0-9]/gi, '-').slice(0, 32)
}

function generateImports(providerId, _connection) {
  const pool = DEMO_POOL[providerId] ?? []
  return pool.map((raw) => normalizeImport(providerId, raw))
}

module.exports = {
  generateImports,
  normalizeImport,
  mapStage,
  slugUsername,
}
