import { useCallback, useEffect, useState } from 'react'

import { subscribeReviewSubmitted } from '@/lib/review-events'
import { fetchReviewsForService } from '@/services/reviews'
import type { ReviewListItem } from '@/types/review'
import type { ServiceId } from '@/types/index'

export function useServiceReviews(serviceId: ServiceId | undefined, limit = 10) {
  const [reviews, setReviews] = useState<ReviewListItem[]>([])
  const [isLoading, setIsLoading] = useState(Boolean(serviceId))
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!serviceId) {
      setReviews([])
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    const result = await fetchReviewsForService(serviceId, limit)

    setReviews(result.reviews)
    setError(result.error)
    setIsLoading(false)
  }, [serviceId, limit])

  useEffect(() => {
    let cancelled = false

    void (async () => {
      if (!serviceId) {
        if (!cancelled) {
          setReviews([])
          setIsLoading(false)
        }
        return
      }

      setIsLoading(true)
      setError(null)

      const result = await fetchReviewsForService(serviceId, limit)

      if (cancelled) return
      setReviews(result.reviews)
      setError(result.error)
      setIsLoading(false)
    })()

    return () => {
      cancelled = true
    }
  }, [serviceId, limit])

  useEffect(() => {
    if (!serviceId) return undefined

    return subscribeReviewSubmitted((detail) => {
      if (detail.serviceId && detail.serviceId !== serviceId) return
      void load()
    })
  }, [load, serviceId])

  return {
    reviews,
    isLoading,
    error,
    reload: load,
  }
}
