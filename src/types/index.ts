/** Shared domain identifiers — extend as features land. */
export type UserId = string
export type TaskId = string
export type ServiceId = string

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
  AcceptedWorkItem,
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

export type {
  DashboardActivityItem,
  DashboardData,
  DashboardStatDisplay,
  DashboardStats,
} from '@/types/dashboard'

export type {
  Review,
  ReviewCreateInput,
  ReviewFormValues,
  UserRatingSummary,
} from '@/types/review'

export type {
  ListingType,
  PriceSuggestion,
  PriceSuggestionRequest,
} from '@/types/price-suggestion'

export type {
  MarketplaceService,
  Service,
  ServiceCreateInput,
  ServiceFormValues,
  ServiceListItem,
} from '@/types/service'
