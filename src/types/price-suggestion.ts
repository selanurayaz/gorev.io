export type ListingType = 'task' | 'service'

export type PriceSuggestionRequest = {
  title: string
  description: string
  category: string
  city: string
  listing_type: ListingType
}

export type PriceSuggestion = {
  suggested_price: number
  minimum_price: number
  maximum_price: number
  short_reason: string
}
