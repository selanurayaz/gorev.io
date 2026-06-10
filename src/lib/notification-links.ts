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
    case 'service_request_received':
      return '/dashboard/teklifler?sekme=talepler'
    case 'service_request_accepted':
    case 'service_request_rejected':
      if (meta?.task_id && meta.other_user_id) {
        const params = new URLSearchParams({
          gorev: meta.task_id,
          karsi: meta.other_user_id,
        })
        return `/dashboard/mesajlar?${params.toString()}`
      }
      return '/dashboard/mesajlar'
    case 'offer_accepted':
      if (meta?.task_id && meta.other_user_id) {
        const params = new URLSearchParams({
          gorev: meta.task_id,
          karsi: meta.other_user_id,
        })
        return `/dashboard/mesajlar?${params.toString()}`
      }
      return '/dashboard/teklifler'
    case 'offer_received':
    case 'offer_rejected':
    default:
      return '/dashboard/teklifler'
  }
}
