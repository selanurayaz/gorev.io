import { useCallback, useState } from 'react'

import {
  emptyOfferForm,
  offerFormToPrice,
  validateOfferForm,
  type OfferFormErrors,
} from '@/lib/offer-form'
import { createOffer } from '@/services/offers'
import type { OfferFormValues } from '@/types/offer'
import type { TaskId } from '@/types/index'

export function useCreateOffer(taskId: TaskId | undefined) {
  const [form, setForm] = useState<OfferFormValues>(emptyOfferForm)
  const [fieldErrors, setFieldErrors] = useState<OfferFormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const setField = useCallback(
    <K extends keyof OfferFormValues>(key: K, value: OfferFormValues[K]) => {
      setForm((prev) => ({ ...prev, [key]: value }))
      setFieldErrors((prev) => {
        if (!prev[key]) return prev
        const next = { ...prev }
        delete next[key]
        return next
      })
      setSubmitError(null)
      setSuccessMessage(null)
    },
    [],
  )

  const submit = useCallback(async () => {
    if (!taskId) {
      setSubmitError('Geçersiz görev.')
      return false
    }

    setSubmitError(null)
    setSuccessMessage(null)

    const errors = validateOfferForm(form)
    setFieldErrors(errors)
    if (Object.keys(errors).length > 0) return false

    const price = offerFormToPrice(form)
    if (price === null) {
      setFieldErrors({ price: 'Geçerli bir teklif fiyatı girin.' })
      return false
    }

    setIsSubmitting(true)

    const { error } = await createOffer({
      task_id: taskId,
      price,
      message: form.message.trim(),
    })

    setIsSubmitting(false)

    if (error) {
      setSubmitError(error)
      return false
    }

    setSuccessMessage('Teklifiniz gönderildi. Görev sahibi inceledikten sonra size dönüş yapabilir.')
    setForm(emptyOfferForm)
    return true
  }, [form, taskId])

  return {
    form,
    fieldErrors,
    isSubmitting,
    submitError,
    successMessage,
    setField,
    submit,
  }
}
