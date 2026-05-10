import { Link } from 'react-router-dom'

import { Container } from '@/components/ui/Container'

const columns = [
  {
    title: 'Ürün',
    links: [
      { label: 'Keşfet', href: '#kategoriler' },
      { label: 'Nasıl çalışır?', href: '#nasil-calisir' },
      { label: 'AI fiyat', href: '#ai-fiyat' },
      { label: 'Öne çıkanlar', href: '#one-cikanlar' },
    ],
  },
  {
    title: 'Şirket',
    links: [
      { label: 'Hakkımızda', href: '#' },
      { label: 'Kariyer', href: '#' },
      { label: 'Basın', href: '#' },
    ],
  },
  {
    title: 'Destek',
    links: [
      { label: 'Yardım merkezi', href: '#' },
      { label: 'Güvenlik', href: '#' },
      { label: 'Topluluk kuralları', href: '#' },
    ],
  },
  {
    title: 'Yasal',
    links: [
      { label: 'Kullanım şartları', href: '#' },
      { label: 'Gizlilik', href: '#' },
      { label: 'Çerezler', href: '#' },
    ],
  },
] as const

export function SiteFooter() {
  return (
    <footer
      className="border-t border-gorev-navy-800 bg-gorev-navy-950"
      role="contentinfo"
    >
      <Container className="py-14">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <Link
              to="/"
              className="inline-block text-xl font-semibold tracking-tight text-gorev-snow"
            >
              görev<span className="text-gorev-yellow-400">.io</span>
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-gorev-muted">
              Yerel ve çevrimiçi kısa süreli hizmetler için modern pazar yeri.
              Şeffaf süreç, güçlü güven ve sade bir arayüz.
            </p>
            <p className="mt-6 text-xs text-gorev-muted">
              İstanbul · Ankara · İzmir ve çevrimiçi Türkiye
            </p>
          </div>

          <div className="grid gap-10 sm:grid-cols-2 lg:col-span-8 lg:grid-cols-4">
            {columns.map((col) => (
              <div key={col.title}>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gorev-muted">
                  {col.title}
                </p>
                <ul className="mt-4 space-y-3 text-sm">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <a
                        href={link.href}
                        className="text-gorev-muted transition hover:text-gorev-snow"
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-14 flex flex-col items-start justify-between gap-4 border-t border-gorev-navy-800 pt-8 text-xs text-gorev-muted sm:flex-row sm:items-center">
          <p>© {new Date().getFullYear()} görev.io. Tüm hakları saklıdır.</p>
          <p className="text-gorev-muted/80">
            Tasarım ve içerik örnek amaçlıdır; canlı ürün mesajları değişebilir.
          </p>
        </div>
      </Container>
    </footer>
  )
}
