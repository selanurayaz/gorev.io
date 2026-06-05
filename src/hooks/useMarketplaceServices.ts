import { useCallback, useEffect, useMemo, useState } from 'react'

import {
  emptyMarketplaceFilters,
  filterMarketplaceServices,
  type MarketplaceFilters,
} from '@/lib/marketplace-filters'
import { fetchCategories } from '@/services/categories'
import { fetchActiveMarketplaceServices } from '@/services/marketplace'
import type { ServiceCategory } from '@/types/category'
import type { MarketplaceService } from '@/types/service'

function buildCategoryNameMap(
  categories: ServiceCategory[],
): Map<string, string> {
  return new Map(categories.map((category) => [category.id, category.name]))
}

export function useMarketplaceServices(enabled = true) {
  const [services, setServices] = useState<MarketplaceService[]>([])
  const [categories, setCategories] = useState<ServiceCategory[]>([])
  const [filters, setFilters] = useState<MarketplaceFilters>(
    emptyMarketplaceFilters,
  )
  const [isLoading, setIsLoading] = useState(enabled)
  const [error, setError] = useState<string | null>(null)
  const [hasLoaded, setHasLoaded] = useState(false)

  const load = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    const { categories: categoryRows } = await fetchCategories()
    const categoryNames = buildCategoryNameMap(categoryRows)
    const { services: activeServices, error: fetchError } =
      await fetchActiveMarketplaceServices(categoryNames)

    setCategories(categoryRows)
    setServices(activeServices)
    setError(fetchError)
    setIsLoading(false)
    setHasLoaded(true)
  }, [])

  useEffect(() => {
    if (!enabled || hasLoaded) return

    let cancelled = false

    void (async () => {
      setIsLoading(true)
      setError(null)

      const { categories: categoryRows } = await fetchCategories()
      if (cancelled) return

      const categoryNames = buildCategoryNameMap(categoryRows)
      const { services: activeServices, error: fetchError } =
        await fetchActiveMarketplaceServices(categoryNames)

      if (cancelled) return
      setCategories(categoryRows)
      setServices(activeServices)
      setError(fetchError)
      setIsLoading(false)
      setHasLoaded(true)
    })()

    return () => {
      cancelled = true
    }
  }, [enabled, hasLoaded])

  const filteredServices = useMemo(
    () => filterMarketplaceServices(services, filters),
    [services, filters],
  )

  const setFilter = useCallback(
    <K extends keyof MarketplaceFilters>(
      key: K,
      value: MarketplaceFilters[K],
    ) => {
      setFilters((prev) => ({ ...prev, [key]: value }))
    },
    [],
  )

  const clearFilters = useCallback(() => {
    setFilters(emptyMarketplaceFilters)
  }, [])

  const hasActiveFilters = useMemo(
    () =>
      Boolean(
        filters.search.trim() ||
          filters.categoryId ||
          filters.city.trim(),
      ),
    [filters],
  )

  return {
    services: filteredServices,
    totalCount: services.length,
    visibleCount: filteredServices.length,
    categories,
    filters,
    setFilter,
    clearFilters,
    hasActiveFilters,
    isLoading,
    error,
    reload: load,
  }
}
