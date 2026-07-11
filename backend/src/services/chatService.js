const APP_CONTEXT = `You are the in-app assistant for "GitHub Developer Discovery Platform".
Help users understand features: Discovery search, developer badges/levels, sort/filter, copy contact info, Prospects kanban, Analytics, Saved Data vault (password-protected, synced to server), User Lookup.
Keep answers concise, friendly, and actionable.`

const KNOWLEDGE = [
  {
    keys: ['badge', 'level', 'bronze', 'silver', 'gold', 'platinum', 'score'],
    answer:
      'Developer badges and levels are based on a contact score (0-100). Open a developer drawer for the full analysis panel.',
  },
  {
    keys: ['saved', 'vault', 'password', 'sync'],
    answer:
      'Saved Data is password-protected and syncs to the server. Use Sync now after switching browsers.',
  },
  {
    keys: ['search', 'discovery', 'country', 'find'],
    answer:
      'Pick a country and optional filters on Discovery, then click Search Developers.',
  },
]

function matchKnowledge(message) {
  const lower = message.toLowerCase()
  for (const item of KNOWLEDGE) {
    if (item.keys.some((k) => lower.includes(k))) {
      return item.answer
    }
  }
  return null
}

function defaultAnswer(page) {
  return `I'm your platform guide. Ask about badges, search, filters, prospects, or saved data. (Page: ${page || 'discovery'})`
}

async function askOpenAI(messages, apiKey) {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: [{ role: 'system', content: APP_CONTEXT }, ...messages],
      max_tokens: 600,
      temperature: 0.4,
    }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error?.message || `OpenAI error ${res.status}`)
  }

  const data = await res.json()
  return data.choices?.[0]?.message?.content?.trim() || 'No response.'
}

async function chat({ message, history, page }) {
  const apiKey = process.env.OPENAI_API_KEY?.trim()

  if (apiKey) {
    const messages = [
      ...(history || []).slice(-8).map((m) => ({
        role: m.role,
        content: m.content,
      })),
      {
        role: 'user',
        content: `[Current page: ${page || 'discovery'}]\n${message}`,
      },
    ]
    return { reply: await askOpenAI(messages, apiKey), source: 'openai' }
  }

  const kb = matchKnowledge(message)
  return {
    reply: kb || defaultAnswer(page),
    source: kb ? 'knowledge' : 'guide',
  }
}

module.exports = { chat }
