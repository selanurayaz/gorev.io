import { useEffect, useId, useRef, useState } from 'react'
import { Link } from 'react-router-dom'

import { NotificationItem } from '@/components/notifications/NotificationItem'
import { Spinner } from '@/components/ui/Spinner'
import { useNotifications } from '@/hooks/useNotifications'
import { cn } from '@/lib/utils'

function BellIcon() {
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
        d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0"
      />
    </svg>
  )
}

export function NotificationBell() {
  const menuId = useId()
  const containerRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)

  const {
    notifications,
    unreadCount,
    isLoading,
    error,
    markAsRead,
    markAllAsRead,
    refresh,
  } = useNotifications()

  const preview = notifications.slice(0, 8)

  useEffect(() => {
    if (!open) return

    void refresh({ silent: true })

    function handlePointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false)
    }

    document.addEventListener('mousedown', handlePointerDown)
    window.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      window.removeEventListener('keydown', handleEscape)
    }
  }, [open, refresh])

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        className={cn(
          'inline-flex items-center gap-2 rounded-xl border border-gorev-navy-700 bg-gorev-navy-900/50 px-3 py-2 text-sm font-medium text-gorev-muted transition hover:border-gorev-yellow-400/35 hover:text-gorev-snow',
          open && 'border-gorev-yellow-400/35 text-gorev-snow',
        )}
        aria-expanded={open}
        aria-haspopup="true"
        aria-controls={menuId}
        onClick={() => setOpen((value) => !value)}
      >
        <BellIcon />
        <span className="hidden sm:inline">Bildirimler</span>
        {unreadCount > 0 ? (
          <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-gorev-yellow-400 px-1.5 text-[10px] font-bold text-gorev-navy-950">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        ) : null}
      </button>

      {open ? (
        <div
          id={menuId}
          role="menu"
          className="absolute right-0 z-50 mt-2 w-[min(100vw-2rem,22rem)] overflow-hidden rounded-2xl border border-gorev-navy-700 bg-gorev-navy-950 shadow-2xl shadow-black/40"
        >
          <div className="flex items-center justify-between gap-2 border-b border-gorev-navy-800 px-4 py-3">
            <p className="text-sm font-semibold text-gorev-snow">Bildirimler</p>
            {unreadCount > 0 ? (
              <button
                type="button"
                className="text-xs font-medium text-gorev-yellow-400 hover:underline"
                onClick={() => void markAllAsRead()}
              >
                Tümünü okundu işaretle
              </button>
            ) : null}
          </div>

          {isLoading ? (
            <div
              className="flex items-center justify-center gap-2 py-10"
              role="status"
            >
              <Spinner className="h-6 w-6 text-gorev-yellow-400" />
              <span className="text-sm text-gorev-muted">Yükleniyor…</span>
            </div>
          ) : null}

          {!isLoading && error ? (
            <p className="px-4 py-6 text-center text-sm text-red-300">{error}</p>
          ) : null}

          {!isLoading && !error && preview.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-gorev-muted">
              Henüz bildiriminiz yok.
            </p>
          ) : null}

          {!isLoading && !error && preview.length > 0 ? (
            <div className="max-h-80 overflow-y-auto">
              {preview.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onRead={markAsRead}
                  compact
                />
              ))}
            </div>
          ) : null}

          <div className="border-t border-gorev-navy-800 p-2">
            <Link
              to="/dashboard/bildirimler"
              className="block rounded-xl px-3 py-2 text-center text-sm font-medium text-gorev-yellow-400 transition hover:bg-gorev-navy-900/80"
              onClick={() => setOpen(false)}
            >
              Tüm bildirimleri gör
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  )
}
