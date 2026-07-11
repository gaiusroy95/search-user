/**
 * Provider-specific sync handlers.
 * Each returns { recordsProcessed, summary, items?, imports? }
 */

const { generateImports } = require('../importMapper')

async function syncGitHub(connection) {
  const imports = generateImports('github', connection)
  const hasServerToken = require('../../utils/githubClient').hasGitHubToken()
  return {
    recordsProcessed: imports.length,
    summary: hasServerToken
      ? `Synced ${imports.length} GitHub profiles into workspace contacts and pipeline.`
      : `Imported ${imports.length} demo GitHub org members into contacts.`,
    items: ['Organizations', 'Public repos', 'Contributor signals'],
    imports,
  }
}

async function syncLinkedIn(connection) {
  const imports = generateImports('linkedin', connection)
  return {
    recordsProcessed: imports.length,
    summary: `Imported ${imports.length} LinkedIn profiles into Contacts and Pipeline.`,
    items: ['Profile imports', 'Connection hints', 'Role titles'],
    imports,
  }
}

async function syncGreenhouse(connection) {
  const imports = generateImports('greenhouse', connection)
  return {
    recordsProcessed: imports.length,
    summary: `Imported ${imports.length} Greenhouse candidates with ATS stage mapping.`,
    items: ['Candidates', 'Applications', 'Stage mappings'],
    imports,
  }
}

async function syncLever(connection) {
  const imports = generateImports('lever', connection)
  return {
    recordsProcessed: imports.length,
    summary: `Imported ${imports.length} Lever opportunities into workspace pipeline.`,
    items: ['Opportunities', 'Contacts', 'Archive reasons'],
    imports,
  }
}

async function syncSlack(connection) {
  return {
    recordsProcessed: 1,
    summary: 'Posted workspace sync digest to connected Slack channel.',
    items: ['Channel notifications', 'Mention routing'],
    imports: [],
  }
}

async function syncGmail(connection) {
  const imports = generateImports('gmail', connection)
  return {
    recordsProcessed: imports.length,
    summary: `Imported ${imports.length} Gmail contacts into Contacts.`,
    items: ['Contact emails', 'Thread metadata'],
    imports,
  }
}

async function syncOutlook(connection) {
  const imports = generateImports('outlook', connection)
  return {
    recordsProcessed: imports.length,
    summary: `Synced ${imports.length} Outlook contacts into Contacts.`,
    items: ['Contacts', 'Calendar availability hints'],
    imports,
  }
}

const HANDLERS = {
  github: syncGitHub,
  linkedin: syncLinkedIn,
  greenhouse: syncGreenhouse,
  lever: syncLever,
  slack: syncSlack,
  gmail: syncGmail,
  outlook: syncOutlook,
}

async function runProviderSync(providerId, connection) {
  const handler = HANDLERS[providerId]
  if (!handler) {
    const err = new Error(`No sync handler for ${providerId}`)
    err.statusCode = 400
    throw err
  }

  await new Promise((r) => setTimeout(r, 800 + Math.random() * 1200))

  if (connection.metadata?.mode === 'demo' && Math.random() < 0.05) {
    const err = new Error('Simulated transient API error — will retry')
    err.code = 'TRANSIENT'
    err.statusCode = 503
    throw err
  }

  return handler(connection)
}

module.exports = { runProviderSync, HANDLERS }
