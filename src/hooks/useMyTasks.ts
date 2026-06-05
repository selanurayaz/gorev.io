import { useCallback, useEffect, useMemo, useState } from 'react'

import { fetchAcceptedWorkByProvider } from '@/services/offers'
import type { AcceptedWorkItem } from '@/types/offer'

export function useMyTasks() {
  const [items, setItems] = useState<AcceptedWorkItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    const { items: rows, error: fetchError } =
      await fetchAcceptedWorkByProvider()

    setItems(rows)
    setError(fetchError)
    setIsLoading(false)
  }, [])

  useEffect(() => {
    let cancelled = false

    void (async () => {
      setIsLoading(true)
      setError(null)

      const { items: rows, error: fetchError } =
        await fetchAcceptedWorkByProvider()

      if (cancelled) return
      setItems(rows)
      setError(fetchError)
      setIsLoading(false)
    })()

    return () => {
      cancelled = true
    }
  }, [])

  const jobCount = useMemo(() => items.length, [items])

  return {
    items,
    jobCount,
    isLoading,
    error,
    reload: load,
  }
}
