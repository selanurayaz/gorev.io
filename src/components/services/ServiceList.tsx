import type { UserRatingSummary } from '@/types/review'
import type { ServiceListItem } from '@/types/service'

import { ServiceCard } from '@/components/services/ServiceCard'

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
          />
        </li>
      ))}
    </ul>
  )
}
