import { useEffect, useMemo, useState } from 'react'
import AppLayout from './components/layout/AppLayout'
import AuthForm from './components/auth/AuthForm'
import type { ChatMessage } from './types/message'

export type ThemeMode = 'light' | 'dark'
export type ModelName = 'GigaChat' | 'GigaChat-Plus' | 'GigaChat-Pro' | 'GigaChat-Max'
export type ScopeName = 'GIGACHAT_API_PERS' | 'GIGACHAT_API_B2B' | 'GIGACHAT_API_CORP'

export type Chat = {
  id: string
  title: string
  lastMessageAt: string
}

export type Settings = {
  model: ModelName
  temperature: number
  topP: number
  maxTokens: number
  systemPrompt: string
  theme: ThemeMode
}

const DEFAULT_SETTINGS: Settings = {
  model: 'GigaChat',
  temperature: 0.8,
  topP: 0.9,
  maxTokens: 1024,
  systemPrompt: 'Ты — полезный ассистент. Отвечай кратко и по делу.',
  theme: 'light',
}

const MOCK_CHATS: Chat[] = [
  { id: 'c1', title: 'План проекта и дедлайны', lastMessageAt: '31.03.2026' },
  { id: 'c2', title: 'Идеи для улучшения UX (мобильная версия)', lastMessageAt: '30.03.2026' },
  { id: 'c3', title: 'Ошибки сборки и типизация', lastMessageAt: '29.03.2026' },
  { id: 'c4', title: 'Markdown и форматирование сообщений', lastMessageAt: '28.03.2026' },
  { id: 'c5', title: 'Новый диалог', lastMessageAt: '27.03.2026' },
]

const MOCK_MESSAGES_BY_CHAT: Record<string, ChatMessage[]> = {
  c1: [
    {
      id: 'm1',
      role: 'assistant',
      timestamp: '2026-03-31T10:20:00.000Z',
      content:
        'Привет! Вот **краткий план**:\n\n- Сделаем layout\n- Добавим sidebar\n- Соберём chat window\n\n```ts\ntype Plan = { step: string }\n```',
    },
    {
      id: 'm2',
      role: 'user',
      timestamp: '2026-03-31T10:22:00.000Z',
      content: 'Ок, начнём. Нужна поддержка *markdown* и адаптивность.',
    },
    {
      id: 'm3',
      role: 'assistant',
      timestamp: '2026-03-31T10:23:00.000Z',
      content: 'Принято. Стили сделаем через CSS Modules + CSS-переменные.',
    },
    {
      id: 'm4',
      role: 'user',
      timestamp: '2026-03-31T10:24:00.000Z',
      content: 'Сообщения пользователя справа, ассистента слева.',
    },
    {
      id: 'm5',
      role: 'assistant',
      timestamp: '2026-03-31T10:25:00.000Z',
      content: 'Сделаем два варианта `user/assistant` и кнопку копирования по hover.',
    },
    {
      id: 'm6',
      role: 'user',
      timestamp: '2026-03-31T10:26:00.000Z',
      content: 'Отлично!',
    },
  ],
  c2: [
    {
      id: 'm1',
      role: 'assistant',
      timestamp: '2026-03-30T09:10:00.000Z',
      content: 'На мобилке sidebar скрываем, показываем кнопку-бургер.',
    },
    {
      id: 'm2',
      role: 'user',
      timestamp: '2026-03-30T09:11:00.000Z',
      content: 'Ок, открытие можно как оверлей.',
    },
    {
      id: 'm3',
      role: 'assistant',
      timestamp: '2026-03-30T09:12:00.000Z',
      content: 'Да, и закрывать по клику в backdrop — просто и понятно.',
    },
    {
      id: 'm4',
      role: 'user',
      timestamp: '2026-03-30T09:13:00.000Z',
      content: 'Супер.',
    },
    {
      id: 'm5',
      role: 'assistant',
      timestamp: '2026-03-30T09:14:00.000Z',
      content: 'Список чатов — минимум 5, с датой и действиями по hover.',
    },
    {
      id: 'm6',
      role: 'user',
      timestamp: '2026-03-30T09:15:00.000Z',
      content: 'Понял.',
    },
  ],
  c3: [
    {
      id: 'm1',
      role: 'assistant',
      timestamp: '2026-03-29T18:01:00.000Z',
      content: 'Типизируем props каждого компонента — обязательно.',
    },
    {
      id: 'm2',
      role: 'user',
      timestamp: '2026-03-29T18:02:00.000Z',
      content: 'Ок.',
    },
    {
      id: 'm3',
      role: 'assistant',
      timestamp: '2026-03-29T18:03:00.000Z',
      content: 'Без Redux/Zustand и без тестов на этом этапе.',
    },
    {
      id: 'm4',
      role: 'user',
      timestamp: '2026-03-29T18:04:00.000Z',
      content: 'Хорошо.',
    },
    {
      id: 'm5',
      role: 'assistant',
      timestamp: '2026-03-29T18:05:00.000Z',
      content: 'Сборку потом проверим через `npm run build`.',
    },
    {
      id: 'm6',
      role: 'user',
      timestamp: '2026-03-29T18:06:00.000Z',
      content: 'Да.',
    },
  ],
  c4: [
    {
      id: 'm1',
      role: 'assistant',
      timestamp: '2026-03-28T14:40:00.000Z',
      content:
        'Пример markdown:\n\n1. **жирный**\n2. *курсив*\n3. Список\n\n```js\nconsole.log("hi")\n```',
    },
    {
      id: 'm2',
      role: 'user',
      timestamp: '2026-03-28T14:41:00.000Z',
      content: 'Проверим в `react-markdown`.',
    },
    {
      id: 'm3',
      role: 'assistant',
      timestamp: '2026-03-28T14:42:00.000Z',
      content: 'Да, а кнопку Copy покажем только при наведении.',
    },
    {
      id: 'm4',
      role: 'user',
      timestamp: '2026-03-28T14:43:00.000Z',
      content: 'Ок.',
    },
    {
      id: 'm5',
      role: 'assistant',
      timestamp: '2026-03-28T14:44:00.000Z',
      content: 'Сообщения юзера справа и другим цветом.',
    },
    {
      id: 'm6',
      role: 'user',
      timestamp: '2026-03-28T14:45:00.000Z',
      content: 'Принял.',
    },
  ],
  c5: [],
}

