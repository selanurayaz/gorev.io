import { formatTaskCreatedAt } from '@/lib/task-display'
import type { Review } from '@/types/review'

type ReviewSubmittedCardProps = {
  review: Review
}

export function ReviewSubmittedCard({ review }: ReviewSubmittedCardProps) {
  return (
    <div className="rounded-xl border border-gorev-green-500/20 bg-gorev-green-500/5 p-4">
      <p className="text-sm font-semibold text-gorev-green-400">
        Değerlendirmeniz kaydedildi
      </p>
      <div className="mt-3 flex items-center gap-2">
        <span className="text-lg font-semibold text-gorev-yellow-300">
          ★ {review.rating}/5
        </span>
        <span className="text-xs text-gorev-muted">
          {formatTaskCreatedAt(review.created_at)}
        </span>
      </div>
      {review.comment ? (
        <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-gorev-snow">
          {review.comment}
        </p>
      ) : null}
    </div>
  )
}
