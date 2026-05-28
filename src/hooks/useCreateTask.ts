import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { useProfile } from '@/hooks/useProfile'
import { resolveTurkishCityName } from '@/lib/cities'
import {
  emptyTaskForm,
  validateTaskForm,
  type TaskFormErrors,
} from '@/lib/task-form'
import { createTask } from '@/services/tasks'
import type { TaskFormValues } from '@/types/task'

export function useCreateTask() {
  const navigate = useNavigate()
  const { profile, isLoading: profileLoading } = useProfile()

  const [form, setForm] = useState<TaskFormValues>(emptyTaskForm)
  const [fieldErrors, setFieldErrors] = useState<TaskFormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [cityPrefilled, setCityPrefilled] = useState(false)
  const redirectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  )

  useEffect(() => {
    return () => {
      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current)
      }
    }
  }, [])

  useEffect(() => {
    if (profileLoading || cityPrefilled || !profile?.city) return

    let cancelled = false

    void (async () => {
      const resolvedCity = resolveTurkishCityName(profile.city)
      if (cancelled) return

      if (resolvedCity) {
        setForm((prev) =>
          prev.city.trim() ? prev : { ...prev, city: resolvedCity },
        )
      }

      setCityPrefilled(true)
    })()

    return () => {
      cancelled = true
    }
  }, [profile?.city, profileLoading, cityPrefilled])

  const setField = useCallback(
    <K extends keyof TaskFormValues>(key: K, value: TaskFormValues[K]) => {
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
    setSubmitError(null)
    setSuccessMessage(null)

    const errors = validateTaskForm(form)
    setFieldErrors(errors)
    if (Object.keys(errors).length > 0) return

    const budgetMin = Number(form.budget_min.trim().replace(',', '.'))
    const budgetMax = Number(form.budget_max.trim().replace(',', '.'))

    setIsSubmitting(true)

    const { task, error } = await createTask({
      title: form.title.trim(),
      description: form.description.trim(),
      category_id: form.category_id,
      city: form.city.trim(),
      budget_min: budgetMin,
      budget_max: budgetMax,
    })

    setIsSubmitting(false)

    if (error) {
      setSubmitError(error)
      return
    }

    setSuccessMessage('Göreviniz oluşturuldu. Görevlerinize yönlendiriliyorsunuz…')

    if (redirectTimeoutRef.current) {
      clearTimeout(redirectTimeoutRef.current)
    }

    redirectTimeoutRef.current = window.setTimeout(() => {
      navigate('/dashboard/gorevlerim', {
        replace: true,
        state: {
          taskCreated: true,
          taskId: task?.id,
          taskTitle: task?.title ?? form.title.trim(),
        },
      })
    }, 900)
  }, [form, navigate])

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
