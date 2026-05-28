import { AuthAlert } from '@/components/auth/AuthAlert'
import { NotificationItem } from '@/components/notifications/NotificationItem'
import { Spinner } from '@/components/ui/Spinner'
import { useNotifications } from '@/hooks/useNotifications'

export function NotificationsPage() {
  const {
    notifications,
    unreadCount,
    isLoading,
    error,
    markAsRead,
    markAllAsRead,
    refresh,
  } = useNotifications()

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gorev-green-400">
          Hesap
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-gorev-snow">
          Bildirimler
        </h1>
        <p className="mt-1 text-sm text-gorev-muted">
          Teklifler, mesajlar ve görev güncellemeleri burada listelenir.
        </p>
      </header>

      {error ? (
        <div className="space-y-3">
          <AuthAlert message={error} variant="error" />
          <button
            type="button"
            onClick={() => void refresh()}
            className="text-sm font-medium text-gorev-yellow-400 underline-offset-4 hover:underline"
          >
            Tekrar dene
          </button>
        </div>
      ) : null}

      <div className="overflow-hidden rounded-2xl border border-gorev-navy-800 bg-gorev-navy-900/30">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gorev-navy-800 px-4 py-3 sm:px-5">
          <p className="text-sm text-gorev-muted">
            {unreadCount > 0
              ? `${unreadCount} okunmamış bildirim`
              : 'Tüm bildirimler okundu'}
          </p>
          {unreadCount > 0 ? (
            <button
              type="button"
              className="text-sm font-medium text-gorev-yellow-400 hover:underline"
              onClick={() => void markAllAsRead()}
            >
              Tümünü okundu işaretle
            </button>
          ) : null}
        </div>

        {isLoading ? (
          <div
            className="flex items-center justify-center gap-3 py-16"
            role="status"
          >
            <Spinner className="h-7 w-7 text-gorev-yellow-400" />
            <span className="text-sm text-gorev-muted">Yükleniyor…</span>
          </div>
        ) : null}

        {!isLoading && notifications.length === 0 ? (
          <p className="px-4 py-12 text-center text-sm text-gorev-muted">
            Henüz bildiriminiz yok. Yeni teklif veya mesaj geldiğinde burada
            görünecek.
          </p>
        ) : null}

        {!isLoading && notifications.length > 0 ? (
          <div>
            {notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onRead={markAsRead}
              />
            ))}
          </div>
        ) : null}
      </div>
    </div>
  )
}
