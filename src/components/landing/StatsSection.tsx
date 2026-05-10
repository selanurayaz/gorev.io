import { stats } from '@/data/landing-content'

import { LandingSection } from '@/components/landing/LandingSection'
import { Container } from '@/components/ui/Container'

export function StatsSection() {
  return (
    <LandingSection id="istatistikler" dense className="border-t-0">
      <Container>
        <div className="rounded-3xl border border-gorev-navy-800 bg-gorev-navy-900/40 px-6 py-10 sm:px-10">
          <div className="grid gap-10 text-center sm:grid-cols-2 sm:text-left lg:grid-cols-4">
            {stats.map((item) => (
              <div key={item.label}>
                <p className="font-mono text-4xl font-semibold tracking-tight text-gorev-yellow-400 sm:text-5xl">
                  {item.value}
                </p>
                <p className="mt-2 text-sm font-medium text-gorev-muted">
                  {item.label}
                </p>
              </div>
            ))}
          </div>
          <p className="mt-8 text-center text-xs text-gorev-muted lg:text-left">
            Gösterilen rakamlar örnek vitrin verisidir; lansman sonrası canlı
            metriklerle güncellenecektir.
          </p>
        </div>
      </Container>
    </LandingSection>
  )
}
