import styles from './AppLayout.module.css'
import ChatWindow from '../chat/ChatWindow'
import { useChat } from '../../app/providers/ChatProvider'
import { Suspense, lazy, useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import AuthForm from '../auth/AuthForm'

const Sidebar = lazy(() => import('../sidebar/Sidebar'))
const SettingsPanel = lazy(() => import('../settings/SettingsPanel'))

export default function AppLayout() {
  const { id } = useParams()
  const navigate = useNavigate()
  const {
    state,
    setSettings,
    resetSettings,
    setActiveChat,
    hasAuth,
    setAuth,
  } = useChat()

  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)

  const activeChatId = state.activeChatId

  useEffect(() => {
    if (!id) return
    const exists = state.chats.some((c) => c.id === id)
    if (!exists) {
      navigate('/', { replace: true })
      return
    }
    if (activeChatId !== id) {
      setActiveChat(id)
    }
  }, [id, state.chats, activeChatId, navigate, setActiveChat])

  const activeChat = useMemo(() => {
    if (!activeChatId) return null
    return state.chats.find((c) => c.id === activeChatId) ?? null
  }, [state.chats, activeChatId])

  const title = activeChat?.title ?? ''

  if (!hasAuth) {
    return <AuthForm onSubmit={setAuth} />
  }

  return (
    <div className={styles.root}>
      <div className={styles.desktopSidebar}>
        <Suspense fallback={<div aria-busy="true">Загрузка…</div>}>
          <Sidebar onNavigate={() => setIsSidebarOpen(false)} />
        </Suspense>
      </div>

      {isSidebarOpen ? (
        <div
          className={styles.mobileSidebarBackdrop}
          role="button"
          tabIndex={0}
          onClick={() => setIsSidebarOpen(false)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') setIsSidebarOpen(false)
          }}
        >
          <div className={styles.mobileSidebar} onClick={(e) => e.stopPropagation()}>
            <Suspense fallback={<div aria-busy="true">Загрузка…</div>}>
              <Sidebar onNavigate={() => setIsSidebarOpen(false)} />
            </Suspense>
          </div>
        </div>
      ) : null}

      <div className={styles.chatArea}>
        <ChatWindow
          title={title}
          chatId={activeChatId}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenSidebar={() => setIsSidebarOpen(true)}
        />
      </div>

      {isSettingsOpen ? (
        <Suspense fallback={<div aria-busy="true">Загрузка…</div>}>
          <SettingsPanel
            isOpen={isSettingsOpen}
            settings={state.settings}
            onClose={() => setIsSettingsOpen(false)}
            onSave={(next) => {
              setSettings(next)
              setIsSettingsOpen(false)
            }}
            onReset={resetSettings}
          />
        </Suspense>
      ) : null}
    </div>
  )
}
