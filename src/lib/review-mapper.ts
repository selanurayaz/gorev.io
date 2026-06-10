import type { Review, ReviewListItem } from '@/types/review'

function readEmbeddedReviewerName(row: Record<string, unknown>): string | null {
  const embedded = row.profiles ?? row.profile ?? row.reviewer

  if (!embedded) return null

  const readName = (obj: Record<string, unknown>) =>
    obj.full_name ?? obj.fullName ?? obj.display_name ?? obj.name

  if (Array.isArray(embedded)) {
    const first = embedded[0]
    if (first && typeof first === 'object') {
      const name = readName(first as Record<string, unknown>)
      return name != null ? String(name).trim() || null : null
    }
    return null
  }

  if (typeof embedded === 'object' && embedded !== null) {
    const name = readName(embedded as Record<string, unknown>)
    return name != null ? String(name).trim() || null : null
  }

  return null
}

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
  const serviceId = row.service_id ?? row.serviceId
  const comment = row.comment ?? row.body ?? row.message ?? row.text ?? null

  return {
    id: String(id),
    task_id: taskId != null ? String(taskId) : null,
    service_id: serviceId != null ? String(serviceId) : null,
    reviewer_id: String(reviewerId),
    reviewed_user_id: String(reviewedUserId),
    rating,
    comment: comment != null ? String(comment) : null,
    created_at: row.created_at != null ? String(row.created_at) : undefined,
  }
}

export function enrichReviewListItem(
  review: Review,
  reviewerNames: Map<string, string>,
  embeddedReviewerName?: string | null,
): ReviewListItem {
  const reviewer_name =
    embeddedReviewerName ??
    (review.reviewer_id
      ? reviewerNames.get(review.reviewer_id) ?? null
      : null)

  return { ...review, reviewer_name }
}

export function normalizeReviewListRow(
  row: Record<string, unknown>,
  reviewerNames: Map<string, string> = new Map(),
): ReviewListItem | null {
  const review = normalizeReviewRow(row)
  if (!review) return null

  return enrichReviewListItem(
    review,
    reviewerNames,
    readEmbeddedReviewerName(row),
  )
}
