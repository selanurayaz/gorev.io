import { useCallback, useState } from 'react'

import {
  acceptServiceRequest,
  rejectServiceRequest,
} from '@/services/service-requests'

export function useServiceRequestActions(onCompleted?: () => void) {
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const accept = useCallback(
    async (offerId: string) => {
      setProcessingId(offerId)
      setActionError(null)
      setSuccessMessage(null)

      const result = await acceptServiceRequest(offerId)

      setProcessingId(null)

      if (!result.success) {
        setActionError(result.error)
        return false
      }

      setSuccessMessage(result.message)
      onCompleted?.()
      return true
    },
    [onCompleted],
  )

  const reject = useCallback(
    async (offerId: string) => {
      setProcessingId(offerId)
      setActionError(null)
      setSuccessMessage(null)

      const result = await rejectServiceRequest(offerId)

      setProcessingId(null)

      if (!result.success) {
        setActionError(result.error)
        return false
      }

      setSuccessMessage(result.message)
      onCompleted?.()
      return true
    },
    [onCompleted],
  )

  const clearMessages = useCallback(() => {
    setActionError(null)
    setSuccessMessage(null)
  }, [])

  return {
    processingId,
    actionError,
    successMessage,
    accept,
    reject,
    clearMessages,
  }
}
