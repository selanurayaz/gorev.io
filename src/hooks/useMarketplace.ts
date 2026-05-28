import { useCallback, useEffect, useMemo, useState } from 'react'

import {
  emptyMarketplaceFilters,
  filterMarketplaceTasks,
  type MarketplaceFilters,
} from '@/lib/marketplace-filters'
import { fetchCategories } from '@/services/categories'
import { fetchOpenMarketplaceTasks } from '@/services/marketplace'
import type { MarketplaceTask } from '@/types/task'
import type { ServiceCategory } from '@/types/category'

function buildCategoryNameMap(
  categories: ServiceCategory[],
): Map<string, string> {
  return new Map(categories.map((category) => [category.id, category.name]))
}

export function useMarketplace() {
  const [tasks, setTasks] = useState<MarketplaceTask[]>([])
  const [categories, setCategories] = useState<ServiceCategory[]>([])
  const [filters, setFilters] = useState<MarketplaceFilters>(
    emptyMarketplaceFilters,
  )
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    const { categories: categoryRows } = await fetchCategories()
    const categoryNames = buildCategoryNameMap(categoryRows)
    const { tasks: openTasks, error: fetchError } =
      await fetchOpenMarketplaceTasks(categoryNames)

    setCategories(categoryRows)
    setTasks(openTasks)
    setError(fetchError)
    setIsLoading(false)
  }, [])

  useEffect(() => {
    let cancelled = false

    void (async () => {
      setIsLoading(true)
      setError(null)

      const { categories: categoryRows } = await fetchCategories()
      if (cancelled) return

      const categoryNames = buildCategoryNameMap(categoryRows)
      const { tasks: openTasks, error: fetchError } =
        await fetchOpenMarketplaceTasks(categoryNames)

      if (cancelled) return
      setCategories(categoryRows)
      setTasks(openTasks)
      setError(fetchError)
      setIsLoading(false)
    })()

    return () => {
      cancelled = true
    }
  }, [])

  const filteredTasks = useMemo(
    () => filterMarketplaceTasks(tasks, filters),
    [tasks, filters],
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
    tasks: filteredTasks,
    totalCount: tasks.length,
    visibleCount: filteredTasks.length,
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
