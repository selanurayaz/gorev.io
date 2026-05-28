import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'

import { NotificationsContext } from '@/contexts/notifications-context'
import { useMessagePolling } from '@/hooks/useMessagePolling'
import {
  fetchNotifications,
  fetchUnreadNotificationCount,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from '@/services/notifications'
import type { AppNotification } from '@/types/notification'

const POLL_MS = 30_000

type NotificationsProviderProps = {
  children: ReactNode
}

export function NotificationsProvider({ children }: NotificationsProviderProps) {
  const [notifications, setNotifications] = useState<AppNotification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async (options?: { silent?: boolean }) => {
    if (!options?.silent) {
      setIsLoading(true)
      setError(null)
    }

    const [listResult, countResult] = await Promise.all([
      fetchNotifications(50),
      fetchUnreadNotificationCount(),
    ])

    setNotifications(listResult.notifications)
    setUnreadCount(countResult.count)
    setError(listResult.error ?? countResult.error)
    setIsLoading(false)
  }, [])

  useEffect(() => {
    let cancelled = false

    void (async () => {
      setIsLoading(true)
      setError(null)

      const [listResult, countResult] = await Promise.all([
        fetchNotifications(50),
        fetchUnreadNotificationCount(),
      ])

      if (cancelled) return

      setNotifications(listResult.notifications)
      setUnreadCount(countResult.count)
      setError(listResult.error ?? countResult.error)
      setIsLoading(false)
    })()

    return () => {
      cancelled = true
    }
  }, [])

  useMessagePolling(true, () => refresh({ silent: true }), POLL_MS)

  const markAsRead = useCallback(
    async (notificationId: string) => {
      const { success, error: updateError } =
        await markNotificationAsRead(notificationId)

      if (!success) {
        setError(updateError)
        return
      }

      setNotifications((prev) =>
        prev.map((item) =>
          item.id === notificationId ? { ...item, is_read: true } : item,
        ),
      )
      setUnreadCount((count) => Math.max(0, count - 1))
    },
    [],
  )

  const markAllAsRead = useCallback(async () => {
    const { success, error: updateError } = await markAllNotificationsAsRead()

    if (!success) {
      setError(updateError)
      return
    }

    setNotifications((prev) => prev.map((item) => ({ ...item, is_read: true })))
    setUnreadCount(0)
  }, [])

  const value = useMemo(
    () => ({
      notifications,
      unreadCount,
      isLoading,
      error,
      refresh,
      markAsRead,
      markAllAsRead,
    }),
    [
      notifications,
      unreadCount,
      isLoading,
      error,
      refresh,
      markAsRead,
      markAllAsRead,
    ],
  )

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  )
}
