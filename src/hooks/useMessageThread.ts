import { useCallback, useEffect, useState } from 'react'

import { useMessagePolling } from '@/hooks/useMessagePolling'
import { useMessageRealtime } from '@/hooks/useMessageRealtime'
import {
  mergeMessagesById,
  resolveExistingConversationReply,
} from '@/lib/messaging-utils'
import { fetchMessagesForConversation, sendMessage } from '@/services/messaging'
import type { ChatMessage } from '@/types/message'
import type { TaskId } from '@/types/index'

export function useMessageThread(
  taskId: TaskId | undefined,
  otherUserId: string | undefined,
  currentUserId: string | undefined,
) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sendError, setSendError] = useState<string | null>(null)
  const [canMessage, setCanMessage] = useState(false)
  const [receiverId, setReceiverId] = useState<string | undefined>(undefined)

  const enabled = Boolean(taskId && currentUserId && otherUserId)
  const threadOtherId = receiverId ?? otherUserId

  const applyReplyState = useCallback(
    (rows: ChatMessage[]) => {
      if (!currentUserId) {
        setCanMessage(false)
        setReceiverId(undefined)
        return
      }

      const reply = resolveExistingConversationReply(
        rows,
        currentUserId,
        otherUserId,
      )
      setCanMessage(reply.canMessage)
      setReceiverId(reply.receiverId ?? undefined)
    },
    [currentUserId, otherUserId],
  )

  const load = useCallback(
    async (options?: { silent?: boolean }) => {
      if (!taskId || !currentUserId || !otherUserId) {
        setMessages([])
        setCanMessage(false)
        setReceiverId(undefined)
        return
      }

      if (!options?.silent) {
        setIsLoading(true)
        setError(null)
      }

      const { messages: rows, error: fetchError } =
        await fetchMessagesForConversation(taskId, otherUserId)

      setMessages(rows)
      setError(fetchError)
      applyReplyState(rows)
      setIsLoading(false)
    },
    [taskId, currentUserId, otherUserId, applyReplyState],
  )

  useEffect(() => {
    if (!enabled) return

    let cancelled = false

    void (async () => {
      setIsLoading(true)
      setError(null)
      setMessages([])

      const { messages: rows, error: fetchError } =
        await fetchMessagesForConversation(taskId!, otherUserId!)

      if (cancelled) return

      setMessages(rows)
      setError(fetchError)
      applyReplyState(rows)
      setIsLoading(false)
    })()

    return () => {
      cancelled = true
    }
  }, [enabled, taskId, otherUserId, currentUserId, applyReplyState])

  const silentReload = useCallback(() => {
    void load({ silent: true })
  }, [load])

  useMessagePolling(enabled, silentReload)

  useMessageRealtime({
    enabled,
    taskId,
    currentUserId,
    otherUserId: threadOtherId,
    onMessages: (updater) => {
      setMessages((prev) => {
        const next = typeof updater === 'function' ? updater(prev) : updater
        applyReplyState(next)
        return next
      })
    },
  })

  const send = useCallback(
    async (content: string) => {
      if (!taskId || !currentUserId) return false

      const reply = resolveExistingConversationReply(
        messages,
        currentUserId,
        otherUserId,
      )
      const targetReceiver = reply.receiverId ?? receiverId ?? otherUserId

      if (!reply.canMessage || !targetReceiver) {
        setSendError('Bu sohbete yanıt veremezsiniz.')
        return false
      }

      setSendError(null)
      setIsSending(true)

      const { message, error: sendErr } = await sendMessage({
        task_id: taskId,
        receiver_id: targetReceiver,
        content,
        existing_thread: true,
      })

      setIsSending(false)

      if (sendErr || !message) {
        setSendError(sendErr ?? 'Mesaj gönderilemedi.')
        return false
      }

      setMessages((prev) => {
        const next = mergeMessagesById(prev, [message])
        applyReplyState(next)
        return next
      })
      await load({ silent: true })
      return true
    },
    [
      taskId,
      currentUserId,
      otherUserId,
      messages,
      receiverId,
      load,
      applyReplyState,
    ],
  )

  return {
    messages: enabled ? messages : [],
    isLoading: enabled ? isLoading : false,
    isSending,
    canMessage: enabled ? canMessage : false,
    error: enabled ? error : null,
    sendError,
    send,
    reload: () => load(),
  }
}
