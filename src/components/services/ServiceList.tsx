import { ServiceCard } from '@/components/services/ServiceCard'
import { serviceDetailPath } from '@/lib/paths'
import type { UserRatingSummary } from '@/types/review'
import type { ServiceListItem } from '@/types/service'

type ServiceListProps = {
  services: ServiceListItem[]
  serviceRatings?: Map<string, UserRatingSummary>
}

export function ServiceList({
  services,
  serviceRatings = new Map(),
}: ServiceListProps) {
  return (
    <ul className="grid list-none gap-4 sm:grid-cols-2">
      {services.map((service) => (
        <li key={service.id}>
          <ServiceCard
            service={service}
            providerRating={serviceRatings.get(service.id) ?? null}
            detailHref={serviceDetailPath(service.id)}
          />
        </li>
      ))}
    </ul>
  )
}
