import { ServiceCard } from '@/components/services/ServiceCard'
import type { MarketplaceService } from '@/types/service'

type MarketplaceServiceGridProps = {
  services: MarketplaceService[]
}

export function MarketplaceServiceGrid({
  services,
}: MarketplaceServiceGridProps) {
  return (
    <ul className="grid list-none gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {services.map((service) => (
        <li key={service.id}>
          <ServiceCard
            service={service}
            providerName={service.provider_name}
          />
        </li>
      ))}
    </ul>
  )
}
