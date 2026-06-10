import { useCallback, useEffect, useState } from 'react'

import { fetchReviewsForUser } from '@/services/reviews'
import type { ReviewListItem } from '@/types/review'

export function useUserReviews(userId: string | undefined, limit = 5) {
  const [reviews, setReviews] = useState<ReviewListItem[]>([])
  const [isLoading, setIsLoading] = useState(Boolean(userId))
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!userId) {
      setReviews([])
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    const result = await fetchReviewsForUser(userId, limit)

    setReviews(result.reviews)
    setError(result.error)
    setIsLoading(false)
  }, [userId, limit])

  useEffect(() => {
    let cancelled = false

    void (async () => {
      if (!userId) {
        if (!cancelled) {
          setReviews([])
          setIsLoading(false)
        }
        return
      }

      setIsLoading(true)
      setError(null)

      const result = await fetchReviewsForUser(userId, limit)

      if (cancelled) return
      setReviews(result.reviews)
      setError(result.error)
      setIsLoading(false)
    })()

    return () => {
      cancelled = true
    }
  }, [userId, limit])

  return {
    reviews,
    isLoading,
    error,
    reload: load,
  }
}
