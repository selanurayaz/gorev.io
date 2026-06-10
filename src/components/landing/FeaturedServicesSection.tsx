import { featuredServices } from '@/data/landing-content'

import { LandingSection } from '@/components/landing/LandingSection'
import { ServiceCard } from '@/components/landing/ServiceCard'
import { Container } from '@/components/ui/Container'
import { SectionHeading } from '@/components/ui/SectionHeading'

export function FeaturedServicesSection() {
  return (
    <LandingSection id="one-cikanlar">
      <Container>
        <SectionHeading
          eyebrow="Öne çıkanlar"
          title="Gerçekçi mikro hizmet örnekleri"
          description="Örnek vitrin kartları — canlı görev ve hizmet ilanları Keşfet sayfasında."
        />

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {featuredServices.map((job) => (
            <ServiceCard
              key={job.id}
              title={job.title}
              provider={job.provider}
              location={job.location}
              priceLabel={job.priceLabel}
              category={job.category}
              badge={job.badge}
            />
          ))}
        </div>
      </Container>
    </LandingSection>
  )
}
