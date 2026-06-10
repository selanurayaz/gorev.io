import { useCallback, useEffect, useMemo, useState } from 'react'

import { subscribeReviewSubmitted } from '@/lib/review-events'
import { fetchCategories } from '@/services/categories'
import { fetchServiceRatingSummariesByIds } from '@/services/reviews'
import { fetchMyServices } from '@/services/services'
import type { UserRatingSummary } from '@/types/review'
import type { ServiceListItem } from '@/types/service'

function buildCategoryNameMap(
  categories: { id: string; name: string }[],
): Map<string, string> {
  return new Map(categories.map((category) => [category.id, category.name]))
}

export function useMyServices() {
  const [services, setServices] = useState<ServiceListItem[]>([])
  const [serviceRatings, setServiceRatings] = useState<
    Map<string, UserRatingSummary>
  >(new Map())
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    const { categories } = await fetchCategories()
    const categoryNames = buildCategoryNameMap(categories)

    const { services: rows, error: servicesError } =
      await fetchMyServices(categoryNames)

    const ratings = await fetchServiceRatingSummariesByIds(
      rows.map((service) => service.id),
    )

    setServices(rows)
    setServiceRatings(ratings)
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

      const ratings = await fetchServiceRatingSummariesByIds(
        rows.map((service) => service.id),
      )

      if (cancelled) return
      setServices(rows)
      setServiceRatings(ratings)
      setError(servicesError)
      setIsLoading(false)
    })()

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => subscribeReviewSubmitted(() => void load()), [load])

  const serviceCount = useMemo(() => services.length, [services])

  return {
    services,
    serviceRatings,
    serviceCount,
    isLoading,
    error,
    reload: load,
  }
}
