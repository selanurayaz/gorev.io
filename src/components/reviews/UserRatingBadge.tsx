import {
  formatAverageRating,
  formatReviewCount,
  hasRealReviews,
} from '@/lib/review-display'
import { cn } from '@/lib/utils'
import type { UserRatingSummary } from '@/types/review'

type UserRatingBadgeProps = {
  summary: UserRatingSummary
  isLoading?: boolean
  className?: string
  compact?: boolean
}

export function UserRatingBadge({
  summary,
  isLoading = false,
  className,
  compact = false,
}: UserRatingBadgeProps) {
  if (isLoading) {
    return (
      <div
        className={cn(
          'h-5 w-32 animate-pulse rounded-lg bg-gorev-navy-800',
          className,
        )}
        aria-hidden
      />
    )
  }

  if (!hasRealReviews(summary)) {
    return (
      <p className={cn('text-sm text-gorev-muted', className)}>
        Henüz değerlendirme yok
      </p>
    )
  }

  if (compact) {
    return (
      <p className={cn('text-sm font-medium text-gorev-yellow-300', className)}>
        ★ {formatAverageRating(summary.averageRating)}
        <span className="ml-1.5 font-normal text-gorev-muted">
          {formatReviewCount(summary.reviewCount)}
        </span>
      </p>
    )
  }

  return (
    <p className={cn('text-sm text-gorev-snow', className)}>
      <span className="font-semibold text-gorev-yellow-300">
        ★ {formatAverageRating(summary.averageRating)}
      </span>
      <span className="ml-2 text-gorev-muted">
        {formatReviewCount(summary.reviewCount)}
      </span>
    </p>
  )
}
