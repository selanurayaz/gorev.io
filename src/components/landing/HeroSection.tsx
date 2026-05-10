import { Button } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'

export function HeroSection() {
  return (
    <div className="relative overflow-hidden border-b border-gorev-navy-900/80">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_85%_55%_at_50%_-15%,rgba(34,197,94,0.18),transparent_55%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gorev-yellow-400/40 to-transparent"
        aria-hidden
      />

      <Container className="relative py-16 sm:py-24 lg:py-28">
        <div className="mx-auto max-w-3xl text-center lg:max-w-4xl">
          <p className="inline-flex items-center gap-2 rounded-full border border-gorev-navy-700 bg-gorev-navy-900/60 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-gorev-muted">
            <span
              className="h-1.5 w-1.5 rounded-full bg-gorev-green-400"
              aria-hidden
            />
            Mikro hizmet pazaryeri
          </p>

          <h1 className="mt-8 text-balance text-4xl font-semibold tracking-tight text-gorev-snow sm:text-5xl lg:text-6xl">
            Kısa süreli işler için{' '}
            <span className="bg-gradient-to-r from-gorev-yellow-300 to-gorev-yellow-400 bg-clip-text text-transparent">
              net, hızlı, güvenilir
            </span>{' '}
            eşleşme.
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-gorev-muted sm:text-xl">
            görev.io; temizlikten montaja, uzaktan yazılım desteğinden yerinde
            bakıma kadar talepleri doğru uzmanlarla buluşturur. Uber kadar
            şeffaf, Fiverr kadar çeşitli — Linear tarzı sade bir deneyim.
          </p>

          <div className="mx-auto mt-10 max-w-xl">
            <div className="flex flex-col gap-2 rounded-2xl border border-gorev-navy-800 bg-gorev-navy-900/50 p-2 shadow-inner shadow-black/20 sm:flex-row sm:items-center">
              <label className="sr-only" htmlFor="hero-search">
                Görev ara
              </label>
              <input
                id="hero-search"
                type="search"
                readOnly
                placeholder="Örn. ‘Kadıköy’de 2 saat ofis temizliği’"
                className="min-h-12 flex-1 rounded-xl border border-transparent bg-gorev-navy-950/80 px-4 text-sm text-gorev-snow placeholder:text-gorev-muted focus:border-gorev-yellow-400/40 focus:outline-none focus:ring-2 focus:ring-gorev-yellow-400/30"
              />
              <Button
                type="button"
                variant="secondary"
                className="min-h-12 shrink-0 px-6 sm:w-auto"
              >
                Görevleri keşfet
              </Button>
            </div>
            <p className="mt-3 text-center text-xs text-gorev-muted">
              Yakında akıllı arama — şimdilik üst menüden bölümlere göz atabilirsin.
            </p>
          </div>

          <div className="mt-12 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:justify-center">
            <Button className="min-h-12 px-8 text-base">Görev oluştur</Button>
            <Button variant="outline" className="min-h-12 px-8 text-base">
              Hizmet ver — ücretsiz kayıt
            </Button>
          </div>
        </div>
      </Container>
    </div>
  )
}
