import { resolveTurkishCityName } from '@/lib/cities'
import type { MarketplaceTask } from '@/types/task'

export type MarketplaceFilters = {
  search: string
  categoryId: string
  city: string
}

export const emptyMarketplaceFilters: MarketplaceFilters = {
  search: '',
  categoryId: '',
  city: '',
}

export function filterMarketplaceTasks(
  tasks: MarketplaceTask[],
  filters: MarketplaceFilters,
): MarketplaceTask[] {
  const query = filters.search.trim().toLocaleLowerCase('tr')
  const city = filters.city.trim().toLocaleLowerCase('tr')

  return tasks.filter((task) => {
    if (filters.categoryId && task.category_id !== filters.categoryId) {
      return false
    }

    if (city) {
      const filterCity = resolveTurkishCityName(city) ?? city.trim()
      const taskCity =
        resolveTurkishCityName(task.city) ?? (task.city ?? '').trim()
      if (taskCity !== filterCity) return false
    }

    if (!query) return true

    const haystack = [
      task.title,
      task.description,
      task.category_name,
      task.city,
      task.owner_name,
    ]
      .filter(Boolean)
      .join(' ')
      .toLocaleLowerCase('tr')

    return haystack.includes(query)
  })
}
