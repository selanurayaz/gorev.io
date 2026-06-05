import { isTurkishCityName } from '@/lib/cities'
import type { ServiceCreateInput, ServiceFormValues } from '@/types/service'

export const emptyServiceForm: ServiceFormValues = {
  title: '',
  description: '',
  category_id: '',
  city: '',
  base_price: '',
  is_active: true,
}

export type ServiceFormErrors = Partial<Record<keyof ServiceFormValues, string>>

function parsePrice(value: string): number | null {
  const trimmed = value.trim().replace(/\s/g, '').replace(',', '.')
  if (!trimmed) return null
  const num = Number(trimmed)
  if (!Number.isFinite(num) || num < 0) return null
  return num
}

export function validateServiceForm(values: ServiceFormValues): ServiceFormErrors {
  const errors: ServiceFormErrors = {}

  const title = values.title.trim()
  if (!title) {
    errors.title = 'Hizmet başlığı gerekli.'
  } else if (title.length < 5) {
    errors.title = 'Başlık en az 5 karakter olmalı.'
  }

  const description = values.description.trim()
  if (!description) {
    errors.description = 'Açıklama gerekli.'
  } else if (description.length < 20) {
    errors.description = 'Açıklama en az 20 karakter olmalı.'
  }

  if (!values.category_id) {
    errors.category_id = 'Kategori seçin.'
  }

  if (!values.city.trim()) {
    errors.city = 'Şehir seçin.'
  } else if (!isTurkishCityName(values.city)) {
    errors.city = 'Listeden geçerli bir il seçin.'
  }

  const basePrice = parsePrice(values.base_price)
  if (basePrice === null) {
    errors.base_price = 'Geçerli bir başlangıç fiyatı girin.'
  } else if (basePrice === 0) {
    errors.base_price = 'Başlangıç fiyatı 0 olamaz.'
  }

  return errors
}

export function serviceFormToCreateInput(
  values: ServiceFormValues,
): ServiceCreateInput | null {
  const errors = validateServiceForm(values)
  if (Object.keys(errors).length > 0) return null

  const basePrice = Number(values.base_price.trim().replace(',', '.'))

  return {
    title: values.title.trim(),
    description: values.description.trim(),
    category_id: values.category_id,
    city: values.city.trim(),
    base_price: basePrice,
    is_active: values.is_active,
  }
}
