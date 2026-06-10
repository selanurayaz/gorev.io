import type { User } from '@supabase/supabase-js'
import { useEffect, useId, useState } from 'react'
import { Link } from 'react-router-dom'

import { composeButtonClassName } from '@/lib/button-styles'
import { Container } from '@/components/ui/Container'
import { useAuth } from '@/hooks/useAuth'
import { getUserDisplayName } from '@/lib/user-display'
import { cn } from '@/lib/utils'

const NAV_LINKS = [
  { href: '/#populer-hizmetler', label: 'Popüler hizmetler' },
  { href: '/#nasil-calisir', label: 'Nasıl çalışır?' },
  { href: '/#ai-fiyat', label: 'AI özellikleri' },
  { href: '/#one-cikanlar', label: 'Öne çıkanlar' },
] as const

function MenuIcon({ open }: { open: boolean }) {
  return (
    <svg
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      aria-hidden
    >
      {open ? (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M6 18 18 6M6 6l12 12"
        />
      ) : (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
        />
      )}
    </svg>
  )
}

const linkClass =
  'relative text-sm font-medium text-gorev-muted transition-colors duration-200 after:absolute after:-bottom-1 after:left-0 after:h-px after:w-full after:origin-left after:scale-x-0 after:bg-gorev-yellow-400 after:transition after:duration-200 hover:text-gorev-snow hover:after:scale-x-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gorev-yellow-400'

function UserGreeting({ user }: { user: User }) {
  const displayName = getUserDisplayName(user)

  return (
    <div
      className="hidden max-w-[7.5rem] truncate rounded-full bg-gradient-to-br from-gorev-navy-800 to-gorev-navy-900 px-3 py-1.5 text-sm font-semibold text-gorev-snow ring-1 ring-gorev-navy-700 min-[400px]:block sm:max-w-none"
      title={user.email ?? undefined}
    >
      <span className="hidden sm:inline">Merhaba, </span>
      <span className="truncate text-gorev-yellow-400">{displayName}</span>
    </div>
  )
}

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuId = useId()
  const { user, isAuthenticated, isLoading } = useAuth()
  const showGuestActions = !isLoading && !isAuthenticated
  const showAuthenticatedActions = !isLoading && isAuthenticated
  const homePath = !isLoading && isAuthenticated ? '/dashboard' : '/'

  useEffect(() => {
    if (!menuOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [menuOpen])

  return (
    <header className="sticky top-0 z-50 border-b border-gorev-navy-800/90 bg-gorev-navy-950/90 backdrop-blur-xl supports-[backdrop-filter]:bg-gorev-navy-950/75">
      <Container className="flex items-center justify-between gap-4 py-3.5 sm:py-4">
        <Link
          to={homePath}
          className="text-lg font-semibold tracking-tight text-gorev-snow transition-colors hover:text-gorev-yellow-300"
          onClick={() => setMenuOpen(false)}
        >
          görev<span className="text-gorev-yellow-400">.io</span>
        </Link>

        <nav
          className="hidden items-center gap-8 lg:flex"
          aria-label="Ana menü"
        >
          <Link to="/kesfet" className={linkClass}>
            Görev Keşfet
          </Link>
          {NAV_LINKS.map((item) => (
            <a key={item.href} href={item.href} className={linkClass}>
              {item.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          {showAuthenticatedActions && user ? (
            <>
              <UserGreeting user={user} />
              <Link
                to="/dashboard"
                className={composeButtonClassName(
                  'primary',
                  'rounded-full px-6 py-2.5 text-sm shadow-lg shadow-gorev-green-500/15',
                )}
              >
                Panele git
              </Link>
            </>
          ) : null}
          {showGuestActions ? (
            <>
              <Link
                to="/giris"
                className={composeButtonClassName(
                  'ghost',
                  'px-4 text-sm font-semibold',
                )}
              >
                Giriş yap
              </Link>
              <Link
                to="/kayit"
                className={composeButtonClassName(
                  'primary',
                  'rounded-full px-6 py-2.5 text-sm shadow-lg shadow-gorev-green-500/15',
                )}
              >
                Ücretsiz başla
              </Link>
            </>
          ) : null}
        </div>

        <div className="flex items-center gap-2 lg:hidden">
          {showAuthenticatedActions ? (
            <Link
              to="/dashboard"
              className={composeButtonClassName(
                'ghost',
                'px-3 text-sm font-semibold',
              )}
            >
              Panel
            </Link>
          ) : null}
          {showGuestActions ? (
            <Link
              to="/giris"
              className={composeButtonClassName(
                'ghost',
                'px-3 text-sm font-semibold',
              )}
            >
              Giriş
            </Link>
          ) : null}
          <button
            type="button"
            className={cn(
              'inline-flex items-center justify-center rounded-xl border border-gorev-navy-700 bg-gorev-navy-900/60 p-2.5 text-gorev-snow transition hover:border-gorev-yellow-400/40 hover:bg-gorev-navy-900',
              menuOpen && 'border-gorev-yellow-400/50 bg-gorev-navy-900',
            )}
            aria-expanded={menuOpen}
            aria-controls={menuId}
            aria-label={menuOpen ? 'Menüyü kapat' : 'Menüyü aç'}
            onClick={() => setMenuOpen((o) => !o)}
          >
            <MenuIcon open={menuOpen} />
          </button>
        </div>
      </Container>

      <div
        id={menuId}
        className={cn(
          'border-t border-gorev-navy-800 bg-gorev-navy-950/98 lg:hidden',
          menuOpen ? 'block' : 'hidden',
        )}
      >
        <Container className="flex flex-col gap-1 py-4">
          <Link
            to="/kesfet"
            className="rounded-xl px-3 py-3 text-base font-medium text-gorev-snow transition hover:bg-gorev-navy-900"
            onClick={() => setMenuOpen(false)}
          >
            Görev Keşfet
          </Link>
          {NAV_LINKS.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="rounded-xl px-3 py-3 text-base font-medium text-gorev-snow transition hover:bg-gorev-navy-900"
              onClick={() => setMenuOpen(false)}
            >
              {item.label}
            </a>
          ))}
          <div className="mt-3 flex flex-col gap-2 border-t border-gorev-navy-800 pt-4">
            {showAuthenticatedActions && user ? (
              <>
                <p className="px-3 text-sm text-gorev-muted">
                  Merhaba,{' '}
                  <span className="font-semibold text-gorev-yellow-400">
                    {getUserDisplayName(user)}
                  </span>
                </p>
                <Link
                  to="/dashboard"
                  className={composeButtonClassName(
                    'primary',
                    'w-full justify-center rounded-full py-3 text-base',
                  )}
                  onClick={() => setMenuOpen(false)}
                >
                  Panele git
                </Link>
              </>
            ) : null}
            {showGuestActions ? (
              <>
                <Link
                  to="/giris"
                  className={composeButtonClassName(
                    'outline',
                    'w-full justify-center rounded-full py-3 text-base',
                  )}
                  onClick={() => setMenuOpen(false)}
                >
                  Giriş yap
                </Link>
                <Link
                  to="/kayit"
                  className={composeButtonClassName(
                    'primary',
                    'w-full justify-center rounded-full py-3 text-base',
                  )}
                  onClick={() => setMenuOpen(false)}
                >
                  Ücretsiz başla
                </Link>
              </>
            ) : null}
          </div>
        </Container>
      </div>
    </header>
  )
}
