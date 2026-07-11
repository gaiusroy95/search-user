const { hashPassword, verifyPassword, signToken } = require('../services/authService')
const {
  createUser,
  getUserByEmail,
  getUserById,
  sanitizeUser,
  listWorkspacesForUser,
  createWorkspace,
} = require('../services/collaborationStore')

function createAuthController() {
  return {
    async register(req, res, next) {
      try {
        const { email, name, password } = req.body || {}
        if (!email?.trim() || !name?.trim() || !password || password.length < 6) {
          return res.status(400).json({ error: 'Email, name, and password (min 6) required' })
        }
        const user = createUser({
          email,
          name,
          passwordHash: hashPassword(password),
        })
        const workspace = createWorkspace({
          name: `${name.split(' ')[0]}'s Team`,
          ownerId: user.id,
        })
        const token = signToken({ userId: user.id })
        res.status(201).json({
          token,
          user,
          workspace,
          workspaces: listWorkspacesForUser(user.id),
        })
      } catch (err) {
        next(err)
      }
    },

    async login(req, res, next) {
      try {
        const { email, password } = req.body || {}
        if (!email?.trim() || !password) {
          return res.status(400).json({ error: 'Email and password required' })
        }
        const user = getUserByEmail(email)
        if (!user || !verifyPassword(password, user.passwordHash)) {
          return res.status(401).json({ error: 'Invalid credentials' })
        }
        const token = signToken({ userId: user.id })
        res.json({
          token,
          user: sanitizeUser(user),
          workspaces: listWorkspacesForUser(user.id),
        })
      } catch (err) {
        next(err)
      }
    },

    me(req, res, next) {
      try {
        const user = sanitizeUser(getUserById(req.user.id))
        if (!user) return res.status(404).json({ error: 'User not found' })
        res.json({
          user,
          workspaces: listWorkspacesForUser(req.user.id),
        })
      } catch (err) {
        next(err)
      }
    },
  }
}

module.exports = { createAuthController }
