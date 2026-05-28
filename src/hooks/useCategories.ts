import { useCallback, useEffect, useState } from 'react'

import { fetchCategories } from '@/services/categories'
import type { ServiceCategory } from '@/types/category'

export function useCategories() {
  const [categories, setCategories] = useState<ServiceCategory[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    const { categories: rows, error: fetchError } = await fetchCategories()

    setCategories(rows)
    setError(fetchError)
    setIsLoading(false)
  }, [])

  useEffect(() => {
    let cancelled = false

    void (async () => {
      setIsLoading(true)
      setError(null)
      const { categories: rows, error: fetchError } = await fetchCategories()
      if (cancelled) return
      setCategories(rows)
      setError(fetchError)
      setIsLoading(false)
    })()

    return () => {
      cancelled = true
    }
  }, [])

  return {
    categories,
    isLoading,
    error,
    reload: load,
  }
}
