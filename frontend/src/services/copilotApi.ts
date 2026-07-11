import type { CopilotMessageRole, CopilotTask } from '@/lib/ai/types'

export interface CopilotStreamRequest {
  task: CopilotTask
  system: string
  prompt: string
  history: Array<{ role: CopilotMessageRole; content: string }>
}

export async function* streamCopilotFromApi(
  request: CopilotStreamRequest
): AsyncGenerator<string> {
  const response = await fetch('/api/copilot/stream', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  })

  if (!response.ok) {
    throw new Error(`Copilot stream failed (${response.status})`)
  }

  const contentType = response.headers.get('content-type') ?? ''
  if (!contentType.includes('text/event-stream') || !response.body) {
    const data = (await response.json()) as { content?: string }
    if (data.content) {
      yield data.content
      return
    }
    throw new Error('Invalid copilot response')
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() ?? ''

    for (const line of lines) {
      if (!line.startsWith('data: ')) continue
      const payload = line.slice(6).trim()
      if (payload === '[DONE]') return
      try {
        const parsed = JSON.parse(payload) as { content?: string }
        if (parsed.content) yield parsed.content
      } catch {
        if (payload) yield payload
      }
    }
  }
}
