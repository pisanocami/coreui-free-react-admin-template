// Provider-agnostic helpers to manage AI provider selection and tokens in localStorage
// For production, do not expose API keys in the frontend. Use a backend proxy.

import { getOpenAIToken, setOpenAIToken, testOpenAIConnection, chat as openaiChat } from './openaiClient'
import { getGeminiToken, setGeminiToken, testGeminiConnection, chat as geminiChat } from './geminiClient'

const PROVIDER_STORAGE_KEY = 'ai_provider_selected'

export const Providers = {
  OpenAI: 'openai',
  Gemini: 'gemini',
}

export function getCurrentProvider() {
  const v = localStorage.getItem(PROVIDER_STORAGE_KEY)
  return v === Providers.Gemini ? Providers.Gemini : Providers.OpenAI
}

export function setCurrentProvider(provider) {
  if (provider !== Providers.OpenAI && provider !== Providers.Gemini) return
  localStorage.setItem(PROVIDER_STORAGE_KEY, provider)
}

export function getToken(provider = getCurrentProvider()) {
  return provider === Providers.Gemini ? getGeminiToken() : getOpenAIToken()
}

export function setToken(token, provider = getCurrentProvider()) {
  if (provider === Providers.Gemini) return setGeminiToken(token)
  return setOpenAIToken(token)
}

export async function testConnection(provider = getCurrentProvider()) {
  return provider === Providers.Gemini ? testGeminiConnection() : testOpenAIConnection()
}

export async function chat(messages, options = {}) {
  const provider = options.provider || getCurrentProvider()
  if (provider === Providers.Gemini) {
    return geminiChat(messages, options)
  }
  return openaiChat(messages, options)
}
