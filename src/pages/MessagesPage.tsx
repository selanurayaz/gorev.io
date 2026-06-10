import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

import { AuthAlert } from '@/components/auth/AuthAlert'
import { ConversationList } from '@/components/messages/ConversationList'
import { MessageThread } from '@/components/messages/MessageThread'
import { Spinner } from '@/components/ui/Spinner'
import { useConversations } from '@/hooks/useConversations'
import { buildConversationSelection } from '@/lib/conversation'
import { useAuth } from '@/hooks/useAuth'
import type { Conversation } from '@/types/message'

export function MessagesPage() {
  const { user } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const [mobileShowThread, setMobileShowThread] = useState(false)

  const { conversations, isLoading, error, reload } = useConversations()

  const taskParam = searchParams.get('gorev')
  const withParam = searchParams.get('karsi')
  const currentUserId = user?.id

  useEffect(() => {
    if (taskParam && withParam) {
      setMobileShowThread(true)
    }
  }, [taskParam, withParam])

  let selectedConversation: Conversation | null = null

  if (currentUserId) {
    if (taskParam && withParam) {
      const { conversationId } = buildConversationSelection(
        taskParam,
        currentUserId,
        withParam,
      )
      selectedConversation =
        conversations.find((c) => c.id === conversationId) ?? {
          id: conversationId,
          task_id: taskParam,
          task_title: 'Görev',
          other_user_id: withParam,
          other_user_name: null,
          last_message: null,
          last_message_at: null,
        }
    } else {
      selectedConversation = conversations[0] ?? null
    }
  }

  function selectConversation(conversation: Conversation) {
    setSearchParams({
      gorev: conversation.task_id,
      karsi: conversation.other_user_id,
    })
    setMobileShowThread(true)
  }

  function handleBackToList() {
    setMobileShowThread(false)
  }

  return (
    <div className="mx-auto flex min-h-0 w-full min-w-0 max-w-5xl flex-col gap-4">
      <header className="shrink-0 min-w-0">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gorev-green-400">
          İletişim
        </p>
        <h1 className="mt-1 text-xl font-semibold tracking-tight text-gorev-snow sm:text-2xl">
          Mesajlar
        </h1>
        <p className="mt-1 text-sm text-gorev-muted">
          Kabul edilmiş tekliflerden sonra görev sahibi ve hizmet veren
          mesajlaşabilir.
        </p>
      </header>

      {error ? (
        <div className="space-y-3">
          <AuthAlert message={error} variant="error" />
          <button
            type="button"
            onClick={() => void reload()}
            className="text-sm font-medium text-gorev-yellow-400 underline-offset-4 hover:underline"
          >
            Tekrar dene
          </button>
        </div>
      ) : null}

      <div className="flex min-h-[min(72dvh,40rem)] min-w-0 flex-1 flex-col overflow-hidden rounded-2xl border border-gorev-navy-800 bg-gorev-navy-900/30 md:flex-row sm:min-h-[min(68dvh,36rem)]">
        <aside
          className={`flex min-h-0 min-w-0 w-full flex-col border-gorev-navy-800 md:w-80 md:shrink-0 md:border-r ${
            mobileShowThread ? 'hidden md:flex' : 'flex'
          }`}
        >
          <div className="border-b border-gorev-navy-800 px-4 py-3">
            <h2 className="text-sm font-semibold text-gorev-snow">Sohbetler</h2>
          </div>

          {isLoading ? (
            <div
              className="flex flex-1 items-center justify-center gap-3 py-12"
              role="status"
            >
              <Spinner className="h-7 w-7 text-gorev-yellow-400" />
              <span className="text-sm text-gorev-muted">Yükleniyor…</span>
            </div>
          ) : null}

          {!isLoading && conversations.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-2 p-6 text-center">
              <p className="text-sm font-medium text-gorev-snow">
                Henüz sohbet yok
              </p>
              <p className="text-sm text-gorev-muted">
                Bir teklif kabul edildiğinde karşı taraf burada görünür.
              </p>
            </div>
          ) : null}

          {!isLoading && conversations.length > 0 ? (
            <div className="min-h-0 flex-1 overflow-y-auto">
              <ConversationList
                conversations={conversations}
                selectedId={selectedConversation?.id ?? null}
                onSelect={selectConversation}
              />
            </div>
          ) : null}
        </aside>

        <section
          className={`min-h-0 min-w-0 flex-1 flex-col ${
            mobileShowThread ? 'flex' : 'hidden md:flex'
          }`}
        >
          {mobileShowThread ? (
            <button
              type="button"
              className="min-h-11 border-b border-gorev-navy-800 px-4 py-3 text-left text-sm font-medium text-gorev-yellow-400 md:hidden"
              onClick={handleBackToList}
            >
              ← Sohbetlere dön
            </button>
          ) : null}

          <MessageThread
            conversation={selectedConversation}
            onMessageSent={() => void reload()}
          />
        </section>
      </div>
    </div>
  )
}
