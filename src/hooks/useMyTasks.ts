import { useCallback, useEffect, useMemo, useState } from 'react'

import { fetchCategories } from '@/services/categories'
import { fetchMyTasks } from '@/services/tasks'
import type { TaskListItem } from '@/types/task'

function buildCategoryNameMap(
  categories: { id: string; name: string }[],
): Map<string, string> {
  return new Map(categories.map((category) => [category.id, category.name]))
}

export function useMyTasks() {
  const [tasks, setTasks] = useState<TaskListItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    const { categories } = await fetchCategories()
    const categoryNames = buildCategoryNameMap(categories)

    const { tasks: rows, error: tasksError } = await fetchMyTasks(categoryNames)

    setTasks(rows)
    setError(tasksError)
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
      const { tasks: rows, error: tasksError } = await fetchMyTasks(
        categoryNames,
      )

      if (cancelled) return
      setTasks(rows)
      setError(tasksError)
      setIsLoading(false)
    })()

    return () => {
      cancelled = true
    }
  }, [])

  const taskCount = useMemo(() => tasks.length, [tasks])

  return {
    tasks,
    taskCount,
    isLoading,
    error,
    reload: load,
  }
}
