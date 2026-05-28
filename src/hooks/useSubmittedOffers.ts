import { useCallback, useEffect, useState } from 'react'

import { fetchSubmittedOffersByProvider } from '@/services/offers'
import type { SubmittedOfferItem } from '@/types/offer'

export function useSubmittedOffers(enabled = true) {
  const [offers, setOffers] = useState<SubmittedOfferItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!enabled) return

    setIsLoading(true)
    setError(null)

    const { offers: rows, error: fetchError } =
      await fetchSubmittedOffersByProvider()

    setOffers(rows)
    setError(fetchError)
    setIsLoading(false)
  }, [enabled])

  useEffect(() => {
    if (!enabled) return

    let cancelled = false

    void (async () => {
      setIsLoading(true)
      setError(null)

      const { offers: rows, error: fetchError } =
        await fetchSubmittedOffersByProvider()

      if (cancelled) return
      setOffers(rows)
      setError(fetchError)
      setIsLoading(false)
    })()

    return () => {
      cancelled = true
    }
  }, [enabled])

  return {
    offers,
    isLoading,
    error,
    reload: load,
  }
}
