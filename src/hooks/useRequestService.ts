import { useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { messageThreadPath } from '@/lib/paths'
import { requestService } from '@/services/service-requests'
import type { ServiceId, TaskId } from '@/types/index'

export function useRequestService() {
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const submit = useCallback(
    async (serviceId: ServiceId) => {
      setIsSubmitting(true)
      setError(null)
      setSuccessMessage(null)

      const result = await requestService(serviceId)

      setIsSubmitting(false)

      if (import.meta.env.DEV) {
        console.info('[useRequestService] result', result)
      }

      if (!result.offerId) {
        setError(
          result.error ??
            'Talep kaydı oluşturulamadı. Teklif tablosuna satır eklenemedi.',
        )
        return false
      }

      if (result.error) {
        setError(result.error)
        return false
      }

      if (result.taskId && result.providerId) {
        setSuccessMessage(
          'Hizmet talebiniz gönderildi. Hizmet veren yanıt verdiğinde mesajlaşabilirsiniz.',
        )
        navigate(
          messageThreadPath(result.taskId as TaskId, result.providerId),
        )
        return true
      }

      setError(result.error ?? 'Talep gönderilemedi.')
      return false
    },
    [navigate],
  )

  const clearMessages = useCallback(() => {
    setError(null)
    setSuccessMessage(null)
  }, [])

  return {
    isSubmitting,
    error,
    successMessage,
    submit,
    clearMessages,
  }
}
