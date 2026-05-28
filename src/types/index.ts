/** Shared domain identifiers — extend as features land. */
export type UserId = string
export type TaskId = string

export type { ServiceCategory } from '@/types/category'
export type {
  Task,
  TaskCreateInput,
  TaskFormValues,
  TaskListItem,
  MarketplaceTask,
} from '@/types/task'

export type {
  Offer,
  OfferActionResult,
  OfferCreateInput,
  OfferFormValues,
  OfferListItem,
  IncomingOfferItem,
  SubmittedOfferItem,
} from '@/types/offer'

export type {
  ChatMessage,
  Conversation,
  SendMessageInput,
} from '@/types/message'

export type {
  AppNotification,
  CreateNotificationInput,
  NotificationMetadata,
  NotificationType,
} from '@/types/notification'
