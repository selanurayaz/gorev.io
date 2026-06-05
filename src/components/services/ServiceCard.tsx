import { formatCityLabel } from '@/lib/cities'
import { formatServiceBasePrice } from '@/lib/service-display'
import { formatTaskCreatedAt } from '@/lib/task-display'
import { cn } from '@/lib/utils'
import type { ServiceListItem } from '@/types/service'

import { ServiceStatusBadge } from '@/components/services/ServiceStatusBadge'

type ServiceCardProps = {
  service: ServiceListItem
  providerName?: string | null
  className?: string
}

export function ServiceCard({
  service,
  providerName,
  className,
}: ServiceCardProps) {
  const categoryLabel = service.category_name ?? 'Kategori belirtilmedi'
  const cityLabel = formatCityLabel(service.city)

  return (
    <article
      className={cn(
        'flex h-full flex-col rounded-2xl border border-gorev-navy-800 bg-gradient-to-b from-gorev-navy-900/80 to-gorev-navy-950/90 p-5 shadow-[0_1px_0_0_rgba(255,255,255,0.04)_inset] transition duration-200',
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
}
