import { useCallback, useState } from 'react'

import { fetchPriceSuggestion } from '@/services/price-suggestion'
import type {
  PriceSuggestion,
  PriceSuggestionRequest,
} from '@/types/price-suggestion'

export function usePriceSuggestion() {
  const [suggestion, setSuggestion] = useState<PriceSuggestion | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const suggest = useCallback(async (input: PriceSuggestionRequest) => {
    setIsLoading(true)
    setError(null)

    const result = await fetchPriceSuggestion(input)

    setSuggestion(result.suggestion)
    setError(result.error)
    setIsLoading(false)

    return result.suggestion
  }, [])

  const reset = useCallback(() => {
    setSuggestion(null)
    setError(null)
    setIsLoading(false)
  }, [])

  return {
    suggestion,
    isLoading,
    error,
    suggest,
    reset,
  }
}
