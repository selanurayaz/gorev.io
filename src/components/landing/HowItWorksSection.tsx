import { howItWorksSteps } from '@/data/landing-content'

import { LandingSection } from '@/components/landing/LandingSection'
import { Container } from '@/components/ui/Container'
import { SectionHeading } from '@/components/ui/SectionHeading'

export function HowItWorksSection() {
  return (
    <LandingSection id="nasil-calisir">
      <Container>
        <SectionHeading
          eyebrow="Nasıl çalışır?"
          title="Üç adımda görevden tamamlanmış işe"
          description="Basit akış; hem görev sahiri hem hizmet veren için minimum sürtünme."
        />

        <ol className="mt-14 grid gap-6 lg:grid-cols-3">
          {howItWorksSteps.map((item, index) => (
            <li key={item.step}>
              <div className="relative h-full rounded-2xl border border-gorev-navy-800 bg-gorev-navy-900/35 p-6 transition duration-200 hover:border-gorev-yellow-400/25 hover:bg-gorev-navy-900/55">
                <span className="text-xs font-semibold uppercase tracking-[0.25em] text-gorev-muted">
                  Adım {index + 1}
                </span>
                <p className="mt-3 font-mono text-3xl font-semibold text-gorev-yellow-400/90">
                  {item.step}
                </p>
                <h3 className="mt-4 text-xl font-semibold text-gorev-snow">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-gorev-muted">
                  {item.description}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </Container>
    </LandingSection>
  )
}
