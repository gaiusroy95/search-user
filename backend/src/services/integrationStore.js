const fs = require('fs')
const path = require('path')
const crypto = require('crypto')

const DATA_DIR = path.join(__dirname, '../../data')
const DB_FILE = path.join(DATA_DIR, 'integrations.json')

const EMPTY_DB = {
  connections: [],
  syncRuns: [],
  jobQueue: [],
  oauthStates: [],
}

function makeId() {
  return crypto.randomUUID()
}

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true })
  }
}

function readDb() {
  ensureDataDir()
  if (!fs.existsSync(DB_FILE)) {
    return structuredClone(EMPTY_DB)
  }
  try {
    const raw = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'))
    return {
      connections: raw.connections ?? [],
      syncRuns: raw.syncRuns ?? [],
      jobQueue: raw.jobQueue ?? [],
      oauthStates: raw.oauthStates ?? [],
    }
  } catch {
    return structuredClone(EMPTY_DB)
  }
}

function writeDb(data) {
  ensureDataDir()
  fs.writeFileSync(DB_FILE, JSON.stringify({ ...data, updatedAt: new Date().toISOString() }, null, 2))
}

function mutate(fn) {
  const db = readDb()
  const result = fn(db)
  writeDb(db)
  return result
}

function sanitizeConnection(c) {
  if (!c) return null
  const { accessToken, refreshToken, ...safe } = c
  return {
    ...safe,
    hasToken: Boolean(accessToken),
  }
}

function getConnection(workspaceId, provider) {
  const db = readDb()
  return (
    db.connections.find((c) => c.workspaceId === workspaceId && c.provider === provider) ?? null
  )
}

function getConnectionById(id) {
  const db = readDb()
  return db.connections.find((c) => c.id === id) ?? null
}

function listConnections(workspaceId) {
  const db = readDb()
  return db.connections
    .filter((c) => c.workspaceId === workspaceId)
    .map(sanitizeConnection)
}

function upsertConnection(input) {
  return mutate((db) => {
    const existing = db.connections.findIndex(
      (c) => c.workspaceId === input.workspaceId && c.provider === input.provider
    )
    const connection = {
      id: input.id || makeId(),
      workspaceId: input.workspaceId,
      userId: input.userId,
      provider: input.provider,
      status: input.status || 'connected',
      accessToken: input.accessToken ?? null,
      refreshToken: input.refreshToken ?? null,
      expiresAt: input.expiresAt ?? null,
      scopes: input.scopes ?? [],
      metadata: input.metadata ?? {},
      connectedAt: input.connectedAt || new Date().toISOString(),
      lastSyncAt: input.lastSyncAt ?? null,
      lastError: input.lastError ?? null,
    }
    if (existing >= 0) {
      db.connections[existing] = { ...db.connections[existing], ...connection }
    } else {
      db.connections.push(connection)
    }
    return sanitizeConnection(
      db.connections.find((c) => c.workspaceId === input.workspaceId && c.provider === input.provider)
    )
  })
}

function updateConnection(id, patch) {
  return mutate((db) => {
    const index = db.connections.findIndex((c) => c.id === id)
    if (index === -1) return null
    db.connections[index] = { ...db.connections[index], ...patch }
    return sanitizeConnection(db.connections[index])
  })
}

function deleteConnection(workspaceId, provider) {
  return mutate((db) => {
    const index = db.connections.findIndex(
      (c) => c.workspaceId === workspaceId && c.provider === provider
    )
    if (index === -1) return false
    const [removed] = db.connections.splice(index, 1)
    db.syncRuns = db.syncRuns.filter((r) => r.connectionId !== removed.id)
    db.jobQueue = db.jobQueue.filter((j) => j.connectionId !== removed.id)
    return true
  })
}

function createSyncRun(input) {
  return mutate((db) => {
    const run = {
      id: makeId(),
      connectionId: input.connectionId,
      workspaceId: input.workspaceId,
      provider: input.provider,
      status: input.status || 'pending',
      startedAt: new Date().toISOString(),
      finishedAt: null,
      recordsProcessed: 0,
      summary: null,
      error: null,
      details: {},
      retryCount: input.retryCount ?? 0,
    }
    db.syncRuns.unshift(run)
    db.syncRuns = db.syncRuns.slice(0, 500)
    return run
  })
}

function completeSyncRun(runId, patch) {
  return mutate((db) => {
    const run = db.syncRuns.find((r) => r.id === runId)
    if (!run) return null
    Object.assign(run, patch, { finishedAt: new Date().toISOString() })
    return run
  })
}

function listSyncRuns(workspaceId, limit = 50) {
  const db = readDb()
  return db.syncRuns
    .filter((r) => r.workspaceId === workspaceId)
    .slice(0, limit)
}

function enqueueJob(input) {
  return mutate((db) => {
    const job = {
      id: makeId(),
      type: input.type || 'sync',
      connectionId: input.connectionId,
      workspaceId: input.workspaceId,
      provider: input.provider,
      payload: input.payload ?? {},
      status: 'pending',
      attempts: 0,
      maxAttempts: input.maxAttempts ?? 3,
      scheduledAt: new Date().toISOString(),
      lastError: null,
      createdAt: new Date().toISOString(),
      startedAt: null,
      finishedAt: null,
    }
    db.jobQueue.unshift(job)
    db.jobQueue = db.jobQueue.slice(0, 200)
    return job
  })
}

function updateJob(jobId, patch) {
  return mutate((db) => {
    const job = db.jobQueue.find((j) => j.id === jobId)
    if (!job) return null
    Object.assign(job, patch)
    return job
  })
}

function getJob(jobId) {
  const db = readDb()
  return db.jobQueue.find((j) => j.id === jobId) ?? null
}

function listJobs(workspaceId, status) {
  const db = readDb()
  let jobs = db.jobQueue.filter((j) => j.workspaceId === workspaceId)
  if (status) jobs = jobs.filter((j) => j.status === status)
  return jobs.slice(0, 100)
}

function claimNextJob() {
  return mutate((db) => {
    const now = Date.now()
    const job = db.jobQueue.find(
      (j) =>
        j.status === 'pending' &&
        new Date(j.scheduledAt).getTime() <= now
    )
    if (!job) return null
    job.status = 'processing'
    job.startedAt = new Date().toISOString()
    job.attempts += 1
    return job
  })
}

function getConnectionWithSecrets(id) {
  const db = readDb()
  return db.connections.find((c) => c.id === id) ?? null
}

module.exports = {
  sanitizeConnection,
  getConnection,
  getConnectionById,
  listConnections,
  upsertConnection,
  updateConnection,
  deleteConnection,
  createSyncRun,
  completeSyncRun,
  listSyncRuns,
  enqueueJob,
  updateJob,
  getJob,
  listJobs,
  claimNextJob,
  getConnectionWithSecrets,
}
