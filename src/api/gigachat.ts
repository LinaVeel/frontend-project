import type { Message, ModelName } from '../app/providers/chatTypes'

export type ChatCompletionParams = {
  accessToken: string
  model: ModelName
  temperature: number
  topP: number
  maxTokens: number
  messages: Array<Pick<Message, 'role' | 'content'>>
  signal?: AbortSignal
}

type OAuthTokenResponse = {
  access_token?: string
  accessToken?: string
}

function getApiBaseUrl() {
  const env = import.meta.env as Record<string, string | undefined>
  const raw = env.VITE_GIGACHAT_BASE_URL
  return (raw && raw.trim()) || 'https://gigachat.devices.sberbank.ru/api/v1'
}

function getOAuthUrl() {
  const env = import.meta.env as Record<string, string | undefined>
  const raw = env.VITE_GIGACHAT_OAUTH_URL
  return raw && raw.trim() ? raw.trim() : ''
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

  const res = await fetch(oauthUrl, {
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

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(text || `HTTP ${res.status}`)
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
  const res = await fetch(getChatCompletionsUrl(), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${params.accessToken}`,
    },
    body: JSON.stringify({
      model: params.model,
      temperature: params.temperature,
      top_p: params.topP,
      max_tokens: params.maxTokens,
      stream: true,
      messages: params.messages,
    }),
    signal: params.signal,
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(text || `HTTP ${res.status}`)
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
  const res = await fetch(getChatCompletionsUrl(), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${params.accessToken}`,
    },
    body: JSON.stringify({
      model: params.model,
      temperature: params.temperature,
      top_p: params.topP,
      max_tokens: params.maxTokens,
      stream: false,
      messages: params.messages,
    }),
    signal: params.signal,
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(text || `HTTP ${res.status}`)
  }

  const data = (await res.json()) as unknown
  const content = extractDelta(data)
  if (content) return content

  return ''
}
