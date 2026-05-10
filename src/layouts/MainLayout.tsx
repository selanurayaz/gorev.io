import { Link, Outlet } from 'react-router-dom'

import { Container } from '@/components/ui/Container'

export function MainLayout() {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="border-b border-gorev-navy-800 bg-gorev-navy-900/80 backdrop-blur supports-[backdrop-filter]:bg-gorev-navy-900/60">
        <Container className="flex items-center justify-between gap-4 py-4">
          <Link
            to="/"
            className="text-lg font-semibold tracking-tight text-gorev-snow"
          >
            görev<span className="text-gorev-yellow-400">.io</span>
          </Link>
          <nav
            className="flex items-center gap-3 text-sm text-gorev-muted"
            aria-label="Primary"
          >
            <span className="hidden sm:inline">Keşfet</span>
            <span className="hidden sm:inline">Nasıl çalışır?</span>
            <button
              type="button"
              className="rounded-lg bg-gorev-yellow-400 px-3 py-1.5 font-medium text-gorev-navy-950 transition hover:bg-gorev-yellow-300"
            >
              Giriş
            </button>
          </nav>
        </Container>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-gorev-navy-800 py-8 text-center text-sm text-gorev-muted">
        <Container>
          <p>© {new Date().getFullYear()} görev.io — Yakında.</p>
        </Container>
      </footer>
    </div>
  )
}
