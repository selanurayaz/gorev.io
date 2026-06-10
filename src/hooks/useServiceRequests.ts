import { useCallback, useEffect, useState } from 'react'

import { fetchServiceRequestsForProvider } from '@/services/service-requests'
import type { ServiceRequestItem } from '@/types/offer'

export function useServiceRequests() {
  const [requests, setRequests] = useState<ServiceRequestItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    const result = await fetchServiceRequestsForProvider()

    setRequests(result.requests)
    setError(result.error)
    setIsLoading(false)
  }, [])

  useEffect(() => {
    let cancelled = false

    void (async () => {
      setIsLoading(true)
      setError(null)

      const result = await fetchServiceRequestsForProvider()

      if (cancelled) return
      setRequests(result.requests)
      setError(result.error)
      setIsLoading(false)
    })()

    return () => {
      cancelled = true
    }
  }, [])

  return {
    requests,
    isLoading,
    error,
    reload: load,
  }
}
