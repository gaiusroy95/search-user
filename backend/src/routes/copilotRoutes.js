const express = require('express')

function registerCopilotRoutes(app, copilotController) {
  const router = express.Router()
  router.post('/copilot/stream', copilotController.stream)
  app.use(router)
}

module.exports = registerCopilotRoutes
