import type { NotificationType } from '@/types/notification'

export function getNotificationTypeLabel(type: NotificationType): string {
  switch (type) {
    case 'offer_received':
      return 'Yeni teklif'
    case 'offer_accepted':
      return 'Teklif kabul edildi'
    case 'offer_rejected':
      return 'Teklif reddedildi'
    case 'service_request_received':
      return 'Yeni hizmet talebi'
    case 'service_request_accepted':
      return 'Hizmet talebi kabul edildi'
    case 'service_request_rejected':
      return 'Hizmet talebi reddedildi'
    case 'message_received':
      return 'Yeni mesaj'
    default:
      return 'Bildirim'
  }
}

export function getNotificationTypeTone(
  type: NotificationType,
): 'yellow' | 'green' | 'red' | 'muted' {
  switch (type) {
    case 'offer_accepted':
      return 'green'
    case 'offer_rejected':
    case 'service_request_rejected':
      return 'red'
    case 'message_received':
      return 'yellow'
    case 'service_request_accepted':
      return 'green'
    case 'offer_received':
    case 'service_request_received':
    default:
      return 'muted'
  }
}

export const notificationTypeBadgeStyles = {
  yellow:
    'border-gorev-yellow-400/30 bg-gorev-yellow-400/10 text-gorev-yellow-300',
  green:
    'border-gorev-green-500/30 bg-gorev-green-500/10 text-gorev-green-400',
  red: 'border-red-500/30 bg-red-500/10 text-red-300',
  muted: 'border-gorev-navy-700 bg-gorev-navy-900/60 text-gorev-muted',
} as const
