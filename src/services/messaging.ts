import type { PostgrestError } from '@supabase/supabase-js'

import { buildConversationId } from '@/lib/conversation'
import {
  canUserMessageOnAcceptedTask,
  resolveMessagingReceiverId,
} from '@/lib/messaging-access'
import {
  getCounterpartUserId,
  isOfferAccepted,
  type AcceptedParticipation,
} from '@/lib/messaging-eligibility'
import { normalizeMessageRow } from '@/lib/message-mapper'
import {
  getCounterpartUserIdFromMessage,
  isMessageBetweenUsers,
  mergeMessagesById,
  sameTaskId,
  sameUserId,
} from '@/lib/messaging-utils'
import {
  formatMessageFetchError,
  formatMessageSendError,
  logSupabaseError,
} from '@/lib/supabase/errors'
import { getAuthSessionContext } from '@/lib/supabase/session'
import { supabase } from '@/lib/supabase/client'
import { notifyMessageReceived } from '@/services/notification-triggers'
import { fetchProfileNamesByIds } from '@/services/profiles'
import type { ChatMessage, Conversation, SendMessageInput } from '@/types/message'
import type { TaskId } from '@/types/index'

export type FetchConversationsResult = {
  conversations: Conversation[]
  error: string | null
}

export type FetchMessagesResult = {
  messages: ChatMessage[]
  error: string | null
}

export type SendMessageResult = {
  message: ChatMessage | null
  error: string | null
}

export type TaskMessagingAccess = {
  canMessage: boolean
  receiverId: string | null
  ownerId: string | null
  providerId: string | null
  error: string | null
}

const MESSAGING_DENIED_MESSAGE =
  'Bu görev için mesajlaşma yalnızca kabul edilmiş teklif sonrası mümkündür.'

function toRows(data: unknown): Record<string, unknown>[] {
  if (!Array.isArray(data)) return []
  return data.filter(
    (row): row is Record<string, unknown> =>
      row !== null && typeof row === 'object',
  )
}

function normalizeRows(data: unknown): ChatMessage[] {
  return toRows(data)
    .map((row) => normalizeMessageRow(row))
    .filter((message): message is ChatMessage => message !== null)
}

function readTaskFromOfferRow(row: Record<string, unknown>): {
  task_id: string | null
  task_title: string | null
  customer_id: string | null
} {
  const embedded = row.tasks ?? row.task
  const taskId = row.task_id ?? row.taskId

  if (embedded && typeof embedded === 'object' && !Array.isArray(embedded)) {
    const task = embedded as Record<string, unknown>
    return {
      task_id: task.id != null ? String(task.id) : taskId != null ? String(taskId) : null,
      task_title: task.title != null ? String(task.title) : null,
      customer_id:
        task.customer_id != null ? String(task.customer_id) : null,
    }
  }

  return {
    task_id: taskId != null ? String(taskId) : null,
    task_title: null,
    customer_id: null,
  }
}

async function lookupTaskOwnerMeta(
  taskId: string,
): Promise<{ customer_id: string; title: string } | null> {
  const { data, error } = await supabase
    .from('tasks')
    .select('customer_id, title')
    .eq('id', taskId)
    .maybeSingle()

  if (error) {
    logSupabaseError('lookupTaskOwnerMeta', error, { taskId })
    return null
  }

  if (!data || typeof data !== 'object') return null

  const record = data as Record<string, unknown>
  const customerId = record.customer_id
  if (customerId == null) return null

  return {
    customer_id: String(customerId),
    title:
      record.title != null ? String(record.title).trim() || 'Görev' : 'Görev',
  }
}

