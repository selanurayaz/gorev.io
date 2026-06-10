import { hasRealReviews, formatAverageRating, formatReviewCount } from '@/lib/review-display'
import { cn } from '@/lib/utils'
import type { UserRatingSummary } from '@/types/review'

export type ServiceCardProps = {
  title: string
  provider: string
  location: string
  priceLabel: string
  category: string
  ratingSummary?: UserRatingSummary | null
  badge?: string
  className?: string
}

export function ServiceCard({
  title,
  provider,
  location,
  priceLabel,
  category,
  ratingSummary = null,
  badge,
  className,
}: ServiceCardProps) {
  const hasReviews = hasRealReviews(ratingSummary)

  return (
    <article
      className={cn(
        'group flex flex-col rounded-2xl border border-gorev-navy-800 bg-gradient-to-b from-gorev-navy-900/80 to-gorev-navy-950/90 p-5 shadow-[0_1px_0_0_rgba(255,255,255,0.04)_inset] transition duration-200 hover:-translate-y-0.5 hover:border-gorev-yellow-400/35 hover:shadow-lg hover:shadow-gorev-navy-950/50',
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-gorev-green-400">
            {category}
          </p>
          <h3 className="mt-1 text-lg font-semibold leading-snug tracking-tight text-gorev-snow">
            {title}
          </h3>
        </div>
        {badge ? (
          <span className="shrink-0 rounded-full border border-gorev-yellow-400/25 bg-gorev-yellow-400/10 px-2.5 py-0.5 text-[11px] font-medium text-gorev-yellow-300">
            {badge}
          </span>
        ) : null}
      </div>

      <dl className="mt-4 space-y-1 text-sm text-gorev-muted">
        <div className="flex justify-between gap-4">
          <dt className="sr-only">Hizmet veren</dt>
          <dd>{provider}</dd>
          <dt className="sr-only">Konum</dt>
          <dd className="text-right text-gorev-muted/90">{location}</dd>
        </div>
      </dl>

      <div className="mt-5 flex flex-wrap items-end justify-between gap-3 border-t border-gorev-navy-800 pt-4">
        <div>
          <p className="text-xs text-gorev-muted">Başlangıç</p>
          <p className="text-base font-semibold text-gorev-snow">{priceLabel}</p>
        </div>
        <div className="text-right text-sm text-gorev-muted">
          {hasReviews ? (
            <p
              role="img"
              aria-label={`${formatAverageRating(ratingSummary.averageRating)} üzerinden 5 yıldız. ${ratingSummary.reviewCount} değerlendirme.`}
            >
              <span className="font-medium text-gorev-yellow-400" aria-hidden>
                ★
              </span>{' '}
              <span className="text-gorev-snow">
                {formatAverageRating(ratingSummary.averageRating)} / 5
              </span>
              <span className="mt-0.5 block text-xs" aria-hidden>
                {formatReviewCount(ratingSummary.reviewCount)}
              </span>
            </p>
          ) : (
            <p className="text-xs">Henüz değerlendirme yok</p>
          )}
        </div>
      </div>

      <button
        type="button"
        className="mt-5 w-full rounded-xl border border-gorev-navy-700 bg-gorev-navy-900/50 py-2.5 text-sm font-semibold text-gorev-snow transition group-hover:border-gorev-green-500/50 group-hover:text-gorev-green-400"
      >
        Detayı gör
      </button>
    </article>
  )
}
