import { useCallback, useEffect, useState } from 'react'

import { fetchIncomingOffersForOwner } from '@/services/offers'
import type { IncomingOfferItem } from '@/types/offer'

export function useIncomingOffers(enabled = true) {
  const [offers, setOffers] = useState<IncomingOfferItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!enabled) return

    setIsLoading(true)
    setError(null)

    const { offers: rows, error: fetchError } =
      await fetchIncomingOffersForOwner()

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
        await fetchIncomingOffersForOwner()

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
