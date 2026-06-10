import { formatCityLabel } from '@/lib/cities'
import { hasRealReviews } from '@/lib/review-display'
import { formatServiceBasePrice } from '@/lib/service-display'
import { formatTaskCreatedAt } from '@/lib/task-display'
import type { MarketplaceService } from '@/types/service'

import { UserRatingBadge } from '@/components/reviews/UserRatingBadge'
import { ServiceStatusBadge } from '@/components/services/ServiceStatusBadge'

type ServiceDetailPanelProps = {
  service: MarketplaceService
}

export function ServiceDetailPanel({ service }: ServiceDetailPanelProps) {
  const categoryLabel = service.category_name ?? 'Kategori belirtilmedi'
  const providerLabel = service.provider_name?.trim() || 'Belirtilmedi'

  return (
    <section className="rounded-2xl border border-gorev-navy-800 bg-gradient-to-b from-gorev-navy-900/80 to-gorev-navy-950/90 p-6 sm:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gorev-green-400">
            Hizmet detayı
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-gorev-snow sm:text-3xl">
            {service.title}
          </h1>
        </div>
        <ServiceStatusBadge isActive={service.is_active} className="self-start" />
      </div>

      {service.description ? (
        <div className="mt-6">
          <h2 className="text-sm font-semibold text-gorev-snow">Açıklama</h2>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-gorev-muted">
            {service.description}
          </p>
        </div>
      ) : null}

      <dl className="mt-6 grid gap-4 border-t border-gorev-navy-800 pt-6 sm:grid-cols-2">
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-gorev-muted">
            Hizmet veren
          </dt>
          <dd className="mt-1 text-sm font-medium text-gorev-green-400">
            {providerLabel}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-gorev-muted">
            Kategori
          </dt>
          <dd className="mt-1 text-sm font-medium text-gorev-snow">
            {categoryLabel}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-gorev-muted">
            Şehir
          </dt>
          <dd className="mt-1 text-sm font-medium text-gorev-snow">
            {formatCityLabel(service.city)}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-gorev-muted">
            Başlangıç fiyatı
          </dt>
          <dd className="mt-1 text-sm font-semibold text-gorev-yellow-300">
            {formatServiceBasePrice(service)}
          </dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="text-xs font-medium uppercase tracking-wide text-gorev-muted">
            Hizmet puanı
          </dt>
          <dd className="mt-1">
            {hasRealReviews(service.provider_rating) ? (
              <UserRatingBadge summary={service.provider_rating!} />
            ) : (
              <span className="text-sm text-gorev-muted">
                Henüz değerlendirme yok
              </span>
            )}
          </dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="text-xs font-medium uppercase tracking-wide text-gorev-muted">
            Yayın tarihi
          </dt>
          <dd className="mt-1 text-sm text-gorev-snow">
            <time dateTime={service.created_at}>
              {formatTaskCreatedAt(service.created_at)}
            </time>
          </dd>
        </div>
      </dl>
    </section>
  )
}
