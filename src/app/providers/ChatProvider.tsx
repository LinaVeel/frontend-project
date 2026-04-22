import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef, useState } from 'react'
import { chatCompletion, fetchAccessToken, streamChatCompletion } from '../../api/gigachat'
import { loadFromStorage, saveToStorage, loadVersioned, saveVersioned } from '../../utils/storage'
import type { Chat, ChatAction, ChatState, Message, ScopeName, Settings } from './chatTypes'
import { DEFAULT_SETTINGS } from './chatTypes'

const STORAGE_KEY = 'gigachat_shell_state'
const AUTH_KEY = 'gigachat_shell_auth_v1'

type Env = Record<string, string | boolean | undefined>

function getEnv(): Env {
  return import.meta.env as unknown as Env
}

function envString(name: string): string {
  const v = getEnv()[name]
  return typeof v === 'string' ? v.trim() : ''
}

function envScope(): ScopeName {
  const raw = envString('VITE_GIGACHAT_SCOPE')
  if (raw === 'GIGACHAT_API_B2B' || raw === 'GIGACHAT_API_CORP' || raw === 'GIGACHAT_API_PERS') {
    return raw
  }
  return 'GIGACHAT_API_PERS'
}

type PersistedState = {
  chats: Chat[]
  activeChatId: string | null
  messagesByChatId: Record<string, Message[]>
  settings: Settings
}

type RuntimeAuth =
  | { kind: 'token'; token: string }
  | { kind: 'basic'; credentialsBase64: string; scope: ScopeName }
  | null

function isBase64Like(value: string): boolean {
  const v = value.trim()
  if (!v) return false
  if (v.length < 16) return false
  if (v.length % 4 !== 0) return false
  return /^[A-Za-z0-9+/=]+$/.test(v)
}

function normalizeRuntimeAuth(raw: unknown): RuntimeAuth {
  if (!raw || typeof raw !== 'object') return null
  const anyRaw = raw as any
  if (anyRaw.kind === 'token' && typeof anyRaw.token === 'string' && anyRaw.token.trim()) {
    return { kind: 'token', token: anyRaw.token.trim() }
  }
  if (
    anyRaw.kind === 'basic' &&
    typeof anyRaw.credentialsBase64 === 'string' &&
    anyRaw.credentialsBase64.trim() &&
    (anyRaw.scope === 'GIGACHAT_API_PERS' || anyRaw.scope === 'GIGACHAT_API_B2B' || anyRaw.scope === 'GIGACHAT_API_CORP')
  ) {
    return { kind: 'basic', credentialsBase64: anyRaw.credentialsBase64.trim(), scope: anyRaw.scope }
  }
  return null
}

function envHasAuth(): boolean {
  const token = envString('VITE_GIGACHAT_ACCESS_TOKEN').replace(/^Bearer\s+/i, '').trim()
  if (token) return true
  const credentialsBase64 = envString('VITE_GIGACHAT_CREDENTIALS_BASE64')
  return Boolean(credentialsBase64)
}

