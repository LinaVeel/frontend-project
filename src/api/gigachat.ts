import type { Message, ModelName } from '../app/providers/chatTypes'

export type ChatCompletionParams = {
  accessToken: string
  model: ModelName
  temperature: number
  topP: number
  maxTokens: number
  repetitionPenalty: number
  messages: Array<Pick<Message, 'role' | 'content'>>
  signal?: AbortSignal
}

type OAuthTokenResponse = {
  access_token?: string
  accessToken?: string
}

function extractErrorMessage(payload: unknown): string {
  if (!payload) return ''
  if (typeof payload === 'string') return payload
  if (typeof payload !== 'object') return ''

  const anyPayload = payload as any
  if (typeof anyPayload.message === 'string') return anyPayload.message
  if (anyPayload.error) {
    const nested = extractErrorMessage(anyPayload.error)
    if (nested) return nested
  }
  if (typeof anyPayload.error_description === 'string') return anyPayload.error_description
  if (typeof anyPayload.detail === 'string') return anyPayload.detail
  return ''
}

async function responseErrorMessage(res: Response): Promise<string> {
  try {
    const contentType = (res.headers.get('content-type') || '').toLowerCase()
    if (contentType.includes('application/json')) {
      const data = (await res.json()) as unknown
      const msg = extractErrorMessage(data)
      if (msg) return msg
      return JSON.stringify(data)
    }

    const text = await res.text().catch(() => '')
    const trimmed = text.trim()
    if (!trimmed) return ''

    try {
      const data = JSON.parse(trimmed) as unknown
      const msg = extractErrorMessage(data)
      if (msg) return msg
      return trimmed
    } catch {
      return trimmed
    }
  } catch {
    return ''
  }
}

function maybeAddEnvHint(message: string): string {
  if (!message) return message
  if (!/OPENAI_API_KEY/i.test(message)) return message
  return `${message}\n\nПохоже, VITE_GIGACHAT_BASE_URL указывает на OpenAI-proxy/backend. Проверьте переменные окружения или смените base URL на официальный GigaChat.`
}

async function throwHttpError(res: Response, context: string): Promise<never> {
  const msg = await responseErrorMessage(res)
  const base = msg || `HTTP ${res.status}`
  throw new Error(maybeAddEnvHint(`${context}: ${base}`))
}

function getApiBaseUrl() {
  const env = import.meta.env as Record<string, string | undefined>
  const raw = env.VITE_GIGACHAT_BASE_URL
  const fallback = 'https://gigachat.devices.sberbank.ru/api/v1'
  const value = (raw && raw.trim()) || ''
  const isDev = Boolean((import.meta.env as any).DEV)
  if (!value) {
    // In dev we use same-origin URL to go through Vite proxy and avoid CORS.
    return isDev ? '/api/v1' : fallback
  }

  // Allow relative base URLs in dev (for Vite proxy).
  if (isDev && value.startsWith('/')) return value

  try {
    const url = new URL(value)
    const host = url.hostname.toLowerCase()

    // Если пользователь хочет работать без отдельного backend/proxy,
    // игнорируем base URL, который не указывает на официальный GigaChat.
    if (host !== 'gigachat.devices.sberbank.ru') return fallback
    return value
  } catch {
    return fallback
  }
}

function getOAuthUrl() {
  const env = import.meta.env as Record<string, string | undefined>
  const raw = env.VITE_GIGACHAT_OAUTH_URL
  const isDev = Boolean((import.meta.env as any).DEV)
  if (raw && raw.trim()) return raw.trim()
  // In dev we proxy OAuth via Vite to avoid CORS.
  return isDev ? '/oauth' : ''
}

function makeRqUid() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return `${Date.now()}_${Math.random().toString(16).slice(2)}`
}

