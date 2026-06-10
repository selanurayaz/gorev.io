import type { ServiceId, TaskId } from '@/types/index'

export type Review = {
  id: string
  task_id: TaskId | null
  service_id: ServiceId | null
  reviewer_id: string
  reviewed_user_id: string
  rating: number
  comment: string | null
  created_at?: string
}

export type ReviewFormValues = {
  rating: number
  comment: string
}

export type ReviewCreateInput = {
  task_id: TaskId
  reviewed_user_id: string
  rating: number
  comment: string
  service_id?: ServiceId | null
}

export type UserRatingSummary = {
  averageRating: number | null
  reviewCount: number
}

/** Liste görünümü — değerlendiren adı dahil. */
export type ReviewListItem = Review & {
  reviewer_name: string | null
}
