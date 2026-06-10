import { Link, Outlet } from 'react-router-dom'

import { Container } from '@/components/ui/Container'

export function AuthLayout() {
  return (
    <div className="relative flex min-h-dvh flex-col overflow-hidden bg-gorev-navy-950">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(34,197,94,0.14),transparent_55%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_55%_40%_at_90%_10%,rgba(250,204,21,0.06),transparent_50%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gorev-yellow-400/35 to-transparent"
        aria-hidden
      />

      <header className="relative border-b border-gorev-navy-900/80 bg-gorev-navy-950/70 backdrop-blur-md">
        <Container className="flex items-center justify-between py-4">
          <Link
            to="/"
            className="text-lg font-semibold tracking-tight text-gorev-snow transition hover:text-gorev-yellow-300"
          >
            görev<span className="text-gorev-yellow-400">.io</span>
          </Link>
          <p className="hidden text-xs font-medium uppercase tracking-[0.18em] text-gorev-muted sm:block">
            Güvenli oturum
          </p>
        </Container>
      </header>

      <main className="relative flex min-w-0 flex-1 flex-col justify-center px-3 py-10 sm:px-4 sm:py-16">
        <Container className="flex justify-center">
          <Outlet />
        </Container>
      </main>

      <footer className="relative border-t border-gorev-navy-900/70 py-6 text-center text-xs text-gorev-muted">
        <Container>
          <p>
            Sorun mu yaşıyorsun?{' '}
            <Link
              to="/kesfet"
              className="font-medium text-gorev-yellow-400/90 underline-offset-4 transition hover:text-gorev-yellow-300 hover:underline"
            >
              Keşfet sayfasına git
            </Link>
          </p>
        </Container>
      </footer>
    </div>
  )
}
