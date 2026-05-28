import type { AppNotification } from '@/types/notification'

export function getNotificationHref(notification: AppNotification): string {
  const meta = notification.metadata

  switch (notification.type) {
    case 'message_received':
      if (meta?.task_id && meta.other_user_id) {
        const params = new URLSearchParams({
          gorev: meta.task_id,
          karsi: meta.other_user_id,
        })
        return `/dashboard/mesajlar?${params.toString()}`
      }
      return '/dashboard/mesajlar'
    case 'offer_received':
    case 'offer_accepted':
    case 'offer_rejected':
    default:
      return '/dashboard/teklifler'
  }
}
