import { Link } from 'react-router-dom'

import { Container } from '@/components/ui/Container'

const columns = [
  {
    title: 'Ürün',
    links: [
      { label: 'Görev Keşfet', href: '/kesfet', isRoute: true },
      { label: 'Popüler hizmetler', href: '/#populer-hizmetler', isRoute: false },
      { label: 'Nasıl çalışır?', href: '/#nasil-calisir', isRoute: false },
      { label: 'AI özellikleri', href: '/#ai-fiyat', isRoute: false },
    ],
  },
  {
    title: 'Hesap',
    links: [
      { label: 'Kayıt ol', href: '/kayit', isRoute: true },
      { label: 'Giriş yap', href: '/giris', isRoute: true },
      { label: 'Görev oluştur', href: '/dashboard/gorev-olustur', isRoute: true },
    ],
  },
  {
    title: 'Destek',
    links: [
      { label: 'Mesajlar', href: '/dashboard/mesajlar', isRoute: true },
      { label: 'Teklifler', href: '/dashboard/teklifler', isRoute: true },
      { label: 'Nasıl çalışır?', href: '/#nasil-calisir', isRoute: false },
    ],
  },
  {
    title: 'Yasal',
    links: [
      { label: 'Kayıt ve şartlar', href: '/kayit', isRoute: true },
      { label: 'Gizlilik', href: '/kayit', isRoute: true },
      { label: 'Örnek içerik notu', href: '/#one-cikanlar', isRoute: false },
    ],
  },
] as const

const social = [
  { label: 'Keşfet', href: '/kesfet', isRoute: true },
  { label: 'Kayıt', href: '/kayit', isRoute: true },
  { label: 'Ana sayfa', href: '/', isRoute: true },
] as const

export function SiteFooter() {
  return (
    <footer
      className="relative border-t border-gorev-navy-800 bg-gorev-navy-950"
      role="contentinfo"
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gorev-yellow-400/35 to-transparent"
        aria-hidden
      />

      <Container className="py-16 lg:py-20">
        <div className="grid gap-14 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-5">
            <Link
              to="/"
              className="inline-block text-2xl font-semibold tracking-tight text-gorev-snow transition hover:text-gorev-yellow-300"
            >
              görev<span className="text-gorev-yellow-400">.io</span>
            </Link>
            <p className="mt-5 max-w-md text-sm leading-relaxed text-gorev-muted">
              Yerel ve çevrimiçi kısa süreli hizmetler için modern pazar yeri.
              Şeffaf süreç, güçlü güven ve okunaklı tipografi ile üretken bir
              deneyim.
            </p>
            <div className="mt-8 flex flex-wrap gap-x-5 gap-y-2 text-sm">
              {social.map((s, i) => (
                <span key={s.label} className="flex items-center gap-x-5">
                  {i > 0 ? (
                    <span className="text-gorev-navy-700" aria-hidden>
                      ·
                    </span>
                  ) : null}
                  <Link
                    to={s.href}
                    className="font-medium text-gorev-muted transition hover:text-gorev-snow"
                  >
                    {s.label}
                  </Link>
                </span>
              ))}
            </div>
            <p className="mt-8 text-xs text-gorev-muted">
              İstanbul · Ankara · İzmir · uzaktan Türkiye
            </p>
          </div>

          <div className="grid gap-10 sm:grid-cols-2 lg:col-span-7 lg:grid-cols-4">
            {columns.map((col) => (
              <div key={col.title}>
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gorev-muted">
                  {col.title}
                </p>
                <ul className="mt-5 space-y-3 text-sm">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      {link.isRoute ? (
                        <Link
                          to={link.href}
                          className="text-gorev-muted transition hover:text-gorev-snow"
                        >
                          {link.label}
                        </Link>
                      ) : (
                        <a
                          href={link.href}
                          className="text-gorev-muted transition hover:text-gorev-snow"
                        >
                          {link.label}
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-4 border-t border-gorev-navy-800 pt-10 text-xs text-gorev-muted sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} görev.io. Tüm hakları saklıdır.</p>
          <p className="max-w-xl text-gorev-muted/85">
            Örnek içerik ve vitrin verisi; canlı ürün mesajları ve metrikler
            değişebilir.
          </p>
        </div>
      </Container>
    </footer>
  )
}
