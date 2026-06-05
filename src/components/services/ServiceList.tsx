import type { ServiceListItem } from '@/types/service'

import { ServiceCard } from '@/components/services/ServiceCard'

type ServiceListProps = {
  services: ServiceListItem[]
}

export function ServiceList({ services }: ServiceListProps) {
  return (
    <ul className="grid list-none gap-4 sm:grid-cols-2">
      {services.map((service) => (
        <li key={service.id}>
          <ServiceCard service={service} />
        </li>
      ))}
    </ul>
  )
}
