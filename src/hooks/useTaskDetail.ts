import { useCallback, useEffect, useState } from 'react'

import { fetchCategories } from '@/services/categories'
import { fetchTaskDetailById } from '@/services/tasks'
import type { MarketplaceTask } from '@/types/task'
import type { TaskId } from '@/types/index'

function buildCategoryNameMap(
  categories: { id: string; name: string }[],
): Map<string, string> {
  return new Map(categories.map((category) => [category.id, category.name]))
}

export function useTaskDetail(taskId: TaskId | undefined) {
  const [task, setTask] = useState<MarketplaceTask | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!taskId) {
      setTask(null)
      setError('Geçersiz görev bağlantısı.')
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    const { categories } = await fetchCategories()
    const categoryNames = buildCategoryNameMap(categories)
    const { task: row, error: fetchError } = await fetchTaskDetailById(
      taskId,
      categoryNames,
    )

    setTask(row)
    setError(fetchError ?? (row ? null : 'Görev bulunamadı.'))
    setIsLoading(false)
  }, [taskId])

  useEffect(() => {
    let cancelled = false

    void (async () => {
      if (!taskId) {
        if (!cancelled) {
          setTask(null)
          setError('Geçersiz görev bağlantısı.')
          setIsLoading(false)
        }
        return
      }

      setIsLoading(true)
      setError(null)

      const { categories } = await fetchCategories()
      if (cancelled) return

      const categoryNames = buildCategoryNameMap(categories)
      const { task: row, error: fetchError } = await fetchTaskDetailById(
        taskId,
        categoryNames,
      )

      if (cancelled) return
      setTask(row)
      setError(fetchError ?? (row ? null : 'Görev bulunamadı.'))
      setIsLoading(false)
    })()

    return () => {
      cancelled = true
    }
  }, [taskId])

  return {
    task,
    isLoading,
    error,
    reload: load,
  }
}
