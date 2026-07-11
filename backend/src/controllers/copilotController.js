const { streamOpenAI, APP_CONTEXT } = require('../services/copilotService')

function createCopilotController() {
  return {
    async stream(req, res, next) {
      try {
        const { task, system, prompt, history } = req.body || {}
        if (!prompt || typeof prompt !== 'string') {
          return res.status(400).json({ error: 'Prompt is required' })
        }

        const apiKey = process.env.OPENAI_API_KEY?.trim()
        if (!apiKey) {
          return res.status(503).json({
            error: 'OpenAI not configured',
            fallback: true,
            task: task || 'unknown',
          })
        }

        res.setHeader('Content-Type', 'text/event-stream')
        res.setHeader('Cache-Control', 'no-cache')
        res.setHeader('Connection', 'keep-alive')
        res.flushHeaders?.()

        await streamOpenAI(
          system || APP_CONTEXT,
          prompt,
          history,
          apiKey,
          (chunk) => {
            res.write(`data: ${JSON.stringify({ content: chunk })}\n\n`)
          }
        )

        res.write('data: [DONE]\n\n')
        res.end()
      } catch (err) {
        if (!res.headersSent) {
          next(err)
        } else {
          res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`)
          res.end()
        }
      }
    },
  }
}

module.exports = { createCopilotController }
