const fs = require('fs')
const path = require('path')
const crypto = require('crypto')
const { ROLES } = require('../constants/permissions')

const DATA_DIR = path.join(__dirname, '../../data')
const DB_FILE = path.join(DATA_DIR, 'collaboration.json')

const EMPTY_DB = {
  users: [],
  workspaces: [],
  memberships: [],
  prospects: [],
  comments: [],
  notifications: [],
  auditLogs: [],
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
      users: raw.users ?? [],
      workspaces: raw.workspaces ?? [],
      memberships: raw.memberships ?? [],
      prospects: raw.prospects ?? [],
      comments: raw.comments ?? [],
      notifications: raw.notifications ?? [],
      auditLogs: raw.auditLogs ?? [],
    }
  } catch {
    return structuredClone(EMPTY_DB)
  }
}

function writeDb(data) {
  ensureDataDir()
  const payload = { ...data, updatedAt: new Date().toISOString() }
  fs.writeFileSync(DB_FILE, JSON.stringify(payload, null, 2), 'utf8')
  return payload
}

function mutate(mutator) {
  const db = readDb()
  const result = mutator(db)
  writeDb(db)
  return result
}

function sanitizeUser(user) {
  if (!user) return null
  const { passwordHash, ...safe } = user
  return safe
}

function getUserByEmail(email) {
  const db = readDb()
  return db.users.find((u) => u.email.toLowerCase() === email.toLowerCase()) ?? null
}

function getUserById(userId) {
  const db = readDb()
  return db.users.find((u) => u.id === userId) ?? null
}

function createUser({ email, name, passwordHash }) {
  return mutate((db) => {
    if (db.users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
      const err = new Error('Email already registered')
      err.statusCode = 409
      throw err
    }
    const user = {
      id: makeId(),
      email: email.toLowerCase().trim(),
      name: name.trim(),
      passwordHash,
      createdAt: new Date().toISOString(),
    }
    db.users.push(user)
    return sanitizeUser(user)
  })
}

function getMembership(workspaceId, userId) {
  const db = readDb()
  return (
    db.memberships.find((m) => m.workspaceId === workspaceId && m.userId === userId) ?? null
  )
}

function listWorkspacesForUser(userId) {
  const db = readDb()
  return db.memberships
    .filter((m) => m.userId === userId)
    .map((m) => {
      const workspace = db.workspaces.find((w) => w.id === m.workspaceId)
      if (!workspace) return null
      return {
        ...workspace,
        role: m.role,
        memberCount: db.memberships.filter((x) => x.workspaceId === workspace.id).length,
      }
    })
    .filter(Boolean)
}

function createWorkspace({ name, ownerId }) {
  return mutate((db) => {
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 48)
    const workspace = {
      id: makeId(),
      name: name.trim(),
      slug: slug || makeId().slice(0, 8),
      ownerId,
      createdAt: new Date().toISOString(),
    }
    db.workspaces.push(workspace)
    db.memberships.push({
      id: makeId(),
      workspaceId: workspace.id,
      userId: ownerId,
      role: 'owner',
      joinedAt: new Date().toISOString(),
    })
    appendAudit(db, {
      workspaceId: workspace.id,
      userId: ownerId,
      action: 'workspace.created',
      resource: 'workspace',
      resourceId: workspace.id,
      details: { name: workspace.name },
    })
    return workspace
  })
}

function getWorkspace(workspaceId) {
  const db = readDb()
  return db.workspaces.find((w) => w.id === workspaceId) ?? null
}

function listMembers(workspaceId) {
  const db = readDb()
  return db.memberships
    .filter((m) => m.workspaceId === workspaceId)
    .map((m) => {
      const user = db.users.find((u) => u.id === m.userId)
      return {
        id: m.id,
        workspaceId: m.workspaceId,
        userId: m.userId,
        role: m.role,
        joinedAt: m.joinedAt,
        user: sanitizeUser(user),
      }
    })
}

