import { Link, Outlet } from 'react-router-dom'

import { SiteFooter } from '@/components/landing/SiteFooter'
import { Container } from '@/components/ui/Container'

const navLinkClass =
  'text-xs text-gorev-muted transition-colors hover:text-gorev-snow sm:text-sm'

export function MainLayout() {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-40 border-b border-gorev-navy-800 bg-gorev-navy-950/85 backdrop-blur-md supports-[backdrop-filter]:bg-gorev-navy-950/70">
        <Container className="flex items-center justify-between gap-4 py-4">
          <Link
            to="/"
            className="text-lg font-semibold tracking-tight text-gorev-snow transition hover:text-gorev-yellow-300"
          >
            görev<span className="text-gorev-yellow-400">.io</span>
          </Link>
          <nav
            className="flex max-w-[65%] flex-wrap items-center justify-end gap-x-3 gap-y-2 sm:max-w-none md:gap-6"
            aria-label="Ana menü"
          >
            <a href="#kategoriler" className={navLinkClass}>
              Kategoriler
            </a>
            <a href="#nasil-calisir" className={navLinkClass}>
              Nasıl çalışır?
            </a>
            <a href="#cta" className={navLinkClass}>
              Başla
            </a>
            <button
              type="button"
              className="rounded-lg bg-gorev-yellow-400 px-3 py-1.5 font-semibold text-gorev-navy-950 transition hover:bg-gorev-yellow-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gorev-yellow-400"
            >
              Giriş
            </button>
          </nav>
        </Container>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <SiteFooter />
    </div>
  )
}
