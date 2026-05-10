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
          description="Net akış; hem görev sahibi hem uzman için az sürtünme, çok netlik."
        />

        <ol className="mt-14 grid gap-6 lg:grid-cols-3">
          {howItWorksSteps.map((item, index) => (
            <li key={item.step}>
              <div className="group relative h-full overflow-hidden rounded-2xl border border-gorev-navy-800 bg-gradient-to-b from-gorev-navy-900/80 to-gorev-navy-950/90 p-7 shadow-[0_1px_0_0_rgba(255,255,255,0.04)_inset] transition duration-200 hover:-translate-y-0.5 hover:border-gorev-yellow-400/30 hover:shadow-xl hover:shadow-black/35">
                <div
                  className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-gorev-yellow-400/20 via-gorev-yellow-400/70 to-gorev-green-400/40 opacity-90 transition group-hover:opacity-100"
                  aria-hidden
                />
                <span className="text-xs font-semibold uppercase tracking-[0.28em] text-gorev-muted">
                  Adım {index + 1}
                </span>
                <p className="mt-4 font-mono text-4xl font-semibold tracking-tight text-gorev-yellow-400/95">
                  {item.step}
                </p>
                <h3 className="mt-5 text-xl font-semibold tracking-tight text-gorev-snow">
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
