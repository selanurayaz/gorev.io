import { formatTaskCreatedAt } from '@/lib/task-display'
import type { ReviewListItem as ReviewListItemType } from '@/types/review'

type ReviewListItemProps = {
  review: ReviewListItemType
}

export function ReviewListItem({ review }: ReviewListItemProps) {
  const reviewerLabel = review.reviewer_name?.trim() || 'Anonim kullanıcı'

  return (
    <article className="rounded-xl border border-gorev-navy-800 bg-gorev-navy-900/40 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-gorev-snow">{reviewerLabel}</p>
          <p className="mt-1 text-xs text-gorev-muted">
            <time dateTime={review.created_at}>
              {formatTaskCreatedAt(review.created_at)}
            </time>
          </p>
        </div>
        <p
          className="text-sm font-semibold text-gorev-yellow-300"
          aria-label={`${review.rating} üzerinden 5 puan`}
        >
          ★ {review.rating}/5
        </p>
      </div>

      {review.comment?.trim() ? (
        <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-gorev-muted">
          {review.comment.trim()}
        </p>
      ) : (
        <p className="mt-3 text-sm italic text-gorev-muted">Yorum bırakılmamış.</p>
      )}
    </article>
  )
}
