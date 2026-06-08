import type { FunctionsError } from '@supabase/supabase-js'

import { validatePriceSuggestionRequest } from '@/lib/price-suggestion'
import { supabase } from '@/lib/supabase/client'
import type {
  PriceSuggestion,
  PriceSuggestionRequest,
} from '@/types/price-suggestion'

export type FetchPriceSuggestionResult = {
  suggestion: PriceSuggestion | null
  error: string | null
}

function isPriceSuggestion(value: unknown): value is PriceSuggestion {
  if (!value || typeof value !== 'object') return false
  const row = value as Record<string, unknown>
  return (
    typeof row.suggested_price === 'number' &&
    typeof row.minimum_price === 'number' &&
    typeof row.maximum_price === 'number' &&
    typeof row.short_reason === 'string'
  )
}

function formatFunctionError(error: FunctionsError): string {
  if (import.meta.env.DEV && error.message) {
    return `AI fiyat önerisi alınamadı: ${error.message}`
  }
  return 'AI fiyat önerisi alınamadı. Lütfen tekrar deneyin.'
}

function readErrorMessage(data: unknown): string | null {
  if (!data || typeof data !== 'object') return null
  const message = (data as Record<string, unknown>).error
  return typeof message === 'string' && message.trim() ? message.trim() : null
}

/** Supabase Edge Function üzerinden Gemini fiyat önerisi. */
export async function fetchPriceSuggestion(
  input: PriceSuggestionRequest,
): Promise<FetchPriceSuggestionResult> {
  const validationError = validatePriceSuggestionRequest(input)
  if (validationError) {
    return { suggestion: null, error: validationError }
  }

  const { data, error } = await supabase.functions.invoke('suggest-price', {
    body: input,
  })

  if (error) {
    return { suggestion: null, error: formatFunctionError(error) }
  }

  const responseError = readErrorMessage(data)
  if (responseError) {
    return { suggestion: null, error: responseError }
  }

  if (!isPriceSuggestion(data)) {
    return {
      suggestion: null,
      error: 'AI yanıtı doğrulanamadı. Lütfen tekrar deneyin.',
    }
  }

  return { suggestion: data, error: null }
}
