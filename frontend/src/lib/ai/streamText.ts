const DEFAULT_CHUNK_SIZE = 24
const DEFAULT_DELAY_MS = 12

export async function* simulateTextStream(
  text: string,
  chunkSize = DEFAULT_CHUNK_SIZE,
  delayMs = DEFAULT_DELAY_MS
): AsyncGenerator<string> {
  let index = 0
  while (index < text.length) {
    const chunk = text.slice(index, index + chunkSize)
    index += chunkSize
    yield chunk
    if (delayMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, delayMs))
    }
  }
}

export async function consumeStream(
  stream: AsyncGenerator<string>,
  onChunk: (accumulated: string) => void
): Promise<string> {
  let accumulated = ''
  for await (const chunk of stream) {
    accumulated += chunk
    onChunk(accumulated)
  }
  return accumulated
}