function inviteMember({ workspaceId, email, role, actorId }) {
  if (!ROLES.includes(role) || role === 'owner') {
    const err = new Error('Invalid role')
    err.statusCode = 400
    throw err
  }
  return mutate((db) => {
    const user = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase())
    if (!user) {
      const err = new Error('User must register before joining a workspace')
      err.statusCode = 404
      throw err
    }
    if (db.memberships.some((m) => m.workspaceId === workspaceId && m.userId === user.id)) {
      const err = new Error('User is already a member')
      err.statusCode = 409
      throw err
    }
    const membership = {
      id: makeId(),
      workspaceId,
      userId: user.id,
      role,
      joinedAt: new Date().toISOString(),
    }
    db.memberships.push(membership)
    createNotification(db, {
      workspaceId,
      userId: user.id,
      type: 'workspace_invite',
      title: 'Added to team workspace',
      body: `You were added as ${role}.`,
      href: '/team',
    })
    appendAudit(db, {
      workspaceId,
      userId: actorId,
      action: 'member.invited',
      resource: 'membership',
      resourceId: membership.id,
      details: { email, role },
    })
    return { ...membership, user: sanitizeUser(user) }
  })
}

function updateMemberRole({ workspaceId, membershipId, role, actorId }) {
  if (!ROLES.includes(role) || role === 'owner') {
    const err = new Error('Invalid role')
    err.statusCode = 400
    throw err
  }
  return mutate((db) => {
    const membership = db.memberships.find(
      (m) => m.id === membershipId && m.workspaceId === workspaceId
    )
    if (!membership) {
      const err = new Error('Member not found')
      err.statusCode = 404
      throw err
    }
    if (membership.role === 'owner') {
      const err = new Error('Cannot change owner role')
      err.statusCode = 400
      throw err
    }
    membership.role = role
    appendAudit(db, {
      workspaceId,
      userId: actorId,
      action: 'member.role_updated',
      resource: 'membership',
      resourceId: membership.id,
      details: { role },
    })
    return membership
  })
}

function removeMember({ workspaceId, membershipId, actorId }) {
  return mutate((db) => {
    const index = db.memberships.findIndex(
      (m) => m.id === membershipId && m.workspaceId === workspaceId
    )
    if (index === -1) {
      const err = new Error('Member not found')
      err.statusCode = 404
      throw err
    }
    const membership = db.memberships[index]
    if (membership.role === 'owner') {
      const err = new Error('Cannot remove workspace owner')
      err.statusCode = 400
      throw err
    }
    db.memberships.splice(index, 1)
    appendAudit(db, {
      workspaceId,
      userId: actorId,
      action: 'member.removed',
      resource: 'membership',
      resourceId: membership.id,
      details: { userId: membership.userId },
    })
    return { ok: true }
  })
}

function listProspects(workspaceId) {
  const db = readDb()
  return db.prospects.filter((p) => p.workspaceId === workspaceId)
}

function addProspect({ workspaceId, prospect, actorId }) {
  return mutate((db) => {
    if (db.prospects.some((p) => p.workspaceId === workspaceId && p.username === prospect.username)) {
      const err = new Error('Candidate already in shared pool')
      err.statusCode = 409
      throw err
    }
    const record = {
      ...prospect,
      id: prospect.id || makeId(),
      workspaceId,
      addedBy: actorId,
      updatedAt: new Date().toISOString(),
    }
    db.prospects.unshift(record)
    appendAudit(db, {
      workspaceId,
      userId: actorId,
      action: 'prospect.created',
      resource: 'prospect',
      resourceId: record.id,
      details: { username: record.username },
    })
    notifyWorkspace(db, workspaceId, actorId, {
      type: 'candidate_saved',
      title: `Candidate saved · ${record.name ?? record.username}`,
      body: `@${record.username} added to shared pipeline`,
      href: '/pipeline',
    })
    return record
  })
}

