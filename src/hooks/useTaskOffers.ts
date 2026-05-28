import { useCallback, useEffect, useState } from 'react'

import { fetchOffersForTaskOwner } from '@/services/offers'
import type { OfferListItem } from '@/types/offer'
import type { TaskId } from '@/types/index'

export function useTaskOffers(
  taskId: TaskId | undefined,
  enabled: boolean,
) {
  const [offers, setOffers] = useState<OfferListItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!taskId || !enabled) {
      setOffers([])
      setError(null)
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    const { offers: rows, error: fetchError } =
      await fetchOffersForTaskOwner(taskId)

    setOffers(rows)
    setError(fetchError)
    setIsLoading(false)
  }, [taskId, enabled])

  useEffect(() => {
    if (!enabled || !taskId) return

    let cancelled = false

    void (async () => {
      setIsLoading(true)
      setError(null)

      const { offers: rows, error: fetchError } =
        await fetchOffersForTaskOwner(taskId)

      if (cancelled) return
      setOffers(rows)
      setError(fetchError)
      setIsLoading(false)
    })()

    return () => {
      cancelled = true
    }
  }, [taskId, enabled])

  return {
    offers,
    isLoading,
    error,
    reload: load,
  }
}