async function appendParticipationsFromOfferRows(
  data: unknown,
  target: AcceptedParticipation[],
  seen: Set<string>,
): Promise<void> {
  for (const row of toRows(data)) {
    if (!isOfferAccepted(String(row.status ?? ''))) continue

    const task = readTaskFromOfferRow(row)
    const providerId = row.provider_id ?? row.providerId
    if (!task.task_id || providerId == null) continue

    let customerId = task.customer_id
    let taskTitle = task.task_title?.trim() || 'Görev'

    if (!customerId) {
      const meta = await lookupTaskOwnerMeta(task.task_id)
      if (!meta) continue
      customerId = meta.customer_id
      taskTitle = meta.title
    }

    const key = `${task.task_id}:${providerId}`
    if (seen.has(key)) continue
    seen.add(key)

    target.push({
      task_id: task.task_id,
      task_title: taskTitle,
      customer_id: customerId,
      provider_id: String(providerId),
    })
  }
}

/** Kabul edilmiş teklifin hizmet verenini bulur (çoklu satır / maybeSingle güvenli). */
async function findAcceptedProviderIdForTask(
  taskId: TaskId,
  currentUserId?: string,
): Promise<string | null> {
  const { data, error } = await supabase
    .from('offers')
    .select('provider_id, status')
    .eq('task_id', taskId)

  if (!error) {
    const acceptedRow = toRows(data).find((row) =>
      isOfferAccepted(String(row.status ?? '')),
    )
    const providerId = acceptedRow?.provider_id ?? acceptedRow?.providerId
    if (providerId != null) return String(providerId)
  } else {
    logSupabaseError('findAcceptedProviderIdForTask.all', error, { taskId })
  }

  if (!currentUserId) return null

  const { data: ownRows, error: ownError } = await supabase
    .from('offers')
    .select('provider_id, status')
    .eq('task_id', taskId)
    .eq('provider_id', currentUserId)

  if (ownError) {
    logSupabaseError('findAcceptedProviderIdForTask.own', ownError, {
      taskId,
      currentUserId,
    })
    return null
  }

  const hasAcceptedOwn = toRows(ownRows).some((row) =>
    isOfferAccepted(String(row.status ?? '')),
  )

  return hasAcceptedOwn ? currentUserId : null
}

/** Görev sahibi teklifleri okuyamıyorsa mevcut mesajlardan provider çıkarır. */
async function inferProviderIdFromTaskMessages(
  taskId: TaskId,
  ownerId: string,
): Promise<string | null> {
  const { data, error } = await supabase
    .from('messages')
    .select('sender_id, receiver_id')
    .eq('task_id', taskId)
    .order('created_at', { ascending: false })
    .limit(30)

  if (error) {
    logSupabaseError('inferProviderIdFromTaskMessages', error, { taskId })
    return null
  }

  for (const row of toRows(data)) {
    const senderId = row.sender_id ?? row.senderId
    const receiverId = row.receiver_id ?? row.receiverId
    if (senderId == null || receiverId == null) continue

    if (sameUserId(String(senderId), ownerId) && !sameUserId(String(receiverId), ownerId)) {
      return String(receiverId)
    }
    if (sameUserId(String(receiverId), ownerId) && !sameUserId(String(senderId), ownerId)) {
      return String(senderId)
    }
  }

  return null
}

/**
 * Görev bazlı mesajlaşma izni ve doğru alıcı kimliği.
 * Görev sahibi (customer_id) veya kabul edilmiş provider mesajlaşabilir.
 */
export async function getTaskMessagingAccess(
  taskId: TaskId,
  userId: string,
): Promise<TaskMessagingAccess> {
  const denied: TaskMessagingAccess = {
    canMessage: false,
    receiverId: null,
    ownerId: null,
    providerId: null,
    error: MESSAGING_DENIED_MESSAGE,
  }

  const taskMeta = await lookupTaskOwnerMeta(taskId)
  if (!taskMeta) return denied

  const ownerId = taskMeta.customer_id
  let providerId = await findAcceptedProviderIdForTask(taskId, userId)

  if (!providerId && sameUserId(ownerId, userId)) {
    providerId = await inferProviderIdFromTaskMessages(taskId, ownerId)
  }

  if (!providerId) return denied

  if (!canUserMessageOnAcceptedTask(ownerId, providerId, userId)) {
    return denied
  }

  const receiverId = resolveMessagingReceiverId(ownerId, providerId, userId)
  if (!receiverId) return denied

  return {
    canMessage: true,
    receiverId,
    ownerId,
    providerId,
    error: null,
  }
}

