import { LandingSection } from '@/components/landing/LandingSection'
import { Container } from '@/components/ui/Container'

const bullets = [
  'Konum, mevsim ve benzer görevlerden talep tahmini — doğru zamanda doğru teklif.',
  'Metin + bağlam ipuçlarıyla yapay zeka destekli fiyat koridoru ve şeffaf aralık.',
  'Tamamlanma süresi ve başarı oranı sinyalleriyle riskleri önceden görünür kılma.',
]

export function AiPricingSection() {
  return (
    <LandingSection id="ai-fiyat" dense>
      <Container>
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-16">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gorev-green-400">
              Yapay zeka destekli
            </p>
            <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight text-gorev-snow sm:text-4xl">
              Akıllı fiyat ve talep öngörüsü
            </h2>
            <p className="mt-5 text-base leading-relaxed text-gorev-muted sm:text-lg">
              görev.io; görev metnini, lokasyonu ve geçmiş iş örüntülerini bir
              araya getirerek hem talebi tahmin eder hem de adil bir başlangıç
              fiyat aralığı önerir. Notion tarzı sade özet; Uber tarzı şeffaf
              beklenti yönetimi.
            </p>

            <ul className="mt-8 space-y-4">
              {bullets.map((text) => (
                <li
                  key={text}
                  className="flex gap-3 text-sm leading-relaxed text-gorev-muted"
                >
                  <span
                    className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-gorev-green-500"
                    aria-hidden
                  />
                  <span>{text}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="relative">
            <div
              className="pointer-events-none absolute -inset-4 rounded-3xl bg-[radial-gradient(circle_at_30%_20%,rgba(250,204,21,0.12),transparent_55%),radial-gradient(circle_at_70%_80%,rgba(34,197,94,0.14),transparent_50%)]"
              aria-hidden
            />
            <div className="relative overflow-hidden rounded-3xl border border-gorev-navy-800 bg-gradient-to-br from-gorev-navy-900 to-gorev-navy-950 p-6 shadow-2xl shadow-black/40 sm:p-8">
              <div className="flex flex-col gap-4 border-b border-gorev-navy-800 pb-5 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-gorev-muted">
                    Örnek görev
                  </p>
                  <p className="mt-1 text-lg font-semibold leading-snug text-gorev-snow">
                    “Kadıköy’de hafta içi akşam React düzeltmesi (2–3 saat)”
                  </p>
                </div>
                <span className="inline-flex w-fit shrink-0 rounded-full bg-gorev-yellow-400/15 px-3 py-1 text-xs font-semibold text-gorev-yellow-300">
                  Tahmini talep: orta–yüksek
                </span>
              </div>

              <dl className="mt-6 space-y-4 text-sm">
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-gorev-muted">Önerilen aralık</dt>
                  <dd className="font-semibold text-gorev-green-400">
                    ₺3.800 — ₺5.200
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-gorev-muted">Bölge ortalaması</dt>
                  <dd className="font-medium text-gorev-snow">₺4.450</dd>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-gorev-muted">Tahmini tamamlanma</dt>
                  <dd className="font-medium text-gorev-snow">~2,5 saat</dd>
                </div>
              </dl>

              <p className="mt-6 rounded-xl border border-gorev-navy-800 bg-gorev-navy-950/60 px-4 py-3 text-xs leading-relaxed text-gorev-muted">
                Kart demo verisidir. Canlı sistemde model; anonimleştirilmiş iş
                geçmişi ve güncel talep sinyalleriyle güncellenir.
              </p>
            </div>
          </div>
        </div>
      </Container>
    </LandingSection>
  )
}
