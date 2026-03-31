import styles from './AppLayout.module.css'
import Sidebar from '../sidebar/Sidebar'
import ChatWindow from '../chat/ChatWindow'
import SettingsPanel from '../settings/SettingsPanel'
import AuthForm from '../auth/AuthForm'
import { useChat } from '../../app/providers/ChatProvider'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

export default function AppLayout() {
  const { id } = useParams()
  const navigate = useNavigate()
  const {
    state,
    setAuth,
    setSettings,
    resetSettings,
    setActiveChat,
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

  if (!state.auth) {
    return (
      <AuthForm
        onSubmit={({ credentials, scope }) => {
          if (!credentials.trim()) return
          setAuth({ credentials: credentials.trim(), scope })
        }}
      />
    )
  }

  return (
    <div className={styles.root}>
      <div className={styles.desktopSidebar}>
        <Sidebar
          onNavigate={() => setIsSidebarOpen(false)}
        />
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
            <Sidebar
              onNavigate={() => setIsSidebarOpen(false)}
            />
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
    </div>
  )
}
