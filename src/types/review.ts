import type { TaskId } from '@/types/index'

export type Review = {
  id: string
  task_id: TaskId | null
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
}

export type UserRatingSummary = {
  averageRating: number | null
  reviewCount: number
}