/** Görev sahibi için kabul edilmiş teklifler (joinsız yedek). */
async function fetchAcceptedParticipationsViaOwnedTasks(
  userId: string,
  target: AcceptedParticipation[],
  seen: Set<string>,
): Promise<PostgrestError | null> {
  const tasksResponse = await supabase
    .from('tasks')
    .select('id, title, customer_id')
    .eq('customer_id', userId)

  if (tasksResponse.error) {
    return tasksResponse.error
  }

  const ownedTasks = toRows(tasksResponse.data)
  if (ownedTasks.length === 0) return null

  const taskMeta = new Map<
    string,
    { title: string; customer_id: string }
  >()

  for (const task of ownedTasks) {
    const id = task.id != null ? String(task.id) : null
    if (!id) continue
    taskMeta.set(id, {
      title: task.title != null ? String(task.title).trim() : 'Görev',
      customer_id:
        task.customer_id != null ? String(task.customer_id) : userId,
    })
  }

  const taskIds = [...taskMeta.keys()]
  if (taskIds.length === 0) return null

  const offersResponse = await supabase
    .from('offers')
    .select('task_id, provider_id, status')
    .in('task_id', taskIds)

  if (offersResponse.error) {
    return offersResponse.error
  }

  for (const row of toRows(offersResponse.data)) {
    if (!isOfferAccepted(String(row.status ?? ''))) continue

    const taskId = row.task_id ?? row.taskId
    const providerId = row.provider_id ?? row.providerId
    if (taskId == null || providerId == null) continue

    const meta = taskMeta.get(String(taskId))
    if (!meta) continue

    const key = `${String(taskId)}:${providerId}`
    if (seen.has(key)) continue
    seen.add(key)

    target.push({
      task_id: String(taskId),
      task_title: meta.title || 'Görev',
      customer_id: meta.customer_id,
      provider_id: String(providerId),
    })
  }

  return null
}

async function fetchAcceptedParticipations(
  userId: string,
): Promise<{ rows: AcceptedParticipation[]; error: PostgrestError | null }> {
  const participations: AcceptedParticipation[] = []
  const seen = new Set<string>()
  let lastError: PostgrestError | null = null

  const asProvider = await supabase
    .from('offers')
    .select('task_id, provider_id, status, tasks(id, title, customer_id)')
    .eq('provider_id', userId)

  if (asProvider.error) {
    lastError = asProvider.error
  } else {
    await appendParticipationsFromOfferRows(
      asProvider.data,
      participations,
      seen,
    )
  }

  const asCustomer = await supabase
    .from('offers')
    .select('task_id, provider_id, status, tasks!inner(id, title, customer_id)')
    .eq('tasks.customer_id', userId)

  if (asCustomer.error) {
    lastError = asCustomer.error
  } else {
    await appendParticipationsFromOfferRows(
      asCustomer.data,
      participations,
      seen,
    )
  }

  const viaTasksError = await fetchAcceptedParticipationsViaOwnedTasks(
    userId,
    participations,
    seen,
  )
  if (viaTasksError) {
    lastError = viaTasksError
  }

  if (participations.length === 0 && lastError) {
    return { rows: [], error: lastError }
  }

  return { rows: participations, error: null }
}

