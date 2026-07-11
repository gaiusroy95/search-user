const express = require('express')

function registerAuthRoutes(app, authController, authMiddleware) {
  const router = express.Router()
  router.post('/auth/register', authController.register)
  router.post('/auth/login', authController.login)
  router.get('/auth/me', authMiddleware, authController.me)
  app.use(router)
}

module.exports = registerAuthRoutes
