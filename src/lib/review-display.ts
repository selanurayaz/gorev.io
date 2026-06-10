import type { UserRatingSummary } from '@/types/review'

export function hasRealReviews(
  summary: UserRatingSummary | null | undefined,
): summary is UserRatingSummary & {
  averageRating: number
  reviewCount: number
} {
  return Boolean(
    summary &&
      summary.reviewCount > 0 &&
      summary.averageRating != null &&
      Number.isFinite(summary.averageRating),
  )
}

export function formatAverageRating(
  value: number | null | undefined,
): string {
  if (value == null || !Number.isFinite(value)) return '—'
  return value.toFixed(1).replace('.', ',')
}

export function formatReviewCount(count: number): string {
  if (count <= 0) return 'Henüz değerlendirme yok'
  if (count === 1) return '1 değerlendirme'
  return `${count} değerlendirme`
}

export function buildRatingLabel(summary: UserRatingSummary): string {
  if (summary.reviewCount <= 0 || summary.averageRating == null) {
    return 'Henüz puan yok'
  }
  return `${formatAverageRating(summary.averageRating)} · ${formatReviewCount(summary.reviewCount)}`
}
