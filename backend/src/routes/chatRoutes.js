const express = require('express')

function registerChatRoutes(app, chatController) {
  const router = express.Router()
  router.post('/chat', chatController.sendMessage)
  app.use(router)
}

module.exports = registerChatRoutes
