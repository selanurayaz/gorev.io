import type { Review } from '@/types/review'

function readRating(value: unknown): number | null {
  const raw = value ?? null
  if (typeof raw === 'number' && Number.isFinite(raw)) return raw
  if (raw == null) return null
  const parsed = Number(raw)
  return Number.isFinite(parsed) ? parsed : null
}

export function normalizeReviewRow(row: Record<string, unknown>): Review | null {
  const id = row.id
  const reviewerId = row.reviewer_id ?? row.reviewerId ?? row.user_id
  const reviewedUserId =
    row.reviewed_user_id ??
    row.reviewedUserId ??
    row.reviewee_id ??
    row.revieweeId

  if (id == null || reviewerId == null || reviewedUserId == null) return null

  const rating = readRating(row.rating ?? row.score ?? row.stars)
  if (rating == null || rating < 1 || rating > 5) return null

  const taskId = row.task_id ?? row.taskId
  const comment = row.comment ?? row.body ?? row.message ?? row.text ?? null

  return {
    id: String(id),
    task_id: taskId != null ? String(taskId) : null,
    reviewer_id: String(reviewerId),
    reviewed_user_id: String(reviewedUserId),
    rating,
    comment: comment != null ? String(comment) : null,
    created_at: row.created_at != null ? String(row.created_at) : undefined,
  }
}
