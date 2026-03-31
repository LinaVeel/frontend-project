import styles from './AppLayout.module.css'
import Sidebar from '../sidebar/Sidebar'
import ChatWindow from '../chat/ChatWindow'
import SettingsPanel from '../settings/SettingsPanel'
import type { Chat, ChatMessage, Settings } from '../../App'

type Props = {
  chats: Chat[]
  activeChatId: string
  onSelectChat: (id: string) => void
  searchQuery: string
  onSearchQueryChange: (value: string) => void

  isSidebarOpen: boolean
  onSidebarOpenChange: (next: boolean) => void

  chatTitle: string
  messages: ChatMessage[]
  onOpenSettings: () => void

  isSettingsOpen: boolean
  onCloseSettings: () => void
  settings: Settings
  onSaveSettings: (next: Settings) => void
  onResetSettings: () => void
}

export default function AppLayout({
  chats,
  activeChatId,
  onSelectChat,
  searchQuery,
  onSearchQueryChange,
  isSidebarOpen,
  onSidebarOpenChange,
  chatTitle,
  messages,
  onOpenSettings,
  isSettingsOpen,
  onCloseSettings,
  settings,
  onSaveSettings,
  onResetSettings,
}: Props) {
  return (
    <div className={styles.root}>
      <div className={styles.desktopSidebar}>
        <Sidebar
          chats={chats}
          activeChatId={activeChatId}
          onSelectChat={onSelectChat}
          searchQuery={searchQuery}
          onSearchQueryChange={onSearchQueryChange}
          onNewChat={() => onSelectChat('c5')}
        />
      </div>

      {isSidebarOpen ? (
        <div
          className={styles.mobileSidebarBackdrop}
          role="button"
          tabIndex={0}
          onClick={() => onSidebarOpenChange(false)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') onSidebarOpenChange(false)
          }}
        >
          <div className={styles.mobileSidebar} onClick={(e) => e.stopPropagation()}>
            <Sidebar
              chats={chats}
              activeChatId={activeChatId}
              onSelectChat={onSelectChat}
              searchQuery={searchQuery}
              onSearchQueryChange={onSearchQueryChange}
              onNewChat={() => onSelectChat('c5')}
            />
          </div>
        </div>
      ) : null}

      <div className={styles.chatArea}>
        <ChatWindow
          title={chatTitle}
          messages={messages}
          onOpenSettings={onOpenSettings}
          onOpenSidebar={() => onSidebarOpenChange(true)}
        />
      </div>

      <SettingsPanel
        isOpen={isSettingsOpen}
        settings={settings}
        onClose={onCloseSettings}
        onSave={onSaveSettings}
        onReset={onResetSettings}
      />
    </div>
  )
}
