import type { TaskId } from '@/types/index'

export type Offer = {
  id: string
  task_id: TaskId
  provider_id: string
  price: number
  message: string | null
  status?: string | null
  created_at?: string
}

export type OfferListItem = Offer & {
  provider_name: string | null
}

export type OfferFormValues = {
  price: string
  message: string
}

export type OfferCreateInput = {
  task_id: TaskId
  price: number
  message: string
}

/** Görev sahibine gelen teklif — görev başlığı dahil. */
export type IncomingOfferItem = OfferListItem & {
  task_title: string
}

/** Hizmet verenin gönderdiği teklif — görev özeti dahil. */
export type SubmittedOfferItem = Offer & {
  task_title: string
  task_city: string | null
  provider_name?: string | null
}

/** Kabul edilmiş teklif — hizmet verenin üzerinde çalıştığı görev. */
export type AcceptedWorkItem = Offer & {
  task_title: string
  task_city: string | null
  task_status: string | null
  task_category_name: string | null
  customer_name: string | null
}

export type OfferActionResult = {
  success: boolean
  error: string | null
  message: string | null
}
