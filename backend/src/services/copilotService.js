const APP_CONTEXT = `You are an expert technical recruiting copilot embedded in a GitHub developer discovery platform.
Use only the workspace data in the user prompt. Be specific, actionable, and concise.
Use markdown headings and bullet points. Never invent emails or facts not in the data.`

async function streamOpenAI(system, userPrompt, history, apiKey, onChunk) {
  const messages = [
    { role: 'system', content: system || APP_CONTEXT },
    ...(history || []).slice(-6).map((m) => ({ role: m.role, content: m.content })),
    { role: 'user', content: userPrompt },
  ]

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages,
      max_tokens: 1200,
      temperature: 0.35,
      stream: true,
    }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error?.message || `OpenAI error ${res.status}`)
  }

  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() ?? ''

    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed.startsWith('data: ')) continue
      const data = trimmed.slice(6)
      if (data === '[DONE]') return
      try {
        const parsed = JSON.parse(data)
        const content = parsed.choices?.[0]?.delta?.content
        if (content) onChunk(content)
      } catch {
        // ignore parse errors on partial SSE
      }
    }
  }
}

async function generateCopilot({ system, prompt, history }) {
  const apiKey = process.env.OPENAI_API_KEY?.trim()
  if (!apiKey) {
    const err = new Error('OpenAI not configured')
    err.code = 'NO_OPENAI'
    throw err
  }

  let content = ''
  await streamOpenAI(system, prompt, history, apiKey, (chunk) => {
    content += chunk
  })
  return content
}

module.exports = { generateCopilot, streamOpenAI, APP_CONTEXT }
