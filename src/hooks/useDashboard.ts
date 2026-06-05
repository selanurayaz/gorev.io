import { useCallback, useEffect, useState } from 'react'

import { fetchDashboardData } from '@/services/dashboard'
import type { DashboardData } from '@/types/dashboard'

export function useDashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    const result = await fetchDashboardData()

    setData(result.data)
    setError(result.error)
    setIsLoading(false)
  }, [])

  useEffect(() => {
    let cancelled = false

    void (async () => {
      setIsLoading(true)
      setError(null)

      const result = await fetchDashboardData()

      if (cancelled) return
      setData(result.data)
      setError(result.error)
      setIsLoading(false)
    })()

    return () => {
      cancelled = true
    }
  }, [])

  return {
    data,
    isLoading,
    error,
    reload: load,
  }
}
