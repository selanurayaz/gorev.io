import { useCallback, useEffect, useMemo, useState } from 'react'

import { fetchCategories } from '@/services/categories'
import { fetchMyServices } from '@/services/services'
import type { ServiceListItem } from '@/types/service'

function buildCategoryNameMap(
  categories: { id: string; name: string }[],
): Map<string, string> {
  return new Map(categories.map((category) => [category.id, category.name]))
}

export function useMyServices() {
  const [services, setServices] = useState<ServiceListItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    const { categories } = await fetchCategories()
    const categoryNames = buildCategoryNameMap(categories)

    const { services: rows, error: servicesError } =
      await fetchMyServices(categoryNames)

    setServices(rows)
    setError(servicesError)
    setIsLoading(false)
  }, [])

  useEffect(() => {
    let cancelled = false

    void (async () => {
      setIsLoading(true)
      setError(null)

      const { categories } = await fetchCategories()
      if (cancelled) return

      const categoryNames = buildCategoryNameMap(categories)
      const { services: rows, error: servicesError } =
        await fetchMyServices(categoryNames)

      if (cancelled) return
      setServices(rows)
      setError(servicesError)
      setIsLoading(false)
    })()

    return () => {
      cancelled = true
    }
  }, [])

  const serviceCount = useMemo(() => services.length, [services])

  return {
    services,
    serviceCount,
    isLoading,
    error,
    reload: load,
  }
}
