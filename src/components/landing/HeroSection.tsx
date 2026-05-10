import { Button } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'

const trustItems = [
  { label: 'Ortalama puan', value: '4,9 / 5' },
  { label: 'Tamamlanan görev', value: '38K+' },
  { label: 'Doğrulanmış uzman', value: '12K+' },
] as const

export function HeroSection() {
  return (
    <div className="relative overflow-hidden border-b border-gorev-navy-900/80">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_90%_60%_at_50%_-25%,rgba(34,197,94,0.22),transparent_58%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_55%_45%_at_80%_10%,rgba(250,204,21,0.08),transparent_55%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gorev-yellow-400/45 to-transparent"
        aria-hidden
      />

      <Container className="relative py-20 sm:py-28 lg:py-32">
        <div className="mx-auto max-w-4xl text-center">
          <p className="inline-flex items-center gap-2 rounded-full border border-gorev-navy-700/90 bg-gorev-navy-900/70 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-gorev-muted shadow-[0_1px_0_0_rgba(255,255,255,0.04)_inset]">
            <span
              className="h-2 w-2 rounded-full bg-gorev-green-400 shadow-[0_0_12px_rgba(74,222,128,0.55)]"
              aria-hidden
            />
            Türkiye · mikro hizmet pazaryeri
          </p>

          <p className="mx-auto mt-8 max-w-2xl text-sm font-medium leading-relaxed text-gorev-muted sm:text-base">
            Uber kadar şeffaf süreç · Fiverr kadar çeşitli ilanlar · Linear kadar
            sade arayüz.
          </p>

          <h1 className="mt-6 text-balance text-5xl font-semibold tracking-tight text-gorev-snow sm:text-6xl lg:text-7xl lg:leading-[1.05]">
            Kısa süreli işler için{' '}
            <span className="bg-gradient-to-r from-gorev-yellow-300 via-gorev-yellow-400 to-gorev-green-400 bg-clip-text text-transparent">
              güvenilir eşleşme
            </span>
            .
          </h1>

          <p className="mx-auto mt-8 max-w-2xl text-pretty text-lg leading-relaxed text-gorev-muted sm:text-xl">
            görev.io; temizlikten taşıma yardımına, grafik tasarımdan yazılım
            desteğine kadar talepleri doğru uzmanlarla buluşturur. İstersen yerinde,
            istersen uzaktan — tek çatı altında.
          </p>

          <div className="mx-auto mt-12 max-w-xl">
            <div className="flex flex-col gap-2 rounded-2xl border border-gorev-navy-800 bg-gorev-navy-900/55 p-2 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)] backdrop-blur-sm sm:flex-row sm:items-center">
              <label className="sr-only" htmlFor="hero-search">
                Görev ara
              </label>
              <input
                id="hero-search"
                type="search"
                readOnly
                placeholder="Örn. Kadıköy’de 2 saat ofis temizliği"
                className="min-h-12 flex-1 rounded-xl border border-transparent bg-gorev-navy-950/85 px-4 text-sm text-gorev-snow placeholder:text-gorev-muted focus:border-gorev-yellow-400/35 focus:outline-none focus:ring-2 focus:ring-gorev-yellow-400/25"
              />
              <Button
                type="button"
                variant="secondary"
                className="min-h-12 shrink-0 px-6 sm:w-auto"
              >
                Görevleri keşfet
              </Button>
            </div>
            <p className="mt-3 text-center text-xs leading-relaxed text-gorev-muted">
              Akıllı arama yakında. Şimdilik menüden bölümlere atlayabilirsin.
            </p>
          </div>

          <div className="mt-12 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:justify-center">
            <Button className="min-h-12 px-9 text-base">Görev oluştur</Button>
            <Button variant="outline" className="min-h-12 px-9 text-base">
              Hizmet ver — ücretsiz kayıt
            </Button>
          </div>

          <ul
            className="mt-14 flex flex-wrap items-center justify-center gap-3 sm:gap-4"
            aria-label="Güven göstergeleri"
          >
            {trustItems.map((item) => (
              <li
                key={item.label}
                className="rounded-2xl border border-gorev-navy-800 bg-gorev-navy-900/45 px-4 py-3 text-left shadow-sm shadow-black/15 transition duration-200 hover:border-gorev-yellow-400/25 hover:bg-gorev-navy-900/70"
              >
                <p className="text-[11px] font-semibold uppercase tracking-wide text-gorev-muted">
                  {item.label}
                </p>
                <p className="mt-1 font-mono text-lg font-semibold tracking-tight text-gorev-snow sm:text-xl">
                  {item.value}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </div>
  )
}