function upsertImportedProspects({ workspaceId, prospects, actorId, provider }) {
  return mutate((db) => {
    let created = 0
    let updated = 0
    let skipped = 0

    for (const prospect of prospects) {
      const index = db.prospects.findIndex(
        (p) =>
          p.workspaceId === workspaceId &&
          (p.username === prospect.username ||
            (p.externalId &&
              prospect.externalId &&
              p.externalId === prospect.externalId &&
              p.source === prospect.source))
      )

      if (index === -1) {
        const record = {
          ...prospect,
          id: prospect.id || makeId(),
          workspaceId,
          addedBy: actorId,
          updatedAt: new Date().toISOString(),
        }
        db.prospects.unshift(record)
        created += 1
        continue
      }

      const prev = db.prospects[index]
      const merged = {
        ...prev,
        ...prospect,
        id: prev.id,
        workspaceId,
        tags: Array.from(new Set([...(prev.tags ?? []), ...(prospect.tags ?? [])])),
        activityHistory: [
          {
            id: makeId(),
            type: 'note',
            message: `Updated from ${provider || prospect.source} sync`,
            at: new Date().toISOString(),
          },
          ...(prev.activityHistory ?? []),
        ].slice(0, 50),
        updatedAt: new Date().toISOString(),
      }
      db.prospects[index] = merged
      updated += 1
    }

    if (created > 0 || updated > 0) {
      appendAudit(db, {
        workspaceId,
        userId: actorId,
        action: 'integration.import',
        resource: 'integration',
        resourceId: provider || 'unknown',
        details: { created, updated, skipped },
      })
      notifyWorkspace(db, workspaceId, actorId, {
        type: 'integration_import',
        title: `${provider} sync imported ${created + updated} contact${created + updated === 1 ? '' : 's'}`,
        body: `${created} new, ${updated} updated — view in Contacts or Pipeline`,
        href: '/contacts',
      })
    }

    return { created, updated, skipped }
  })
}

function updateProspect({ workspaceId, prospectId, patch, actorId }) {
  return mutate((db) => {
    const index = db.prospects.findIndex(
      (p) => p.id === prospectId && p.workspaceId === workspaceId
    )
    if (index === -1) {
      const err = new Error('Prospect not found')
      err.statusCode = 404
      throw err
    }
    const prev = db.prospects[index]
    const next = { ...prev, ...patch, updatedAt: new Date().toISOString() }
    db.prospects[index] = next
    appendAudit(db, {
      workspaceId,
      userId: actorId,
      action: 'prospect.updated',
      resource: 'prospect',
      resourceId: prospectId,
      details: { fields: Object.keys(patch) },
    })
    if (patch.status && patch.status !== prev.status) {
      notifyWorkspace(db, workspaceId, actorId, {
        type: 'pipeline_status',
        title: `Pipeline update · @${next.username}`,
        body: `Status changed to ${patch.status}`,
        href: '/pipeline',
      })
    }
    return next
  })
}

function deleteProspect({ workspaceId, prospectId, actorId }) {
  return mutate((db) => {
    const index = db.prospects.findIndex(
      (p) => p.id === prospectId && p.workspaceId === workspaceId
    )
    if (index === -1) {
      const err = new Error('Prospect not found')
      err.statusCode = 404
      throw err
    }
    const [removed] = db.prospects.splice(index, 1)
    db.comments = db.comments.filter((c) => c.prospectId !== prospectId)
    appendAudit(db, {
      workspaceId,
      userId: actorId,
      action: 'prospect.deleted',
      resource: 'prospect',
      resourceId: prospectId,
      details: { username: removed.username },
    })
    return { ok: true }
  })
}

