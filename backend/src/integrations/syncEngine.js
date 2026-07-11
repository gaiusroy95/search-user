const { runProviderSync } = require('./providers')
const { getProvider } = require('./registry')
const { applyImportResults } = require('./importer')
const store = require('../services/integrationStore')

const MAX_RETRIES = 3
const RETRY_DELAYS_MS = [5000, 30000, 120000]

function isRetryable(error) {
  if (error.code === 'TRANSIENT') return true
  const status = error.statusCode
  return status === 429 || status === 503 || status === 502
}

async function executeSync(connection, store) {
  const provider = getProvider(connection.provider)
  if (!provider?.supportsSync) {
    const err = new Error('Provider does not support sync')
    err.statusCode = 400
    throw err
  }

  const run = store.createSyncRun({
    connectionId: connection.id,
    workspaceId: connection.workspaceId,
    provider: connection.provider,
    status: 'running',
  })

  try {
    const result = await runProviderSync(connection.provider, connection)
    let importStats = { created: 0, updated: 0, skipped: 0 }
    if (result.imports?.length) {
      importStats = applyImportResults(
        connection.workspaceId,
        result.imports,
        connection.userId
      )
    }
    store.completeSyncRun(run.id, {
      status: 'completed',
      recordsProcessed: result.recordsProcessed,
      summary: result.summary,
      details: { items: result.items, importStats },
    })
    store.updateConnection(connection.id, {
      status: 'connected',
      lastSyncAt: new Date().toISOString(),
      lastError: null,
    })
    return { runId: run.id, ...result }
  } catch (error) {
    store.completeSyncRun(run.id, {
      status: 'failed',
      recordsProcessed: 0,
      error: error.message,
    })
    store.updateConnection(connection.id, {
      status: 'error',
      lastError: error.message,
    })
    throw error
  }
}

function scheduleRetry(job, store, attempt) {
  const delay = RETRY_DELAYS_MS[Math.min(attempt, RETRY_DELAYS_MS.length - 1)]
  store.updateJob(job.id, {
    status: 'pending',
    attempts: attempt,
    scheduledAt: new Date(Date.now() + delay).toISOString(),
    lastError: job.lastError,
  })
}

module.exports = {
  executeSync,
  isRetryable,
  scheduleRetry,
  MAX_RETRIES,
  RETRY_DELAYS_MS,
}
