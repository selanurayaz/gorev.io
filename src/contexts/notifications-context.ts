import { createContext } from 'react'

import type { AppNotification } from '@/types/notification'

export type NotificationsContextValue = {
  notifications: AppNotification[]
  unreadCount: number
  isLoading: boolean
  error: string | null
  refresh: (options?: { silent?: boolean }) => Promise<void>
  markAsRead: (notificationId: string) => Promise<void>
  markAllAsRead: () => Promise<void>
}

export const NotificationsContext =
  createContext<NotificationsContextValue | null>(null)
