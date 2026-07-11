const { listProviders, getProvider } = require('../integrations/registry')
const {
  buildAuthUrl,
  exchangeCode,
  createDemoTokens,
  verifyState,
} = require('../integrations/oauthService')
const store = require('../services/integrationStore')
const { enqueueSyncJob } = require('../services/integrationJobRunner')

function createIntegrationController() {
  return {
    listProviders(_req, res) {
      res.json({ providers: listProviders() })
    },

    listConnections(req, res, next) {
      try {
        const connections = store.listConnections(req.workspaceId)
        const providers = listProviders()
        const merged = providers.map((p) => {
          const conn = connections.find((c) => c.provider === p.id)
          return {
            provider: p,
            connection: conn ?? null,
            status: conn?.status ?? 'disconnected',
          }
        })
        res.json({ integrations: merged })
      } catch (err) {
        next(err)
      }
    },

    connect(req, res, next) {
      try {
        const providerId = req.params.provider
        const provider = getProvider(providerId)
        if (!provider) return res.status(404).json({ error: 'Provider not found' })

        const existing = store.getConnection(req.workspaceId, providerId)
        if (existing?.status === 'connected') {
          return res.json({ connection: store.sanitizeConnection(existing), alreadyConnected: true })
        }

        const auth = buildAuthUrl(providerId, {
          workspaceId: req.workspaceId,
          userId: req.user.id,
        })

        if (auth.mode === 'demo') {
          const tokens = createDemoTokens(providerId)
          const connection = store.upsertConnection({
            workspaceId: req.workspaceId,
            userId: req.user.id,
            provider: providerId,
            status: 'connected',
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            expiresAt: tokens.expiresAt,
            scopes: provider.scopes,
            metadata: tokens.metadata,
          })
          return res.json({ connection, mode: 'demo' })
        }

        res.json({ authUrl: auth.authUrl, mode: 'oauth' })
      } catch (err) {
        next(err)
      }
    },

    async oauthCallback(req, res) {
      const providerId = req.params.provider
      const { code, state, error } = req.query

      const frontend = process.env.CORS_ORIGIN?.split(',')[0] || 'http://localhost:5173'

      if (error) {
        return res.redirect(`${frontend}/integrations?error=${encodeURIComponent(error)}`)
      }

      const payload = verifyState(state)
      if (!payload || payload.providerId !== providerId) {
        return res.redirect(`${frontend}/integrations?error=invalid_state`)
      }

      try {
        const provider = getProvider(providerId)
        const tokens = await exchangeCode(providerId, code)
        store.upsertConnection({
          workspaceId: payload.workspaceId,
          userId: payload.userId,
          provider: providerId,
          status: 'connected',
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          expiresAt: tokens.expiresAt,
          scopes: provider.scopes,
          metadata: tokens.metadata,
        })
        res.redirect(`${frontend}/integrations?connected=${providerId}`)
      } catch (err) {
        res.redirect(
          `${frontend}/integrations?error=${encodeURIComponent(err.message || 'oauth_failed')}`
        )
      }
    },

    disconnect(req, res, next) {
      try {
        const ok = store.deleteConnection(req.workspaceId, req.params.provider)
        if (!ok) return res.status(404).json({ error: 'Connection not found' })
        res.json({ ok: true })
      } catch (err) {
        next(err)
      }
    },

    triggerSync(req, res, next) {
      try {
        const connection = store.getConnection(req.workspaceId, req.params.provider)
        if (!connection || connection.status === 'disconnected') {
          return res.status(404).json({ error: 'Connect integration first' })
        }
        const full = store.getConnectionWithSecrets(connection.id)
        const job = enqueueSyncJob(full)
        res.status(202).json({ job, message: 'Sync queued' })
      } catch (err) {
        next(err)
      }
    },

    syncHistory(req, res, next) {
      try {
        const runs = store.listSyncRuns(req.workspaceId, Number(req.query.limit) || 50)
        res.json({ runs })
      } catch (err) {
        next(err)
      }
    },

    listJobs(req, res, next) {
      try {
        const jobs = store.listJobs(req.workspaceId, req.query.status)
        res.json({ jobs })
      } catch (err) {
        next(err)
      }
    },

    retryJob(req, res, next) {
      try {
        const job = store.getJob(req.params.jobId)
        if (!job || job.workspaceId !== req.workspaceId) {
          return res.status(404).json({ error: 'Job not found' })
        }
        if (job.status !== 'failed') {
          return res.status(400).json({ error: 'Only failed jobs can be retried' })
        }
        const updated = store.updateJob(job.id, {
          status: 'pending',
          attempts: 0,
          scheduledAt: new Date().toISOString(),
          lastError: null,
          finishedAt: null,
        })
        res.json({ job: updated })
      } catch (err) {
        next(err)
      }
    },
  }
}

module.exports = { createIntegrationController }
