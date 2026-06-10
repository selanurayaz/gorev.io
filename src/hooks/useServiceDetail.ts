import { useCallback, useEffect, useState } from 'react'

import { subscribeReviewSubmitted } from '@/lib/review-events'
import { fetchCategories } from '@/services/categories'
import { fetchServiceDetailById } from '@/services/marketplace'
import type { MarketplaceService } from '@/types/service'
import type { ServiceId } from '@/types/index'

function buildCategoryNameMap(
  categories: { id: string; name: string }[],
): Map<string, string> {
  return new Map(categories.map((category) => [category.id, category.name]))
}

export function useServiceDetail(serviceId: ServiceId | undefined) {
  const [service, setService] = useState<MarketplaceService | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!serviceId) {
      setService(null)
      setError('Geçersiz hizmet bağlantısı.')
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    const { categories } = await fetchCategories()
    const categoryNames = buildCategoryNameMap(categories)
    const { service: row, error: fetchError } = await fetchServiceDetailById(
      serviceId,
      categoryNames,
    )

    setService(row)
    setError(fetchError ?? (row ? null : 'Hizmet bulunamadı.'))
    setIsLoading(false)
  }, [serviceId])

  useEffect(() => {
    let cancelled = false

    void (async () => {
      if (!serviceId) {
        if (!cancelled) {
          setService(null)
          setError('Geçersiz hizmet bağlantısı.')
          setIsLoading(false)
        }
        return
      }

      setIsLoading(true)
      setError(null)

      const { categories } = await fetchCategories()
      if (cancelled) return

      const categoryNames = buildCategoryNameMap(categories)
      const { service: row, error: fetchError } = await fetchServiceDetailById(
        serviceId,
        categoryNames,
      )

      if (cancelled) return
      setService(row)
      setError(fetchError ?? (row ? null : 'Hizmet bulunamadı.'))
      setIsLoading(false)
    })()

    return () => {
      cancelled = true
    }
  }, [serviceId])

  useEffect(() => {
    if (!serviceId) return undefined

    return subscribeReviewSubmitted((detail) => {
      if (detail.serviceId && detail.serviceId !== serviceId) return
      void load()
    })
  }, [load, serviceId])

  return {
    service,
    isLoading,
    error,
    reload: load,
  }
}
