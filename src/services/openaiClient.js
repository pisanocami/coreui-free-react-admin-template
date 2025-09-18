// Simple OpenAI client for browser use (warning: exposing API keys in frontend is insecure)
// This is intended for development/testing. For production, route requests via a backend proxy.

const STORAGE_KEY = 'openai_api_token'

export function setOpenAIToken(token) {
  if (typeof token === 'string') {
    localStorage.setItem(STORAGE_KEY, token.trim())
  }
}

export function getOpenAIToken() {
  return localStorage.getItem(STORAGE_KEY) || ''
}

function getAuthHeaders() {
  const key = getOpenAIToken()
  if (!key) throw new Error('Falta el token de OpenAI. Configúralo en Perfil > OpenAI.')
  return {
    Authorization: `Bearer ${key}`,
    'Content-Type': 'application/json',
  }
}

// Quick health check: create a tiny response using a small model
export async function testOpenAIConnection() {
  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are a concise assistant.' },
          { role: 'user', content: 'Say "pong"' },
        ],
        max_tokens: 10,
        temperature: 0,
      }),
    })

    if (!res.ok) {
      const text = await res.text()
      throw new Error(`Error HTTP ${res.status}: ${text}`)
    }

    const data = await res.json()
    const msg = data?.choices?.[0]?.message?.content || ''
    return { ok: true, message: msg }
  } catch (err) {
    // Common issue: CORS blocked by OpenAI when called from browser
    return { ok: false, error: err.message || String(err) }
  }
}

// Generic chat helper
export async function chat(messages, options = {}) {
  const payload = {
    model: options.model || 'gpt-4o-mini',
    messages,
    temperature: options.temperature ?? 0.5,
    max_tokens: options.max_tokens ?? 512,
  }
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`OpenAI error ${res.status}: ${text}`)
  }
  const data = await res.json()
  return data?.choices?.[0]?.message?.content ?? ''
}
