import type { ChatMessage } from '@/types/message'

/** Auth / Supabase kimliklerini karşılaştırır. */
export function sameUserId(
  a: string | null | undefined,
  b: string | null | undefined,
): boolean {
  if (!a || !b) return false
  return a.trim().toLowerCase() === b.trim().toLowerCase()
}

export function sameTaskId(
  a: string | null | undefined,
  b: string | null | undefined,
): boolean {
  if (!a || !b) return false
  return a.trim().toLowerCase() === b.trim().toLowerCase()
}

export function getCounterpartUserIdFromMessage(
  message: ChatMessage,
  currentUserId: string,
): string | null {
  if (sameUserId(message.sender_id, currentUserId)) {
    return message.receiver_id
  }
  if (sameUserId(message.receiver_id, currentUserId)) {
    return message.sender_id
  }
  return null
}

export function isMessageBetweenUsers(
  message: ChatMessage,
  userId: string,
  otherUserId: string,
): boolean {
  const involvesCurrent =
    sameUserId(message.sender_id, userId) ||
    sameUserId(message.receiver_id, userId)
  const involvesOther =
    sameUserId(message.sender_id, otherUserId) ||
    sameUserId(message.receiver_id, otherUserId)

  return involvesCurrent && involvesOther
}

export type ExistingConversationReply = {
  canMessage: boolean
  receiverId: string | null
}

/**
 * Mevcut sohbet: kullanıcı gönderen veya alıcıysa yanıt verebilir.
 * Alıcı, son mesaja veya listedeki karşı taraftan türetilir.
 */
export function resolveExistingConversationReply(
  messages: ChatMessage[],
  currentUserId: string,
  otherUserId?: string,
): ExistingConversationReply {
  for (let i = messages.length - 1; i >= 0; i -= 1) {
    const message = messages[i]
    if (sameUserId(message.sender_id, currentUserId)) {
      return { canMessage: true, receiverId: message.receiver_id }
    }
    if (sameUserId(message.receiver_id, currentUserId)) {
      return { canMessage: true, receiverId: message.sender_id }
    }
  }

  if (otherUserId && !sameUserId(otherUserId, currentUserId)) {
    return { canMessage: true, receiverId: otherUserId }
  }

  return { canMessage: false, receiverId: null }
}

export function mergeMessagesById(
  existing: ChatMessage[],
  incoming: ChatMessage[],
): ChatMessage[] {
  const map = new Map<string, ChatMessage>()

  for (const message of [...existing, ...incoming]) {
    map.set(message.id, message)
  }

  return [...map.values()].sort(
    (a, b) =>
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
  )
}
