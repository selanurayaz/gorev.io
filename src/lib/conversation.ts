import type { TaskId } from '@/types/index'
import type { UserId } from '@/types/index'

/** İki kullanıcı + görev için kararlı sohbet anahtarı. */
export function buildConversationId(
  taskId: TaskId,
  userA: UserId,
  userB: UserId,
): string {
  const participants = [userA, userB].sort()
  return `${taskId}:${participants[0]}:${participants[1]}`
}

export function parseConversationId(
  conversationId: string,
): { taskId: TaskId; userA: UserId; userB: UserId } | null {
  const parts = conversationId.split(':')
  if (parts.length !== 3) return null

  const [taskId, userA, userB] = parts
  if (!taskId || !userA || !userB) return null

  return { taskId, userA, userB }
}

export function getOtherUserIdFromConversation(
  conversationId: string,
  currentUserId: UserId,
): UserId | null {
  const parsed = parseConversationId(conversationId)
  if (!parsed) return null

  if (parsed.userA === currentUserId) return parsed.userB
  if (parsed.userB === currentUserId) return parsed.userA

  return null
}

export function buildConversationSelection(
  taskId: TaskId,
  currentUserId: UserId,
  otherUserId: UserId,
): { conversationId: string; taskId: TaskId; otherUserId: UserId } {
  return {
    conversationId: buildConversationId(taskId, currentUserId, otherUserId),
    taskId,
    otherUserId,
  }
}
