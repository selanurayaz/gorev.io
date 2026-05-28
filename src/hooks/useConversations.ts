import { useCallback, useEffect, useState } from 'react'

import { useMessagePolling } from '@/hooks/useMessagePolling'
import { fetchConversations } from '@/services/messaging'
import type { Conversation } from '@/types/message'

const LIST_POLL_MS = 8_000

export function useConversations() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async (options?: { silent?: boolean }) => {
    if (!options?.silent) {
      setIsLoading(true)
      setError(null)
    }

    const { conversations: rows, error: fetchError } = await fetchConversations()

    setConversations(rows)
    setError(fetchError)
    setIsLoading(false)
  }, [])

  useEffect(() => {
    let cancelled = false

    void (async () => {
      setIsLoading(true)
      setError(null)

      const { conversations: rows, error: fetchError } =
        await fetchConversations()

      if (cancelled) return
      setConversations(rows)
      setError(fetchError)
      setIsLoading(false)
    })()

    return () => {
      cancelled = true
    }
  }, [])

  useMessagePolling(true, () => load({ silent: true }), LIST_POLL_MS)

  return {
    conversations,
    isLoading,
    error,
    reload: () => load(),
  }
}
