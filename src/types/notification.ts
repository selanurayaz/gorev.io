import type { UserId } from '@/types/index'

export type NotificationType =
  | 'offer_received'
  | 'offer_accepted'
  | 'offer_rejected'
  | 'service_request_received'
  | 'service_request_accepted'
  | 'service_request_rejected'
  | 'message_received'

export type NotificationMetadata = {
  task_id?: string
  offer_id?: string
  service_id?: string
  other_user_id?: string
  message_id?: string
}

export type AppNotification = {
  id: string
  user_id: UserId
  title: string
  message: string
  type: NotificationType
  is_read: boolean
  created_at: string
  metadata: NotificationMetadata | null
}

export type CreateNotificationInput = {
  user_id: UserId
  title: string
  message: string
  type: NotificationType
  metadata?: NotificationMetadata | null
}