function makeId(prefix: string) {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `${prefix}_${crypto.randomUUID()}`
  }
  return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}`
}

function nowIso() {
  return new Date().toISOString()
}

function defaultChatTitle(index: number) {
  if (index === 1) return 'Новый чат'
  return `Диалог ${index}`
}

function normalizeSettings(input: unknown): Settings {
  const base: Settings = { ...DEFAULT_SETTINGS }
  if (!input || typeof input !== 'object') return base
  const anyInput = input as Partial<Record<keyof Settings, unknown>>

  const model = anyInput.model
  if (model === 'GigaChat' || model === 'GigaChat-Plus' || model === 'GigaChat-Pro' || model === 'GigaChat-Max') {
    base.model = model
  }

  const theme = anyInput.theme
  if (theme === 'light' || theme === 'dark') base.theme = theme

  if (typeof anyInput.systemPrompt === 'string') base.systemPrompt = anyInput.systemPrompt

  const toNumber = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) ? v : undefined)
  base.temperature = toNumber(anyInput.temperature) ?? base.temperature
  base.topP = toNumber(anyInput.topP) ?? base.topP
  base.maxTokens = toNumber(anyInput.maxTokens) ?? base.maxTokens
  base.repetitionPenalty = toNumber(anyInput.repetitionPenalty) ?? base.repetitionPenalty

  return base
}

function normalizeState(persisted: PersistedState | null): ChatState {
  const baseChats = persisted?.chats ?? []
  const baseMessagesByChatId = persisted?.messagesByChatId ?? {}

  const chats = baseChats.length
    ? baseChats
    : [
        {
          id: makeId('c'),
          title: defaultChatTitle(1),
          createdAt: nowIso(),
          updatedAt: nowIso(),
          isTitleAuto: true,
        },
      ]

  const activeChatId = persisted?.activeChatId && chats.some((c) => c.id === persisted.activeChatId)
    ? persisted.activeChatId
    : chats[0]?.id ?? null

  const messagesByChatId: Record<string, Message[]> = {}
  for (const chat of chats) {
    messagesByChatId[chat.id] = Array.isArray(baseMessagesByChatId[chat.id]) ? baseMessagesByChatId[chat.id]! : []
  }

  return {
    chats,
    activeChatId,
    messagesByChatId,
    isLoadingByChatId: {},
    errorByChatId: {},
    settings: normalizeSettings(persisted?.settings),
  }
}

function isAutoTitle(title: string) {
  const t = title.trim().toLowerCase()
  return t === 'новый чат' || t.startsWith('диалог ')
}

function generateTitleFromFirstMessage(content: string): string | null {
  const trimmed = content.trim().replace(/\s+/g, ' ')
  if (!trimmed) return null
  if (trimmed.length < 4) return null
  const maxLen = 40
  return trimmed.length > maxLen ? `${trimmed.slice(0, maxLen).trim()}…` : trimmed
}

function reducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case 'INIT_STATE': {
      return action.payload
    }

    case 'SET_ACTIVE_CHAT': {
      return {
        ...state,
        activeChatId: action.payload.chatId,
      }
    }

    case 'CREATE_CHAT': {
      const chats = [action.payload.chat, ...state.chats]
      return {
        ...state,
        chats,
        activeChatId: action.payload.chat.id,
        messagesByChatId: {
          ...state.messagesByChatId,
          [action.payload.chat.id]: [],
        },
      }
    }

    case 'RENAME_CHAT': {
      const ts = nowIso()
      return {
        ...state,
        chats: state.chats.map((c) =>
          c.id === action.payload.chatId
            ? { ...c, title: action.payload.title, updatedAt: ts, isTitleAuto: false }
            : c,
        ),
      }
    }

    case 'DELETE_CHAT': {
      const { chatId } = action.payload
      const nextChats = state.chats.filter((c) => c.id !== chatId)
      const nextActiveChatId = state.activeChatId === chatId ? nextChats[0]?.id ?? null : state.activeChatId

      const { [chatId]: _m, ...restMessages } = state.messagesByChatId
      const { [chatId]: _l, ...restLoading } = state.isLoadingByChatId
      const { [chatId]: _e, ...restErrors } = state.errorByChatId

      return {
        ...state,
        chats: nextChats,
        activeChatId: nextActiveChatId,
        messagesByChatId: restMessages,
        isLoadingByChatId: restLoading,
        errorByChatId: restErrors,
      }
    }

    case 'ADD_MESSAGE': {
      const { message } = action.payload
      const prevMessages = state.messagesByChatId[message.chatId] ?? []

      const nextMessagesByChatId = {
        ...state.messagesByChatId,
        [message.chatId]: [...prevMessages, message],
      }

      const ts = nowIso()
      const isFirstUserMessage = message.role === 'user' && prevMessages.every((m) => m.role !== 'user')

      const chats = state.chats.map((c) => {
        if (c.id !== message.chatId) return c

        let title = c.title
        let isTitleAuto = c.isTitleAuto

        if (isFirstUserMessage && c.isTitleAuto && isAutoTitle(c.title)) {
          const generated = generateTitleFromFirstMessage(message.content)
          if (generated) {
            title = generated
            isTitleAuto = true
          }
        }

        return { ...c, title, updatedAt: ts, isTitleAuto }
      })

      return {
        ...state,
        messagesByChatId: nextMessagesByChatId,
        chats,
      }
    }

    case 'UPDATE_MESSAGE': {
      const { chatId, messageId, content } = action.payload
      const prev = state.messagesByChatId[chatId] ?? []
      const next = prev.map((m) => (m.id === messageId ? { ...m, content } : m))
      return {
        ...state,
        messagesByChatId: {
          ...state.messagesByChatId,
          [chatId]: next,
        },
      }
    }

    case 'SET_LOADING': {
      const { chatId, isLoading } = action.payload
      return {
        ...state,
        isLoadingByChatId: {
          ...state.isLoadingByChatId,
          [chatId]: isLoading,
        },
      }
    }

    case 'SET_ERROR': {
      const { chatId, error } = action.payload
      return {
        ...state,
        errorByChatId: {
          ...state.errorByChatId,
          [chatId]: error,
        },
      }
    }

    case 'SET_SETTINGS': {
      return {
        ...state,
        settings: action.payload.settings,
      }
    }

    default:
      return state
  }
}

type ChatContextValue = {
  state: ChatState
  createChat: () => string
  setActiveChat: (chatId: string) => void
  renameChat: (chatId: string, title: string) => void
  deleteChat: (chatId: string) => void

  setSettings: (settings: Settings) => void
  resetSettings: () => void

  hasAuth: boolean
  setAuth: (params: { credentials: string; scope: ScopeName }) => void
  clearAuth: () => void

  sendMessage: (text: string) => Promise<void>
  retryLast: () => Promise<void>
  stop: () => void
}

const ChatContext = createContext<ChatContextValue | null>(null)

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, () => {
    const persisted = loadVersioned<PersistedState>(STORAGE_KEY)
    return normalizeState(persisted)
  })

  const [runtimeAuth, setRuntimeAuth] = useState<RuntimeAuth>(() => {
    const saved = loadFromStorage<unknown>(AUTH_KEY)
    return normalizeRuntimeAuth(saved)
  })

  const abortRef = useRef<AbortController | null>(null)
  const accessTokenRef = useRef<string | null>(null)
  const lastRequestRef = useRef<{
    chatId: string
    assistantMessageId: string
    messages: Array<Pick<Message, 'role' | 'content'>>
  } | null>(null)

  const getAccessToken = useCallback(
    async (signal?: AbortSignal): Promise<string> => {
      const envToken = envString('VITE_GIGACHAT_ACCESS_TOKEN').replace(/^Bearer\s+/i, '').trim()
      if (envToken) return envToken

      if (runtimeAuth?.kind === 'token') return runtimeAuth.token

      if (accessTokenRef.current) return accessTokenRef.current

      const envCredentialsBase64 = envString('VITE_GIGACHAT_CREDENTIALS_BASE64')
      const runtimeCredentialsBase64 = runtimeAuth?.kind === 'basic' ? runtimeAuth.credentialsBase64 : ''
      const credentialsBase64 = envCredentialsBase64 || runtimeCredentialsBase64

      if (!credentialsBase64) {
        throw new Error('Не задан токен/credentials для GigaChat. Укажите VITE_GIGACHAT_ACCESS_TOKEN или введите данные в форме входа.')
      }

      const scope = runtimeAuth?.kind === 'basic' ? runtimeAuth.scope : envScope()
      const token = await fetchAccessToken({
        credentialsBase64,
        scope,
        signal,
      })

      accessTokenRef.current = token
      return token
    },
    [runtimeAuth],
  )

  const hasAuth = useMemo(() => envHasAuth() || runtimeAuth != null, [runtimeAuth])

  const setAuth = useCallback((params: { credentials: string; scope: ScopeName }) => {
    const raw = params.credentials.trim()
    if (!raw) return

    const bearerMatch = raw.match(/^Bearer\s+(.+)$/i)
    const basicMatch = raw.match(/^Basic\s+(.+)$/i)

    let next: RuntimeAuth = null
    if (bearerMatch && bearerMatch[1]?.trim()) {
      next = { kind: 'token', token: bearerMatch[1].trim() }
    } else if (basicMatch && basicMatch[1]?.trim()) {
      next = { kind: 'basic', credentialsBase64: basicMatch[1].trim(), scope: params.scope }
    } else if (isBase64Like(raw)) {
      next = { kind: 'basic', credentialsBase64: raw, scope: params.scope }
    } else {
      next = { kind: 'token', token: raw }
    }

    setRuntimeAuth(next)
    saveToStorage(AUTH_KEY, next)
    accessTokenRef.current = null
  }, [])

  const clearAuth = useCallback(() => {
    setRuntimeAuth(null)
    saveToStorage(AUTH_KEY, null)
    accessTokenRef.current = null
  }, [])

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', state.settings.theme)
  }, [state.settings.theme])

  useEffect(() => {
    const data: PersistedState = {
      chats: state.chats,
      activeChatId: state.activeChatId,
      messagesByChatId: state.messagesByChatId,
      settings: state.settings,
    }
    saveVersioned(STORAGE_KEY, data)
  }, [state.chats, state.activeChatId, state.messagesByChatId, state.settings])

  const createChat = useCallback(() => {
    const id = makeId('c')
    const index = state.chats.length + 1
    const ts = nowIso()
    const chat: Chat = {
      id,
      title: defaultChatTitle(index),
      createdAt: ts,
      updatedAt: ts,
      isTitleAuto: true,
    }
    dispatch({ type: 'CREATE_CHAT', payload: { chat } })
    return id
  }, [state.chats.length])

  const setActiveChat = useCallback((chatId: string) => {
    dispatch({ type: 'SET_ACTIVE_CHAT', payload: { chatId } })
  }, [])

  const renameChat = useCallback((chatId: string, title: string) => {
    dispatch({ type: 'RENAME_CHAT', payload: { chatId, title } })
  }, [])

  const deleteChat = useCallback(
    (chatId: string) => {
      if (abortRef.current && state.activeChatId === chatId) {
        abortRef.current.abort()
        abortRef.current = null
      }
      dispatch({ type: 'DELETE_CHAT', payload: { chatId } })
    },
    [state.activeChatId],
  )

  const setSettings = useCallback((settings: Settings) => {
    dispatch({ type: 'SET_SETTINGS', payload: { settings } })
  }, [])

  const resetSettings = useCallback(() => {
    dispatch({ type: 'SET_SETTINGS', payload: { settings: DEFAULT_SETTINGS } })
  }, [])

  const stop = useCallback(() => {
    if (abortRef.current) {
      abortRef.current.abort()
      abortRef.current = null
    }

    const chatId = state.activeChatId
    if (chatId) {
      dispatch({ type: 'SET_LOADING', payload: { chatId, isLoading: false } })
    }
  }, [state.activeChatId])

  const runRequest = useCallback(
    async (params: {
      chatId: string
      assistantMessageId: string
      messages: Array<Pick<Message, 'role' | 'content'>>
    }) => {
      const { chatId, assistantMessageId, messages } = params

      abortRef.current?.abort()
      const controller = new AbortController()
      abortRef.current = controller

      const accessToken = await getAccessToken(controller.signal)

      try {
        let acc = ''
        await streamChatCompletion(
          {
            accessToken,
            model: state.settings.model,
            temperature: state.settings.temperature,
            topP: state.settings.topP,
            maxTokens: state.settings.maxTokens,
            repetitionPenalty: state.settings.repetitionPenalty,
            messages,
            signal: controller.signal,
          },
          (delta) => {
            acc += delta
            dispatch({
              type: 'UPDATE_MESSAGE',
              payload: { chatId, messageId: assistantMessageId, content: acc },
            })
          },
        )
      } catch (e) {
        if (controller.signal.aborted) return

        try {
          const full = await chatCompletion({
            accessToken,
            model: state.settings.model,
            temperature: state.settings.temperature,
            topP: state.settings.topP,
            maxTokens: state.settings.maxTokens,
            repetitionPenalty: state.settings.repetitionPenalty,
            messages,
            signal: controller.signal,
          })
          dispatch({ type: 'UPDATE_MESSAGE', payload: { chatId, messageId: assistantMessageId, content: full } })
        } catch (e) {
          if (controller.signal.aborted) return

          const msg = e instanceof Error ? e.message : 'Ошибка запроса'
          dispatch({ type: 'SET_ERROR', payload: { chatId, error: msg } })
        }
      } finally {
        if (abortRef.current === controller) {
          abortRef.current = null
        }
        dispatch({ type: 'SET_LOADING', payload: { chatId, isLoading: false } })
      }
    },
    [getAccessToken, state.settings],
  )

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim()
      if (!trimmed) return

      const chatId = state.activeChatId ?? createChat()
      if (!chatId) return

      if (state.isLoadingByChatId[chatId]) return

      dispatch({ type: 'SET_ERROR', payload: { chatId, error: null } })

      const userMessage: Message = {
        id: makeId('m'),
        chatId,
        role: 'user',
        content: trimmed,
        timestamp: nowIso(),
      }

      const assistantMessageId = makeId('m')
      const assistantMessage: Message = {
        id: assistantMessageId,
        chatId,
        role: 'assistant',
        content: '',
        timestamp: nowIso(),
      }

      dispatch({ type: 'ADD_MESSAGE', payload: { message: userMessage } })
      dispatch({ type: 'ADD_MESSAGE', payload: { message: assistantMessage } })
      dispatch({ type: 'SET_LOADING', payload: { chatId, isLoading: true } })

      const previous = state.messagesByChatId[chatId] ?? []
      const contextMessages: Array<Pick<Message, 'role' | 'content'>> = []
      const systemPrompt = state.settings.systemPrompt.trim()
      if (systemPrompt) {
        contextMessages.push({ role: 'system', content: systemPrompt })
      }
      for (const m of previous) {
        if (m.role === 'system') continue
        contextMessages.push({ role: m.role, content: m.content })
      }
      contextMessages.push({ role: 'user', content: trimmed })

      lastRequestRef.current = { chatId, assistantMessageId, messages: contextMessages }

      try {
        await runRequest({ chatId, assistantMessageId, messages: contextMessages })
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Ошибка запроса'
        dispatch({ type: 'SET_ERROR', payload: { chatId, error: msg } })
        dispatch({ type: 'SET_LOADING', payload: { chatId, isLoading: false } })
      }
    },
    [state.activeChatId, state.isLoadingByChatId, state.messagesByChatId, state.settings, createChat, runRequest],
  )

  const retryLast = useCallback(async () => {
    const last = lastRequestRef.current
    if (!last) return
    const { chatId, assistantMessageId, messages } = last

    if (state.isLoadingByChatId[chatId]) return

    dispatch({ type: 'SET_ERROR', payload: { chatId, error: null } })
    dispatch({ type: 'UPDATE_MESSAGE', payload: { chatId, messageId: assistantMessageId, content: '' } })
    dispatch({ type: 'SET_LOADING', payload: { chatId, isLoading: true } })

    try {
      await runRequest({ chatId, assistantMessageId, messages })
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Ошибка запроса'
      dispatch({ type: 'SET_ERROR', payload: { chatId, error: msg } })
      dispatch({ type: 'SET_LOADING', payload: { chatId, isLoading: false } })
    }
  }, [runRequest, state.isLoadingByChatId])

  const value = useMemo<ChatContextValue>(
    () => ({
      state,
      createChat,
      setActiveChat,
      renameChat,
      deleteChat,
      setSettings,
      resetSettings,
      sendMessage,
      retryLast,
      stop,
      hasAuth,
      setAuth,
      clearAuth,
    }),
    [
      state,
      createChat,
      setActiveChat,
      renameChat,
      deleteChat,
      setSettings,
      resetSettings,
      sendMessage,
      retryLast,
      stop,
      hasAuth,
      setAuth,
      clearAuth,
    ],
  )

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>
}

export function useChat() {
  const ctx = useContext(ChatContext)
  if (!ctx) {
    throw new Error('useChat должен использоваться внутри <ChatProvider>')
  }
  return ctx
}
