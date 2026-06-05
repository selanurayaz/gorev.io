import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { useProfile } from '@/hooks/useProfile'
import { resolveTurkishCityName } from '@/lib/cities'
import {
  emptyServiceForm,
  validateServiceForm,
  type ServiceFormErrors,
} from '@/lib/service-form'
import { createService } from '@/services/services'
import type { ServiceFormValues } from '@/types/service'

export function useCreateService() {
  const navigate = useNavigate()
  const { profile, isLoading: profileLoading } = useProfile()

  const [form, setForm] = useState<ServiceFormValues>(emptyServiceForm)
  const [fieldErrors, setFieldErrors] = useState<ServiceFormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [cityPrefilled, setCityPrefilled] = useState(false)
  const redirectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

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
    <K extends keyof ServiceFormValues>(key: K, value: ServiceFormValues[K]) => {
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

    const errors = validateServiceForm(form)
    setFieldErrors(errors)
    if (Object.keys(errors).length > 0) return

    const basePrice = Number(form.base_price.trim().replace(',', '.'))

    setIsSubmitting(true)

    const { service, error } = await createService({
      title: form.title.trim(),
      description: form.description.trim(),
      category_id: form.category_id,
      city: form.city.trim(),
      base_price: basePrice,
      is_active: form.is_active,
    })

    setIsSubmitting(false)

    if (error) {
      setSubmitError(error)
      return
    }

    setSuccessMessage(
      'Hizmetiniz oluşturuldu. Hizmetlerinize yönlendiriliyorsunuz…',
    )

    if (redirectTimeoutRef.current) {
      clearTimeout(redirectTimeoutRef.current)
    }

    redirectTimeoutRef.current = window.setTimeout(() => {
      navigate('/dashboard/hizmetler', {
        replace: true,
        state: {
          serviceCreated: true,
          serviceId: service?.id,
          serviceTitle: service?.title ?? form.title.trim(),
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
