import { isTurkishCityName, resolveTurkishCityName } from '@/lib/cities'
import type { Profile, ProfileFormValues } from '@/types/profile'

export const emptyProfileForm: ProfileFormValues = {
  full_name: '',
  city: '',
  role: '',
  bio: '',
}

export function profileToFormValues(profile: Profile | null): ProfileFormValues {
  if (!profile) return { ...emptyProfileForm }

  const city = resolveTurkishCityName(profile.city) ?? ''

  return {
    full_name: profile.full_name ?? '',
    city,
    role: profile.role ?? '',
    bio: profile.bio ?? '',
  }
}

export type ProfileFormErrors = Partial<Record<keyof ProfileFormValues, string>>

export function validateProfileForm(
  values: ProfileFormValues,
): ProfileFormErrors {
  const errors: ProfileFormErrors = {}

  if (!values.full_name.trim()) {
    errors.full_name = 'Ad soyad gerekli.'
  }

  if (values.bio.length > 500) {
    errors.bio = 'Biyografi en fazla 500 karakter olabilir.'
  }

  if (!values.city) {
    errors.city = 'Şehir seçin.'
  } else if (!isTurkishCityName(values.city)) {
    errors.city = 'Listeden geçerli bir il seçin.'
  }

  return errors
}
