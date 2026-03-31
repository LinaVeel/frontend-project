export type ThemeMode = 'light' | 'dark'
export type ModelName = 'GigaChat' | 'GigaChat-Plus' | 'GigaChat-Pro' | 'GigaChat-Max'
export type ScopeName = 'GIGACHAT_API_PERS' | 'GIGACHAT_API_B2B' | 'GIGACHAT_API_CORP'

export type Chat = {
  id: string
  title: string
  createdAt: string
  updatedAt: string
  isTitleAuto: boolean
}

export type MessageRole = 'system' | 'user' | 'assistant'

export type Message = {
  id: string
  chatId: string
  role: MessageRole
  content: string
  timestamp: string
}

export type Settings = {
  model: ModelName
  temperature: number
  topP: number
  maxTokens: number
  systemPrompt: string
  theme: ThemeMode
}

export type AuthState = {
  credentials: string
  scope: ScopeName
  accessToken?: string
}

export type ChatState = {
  chats: Chat[]
  activeChatId: string | null
  messagesByChatId: Record<string, Message[]>
  isLoadingByChatId: Record<string, boolean>
  errorByChatId: Record<string, string | null>
  settings: Settings
  auth: AuthState | null
}

export type ChatAction =
  | { type: 'INIT_STATE'; payload: ChatState }
  | { type: 'SET_ACTIVE_CHAT'; payload: { chatId: string | null } }
  | { type: 'CREATE_CHAT'; payload: { chat: Chat } }
  | { type: 'RENAME_CHAT'; payload: { chatId: string; title: string } }
  | { type: 'DELETE_CHAT'; payload: { chatId: string } }
  | { type: 'ADD_MESSAGE'; payload: { message: Message } }
  | { type: 'UPDATE_MESSAGE'; payload: { chatId: string; messageId: string; content: string } }
  | { type: 'SET_LOADING'; payload: { chatId: string; isLoading: boolean } }
  | { type: 'SET_ERROR'; payload: { chatId: string; error: string | null } }
  | { type: 'SET_SETTINGS'; payload: { settings: Settings } }
  | { type: 'SET_AUTH'; payload: { auth: AuthState | null } }
  | { type: 'SET_AUTH_ACCESS_TOKEN'; payload: { accessToken: string | undefined } }

export const DEFAULT_SETTINGS: Settings = {
  model: 'GigaChat',
  temperature: 0.8,
  topP: 0.9,
  maxTokens: 1024,
  systemPrompt: 'Ты — полезный ассистент. Отвечай кратко и по делу.',
  theme: 'light',
}
