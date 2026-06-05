import { useCallback, useEffect, useState } from 'react'

import {
  emptyReviewForm,
  validateReviewForm,
  type ReviewFormErrors,
} from '@/lib/review-form'
import { fetchAcceptedProviderIdForTask } from '@/services/offers'
import { createTaskReview, fetchTaskReviewByReviewer } from '@/services/reviews'
import type { Review, ReviewFormValues } from '@/types/review'
import type { TaskId } from '@/types/index'

export function useTaskReview(
  taskId: TaskId | undefined,
  enabled: boolean,
) {
  const [providerId, setProviderId] = useState<string | null>(null)
  const [existingReview, setExistingReview] = useState<Review | null>(null)
  const [form, setForm] = useState<ReviewFormValues>(emptyReviewForm)
  const [fieldErrors, setFieldErrors] = useState<ReviewFormErrors>({})
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!taskId || !enabled) {
      setProviderId(null)
      setExistingReview(null)
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    const [provider, reviewResult] = await Promise.all([
      fetchAcceptedProviderIdForTask(taskId),
      fetchTaskReviewByReviewer(taskId),
    ])

    setProviderId(provider)
    setExistingReview(reviewResult.review)
    setError(reviewResult.error)
    setIsLoading(false)
  }, [taskId, enabled])

  useEffect(() => {
    let cancelled = false

    void (async () => {
      if (!taskId || !enabled) {
        if (!cancelled) {
          setProviderId(null)
          setExistingReview(null)
          setIsLoading(false)
        }
        return
      }

      setIsLoading(true)
      setError(null)

      const [provider, reviewResult] = await Promise.all([
        fetchAcceptedProviderIdForTask(taskId),
        fetchTaskReviewByReviewer(taskId),
      ])

      if (cancelled) return
      setProviderId(provider)
      setExistingReview(reviewResult.review)
      setError(reviewResult.error)
      setIsLoading(false)
    })()

    return () => {
      cancelled = true
    }
  }, [taskId, enabled])

  const setField = useCallback(
    <K extends keyof ReviewFormValues>(key: K, value: ReviewFormValues[K]) => {
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
    if (!taskId || !providerId) return false

    setSubmitError(null)
    setSuccessMessage(null)

    const errors = validateReviewForm(form)
    setFieldErrors(errors)
    if (Object.keys(errors).length > 0) return false

    setIsSubmitting(true)

    const { review, error: createError } = await createTaskReview({
      task_id: taskId,
      reviewed_user_id: providerId,
      rating: form.rating,
      comment: form.comment.trim(),
    })

    setIsSubmitting(false)

    if (createError) {
      setSubmitError(createError)
      return false
    }

    setExistingReview(review)
    setSuccessMessage('Değerlendirmeniz kaydedildi. Teşekkür ederiz!')
    return true
  }, [form, providerId, taskId])

  return {
    providerId,
    existingReview,
    form,
    fieldErrors,
    isLoading,
    isSubmitting,
    error,
    submitError,
    successMessage,
    setField,
    submit,
    reload: load,
  }
}
