import { useEffect } from 'react'

import { normalizeMessageRow } from '@/lib/message-mapper'
import {
  isMessageBetweenUsers,
  mergeMessagesById,
} from '@/lib/messaging-utils'
import { supabase } from '@/lib/supabase/client'
import type { ChatMessage } from '@/types/message'
import type { TaskId } from '@/types/index'

type UseMessageRealtimeOptions = {
  enabled: boolean
  taskId: TaskId | undefined
  currentUserId: string | undefined
  otherUserId: string | undefined
  onMessages: (updater: (prev: ChatMessage[]) => ChatMessage[]) => void
}

/** Yeni mesajlar için Supabase realtime; yoksa polling yedeklenir. */
export function useMessageRealtime({
  enabled,
  taskId,
  currentUserId,
  otherUserId,
  onMessages,
}: UseMessageRealtimeOptions) {
  useEffect(() => {
    if (!enabled || !taskId || !currentUserId || !otherUserId) return

    const channel = supabase
      .channel(`messages-thread-${taskId}-${currentUserId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `task_id=eq.${taskId}`,
        },
        (payload) => {
          const row = payload.new
          if (!row || typeof row !== 'object') return

          const message = normalizeMessageRow(
            row as Record<string, unknown>,
          )
          if (!message) return

          if (
            !isMessageBetweenUsers(message, currentUserId, otherUserId)
          ) {
            return
          }

          onMessages((prev) => mergeMessagesById(prev, [message]))
        },
      )
      .subscribe()

    return () => {
      void supabase.removeChannel(channel)
    }
  }, [enabled, taskId, currentUserId, otherUserId, onMessages])
}
