import { supabase } from '@/lib/supabase/client'
import { logSupabaseError } from '@/lib/supabase/errors'
import { createNotification } from '@/services/notifications'
import { fetchProfileNamesByIds } from '@/services/profiles'
import type { TaskId } from '@/types/index'

async function getTaskTitle(taskId: TaskId): Promise<string> {
  const { data, error } = await supabase
    .from('tasks')
    .select('title')
    .eq('id', taskId)
    .maybeSingle()

  if (error) {
    logSupabaseError('notificationTriggers.getTaskTitle', error, { taskId })
    return 'Görev'
  }

  if (!data || typeof data !== 'object') return 'Görev'

  const title = (data as Record<string, unknown>).title
  return title != null ? String(title).trim() || 'Görev' : 'Görev'
}

async function getDisplayName(userId: string): Promise<string> {
  const names = await fetchProfileNamesByIds([userId])
  return names.get(userId) ?? 'Bir kullanıcı'
}

/** Görev sahibine yeni teklif bildirimi. */
export async function notifyOfferReceived(input: {
  customerId: string
  offerId: string
  taskId: TaskId
  providerId: string
}): Promise<void> {
  const [taskTitle, providerName] = await Promise.all([
    getTaskTitle(input.taskId),
    getDisplayName(input.providerId),
  ])

  await createNotification({
    user_id: input.customerId,
    type: 'offer_received',
    title: 'Yeni teklif aldınız',
    message: `${providerName}, “${taskTitle}” görevinize teklif verdi.`,
    metadata: {
      task_id: input.taskId,
      offer_id: input.offerId,
      other_user_id: input.providerId,
    },
  })
}

/** Hizmet verene teklif kabul bildirimi. */
export async function notifyOfferAccepted(input: {
  providerId: string
  offerId: string
  taskId: TaskId
}): Promise<void> {
  const taskTitle = await getTaskTitle(input.taskId)

  await createNotification({
    user_id: input.providerId,
    type: 'offer_accepted',
    title: 'Teklifiniz kabul edildi',
    message: `“${taskTitle}” görevi için verdiğiniz teklif kabul edildi.`,
    metadata: {
      task_id: input.taskId,
      offer_id: input.offerId,
    },
  })
}

/** Hizmet verene teklif red bildirimi. */
export async function notifyOfferRejected(input: {
  providerId: string
  offerId: string
  taskId: TaskId
}): Promise<void> {
  const taskTitle = await getTaskTitle(input.taskId)

  await createNotification({
    user_id: input.providerId,
    type: 'offer_rejected',
    title: 'Teklifiniz reddedildi',
    message: `“${taskTitle}” görevi için verdiğiniz teklif reddedildi.`,
    metadata: {
      task_id: input.taskId,
      offer_id: input.offerId,
    },
  })
}

/** Alıcıya yeni mesaj bildirimi. */
export async function notifyMessageReceived(input: {
  receiverId: string
  senderId: string
  taskId: TaskId
  messageId: string
  preview: string
}): Promise<void> {
  const [taskTitle, senderName] = await Promise.all([
    getTaskTitle(input.taskId),
    getDisplayName(input.senderId),
  ])

  const excerpt =
    input.preview.length > 120
      ? `${input.preview.slice(0, 117)}…`
      : input.preview

  await createNotification({
    user_id: input.receiverId,
    type: 'message_received',
    title: 'Yeni mesajınız var',
    message: `${senderName} (“${taskTitle}”): ${excerpt}`,
    metadata: {
      task_id: input.taskId,
      other_user_id: input.senderId,
      message_id: input.messageId,
    },
  })
}
