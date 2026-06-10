import { useCallback, useEffect, useId, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'

import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar'
import { DashboardTopbar } from '@/components/dashboard/DashboardTopbar'
import { NotificationsProvider } from '@/contexts/NotificationsProvider'
import { ProfileProvider } from '@/contexts/ProfileProvider'
import { cn } from '@/lib/utils'

const pageTitles: Record<string, { title: string; subtitle?: string }> = {
  '/dashboard': {
    title: 'Ana Sayfa',
    subtitle: 'Görevlerinize genel bakış',
  },
  '/dashboard/gorevlerim': {
    title: 'Görevlerim',
    subtitle: 'Kabul edilmiş işleriniz',
  },
  '/dashboard/hizmetler': {
    title: 'Hizmetler',
    subtitle: 'Sunduğunuz hizmet paketleri',
  },
  '/dashboard/hizmet-olustur': {
    title: 'Hizmet Oluştur',
    subtitle: 'Yeni hizmet ilanı yayınlayın',
  },
  '/dashboard/gorev-olustur': {
    title: 'Görev Oluştur',
    subtitle: 'Yaptırmak istediğiniz işi tanımlayın',
  },
  '/dashboard/mesajlar': {
    title: 'Mesajlar',
    subtitle: 'Kabul edilmiş görevlerde mesajlaşma',
  },
  '/dashboard/teklifler': {
    title: 'Teklifler',
    subtitle: 'Gelen ve verdiğiniz teklifler',
  },
  '/dashboard/profil': {
    title: 'Profil',
    subtitle: 'Hesap ve tercihler',
  },
  '/dashboard/bildirimler': {
    title: 'Bildirimler',
    subtitle: 'Teklifler, mesajlar ve güncellemeler',
  },
}

function CloseIcon() {
  return (
    <svg
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6 18 18 6M6 6l12 12"
      />
    </svg>
  )
}

export function DashboardLayout() {
  const drawerId = useId()
  const { pathname } = useLocation()
  const meta = pageTitles[pathname] ?? pageTitles['/dashboard']

  const [mobileMenu, setMobileMenu] = useState({
    open: false,
    atPath: pathname,
  })
  const sidebarOpen = mobileMenu.open && mobileMenu.atPath === pathname

  const setSidebarOpen = useCallback(
    (open: boolean) => {
      setMobileMenu({ open, atPath: pathname })
    },
    [pathname],
  )

  useEffect(() => {
    if (!sidebarOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSidebarOpen(false)
    }
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [sidebarOpen, setSidebarOpen])

  return (
    <div className="flex min-h-dvh min-w-0 overflow-x-clip bg-gorev-navy-950">
      {/* Desktop sidebar */}
      <div className="hidden w-64 shrink-0 border-r border-gorev-navy-800 bg-gorev-navy-950 lg:block xl:w-72">
        <DashboardSidebar className="sticky top-0 h-dvh" />
      </div>

      {/* Mobile drawer */}
      {sidebarOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          aria-label="Menüyü kapat"
          onClick={() => setSidebarOpen(false)}
        />
      ) : null}

      <div
        id={drawerId}
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-[min(100%,18rem)] border-r border-gorev-navy-800 bg-gorev-navy-950 shadow-2xl transition-transform duration-200 lg:hidden',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
        )}
        aria-hidden={!sidebarOpen}
      >
        <div className="flex items-center justify-end border-b border-gorev-navy-800 p-3">
          <button
            type="button"
            className="rounded-xl border border-gorev-navy-700 p-2.5 text-gorev-snow transition hover:border-gorev-yellow-400/40"
            onClick={() => setSidebarOpen(false)}
            aria-label="Menüyü kapat"
          >
            <CloseIcon />
          </button>
        </div>
        <DashboardSidebar
          className="h-[calc(100dvh-3.5rem)]"
          onNavigate={() => setSidebarOpen(false)}
        />
      </div>

      <NotificationsProvider>
        <ProfileProvider>
          <div className="flex min-w-0 flex-1 flex-col">
            <DashboardTopbar
              title={meta.title}
              subtitle={meta.subtitle}
              onMenuClick={() => setSidebarOpen(true)}
            />
            <main className="min-w-0 flex-1 overflow-x-clip px-3 py-5 sm:px-6 sm:py-8 lg:px-8">
              <Outlet />
            </main>
          </div>
        </ProfileProvider>
      </NotificationsProvider>
    </div>
  )
}