export async function fetchAccessToken(params: {
  credentialsBase64: string
  scope: string
  signal?: AbortSignal
}): Promise<string> {
  const oauthUrl = getOAuthUrl()
  if (!oauthUrl) {
    throw new Error('VITE_GIGACHAT_OAUTH_URL не задан')
  }

  const body = new URLSearchParams({
    grant_type: 'client_credentials',
    scope: params.scope,
  })

  let res: Response
  try {
    res = await fetch(oauthUrl, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${params.credentialsBase64}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: 'application/json',
        RqUID: makeRqUid(),
      },
      body,
      signal: params.signal,
    })
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    if (/failed to fetch/i.test(msg)) {
      throw new Error('Не удалось выполнить запрос (возможен CORS/сеть). Если API недоступен из браузера, нужен прокси на dev-сервере.')
    }
    throw e
  }

  if (!res.ok) {
    await throwHttpError(res, 'OAuth')
  }

  const data = (await res.json()) as OAuthTokenResponse
  const token = (data.access_token || data.accessToken || '').trim()
  if (!token) {
    throw new Error('Не удалось получить access_token')
  }

  return token
}

function getChatCompletionsUrl() {
  const base = getApiBaseUrl().replace(/\/+$/, '')
  return `${base}/chat/completions`
}

function extractDelta(data: unknown): string {
  if (!data || typeof data !== 'object') return ''
  const anyData = data as any

  const choice = Array.isArray(anyData.choices) ? anyData.choices[0] : undefined
  if (!choice || typeof choice !== 'object') return ''

  const delta = choice.delta
  if (delta && typeof delta === 'object' && typeof delta.content === 'string') return delta.content

  const message = choice.message
  if (message && typeof message === 'object' && typeof message.content === 'string') return message.content

  const text = choice.text
  if (typeof text === 'string') return text

  return ''
}

function parseSseEvents(chunk: string): string[] {
  const events: string[] = []
  const parts = chunk.split(/\n\n/)
  for (const part of parts) {
    const lines = part.split(/\n/)
    const dataLines = lines
      .map((l) => l.trimEnd())
      .filter((l) => l.startsWith('data:'))
      .map((l) => l.slice('data:'.length).trim())

    if (dataLines.length === 0) continue
    events.push(dataLines.join('\n'))
  }
  return events
}

export async function streamChatCompletion(
  params: ChatCompletionParams,
  onDelta: (delta: string) => void,
): Promise<void> {
  let res: Response
  try {
    res = await fetch(getChatCompletionsUrl(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${params.accessToken}`,
      },
      body: JSON.stringify({
        model: params.model,
        temperature: params.temperature,
        top_p: params.topP,
        max_tokens: params.maxTokens,
        repetition_penalty: params.repetitionPenalty,
        stream: true,
        messages: params.messages,
      }),
      signal: params.signal,
    })
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    if (/failed to fetch/i.test(msg)) {
      throw new Error('Не удалось выполнить запрос (возможен CORS/сеть). Если API недоступен из браузера, нужен прокси на dev-сервере.')
    }
    throw e
  }

  if (!res.ok) {
    await throwHttpError(res, 'ChatCompletions(stream)')
  }

  if (!res.body) {
    throw new Error('Streaming не поддерживается: отсутствует body')
  }

  const reader = res.body.getReader()
  const decoder = new TextDecoder('utf-8')

  let buffer = ''
  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })
    const lastEventBreak = buffer.lastIndexOf('\n\n')
    if (lastEventBreak === -1) continue

    const complete = buffer.slice(0, lastEventBreak)
    buffer = buffer.slice(lastEventBreak + 2)

    for (const dataLine of parseSseEvents(complete)) {
      if (dataLine === '[DONE]') return
      const payload = JSON.parse(dataLine) as unknown
      const delta = extractDelta(payload)
      if (delta) onDelta(delta)
    }
  }
}

export async function chatCompletion(params: ChatCompletionParams): Promise<string> {
  let res: Response
  try {
    res = await fetch(getChatCompletionsUrl(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${params.accessToken}`,
      },
      body: JSON.stringify({
        model: params.model,
        temperature: params.temperature,
        top_p: params.topP,
        max_tokens: params.maxTokens,
        repetition_penalty: params.repetitionPenalty,
        stream: false,
        messages: params.messages,
      }),
      signal: params.signal,
    })
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    if (/failed to fetch/i.test(msg)) {
      throw new Error('Не удалось выполнить запрос (возможен CORS/сеть). Если API недоступен из браузера, нужен прокси на dev-сервере.')
    }
    throw e
  }

  if (!res.ok) {
    await throwHttpError(res, 'ChatCompletions')
  }

  const data = (await res.json()) as unknown
  const content = extractDelta(data)
  if (content) return content

  return ''
}
