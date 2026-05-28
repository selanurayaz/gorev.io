import type { TaskId } from '@/types/index'
import type { UserId } from '@/types/index'

/** `messages` tablosu. */
export type ChatMessage = {
  id: string
  sender_id: UserId
  receiver_id: UserId
  task_id: TaskId | null
  content: string
  created_at: string
}

export type Conversation = {
  /** `taskId:otherUserId` (sıralı, kararlı anahtar). */
  id: string
  task_id: TaskId
  task_title: string
  other_user_id: UserId
  other_user_name: string | null
  last_message: string | null
  last_message_at: string | null
}

export type SendMessageInput = {
  task_id: TaskId
  receiver_id: UserId
  content: string
  /** Mesajlar sayfasında mevcut sohbete yanıt; teklif kontrolü uygulanmaz. */
  existing_thread?: boolean
}
