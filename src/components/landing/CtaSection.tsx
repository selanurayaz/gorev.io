import { Button } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'

export function CtaSection() {
  return (
    <section
      id="cta"
      className="scroll-mt-24 border-t border-gorev-navy-900/80 py-16 sm:py-20"
      aria-labelledby="cta-heading"
    >
      <Container>
        <div className="relative overflow-hidden rounded-3xl border border-gorev-navy-800 bg-gradient-to-br from-gorev-navy-900 via-gorev-navy-950 to-gorev-navy-900 px-8 py-12 text-center shadow-2xl shadow-black/35 sm:px-14 sm:py-16">
          <div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_50%_0%,rgba(250,204,21,0.12),transparent)]"
            aria-hidden
          />
          <div className="relative mx-auto max-w-2xl">
            <h2
              id="cta-heading"
              className="text-balance text-3xl font-semibold tracking-tight text-gorev-snow sm:text-4xl"
            >
              İlk görevini bugün oluştur
            </h2>
            <p className="mt-4 text-pretty text-base leading-relaxed text-gorev-muted sm:text-lg">
              Ücretsiz kayıt; görevini yayınla veya portföyünü doldur. Üretim
              öncesi bekleme listesine katıl — erken üyelere özel ücret
              avantajlarından haberdar ol.
            </p>
            <div className="mt-10 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:justify-center">
              <Button className="min-h-12 px-10 text-base">Bekleme listesine katıl</Button>
              <Button variant="outline" className="min-h-12 px-10 text-base">
                Kurumsal iletişim
              </Button>
            </div>
          </div>
        </div>
      </Container>
    </section>
  )
}
