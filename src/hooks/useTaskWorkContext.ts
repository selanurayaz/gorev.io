import { useCallback, useEffect, useState } from 'react'

import { useAuth } from '@/hooks/useAuth'
import {
  isTaskCompletedStatus,
  isTaskInProgressStatus,
} from '@/lib/task-status'
import { fetchTaskWorkMeta } from '@/services/tasks'
import type { TaskId } from '@/types/index'

export function useTaskWorkContext(taskId: TaskId | undefined) {
  const { user } = useAuth()
  const [customerId, setCustomerId] = useState<string | null>(null)
  const [status, setStatus] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(Boolean(taskId))
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!taskId) {
      setCustomerId(null)
      setStatus(null)
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    const { meta, error: fetchError } = await fetchTaskWorkMeta(taskId)

    setCustomerId(meta?.customer_id ?? null)
    setStatus(meta?.status ?? null)
    setError(fetchError)
    setIsLoading(false)
  }, [taskId])

  useEffect(() => {
    let cancelled = false

    void (async () => {
      if (!taskId) {
        if (!cancelled) {
          setCustomerId(null)
          setStatus(null)
          setIsLoading(false)
        }
        return
      }

      setIsLoading(true)
      setError(null)

      const { meta, error: fetchError } = await fetchTaskWorkMeta(taskId)

      if (cancelled) return
      setCustomerId(meta?.customer_id ?? null)
      setStatus(meta?.status ?? null)
      setError(fetchError)
      setIsLoading(false)
    })()

    return () => {
      cancelled = true
    }
  }, [taskId])

  const isOwner = Boolean(
    user?.id && customerId && user.id === customerId,
  )
  const isInProgress = isTaskInProgressStatus(status)
  const isCompleted = isTaskCompletedStatus(status)

  return {
    isOwner,
    isInProgress,
    isCompleted,
    status,
    isLoading,
    error,
    reload: load,
  }
}