function listComments(workspaceId, prospectId) {
  const db = readDb()
  return db.comments
    .filter((c) => c.workspaceId === workspaceId && c.prospectId === prospectId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .map((c) => ({
      ...c,
      author: sanitizeUser(db.users.find((u) => u.id === c.userId)),
    }))
}

function parseMentions(body, members) {
  const mentions = []
  const regex = /@([a-zA-Z0-9._-]+)/g
  let match
  while ((match = regex.exec(body)) !== null) {
    const handle = match[1].toLowerCase()
    const member = members.find(
      (m) =>
        m.user?.email?.split('@')[0]?.toLowerCase() === handle ||
        m.user?.name?.toLowerCase().replace(/\s+/g, '') === handle
    )
    if (member && !mentions.includes(member.userId)) {
      mentions.push(member.userId)
    }
  }
  return mentions
}

function addComment({ workspaceId, prospectId, userId, body }) {
  return mutate((db) => {
    const prospect = db.prospects.find(
      (p) => p.id === prospectId && p.workspaceId === workspaceId
    )
    if (!prospect) {
      const err = new Error('Prospect not found')
      err.statusCode = 404
      throw err
    }
    const members = listMembers(workspaceId)
    const mentions = parseMentions(body, members)
    const comment = {
      id: makeId(),
      workspaceId,
      prospectId,
      userId,
      body: body.trim(),
      mentions,
      createdAt: new Date().toISOString(),
    }
    db.comments.unshift(comment)
    appendAudit(db, {
      workspaceId,
      userId,
      action: 'comment.created',
      resource: 'comment',
      resourceId: comment.id,
      details: { prospectId, mentions },
    })
    for (const mentionedUserId of mentions) {
      if (mentionedUserId === userId) continue
      createNotification(db, {
        workspaceId,
        userId: mentionedUserId,
        type: 'mention',
        title: 'You were mentioned',
        body: body.slice(0, 120),
        href: '/pipeline',
      })
    }
    notifyWorkspace(db, workspaceId, userId, {
      type: 'comment',
      title: `Comment on @${prospect.username}`,
      body: body.slice(0, 120),
      href: '/pipeline',
    })
    return {
      ...comment,
      author: sanitizeUser(db.users.find((u) => u.id === userId)),
    }
  })
}

function listNotifications(workspaceId, userId) {
  const db = readDb()
  return db.notifications
    .filter((n) => n.workspaceId === workspaceId && n.userId === userId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 100)
}

function markNotificationRead(workspaceId, userId, notificationId) {
  return mutate((db) => {
    const notification = db.notifications.find(
      (n) => n.id === notificationId && n.workspaceId === workspaceId && n.userId === userId
    )
    if (!notification) {
      const err = new Error('Notification not found')
      err.statusCode = 404
      throw err
    }
    notification.read = true
    return notification
  })
}

function markAllNotificationsRead(workspaceId, userId) {
  return mutate((db) => {
    db.notifications.forEach((n) => {
      if (n.workspaceId === workspaceId && n.userId === userId) n.read = true
    })
    return { ok: true }
  })
}

function listAuditLogs(workspaceId, limit = 50) {
  const db = readDb()
  return db.auditLogs
    .filter((l) => l.workspaceId === workspaceId)
    .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
    .slice(0, limit)
    .map((l) => ({
      ...l,
      actor: sanitizeUser(db.users.find((u) => u.id === l.userId)),
    }))
}

function createNotification(db, { workspaceId, userId, type, title, body, href }) {
  db.notifications.unshift({
    id: makeId(),
    workspaceId,
    userId,
    type,
    title,
    body,
    href,
    read: false,
    createdAt: new Date().toISOString(),
  })
  db.notifications = db.notifications.slice(0, 500)
}

function notifyWorkspace(db, workspaceId, actorId, { type, title, body, href }) {
  const members = db.memberships.filter((m) => m.workspaceId === workspaceId)
  for (const member of members) {
    if (member.userId === actorId) continue
    createNotification(db, {
      workspaceId,
      userId: member.userId,
      type,
      title,
      body,
      href,
    })
  }
}

function appendAudit(db, { workspaceId, userId, action, resource, resourceId, details }) {
  db.auditLogs.unshift({
    id: makeId(),
    workspaceId,
    userId,
    action,
    resource,
    resourceId,
    details: details ?? {},
    at: new Date().toISOString(),
  })
  db.auditLogs = db.auditLogs.slice(0, 1000)
}

module.exports = {
  sanitizeUser,
  getUserByEmail,
  getUserById,
  createUser,
  getMembership,
  listWorkspacesForUser,
  createWorkspace,
  getWorkspace,
  listMembers,
  inviteMember,
  updateMemberRole,
  removeMember,
  listProspects,
  addProspect,
  upsertImportedProspects,
  updateProspect,
  deleteProspect,
  listComments,
  addComment,
  listNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  listAuditLogs,
}
