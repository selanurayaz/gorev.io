import type {
  AppNotification,
  NotificationMetadata,
  NotificationType,
} from '@/types/notification'

const NOTIFICATION_TYPES: NotificationType[] = [
  'offer_received',
  'offer_accepted',
  'offer_rejected',
  'service_request_received',
  'service_request_accepted',
  'service_request_rejected',
  'message_received',
]

function parseNotificationType(value: unknown): NotificationType {
  const normalized = String(value ?? '')
    .trim()
    .toLowerCase()

  if (NOTIFICATION_TYPES.includes(normalized as NotificationType)) {
    return normalized as NotificationType
  }

  if (normalized.includes('service') && normalized.includes('request')) {
    if (normalized.includes('accept')) {
      return 'service_request_accepted'
    }
    if (normalized.includes('reject')) {
      return 'service_request_rejected'
    }
    return 'service_request_received'
  }

  if (normalized.includes('offer') && normalized.includes('accept')) {
    return 'offer_accepted'
  }
  if (normalized.includes('offer') && normalized.includes('reject')) {
    return 'offer_rejected'
  }
  if (normalized.includes('offer')) {
    return 'offer_received'
  }
  if (normalized.includes('message') || normalized.includes('mesaj')) {
    return 'message_received'
  }

  return 'offer_received'
}

function parseMetadata(value: unknown): NotificationMetadata | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null
  }

  const record = value as Record<string, unknown>

  const metadata: NotificationMetadata = {}

  const taskId = record.task_id ?? record.taskId
  const offerId = record.offer_id ?? record.offerId
  const otherUserId =
    record.other_user_id ?? record.otherUserId ?? record.sender_id
  const messageId = record.message_id ?? record.messageId
  const serviceId = record.service_id ?? record.serviceId

  if (taskId != null) metadata.task_id = String(taskId)
  if (offerId != null) metadata.offer_id = String(offerId)
  if (serviceId != null) metadata.service_id = String(serviceId)
  if (otherUserId != null) metadata.other_user_id = String(otherUserId)
  if (messageId != null) metadata.message_id = String(messageId)

  return Object.keys(metadata).length > 0 ? metadata : null
}

function readIsRead(row: Record<string, unknown>): boolean {
  if (row.is_read === true || row.read === true) return true
  if (row.is_read === false || row.read === false) return false
  if (row.read_at != null || row.readAt != null) return true
  return false
}

export function normalizeNotificationRow(
  row: Record<string, unknown>,
): AppNotification | null {
  const id = row.id
  const userId = row.user_id ?? row.userId

  if (id == null || userId == null) return null

  const title = row.title ?? row.subject ?? row.heading
  const message =
    row.message ?? row.body ?? row.content ?? row.description ?? null

  if (title == null || message == null) return null

  const metadata =
    parseMetadata(row.metadata ?? row.data ?? row.payload ?? row.extra) ??
    parseMetadata({
      task_id: row.task_id ?? row.taskId,
      offer_id: row.offer_id ?? row.offerId,
      other_user_id: row.other_user_id ?? row.sender_id,
      message_id: row.message_id ?? row.messageId,
    })

  return {
    id: String(id),
    user_id: String(userId),
    title: String(title).trim(),
    message: String(message).trim(),
    type: parseNotificationType(row.type ?? row.notification_type),
    is_read: readIsRead(row),
    created_at:
      row.created_at != null
        ? String(row.created_at)
        : new Date().toISOString(),
    metadata,
  }
}
