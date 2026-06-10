import { AuthAlert } from '@/components/auth/AuthAlert'
import { ReviewListItem } from '@/components/reviews/ReviewListItem'
import { Spinner } from '@/components/ui/Spinner'
import type { ReviewListItem as ReviewListItemType } from '@/types/review'

type ReviewListProps = {
  reviews: ReviewListItemType[]
  isLoading?: boolean
  error?: string | null
  onRetry?: () => void
  emptyMessage?: string
}

export function ReviewList({
  reviews,
  isLoading = false,
  error = null,
  onRetry,
  emptyMessage = 'Henüz değerlendirme yok',
}: ReviewListProps) {
  if (isLoading) {
    return (
      <div
        className="flex items-center justify-center gap-3 py-8"
        role="status"
      >
        <Spinner className="h-6 w-6 text-gorev-yellow-400" />
        <span className="text-sm text-gorev-muted">Değerlendirmeler yükleniyor…</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-3">
        <AuthAlert message={error} variant="error" />
        {onRetry ? (
          <button
            type="button"
            onClick={() => void onRetry()}
            className="text-sm font-medium text-gorev-yellow-400 underline-offset-4 hover:underline"
          >
            Tekrar dene
          </button>
        ) : null}
      </div>
    )
  }

  if (reviews.length === 0) {
    return (
      <p className="py-4 text-center text-sm text-gorev-muted">{emptyMessage}</p>
    )
  }

  return (
    <ul className="space-y-3">
      {reviews.map((review) => (
        <li key={review.id}>
          <ReviewListItem review={review} />
        </li>
      ))}
    </ul>
  )
}