function mergeConversations(
  participations: AcceptedParticipation[],
  messages: ChatMessage[],
  currentUserId: string,
  nameMap: Map<string, string>,
): Conversation[] {
  const map = new Map<string, Conversation>()

  const ensureConversation = (
    taskId: string,
    otherUserId: string,
    taskTitle: string,
  ) => {
    const id = buildConversationId(taskId, currentUserId, otherUserId)
    const existing = map.get(id)

    if (!existing) {
      map.set(id, {
        id,
        task_id: taskId,
        task_title: taskTitle,
        other_user_id: otherUserId,
        other_user_name: nameMap.get(otherUserId) ?? null,
        last_message: null,
        last_message_at: null,
      })
      return map.get(id)!
    }

    if (existing.task_title === 'Görev' && taskTitle !== 'Görev') {
      existing.task_title = taskTitle
    }

    return existing
  }

  for (const participation of participations) {
    const otherUserId = getCounterpartUserId(participation, currentUserId)
    if (!otherUserId) continue

    ensureConversation(
      participation.task_id,
      otherUserId,
      participation.task_title,
    )
  }

  for (const message of messages) {
    if (!message.task_id) continue

    const otherUserId = getCounterpartUserIdFromMessage(message, currentUserId)
    if (!otherUserId) continue

    const conversation = ensureConversation(
      message.task_id,
      otherUserId,
      'Görev',
    )

    const messageTime = new Date(message.created_at).getTime()
    const existingTime = conversation.last_message_at
      ? new Date(conversation.last_message_at).getTime()
      : 0

    if (!conversation.last_message_at || messageTime >= existingTime) {
      conversation.last_message = message.content
      conversation.last_message_at = message.created_at
    }
  }

  return [...map.values()].sort((a, b) => {
    const aTime = a.last_message_at
      ? new Date(a.last_message_at).getTime()
      : 0
    const bTime = b.last_message_at
      ? new Date(b.last_message_at).getTime()
      : 0
    if (bTime !== aTime) return bTime - aTime
    return a.task_title.localeCompare(b.task_title, 'tr')
  })
}

/** Oturumdaki kullanıcının gönderdiği veya aldığı tüm mesajlar. */
export async function fetchUserMessages(
  userId: string,
): Promise<{ messages: ChatMessage[]; error: PostgrestError | null }> {
  const combined = await supabase
    .from('messages')
    .select('*')
    .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
    .order('created_at', { ascending: false })

  if (!combined.error) {
    return { messages: normalizeRows(combined.data), error: null }
  }

  logSupabaseError('fetchUserMessages.or', combined.error)

  const [asSender, asReceiver] = await Promise.all([
    supabase
      .from('messages')
      .select('*')
      .eq('sender_id', userId)
      .order('created_at', { ascending: false }),
    supabase
      .from('messages')
      .select('*')
      .eq('receiver_id', userId)
      .order('created_at', { ascending: false }),
  ])

  if (asSender.error) {
    return { messages: [], error: asSender.error }
  }
  if (asReceiver.error) {
    return { messages: [], error: asReceiver.error }
  }

  const merged = mergeMessagesById(
    normalizeRows(asSender.data),
    normalizeRows(asReceiver.data),
  ).sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  )

  return { messages: merged, error: null }
}

function filterThreadMessages(
  rows: ChatMessage[],
  userId: string,
  otherUserId: string,
  taskId: TaskId,
): ChatMessage[] {
  return rows.filter(
    (message) =>
      sameTaskId(message.task_id, taskId) &&
      isMessageBetweenUsers(message, userId, otherUserId),
  )
}

/** Kabul edilmiş tekliflere dayalı sohbet listesi. */
export async function fetchConversations(): Promise<FetchConversationsResult> {
  const auth = await getAuthSessionContext()
  if (!auth.session) {
    return { conversations: [], error: auth.error ?? 'Oturum bulunamadı.' }
  }

  const { userId } = auth.session

  const { rows: participations, error: participationError } =
    await fetchAcceptedParticipations(userId)

  if (participationError) {
    logSupabaseError('fetchConversations.participations', participationError)
  }

  const { messages, error: messagesError } = await fetchUserMessages(userId)

  if (messagesError) {
    logSupabaseError('fetchConversations.messages', messagesError)
    return { conversations: [], error: formatMessageFetchError(messagesError) }
  }

  const otherUserIds = new Set<string>()

  for (const participation of participations) {
    const otherId = getCounterpartUserId(participation, userId)
    if (otherId) otherUserIds.add(otherId)
  }

  for (const message of messages) {
    const otherId = getCounterpartUserIdFromMessage(message, userId)
    if (otherId) otherUserIds.add(otherId)
  }

  const nameMap = await fetchProfileNamesByIds([...otherUserIds])
  const conversations = mergeConversations(
    participations,
    messages,
    userId,
    nameMap,
  )

  if (import.meta.env.DEV) {
    console.info('[messaging] conversations', {
      count: conversations.length,
      messages: messages.length,
      participations: participations.length,
    })
  }

  return { conversations, error: null }
}

