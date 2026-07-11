/**
 * Integration provider registry — single source of truth for supported connectors.
 * Each provider declares OAuth config, capabilities, and sync behavior metadata.
 */

const PROVIDERS = {
  github: {
    id: 'github',
    name: 'GitHub',
    description: 'Sync organizations, repos, and developer profiles from GitHub.',
    category: 'source',
    authType: 'oauth2',
    scopes: ['read:user', 'read:org', 'repo:read'],
    envPrefix: 'GITHUB_OAUTH',
    supportsSync: true,
    supportsWebhook: false,
  },
  linkedin: {
    id: 'linkedin',
    name: 'LinkedIn',
    description: 'Import candidate profiles and recruiter network connections.',
    category: 'source',
    authType: 'oauth2',
    scopes: ['r_liteprofile', 'r_emailaddress'],
    envPrefix: 'LINKEDIN_OAUTH',
    supportsSync: true,
    supportsWebhook: false,
  },
  greenhouse: {
    id: 'greenhouse',
    name: 'Greenhouse',
    description: 'Bi-directional sync with Greenhouse ATS candidates and stages.',
    category: 'ats',
    authType: 'oauth2',
    scopes: ['candidates.read', 'candidates.write'],
    envPrefix: 'GREENHOUSE_OAUTH',
    supportsSync: true,
    supportsWebhook: true,
  },
  lever: {
    id: 'lever',
    name: 'Lever',
    description: 'Import opportunities and sync pipeline stages with Lever.',
    category: 'ats',
    authType: 'oauth2',
    scopes: ['opportunities:read:admin', 'contacts:read'],
    envPrefix: 'LEVER_OAUTH',
    supportsSync: true,
    supportsWebhook: true,
  },
  slack: {
    id: 'slack',
    name: 'Slack',
    description: 'Post pipeline updates and @mention notifications to channels.',
    category: 'communication',
    authType: 'oauth2',
    scopes: ['chat:write', 'users:read'],
    envPrefix: 'SLACK_OAUTH',
    supportsSync: true,
    supportsWebhook: true,
  },
  gmail: {
    id: 'gmail',
    name: 'Gmail',
    description: 'Import contacts and log outreach emails from Gmail.',
    category: 'communication',
    authType: 'oauth2',
    scopes: ['https://www.googleapis.com/auth/gmail.readonly'],
    envPrefix: 'GMAIL_OAUTH',
    supportsSync: true,
    supportsWebhook: false,
  },
  outlook: {
    id: 'outlook',
    name: 'Outlook',
    description: 'Sync Microsoft 365 contacts and calendar for recruiting outreach.',
    category: 'communication',
    authType: 'oauth2',
    scopes: ['Mail.Read', 'Contacts.Read'],
    envPrefix: 'OUTLOOK_OAUTH',
    supportsSync: true,
    supportsWebhook: true,
  },
}

const PROVIDER_IDS = Object.keys(PROVIDERS)

function getProvider(id) {
  return PROVIDERS[id] ?? null
}

function listProviders() {
  return PROVIDER_IDS.map((id) => {
    const p = PROVIDERS[id]
    return {
      id: p.id,
      name: p.name,
      description: p.description,
      category: p.category,
      authType: p.authType,
      scopes: p.scopes,
      supportsSync: p.supportsSync,
      supportsWebhook: p.supportsWebhook,
      oauthConfigured: isOAuthConfigured(p.id),
    }
  })
}

function isOAuthConfigured(providerId) {
  const provider = getProvider(providerId)
  if (!provider) return false
  if (providerId === 'github' && process.env.GITHUB_TOKEN) return true
  const prefix = provider.envPrefix
  return Boolean(process.env[`${prefix}_CLIENT_ID`] && process.env[`${prefix}_CLIENT_SECRET`])
}

function getOAuthConfig(providerId) {
  const provider = getProvider(providerId)
  if (!provider) return null
  const prefix = provider.envPrefix
  return {
    clientId: process.env[`${prefix}_CLIENT_ID`] || '',
    clientSecret: process.env[`${prefix}_CLIENT_SECRET`] || '',
    redirectUri:
      process.env[`${prefix}_REDIRECT_URI`] ||
      `${process.env.API_BASE_URL || 'http://localhost:3000'}/integrations/oauth/callback/${providerId}`,
    authorizeUrl: getAuthorizeUrl(providerId),
    tokenUrl: getTokenUrl(providerId),
    scopes: provider.scopes,
  }
}

function getAuthorizeUrl(providerId) {
  const urls = {
    github: 'https://github.com/login/oauth/authorize',
    linkedin: 'https://www.linkedin.com/oauth/v2/authorization',
    greenhouse: 'https://api.greenhouse.io/oauth/authorize',
    lever: 'https://auth.lever.co/authorize',
    slack: 'https://slack.com/oauth/v2/authorize',
    gmail: 'https://accounts.google.com/o/oauth2/v2/auth',
    outlook: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
  }
  return urls[providerId] || ''
}

function getTokenUrl(providerId) {
  const urls = {
    github: 'https://github.com/login/oauth/access_token',
    linkedin: 'https://www.linkedin.com/oauth/v2/accessToken',
    greenhouse: 'https://api.greenhouse.io/oauth/token',
    lever: 'https://auth.lever.co/oauth/token',
    slack: 'https://slack.com/api/oauth.v2.access',
    gmail: 'https://oauth2.googleapis.com/token',
    outlook: 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
  }
  return urls[providerId] || ''
}

module.exports = {
  PROVIDERS,
  PROVIDER_IDS,
  getProvider,
  listProviders,
  isOAuthConfigured,
  getOAuthConfig,
}
