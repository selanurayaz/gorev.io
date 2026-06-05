import type { ServiceId } from '@/types/index'

/** `services` tablosu — hizmet veren ilanları. */
export type Service = {
  id: ServiceId
  provider_id: string
  title: string
  description: string | null
  category_id: string | null
  city: string | null
  base_price: number | null
  is_active: boolean
  created_at?: string
}

/** Liste görünümü — kategori adı istemci tarafında zenginleştirilir. */
export type ServiceListItem = Service & {
  category_name: string | null
}

/** Keşfet / marketplace — hizmet veren adı dahil. */
export type MarketplaceService = ServiceListItem & {
  provider_name: string | null
}

export type ServiceFormValues = {
  title: string
  description: string
  category_id: string
  city: string
  base_price: string
  is_active: boolean
}

export type ServiceCreateInput = {
  title: string
  description: string
  category_id: string
  city: string
  base_price: number
  is_active: boolean
}
