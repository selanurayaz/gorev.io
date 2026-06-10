import { Link } from 'react-router-dom'

import { popularServices } from '@/data/landing-content'

import { LandingSection } from '@/components/landing/LandingSection'
import { ServiceCategoryIcon } from '@/components/landing/ServiceCategoryIcon'
import { Container } from '@/components/ui/Container'
import { SectionHeading } from '@/components/ui/SectionHeading'

export function PopularServicesSection() {
  return (
    <LandingSection id="populer-hizmetler">
      <Container>
        <SectionHeading
          eyebrow="Popüler hizmetler"
          title="En çok talep gören kategoriler"
          description="Gerçek yaşamdan örneklerle özetlendi — görevinizi yazın, doğru uzmanlar öne çıksın."
        />

        <ul className="mt-14 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {popularServices.map((svc) => (
            <li key={svc.id}>
              <Link
                to="/kesfet"
                className="flex h-full w-full flex-col rounded-2xl border border-gorev-navy-800 bg-gorev-navy-900/35 p-6 text-left transition duration-200 hover:-translate-y-0.5 hover:border-gorev-green-500/35 hover:bg-gorev-navy-900/65 hover:shadow-lg hover:shadow-black/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gorev-yellow-400"
              >
                <ServiceCategoryIcon name={svc.icon} />
                <span className="mt-5 text-lg font-semibold tracking-tight text-gorev-snow">
                  {svc.title}
                </span>
                <span className="mt-2 text-sm leading-relaxed text-gorev-muted">
                  {svc.description}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </Container>
    </LandingSection>
  )
}
