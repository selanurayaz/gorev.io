import type { ChatMessage } from '@/types/message'

export function normalizeMessageRow(
  row: Record<string, unknown>,
): ChatMessage | null {
  const id = row.id
  const senderId = row.sender_id ?? row.senderId ?? row.from_user_id
  const receiverId = row.receiver_id ?? row.receiverId ?? row.to_user_id

  if (id == null || senderId == null || receiverId == null) return null

  const content =
    row.content ?? row.message ?? row.body ?? row.text ?? null

  if (content == null || String(content).trim() === '') return null

  const taskId = row.task_id ?? row.taskId

  return {
    id: String(id),
    sender_id: String(senderId),
    receiver_id: String(receiverId),
    task_id: taskId != null ? String(taskId) : null,
    content: String(content).trim(),
    created_at:
      row.created_at != null
        ? String(row.created_at)
        : new Date().toISOString(),
  }
}
