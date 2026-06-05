import { useCallback, useState } from 'react'

import { completeTask } from '@/services/tasks'
import type { TaskId } from '@/types/index'

export function useCompleteTask(onCompleted?: () => void) {
  const [isCompleting, setIsCompleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const complete = useCallback(
    async (taskId: TaskId) => {
      setIsCompleting(true)
      setError(null)
      setSuccessMessage(null)

      const result = await completeTask(taskId)

      setIsCompleting(false)

      if (result.error) {
        setError(result.error)
        return false
      }

      if (result.message) {
        setSuccessMessage(result.message)
      }

      onCompleted?.()
      return true
    },
    [onCompleted],
  )

  const clearMessages = useCallback(() => {
    setError(null)
    setSuccessMessage(null)
  }, [])

  return {
    isCompleting,
    error,
    successMessage,
    complete,
    clearMessages,
  }
}
