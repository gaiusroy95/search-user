const { chat } = require('../services/chatService')

function createChatController() {
  return {
    async sendMessage(req, res, next) {
      try {
        const { message, history, page } = req.body || {}
        if (!message || typeof message !== 'string' || !message.trim()) {
          return res.status(400).json({ error: 'Message is required' })
        }
        const result = await chat({
          message: message.trim(),
          history: Array.isArray(history) ? history : [],
          page: page || 'discovery',
        })
        res.json(result)
      } catch (err) {
        next(err)
      }
    },
  }
}

module.exports = { createChatController }