export default function App() {
  const [isAuthed, setIsAuthed] = useState(false)
  const [theme, setTheme] = useState<ThemeMode>(DEFAULT_SETTINGS.theme)
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS)
  const [activeChatId, setActiveChatId] = useState(MOCK_CHATS[0].id)
  const [searchQuery, setSearchQuery] = useState('')
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)

  const filteredChats = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return MOCK_CHATS
    return MOCK_CHATS.filter((c) => c.title.toLowerCase().includes(q))
  }, [searchQuery])

  const activeChat = useMemo(() => MOCK_CHATS.find((c) => c.id === activeChatId) ?? MOCK_CHATS[0], [activeChatId])
  const messages = MOCK_MESSAGES_BY_CHAT[activeChat.id] ?? []

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  if (!isAuthed) {
    return (
      <AuthForm
        onSubmit={({ credentials, scope }) => {
          if (!credentials.trim()) return
          void scope
          setIsAuthed(true)
        }}
      />
    )
  }

  return (
    <AppLayout
      chats={filteredChats}
      activeChatId={activeChatId}
      onSelectChat={(id) => {
        setActiveChatId(id)
        setIsSidebarOpen(false)
      }}
      searchQuery={searchQuery}
      onSearchQueryChange={setSearchQuery}
      isSidebarOpen={isSidebarOpen}
      onSidebarOpenChange={setIsSidebarOpen}
      chatTitle={activeChat.title}
      messages={messages}
      onOpenSettings={() => setIsSettingsOpen(true)}
      isSettingsOpen={isSettingsOpen}
      onCloseSettings={() => setIsSettingsOpen(false)}
      settings={settings}
      onSaveSettings={(next) => {
        setSettings(next)
        setTheme(next.theme)
        setIsSettingsOpen(false)
      }}
      onResetSettings={() => {
        setSettings(DEFAULT_SETTINGS)
        setTheme(DEFAULT_SETTINGS.theme)
      }}
    />
  )
}
