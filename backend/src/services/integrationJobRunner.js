const {
  executeSync,
  isRetryable,
  scheduleRetry,
  MAX_RETRIES,
} = require('../integrations/syncEngine')
const store = require('./integrationStore')

let intervalHandle = null
let processing = false

async function processJob(job) {
  const connection = store.getConnectionWithSecrets(job.connectionId)
  if (!connection) {
    store.updateJob(job.id, {
      status: 'failed',
      finishedAt: new Date().toISOString(),
      lastError: 'Connection not found',
    })
    return
  }

  try {
    await executeSync(connection, store)
    store.updateJob(job.id, {
      status: 'completed',
      finishedAt: new Date().toISOString(),
      lastError: null,
    })
  } catch (error) {
    const attempts = job.attempts
    if (isRetryable(error) && attempts < (job.maxAttempts || MAX_RETRIES)) {
      scheduleRetry(
        { ...job, lastError: error.message },
        store,
        attempts
      )
    } else {
      store.updateJob(job.id, {
        status: 'failed',
        finishedAt: new Date().toISOString(),
        lastError: error.message,
      })
    }
  }
}

async function tick() {
  if (processing) return
  processing = true
  try {
    const job = store.claimNextJob()
    if (job) await processJob(job)
  } finally {
    processing = false
  }
}

function startJobRunner(intervalMs = 3000) {
  if (intervalHandle) return
  intervalHandle = setInterval(() => {
    void tick()
  }, intervalMs)
  console.log('[integrations] Background job runner started')
}

function stopJobRunner() {
  if (intervalHandle) {
    clearInterval(intervalHandle)
    intervalHandle = null
  }
}

function enqueueSyncJob(connection) {
  return store.enqueueJob({
    type: 'sync',
    connectionId: connection.id,
    workspaceId: connection.workspaceId,
    provider: connection.provider,
    maxAttempts: MAX_RETRIES,
  })
}

module.exports = {
  startJobRunner,
  stopJobRunner,
  enqueueSyncJob,
  processJob,
  tick,
}
