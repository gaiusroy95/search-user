const express = require('express')

function registerVaultRoutes(app, vaultController) {
  const router = express.Router()
  router.get('/vault', vaultController.getVault)
  router.put('/vault', vaultController.saveVault)
  app.use(router)
}

module.exports = registerVaultRoutes
