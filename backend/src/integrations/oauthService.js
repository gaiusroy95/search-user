const crypto = require('crypto')
const { getOAuthConfig, getProvider, isOAuthConfigured } = require('../integrations/registry')

function signState(payload) {
  const secret = process.env.AUTH_SECRET || 'dev-collaboration-secret-change-me'
  const data = Buffer.from(JSON.stringify(payload)).toString('base64url')
  const sig = crypto.createHmac('sha256', secret).update(data).digest('base64url')
  return `${data}.${sig}`
}

function verifyState(state) {
  if (!state) return null
  const secret = process.env.AUTH_SECRET || 'dev-collaboration-secret-change-me'
  const [data, sig] = state.split('.')
  if (!data || !sig) return null
  const expected = crypto.createHmac('sha256', secret).update(data).digest('base64url')
  try {
    if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null
  } catch {
    return null
  }
  try {
    const payload = JSON.parse(Buffer.from(data, 'base64url').toString('utf8'))
    if (payload.exp && payload.exp < Date.now()) return null
    return payload
  } catch {
    return null
  }
}

function buildAuthUrl(providerId, { workspaceId, userId }) {
  const config = getOAuthConfig(providerId)
  const provider = getProvider(providerId)
  if (!config || !provider) {
    const err = new Error('Unknown provider')
    err.statusCode = 400
    throw err
  }

  if (!isOAuthConfigured(providerId)) {
    return { mode: 'demo', authUrl: null }
  }

  const state = signState({
    workspaceId,
    userId,
    providerId,
    exp: Date.now() + 10 * 60 * 1000,
  })

  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    scope: config.scopes.join(' '),
    state,
    response_type: 'code',
  })

  if (providerId === 'gmail' || providerId === 'outlook') {
    params.set('access_type', 'offline')
    params.set('prompt', 'consent')
  }

  return {
    mode: 'oauth',
    authUrl: `${config.authorizeUrl}?${params.toString()}`,
    state,
  }
}

async function exchangeCode(providerId, code) {
  const config = getOAuthConfig(providerId)
  if (!config?.clientId) {
    const err = new Error('OAuth not configured for this provider')
    err.statusCode = 503
    throw err
  }

  const body = new URLSearchParams({
    client_id: config.clientId,
    client_secret: config.clientSecret,
    code,
    redirect_uri: config.redirectUri,
    grant_type: 'authorization_code',
  })

  const headers = { 'Content-Type': 'application/x-www-form-urlencoded' }
  if (providerId === 'github') {
    headers.Accept = 'application/json'
  }

  const res = await fetch(config.tokenUrl, { method: 'POST', headers, body })
  if (!res.ok) {
    const err = new Error(`OAuth token exchange failed (${res.status})`)
    err.statusCode = 502
    throw err
  }

  const data = await res.json()
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token ?? null,
    expiresAt: data.expires_in
      ? new Date(Date.now() + data.expires_in * 1000).toISOString()
      : null,
    metadata: {
      tokenType: data.token_type,
      scope: data.scope,
    },
  }
}

function createDemoTokens(providerId) {
  return {
    accessToken: `demo_${providerId}_${crypto.randomBytes(8).toString('hex')}`,
    refreshToken: null,
    expiresAt: null,
    metadata: { mode: 'demo' },
  }
}

module.exports = {
  buildAuthUrl,
  exchangeCode,
  createDemoTokens,
  verifyState,
  signState,
}
