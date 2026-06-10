import { Link } from 'react-router-dom'

import { UserRatingBadge } from '@/components/reviews/UserRatingBadge'
import { hasRealReviews } from '@/lib/review-display'
import { formatCityLabel } from '@/lib/cities'
import { formatServiceBasePrice } from '@/lib/service-display'
import { formatTaskCreatedAt } from '@/lib/task-display'
import { cn } from '@/lib/utils'
import type { UserRatingSummary } from '@/types/review'
import type { ServiceListItem } from '@/types/service'

import { ServiceStatusBadge } from '@/components/services/ServiceStatusBadge'

type ServiceCardProps = {
  service: ServiceListItem
  providerName?: string | null
  providerRating?: UserRatingSummary | null
  className?: string
  /** Verilirse kart tıklanabilir hizmet detayına gider. */
  detailHref?: string
}

export function ServiceCard({
  service,
  providerName,
  providerRating = null,
  className,
  detailHref,
}: ServiceCardProps) {
  const categoryLabel = service.category_name ?? 'Kategori belirtilmedi'
  const cityLabel = formatCityLabel(service.city)

  const article = (
    <article
      className={cn(
        'flex h-full flex-col rounded-2xl border border-gorev-navy-800 bg-gradient-to-b from-gorev-navy-900/80 to-gorev-navy-950/90 p-5 shadow-[0_1px_0_0_rgba(255,255,255,0.04)_inset] transition duration-200',
        detailHref &&
          'hover:-translate-y-0.5 hover:border-gorev-navy-700 hover:shadow-lg hover:shadow-black/25',
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="min-w-0 flex-1 text-base font-semibold leading-snug tracking-tight text-gorev-snow">
          {service.title}
        </h3>
        <ServiceStatusBadge isActive={service.is_active} />
      </div>

      {service.description ? (
        <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-gorev-muted">
          {service.description}
        </p>
      ) : null}

      <dl className="mt-4 flex flex-1 flex-col gap-3 text-sm">
        <div className="flex items-start justify-between gap-3">
          <dt className="shrink-0 text-gorev-muted">Kategori</dt>
          <dd className="text-right font-medium text-gorev-snow">
            {categoryLabel}
          </dd>
        </div>
        <div className="flex items-start justify-between gap-3">
          <dt className="shrink-0 text-gorev-muted">Şehir</dt>
          <dd className="text-right font-medium text-gorev-snow">
            {cityLabel}
          </dd>
        </div>
        <div className="flex items-start justify-between gap-3">
          <dt className="shrink-0 text-gorev-muted">Başlangıç fiyatı</dt>
          <dd className="text-right font-semibold text-gorev-yellow-300">
            {formatServiceBasePrice(service)}
          </dd>
        </div>
        {providerName?.trim() ? (
          <div className="flex items-start justify-between gap-3">
            <dt className="shrink-0 text-gorev-muted">Hizmet veren</dt>
            <dd className="text-right font-medium text-gorev-green-400">
              {providerName.trim()}
            </dd>
          </div>
        ) : null}
        {providerRating !== null ? (
          <div className="flex items-start justify-between gap-3">
            <dt className="shrink-0 text-gorev-muted">Puan</dt>
            <dd className="text-right">
              {hasRealReviews(providerRating) ? (
                <UserRatingBadge summary={providerRating} compact />
              ) : (
                <span className="text-sm text-gorev-muted">
                  Henüz değerlendirme yok
                </span>
              )}
            </dd>
          </div>
        ) : null}
      </dl>

      <footer className="mt-5 flex items-center justify-between gap-2 border-t border-gorev-navy-800 pt-4">
        <span className="text-xs text-gorev-muted">Oluşturulma</span>
        <time
          className="text-xs font-medium text-gorev-snow"
          dateTime={service.created_at}
        >
          {formatTaskCreatedAt(service.created_at)}
        </time>
      </footer>
    </article>
  )

  if (detailHref) {
    return (
      <Link
        to={detailHref}
        className="block h-full rounded-2xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gorev-yellow-400"
      >
        {article}
      </Link>
    )
  }

  return article
}
