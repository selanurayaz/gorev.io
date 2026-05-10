import { composeButtonClassName } from '@/lib/button-styles'
import { Container } from '@/components/ui/Container'

export function CtaSection() {
  return (
    <section
      id="cta"
      className="scroll-mt-24 border-t border-gorev-navy-900/80 py-16 sm:py-20"
      aria-labelledby="cta-heading"
    >
      <Container>
        <div className="relative overflow-hidden rounded-[2rem] border border-gorev-navy-800 bg-gradient-to-br from-gorev-navy-900 via-gorev-navy-950 to-gorev-navy-900 px-8 py-14 text-center shadow-2xl shadow-black/40 sm:px-14 sm:py-16 lg:px-16">
          <div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_75%_55%_at_50%_0%,rgba(250,204,21,0.14),transparent_55%)]"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute -right-24 -top-24 h-56 w-56 rounded-full bg-gorev-green-500/10 blur-3xl"
            aria-hidden
          />
          <div className="relative mx-auto max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gorev-green-400">
              Hazır mısın?
            </p>
            <h2
              id="cta-heading"
              className="mt-4 text-balance text-3xl font-semibold tracking-tight text-gorev-snow sm:text-4xl md:text-5xl"
            >
              Dakikalar içinde görevini yayınla
            </h2>
            <p className="mt-5 text-pretty text-base leading-relaxed text-gorev-muted sm:text-lg">
              Ücretsiz kayıt; portföyünü tamamla veya ilk görevini oluştur.
              Bekleme listasındakiler, lansmanda ücret avantajlarından ilk haberdar
              olanlar olacak.
            </p>
            <div className="mt-10 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:justify-center">
              <a
                href="#"
                className={composeButtonClassName(
                  'primary',
                  'min-h-12 justify-center px-10 text-base',
                )}
              >
                Bekleme listesine katıl
              </a>
              <a
                href="#"
                className={composeButtonClassName(
                  'outline',
                  'min-h-12 justify-center px-10 text-base',
                )}
              >
                Kurumsal iletişim
              </a>
            </div>
          </div>
        </div>
      </Container>
    </section>
  )
}