export async function fetchMessagesForConversation(
  taskId: TaskId,
  otherUserId: string,
): Promise<FetchMessagesResult> {
  const auth = await getAuthSessionContext()
  if (!auth.session) {
    return { messages: [], error: auth.error ?? 'Oturum bulunamadı.' }
  }

  const { userId } = auth.session

  const primary = await supabase
    .from('messages')
    .select('*')
    .eq('task_id', taskId)
    .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
    .order('created_at', { ascending: true })

  let threadMessages: ChatMessage[]

  if (!primary.error) {
    threadMessages = filterThreadMessages(
      normalizeRows(primary.data),
      userId,
      otherUserId,
      taskId,
    )
  } else {
    logSupabaseError('fetchMessagesForConversation.or', primary.error, {
      taskId,
      otherUserId,
    })

    const { messages: userMessages, error: fallbackError } =
      await fetchUserMessages(userId)

    if (fallbackError) {
      return { messages: [], error: formatMessageFetchError(fallbackError) }
    }

    threadMessages = filterThreadMessages(
      userMessages,
      userId,
      otherUserId,
      taskId,
    )
  }

  if (threadMessages.length === 0) {
    const access = await getTaskMessagingAccess(taskId, userId)
    if (!access.canMessage) {
      return { messages: [], error: access.error }
    }
  }

  return { messages: threadMessages, error: null }
}

export async function sendMessage(
  input: SendMessageInput,
): Promise<SendMessageResult> {
  const auth = await getAuthSessionContext()
  if (!auth.session) {
    return { message: null, error: auth.error ?? 'Oturum bulunamadı.' }
  }

  const { userId } = auth.session
  const content = input.content.trim()

  if (!content) {
    return { message: null, error: 'Mesaj boş olamaz.' }
  }

  if (content.length > 2000) {
    return { message: null, error: 'Mesaj en fazla 2000 karakter olabilir.' }
  }

  let receiverId = input.receiver_id

  if (input.existing_thread) {
    if (sameUserId(receiverId, userId)) {
      return { message: null, error: 'Kendinize mesaj gönderemezsiniz.' }
    }
  } else {
    const access = await getTaskMessagingAccess(input.task_id, userId)

    if (!access.canMessage || !access.receiverId) {
      return { message: null, error: access.error ?? MESSAGING_DENIED_MESSAGE }
    }

    receiverId = access.receiverId
  }

  if (!receiverId || sameUserId(receiverId, userId)) {
    return { message: null, error: 'Kendinize mesaj gönderemezsiniz.' }
  }

  const payload = {
    sender_id: userId,
    receiver_id: receiverId,
    task_id: input.task_id,
    content,
  }

  const { data, error } = await supabase
    .from('messages')
    .insert(payload)
    .select('*')
    .single()

  if (error) {
    logSupabaseError('sendMessage', error, { taskId: input.task_id })
    return { message: null, error: formatMessageSendError(error) }
  }

  if (!data || typeof data !== 'object') {
    return { message: null, error: 'Mesaj gönderildi ancak yanıt alınamadı.' }
  }

  const message = normalizeMessageRow(data as Record<string, unknown>)
  if (!message) {
    return { message: null, error: 'Mesaj kaydı doğrulanamadı.' }
  }

  if (import.meta.env.DEV) {
    console.info('[messaging] sent', { messageId: message.id })
  }

  void notifyMessageReceived({
    receiverId,
    senderId: userId,
    taskId: input.task_id,
    messageId: message.id,
    preview: content,
  })

  return { message, error: null }
}
