import type { OfferFormValues } from '@/types/offer'

export const emptyOfferForm: OfferFormValues = {
  price: '',
  message: '',
}

export type OfferFormErrors = Partial<Record<keyof OfferFormValues, string>>

function parsePrice(value: string): number | null {
  const trimmed = value.trim().replace(/\s/g, '').replace(',', '.')
  if (!trimmed) return null
  const num = Number(trimmed)
  if (!Number.isFinite(num) || num <= 0) return null
  return num
}

export function validateOfferForm(values: OfferFormValues): OfferFormErrors {
  const errors: OfferFormErrors = {}

  if (parsePrice(values.price) === null) {
    errors.price = 'Geçerli bir teklif fiyatı girin.'
  }

  const message = values.message.trim()
  if (!message) {
    errors.message = 'Mesaj gerekli.'
  } else if (message.length < 10) {
    errors.message = 'Mesaj en az 10 karakter olmalı.'
  } else if (message.length > 1000) {
    errors.message = 'Mesaj en fazla 1000 karakter olabilir.'
  }

  return errors
}

export function offerFormToPrice(values: OfferFormValues): number | null {
  return parsePrice(values.price)
}
