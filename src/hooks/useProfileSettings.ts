import { useCallback, useEffect, useState } from 'react'

import { useAuth } from '@/hooks/useAuth'
import { useProfile } from '@/hooks/useProfile'
import {
  emptyProfileForm,
  profileToFormValues,
  validateProfileForm,
  type ProfileFormErrors,
} from '@/lib/profile-form'
import { updateProfileByUserId } from '@/services/profiles'
import type { ProfileFormValues } from '@/types/profile'

export function useProfileSettings() {
  const { user } = useAuth()
  const {
    profile,
    isLoading,
    error: loadError,
    refetch: refetchGlobalProfile,
  } = useProfile()

  const [form, setForm] = useState<ProfileFormValues>(emptyProfileForm)
  const [fieldErrors, setFieldErrors] = useState<ProfileFormErrors>({})
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const email = user?.email ?? ''

  useEffect(() => {
    if (isLoading) return

    let cancelled = false

    void (async () => {
      if (cancelled) return
      setForm(profileToFormValues(profile))
    })()

    return () => {
      cancelled = true
    }
  }, [profile, isLoading])

  const setField = useCallback(
    <K extends keyof ProfileFormValues>(key: K, value: ProfileFormValues[K]) => {
      setForm((prev) => ({ ...prev, [key]: value }))
      setFieldErrors((prev) => {
        if (!prev[key]) return prev
        const next = { ...prev }
        delete next[key]
        return next
      })
      setSuccessMessage(null)
      setSaveError(null)
    },
    [],
  )

  const save = useCallback(async () => {
    setSaveError(null)
    setSuccessMessage(null)

    const errors = validateProfileForm(form)
    setFieldErrors(errors)
    if (Object.keys(errors).length > 0) return

    setIsSaving(true)

    const { profile: saved, error } = await updateProfileByUserId({
      full_name: form.full_name,
      city: form.city,
      role: form.role,
      bio: form.bio,
    })

    setIsSaving(false)

    if (error) {
      setSaveError(error)
      return
    }

    if (saved) {
      setForm(profileToFormValues(saved))
    }

    setSuccessMessage('Profil bilgileriniz başarıyla kaydedildi.')
    await refetchGlobalProfile()
  }, [form, refetchGlobalProfile])

  const reload = useCallback(async () => {
    await refetchGlobalProfile()
  }, [refetchGlobalProfile])

  return {
    email,
    form,
    fieldErrors,
    isLoading,
    isSaving,
    loadError,
    saveError,
    successMessage,
    setField,
    save,
    reload,
  }
}
