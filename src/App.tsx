import { useMemo, useState } from 'react'
import AppLayout from './components/layout/AppLayout'
import AuthForm from './components/auth/AuthForm'

export type ThemeMode = 'light' | 'dark'
export type ModelName = 'GigaChat' | 'GigaChat-Plus' | 'GigaChat-Pro' | 'GigaChat-Max'
export type ScopeName = 'GIGACHAT_API_PERS' | 'GIGACHAT_API_B2B' | 'GIGACHAT_API_CORP'

export type Chat = {
  id: string
  title: string
  lastMessageAt: string
}

export type MessageRole = 'user' | 'assistant'
export type ChatMessage = {
  id: string
  role: MessageRole
  senderLabel: string
  content: string
  createdAt: string
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
      senderLabel: 'GigaChat',
      createdAt: '10:20',
      content:
        'Привет! Вот **краткий план**:\n\n- Сделаем layout\n- Добавим sidebar\n- Соберём chat window\n\n```ts\ntype Plan = { step: string }\n```',
    },
    {
      id: 'm2',
      role: 'user',
      senderLabel: 'Вы',
      createdAt: '10:22',
      content: 'Ок, начнём. Нужна поддержка *markdown* и адаптивность.',
    },
    {
      id: 'm3',
      role: 'assistant',
      senderLabel: 'GigaChat',
      createdAt: '10:23',
      content: 'Принято. Стили сделаем через CSS Modules + CSS-переменные.',
    },
    {
      id: 'm4',
      role: 'user',
      senderLabel: 'Вы',
      createdAt: '10:24',
      content: 'Сообщения пользователя справа, ассистента слева.',
    },
    {
      id: 'm5',
      role: 'assistant',
      senderLabel: 'GigaChat',
      createdAt: '10:25',
      content: 'Сделаем два варианта `user/assistant` и кнопку копирования по hover.',
    },
    {
      id: 'm6',
      role: 'user',
      senderLabel: 'Вы',
      createdAt: '10:26',
      content: 'Отлично!',
    },
  ],
  c2: [
    {
      id: 'm1',
      role: 'assistant',
      senderLabel: 'GigaChat',
      createdAt: '09:10',
      content: 'На мобилке sidebar скрываем, показываем кнопку-бургер.',
    },
    {
      id: 'm2',
      role: 'user',
      senderLabel: 'Вы',
      createdAt: '09:11',
      content: 'Ок, открытие можно как оверлей.',
    },
    {
      id: 'm3',
      role: 'assistant',
      senderLabel: 'GigaChat',
      createdAt: '09:12',
      content: 'Да, и закрывать по клику в backdrop — просто и понятно.',
    },
    {
      id: 'm4',
      role: 'user',
      senderLabel: 'Вы',
      createdAt: '09:13',
      content: 'Супер.',
    },
    {
      id: 'm5',
      role: 'assistant',
      senderLabel: 'GigaChat',
      createdAt: '09:14',
      content: 'Список чатов — минимум 5, с датой и действиями по hover.',
    },
    {
      id: 'm6',
      role: 'user',
      senderLabel: 'Вы',
      createdAt: '09:15',
      content: 'Понял.',
    },
  ],
  c3: [
    {
      id: 'm1',
      role: 'assistant',
      senderLabel: 'GigaChat',
      createdAt: '18:01',
      content: 'Типизируем props каждого компонента — обязательно.',
    },
    {
      id: 'm2',
      role: 'user',
      senderLabel: 'Вы',
      createdAt: '18:02',
      content: 'Ок.',
    },
    {
      id: 'm3',
      role: 'assistant',
      senderLabel: 'GigaChat',
      createdAt: '18:03',
      content: 'Без Redux/Zustand и без тестов на этом этапе.',
    },
    {
      id: 'm4',
      role: 'user',
      senderLabel: 'Вы',
      createdAt: '18:04',
      content: 'Хорошо.',
    },
    {
      id: 'm5',
      role: 'assistant',
      senderLabel: 'GigaChat',
      createdAt: '18:05',
      content: 'Сборку потом проверим через `npm run build`.',
    },
    {
      id: 'm6',
      role: 'user',
      senderLabel: 'Вы',
      createdAt: '18:06',
      content: 'Да.',
    },
  ],
  c4: [
    {
      id: 'm1',
      role: 'assistant',
      senderLabel: 'GigaChat',
      createdAt: '14:40',
      content:
        'Пример markdown:\n\n1. **жирный**\n2. *курсив*\n3. Список\n\n```js\nconsole.log("hi")\n```',
    },
    {
      id: 'm2',
      role: 'user',
      senderLabel: 'Вы',
      createdAt: '14:41',
      content: 'Проверим в `react-markdown`.',
    },
    {
      id: 'm3',
      role: 'assistant',
      senderLabel: 'GigaChat',
      createdAt: '14:42',
      content: 'Да, а кнопку Copy покажем только при наведении.',
    },
    {
      id: 'm4',
      role: 'user',
      senderLabel: 'Вы',
      createdAt: '14:43',
      content: 'Ок.',
    },
    {
      id: 'm5',
      role: 'assistant',
      senderLabel: 'GigaChat',
      createdAt: '14:44',
      content: 'Сообщения юзера справа и другим цветом.',
    },
    {
      id: 'm6',
      role: 'user',
      senderLabel: 'Вы',
      createdAt: '14:45',
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

  if (!isAuthed) {
    return (
      <div data-theme={theme}>
        <AuthForm
          onSubmit={({ credentials, scope }) => {
            if (!credentials.trim()) return
            void scope
            setIsAuthed(true)
          }}
        />
      </div>
    )
  }

  return (
    <div data-theme={theme}>
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
    </div>
  )
}
