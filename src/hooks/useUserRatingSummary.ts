import { useCallback, useEffect, useState } from 'react'

import { fetchUserRatingSummary } from '@/services/reviews'
import type { UserRatingSummary } from '@/types/review'

const emptySummary: UserRatingSummary = {
  averageRating: null,
  reviewCount: 0,
}

export function useUserRatingSummary(userId: string | undefined) {
  const [summary, setSummary] = useState<UserRatingSummary>(emptySummary)
  const [isLoading, setIsLoading] = useState(Boolean(userId))
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!userId) {
      setSummary(emptySummary)
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    const result = await fetchUserRatingSummary(userId)

    setSummary(result.summary)
    setError(result.error)
    setIsLoading(false)
  }, [userId])

  useEffect(() => {
    let cancelled = false

    void (async () => {
      if (!userId) {
        if (!cancelled) {
          setSummary(emptySummary)
          setIsLoading(false)
        }
        return
      }

      setIsLoading(true)
      setError(null)

      const result = await fetchUserRatingSummary(userId)

      if (cancelled) return
      setSummary(result.summary)
      setError(result.error)
      setIsLoading(false)
    })()

    return () => {
      cancelled = true
    }
  }, [userId])

  return {
    summary,
    isLoading,
    error,
    reload: load,
  }
}
