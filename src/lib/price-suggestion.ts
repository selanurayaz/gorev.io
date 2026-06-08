import type { PriceSuggestionRequest } from '@/types/price-suggestion'

export function validatePriceSuggestionRequest(
  input: Partial<PriceSuggestionRequest>,
): string | null {
  const title = input.title?.trim() ?? ''
  const description = input.description?.trim() ?? ''
  const category = input.category?.trim() ?? ''
  const city = input.city?.trim() ?? ''

  if (!title || title.length < 5) {
    return 'AI önerisi için başlık en az 5 karakter olmalı.'
  }
  if (!description || description.length < 20) {
    return 'AI önerisi için açıklama en az 20 karakter olmalı.'
  }
  if (!category) {
    return 'AI önerisi için kategori seçin.'
  }
  if (!city) {
    return 'AI önerisi için şehir seçin.'
  }
  if (input.listing_type !== 'task' && input.listing_type !== 'service') {
    return 'Geçersiz ilan türü.'
  }

  return null
}

export function toPriceFieldValue(value: number): string {
  return String(Math.round(value))
}
