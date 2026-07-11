const crypto = require('crypto')
const collaborationStore = require('../services/collaborationStore')

function importToProspect(record) {
  const now = new Date().toISOString()
  return {
    username: record.username,
    name: record.name,
    profile: record.profileUrl || '',
    avatar: record.avatar || null,
    bio: record.title ? `${record.title}${record.company ? ` at ${record.company}` : ''}` : null,
    location: record.location || null,
    email: record.email || null,
    company: record.company || null,
    twitter: null,
    website: record.profileUrl || null,
    followers: 0,
    following: 0,
    publicRepos: 0,
    primaryLanguage: null,
    languages: [],
    repositories: [],
    status: record.status || 'NEW',
    notes: record.notes || '',
    tags: record.tags || [record.source],
    savedAt: now,
    activityHistory: [
      {
        id: crypto.randomUUID(),
        type: 'created',
        message: `Imported from ${record.source}`,
        at: now,
      },
    ],
    source: record.source,
    externalId: record.externalId,
    importedAt: now,
  }
}

function applyImportResults(workspaceId, imports, actorId) {
  if (!imports?.length) return { created: 0, updated: 0, skipped: 0 }
  return collaborationStore.upsertImportedProspects({
    workspaceId,
    prospects: imports.map(importToProspect),
    actorId: actorId || 'system',
    provider: imports[0]?.source,
  })
}

module.exports = { importToProspect, applyImportResults }
