import { useEffect, useRef } from 'react'

import { AuthAlert } from '@/components/auth/AuthAlert'
import { MessageBubble } from '@/components/messages/MessageBubble'
import { MessageComposer } from '@/components/messages/MessageComposer'
import { TaskOwnerWorkPanel } from '@/components/tasks/TaskOwnerWorkPanel'
import { Spinner } from '@/components/ui/Spinner'
import { useAuth } from '@/hooks/useAuth'
import { useMessageThread } from '@/hooks/useMessageThread'
import { sameUserId } from '@/lib/messaging-utils'
import type { Conversation } from '@/types/message'
import type { TaskId } from '@/types/index'

type MessageThreadProps = {
  conversation: Conversation | null
  onMessageSent?: () => void
}

export function MessageThread({ conversation, onMessageSent }: MessageThreadProps) {
  const { user } = useAuth()
  const bottomRef = useRef<HTMLDivElement>(null)

  const taskId = conversation?.task_id
  const otherUserId = conversation?.other_user_id

  const {
    messages,
    isLoading,
    isSending,
    canMessage,
    error,
    sendError,
    send,
  } = useMessageThread(taskId, otherUserId, user?.id)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, conversation?.id])

  if (!conversation) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-2 p-8 text-center">
        <p className="text-sm font-medium text-gorev-snow">
          Bir sohbet seçin
        </p>
        <p className="max-w-xs text-sm text-gorev-muted">
          Kabul edilmiş teklifleriniz için listeden bir konuşma seçerek
          mesajlaşmaya başlayın.
        </p>
      </div>
    )
  }

  const currentUserId = user?.id

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <header className="border-b border-gorev-navy-800 px-4 py-3 sm:px-5">
        <p className="font-semibold text-gorev-snow">
          {conversation.other_user_name ?? 'Kullanıcı'}
        </p>
        <p className="text-xs text-gorev-muted">{conversation.task_title}</p>
      </header>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        {error ? (
          <div className="p-4">
            <AuthAlert message={error} variant="error" />
          </div>
        ) : null}

        {isLoading ? (
          <div
            className="flex flex-1 items-center justify-center gap-3"
            role="status"
          >
            <Spinner className="h-7 w-7 text-gorev-yellow-400" />
            <span className="text-sm text-gorev-muted">Mesajlar yükleniyor…</span>
          </div>
        ) : (
          <div className="flex-1 space-y-3 overflow-y-auto p-4 sm:p-5">
            {messages.length === 0 && !error ? (
              <p className="text-center text-sm text-gorev-muted">
                Henüz mesaj yok. İlk mesajı siz gönderin.
              </p>
            ) : null}
            {messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                isOwn={sameUserId(message.sender_id, currentUserId)}
              />
            ))}
            <div ref={bottomRef} />
          </div>
        )}

        {sendError ? (
          <div className="px-4 pb-2">
            <AuthAlert message={sendError} variant="error" />
          </div>
        ) : null}

        {taskId ? (
          <div className="border-t border-gorev-navy-800 px-4 py-4 sm:px-5">
            <TaskOwnerWorkPanel taskId={taskId as TaskId} />
          </div>
        ) : null}

        <MessageComposer
          disabled={isLoading || !conversation || !canMessage}
          isSending={isSending}
          onSend={async (content) => {
            const ok = await send(content)
            if (ok) onMessageSent?.()
            return ok
          }}
        />
      </div>
    </div>
  )
}
