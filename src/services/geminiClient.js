// Simple Gemini client for browser use (warning: exposing API keys in frontend is insecure)
// This is intended for development/testing. For production, use a backend proxy.

const STORAGE_KEY = 'gemini_api_token'

export function setGeminiToken(token) {
  if (typeof token === 'string') {
    localStorage.setItem(STORAGE_KEY, token.trim())
  }
}

export function getGeminiToken() {
  return localStorage.getItem(STORAGE_KEY) || ''
}

function getKeyOrThrow() {
  const key = getGeminiToken()
  if (!key) throw new Error('Falta el token de Gemini. Configúralo en Perfil > API Provider: Gemini.')
  return key
}

// Health check using Gemini generateContent endpoint
export async function testGeminiConnection() {
  try {
    const key = getKeyOrThrow()
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${encodeURIComponent(key)}`
    const body = {
      contents: [
        {
          role: 'user',
          parts: [{ text: 'Say "pong"' }],
        },
      ],
    }
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    if (!res.ok) {
      const text = await res.text()
      throw new Error(`Error HTTP ${res.status}: ${text}`)
    }
    const data = await res.json()
    const msg = data?.candidates?.[0]?.content?.parts?.[0]?.text || ''
    return { ok: true, message: msg }
  } catch (err) {
    return { ok: false, error: err.message || String(err) }
  }
}

export async function chat(messages, options = {}) {
  const key = getKeyOrThrow()
  const model = options.model || 'gemini-1.5-flash'
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(key)}`

  // Convert OpenAI-like messages to Gemini contents
  const contents = []
  for (const m of messages) {
    if (!m || !m.role) continue
    contents.push({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content || '' }] })
  }

  const body = { contents }
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Gemini error ${res.status}: ${text}`)
  }
  const data = await res.json()
  return data?.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
}
