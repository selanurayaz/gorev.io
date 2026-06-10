import { useCallback, useEffect, useState } from 'react'

import {
  emptyReviewForm,
  validateReviewForm,
  type ReviewFormErrors,
} from '@/lib/review-form'
import { emitReviewSubmitted } from '@/lib/review-events'
import { fetchTaskRowForReview, readSourceServiceId } from '@/lib/task-source'
import { fetchAcceptedProviderIdForTask } from '@/services/offers'
import { createTaskReview, fetchTaskReviewByReviewer } from '@/services/reviews'
import type { Review, ReviewFormValues } from '@/types/review'
import type { ServiceId, TaskId } from '@/types/index'

export function useTaskReview(
  taskId: TaskId | undefined,
  enabled: boolean,
  onSubmitted?: () => void,
) {
  const [providerId, setProviderId] = useState<string | null>(null)
  const [sourceServiceId, setSourceServiceId] = useState<ServiceId | null>(null)
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
      setSourceServiceId(null)
      setExistingReview(null)
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    const [provider, reviewResult, taskResult] = await Promise.all([
      fetchAcceptedProviderIdForTask(taskId),
      fetchTaskReviewByReviewer(taskId),
      fetchTaskRowForReview(taskId),
    ])

    setProviderId(provider)
    setExistingReview(reviewResult.review)
    setSourceServiceId(
      taskResult.row ? readSourceServiceId(taskResult.row) : null,
    )
    setError(reviewResult.error)
    setIsLoading(false)
  }, [taskId, enabled])

  useEffect(() => {
    let cancelled = false

    void (async () => {
      if (!taskId || !enabled) {
        if (!cancelled) {
          setProviderId(null)
          setSourceServiceId(null)
          setExistingReview(null)
          setIsLoading(false)
        }
        return
      }

      setIsLoading(true)
      setError(null)

      const [provider, reviewResult, taskResult] = await Promise.all([
        fetchAcceptedProviderIdForTask(taskId),
        fetchTaskReviewByReviewer(taskId),
        fetchTaskRowForReview(taskId),
      ])

      if (cancelled) return
      setProviderId(provider)
      setExistingReview(reviewResult.review)
      setSourceServiceId(
        taskResult.row ? readSourceServiceId(taskResult.row) : null,
      )
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
      service_id: sourceServiceId,
    })

    setIsSubmitting(false)

    if (createError) {
      setSubmitError(createError)
      return false
    }

    setExistingReview(review)
    setSuccessMessage('Değerlendirmeniz kaydedildi. Teşekkür ederiz!')

    const resolvedServiceId = review?.service_id ?? sourceServiceId ?? null
    emitReviewSubmitted({
      taskId,
      serviceId: resolvedServiceId,
    })
    onSubmitted?.()

    return true
  }, [form, onSubmitted, providerId, sourceServiceId, taskId])

  return {
    providerId,
    sourceServiceId,
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
