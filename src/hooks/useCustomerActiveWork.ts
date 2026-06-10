import { useCallback, useEffect, useMemo, useState } from 'react'

import { loadAllServiceRequestTaskIds } from '@/lib/task-source'
import {
  isTaskCompletedStatus,
  isTaskInProgressStatus,
} from '@/lib/task-status'
import { fetchCategories } from '@/services/categories'
import { fetchCustomerActiveWork } from '@/services/tasks'
import type { TaskListItem } from '@/types/task'

function buildCategoryNameMap(
  categories: { id: string; name: string }[],
): Map<string, string> {
  return new Map(categories.map((category) => [category.id, category.name]))
}

function partitionCustomerWork(
  tasks: TaskListItem[],
  serviceRequestTaskIds: Set<string>,
) {
  const isServiceRequest = (task: TaskListItem) =>
    serviceRequestTaskIds.has(task.id)

  const ongoing = tasks.filter(
    (task) =>
      isTaskInProgressStatus(task.status) && !isTaskCompletedStatus(task.status),
  )

  const completed = tasks.filter((task) => isTaskCompletedStatus(task.status))

  return {
    serviceRequestOngoing: ongoing.filter(isServiceRequest),
    serviceRequestCompleted: completed.filter(isServiceRequest),
    otherOngoing: ongoing.filter((task) => !isServiceRequest(task)),
    otherCompleted: completed.filter((task) => !isServiceRequest(task)),
    tasks,
  }
}

export function useCustomerActiveWork() {
  const [tasks, setTasks] = useState<TaskListItem[]>([])
  const [serviceRequestTaskIds, setServiceRequestTaskIds] = useState<
    Set<string>
  >(new Set())
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    const [{ categories }, serviceRequestIds] = await Promise.all([
      fetchCategories(),
      loadAllServiceRequestTaskIds(),
    ])
    const categoryNames = buildCategoryNameMap(categories)
    const result = await fetchCustomerActiveWork(categoryNames)

    setServiceRequestTaskIds(serviceRequestIds)
    setTasks(result.tasks)
    setError(result.error)
    setIsLoading(false)
  }, [])

  useEffect(() => {
    let cancelled = false

    void (async () => {
      setIsLoading(true)
      setError(null)

      const [{ categories }, serviceRequestIds] = await Promise.all([
        fetchCategories(),
        loadAllServiceRequestTaskIds(),
      ])
      if (cancelled) return

      const categoryNames = buildCategoryNameMap(categories)
      const result = await fetchCustomerActiveWork(categoryNames)

      if (cancelled) return
      setServiceRequestTaskIds(serviceRequestIds)
      setTasks(result.tasks)
      setError(result.error)
      setIsLoading(false)
    })()

    return () => {
      cancelled = true
    }
  }, [])

  const partitions = useMemo(
    () => partitionCustomerWork(tasks, serviceRequestTaskIds),
    [tasks, serviceRequestTaskIds],
  )

  return {
    ...partitions,
    isLoading,
    error,
    reload: load,
  }
}
