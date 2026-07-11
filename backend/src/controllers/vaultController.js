const { readVault, writeVault, verifyPassword } = require('../services/vaultService')
const { AppError } = require('../utils/errors')

function createVaultController() {
  return {
    getVault(req, res, next) {
      try {
        const password = req.headers['x-vault-password'] || req.query.password
        if (!verifyPassword(password)) {
          throw new AppError('Invalid vault password', 401)
        }
        const vault = readVault()
        res.json(vault)
      } catch (err) {
        next(err)
      }
    },

    saveVault(req, res, next) {
      try {
        const { password, categories, records } = req.body || {}
        if (!verifyPassword(password)) {
          throw new AppError('Invalid vault password', 401)
        }
        const saved = writeVault({ categories, records })
        res.json({
          ok: true,
          categories: saved.categories,
          records: saved.records,
          updatedAt: saved.updatedAt,
        })
      } catch (err) {
        next(err)
      }
    },
  }
}

module.exports = { createVaultController }
