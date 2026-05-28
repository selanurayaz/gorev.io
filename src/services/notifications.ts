import type { PostgrestError } from '@supabase/supabase-js'

import { normalizeNotificationRow } from '@/lib/notification-mapper'
import {
  formatNotificationFetchError,
  formatNotificationUpdateError,
  isPostgrestSchemaError,
  logSupabaseError,
} from '@/lib/supabase/errors'
import { getAuthSessionContext } from '@/lib/supabase/session'
import { supabase } from '@/lib/supabase/client'
import type {
  AppNotification,
  CreateNotificationInput,
} from '@/types/notification'

export type FetchNotificationsResult = {
  notifications: AppNotification[]
  error: string | null
}

export type FetchUnreadCountResult = {
  count: number
  error: string | null
}

function toRows(data: unknown): Record<string, unknown>[] {
  if (!Array.isArray(data)) return []
  return data.filter(
    (row): row is Record<string, unknown> =>
      row !== null && typeof row === 'object',
  )
}

function normalizeRows(data: unknown): AppNotification[] {
  return toRows(data)
    .map((row) => normalizeNotificationRow(row))
    .filter((row): row is AppNotification => row !== null)
}

function buildInsertPayload(input: CreateNotificationInput): Record<string, unknown> {
  const payload: Record<string, unknown> = {
    user_id: input.user_id,
    title: input.title,
    message: input.message,
    type: input.type,
    is_read: false,
  }

  if (input.metadata) {
    payload.metadata = input.metadata
    payload.task_id = input.metadata.task_id
    payload.offer_id = input.metadata.offer_id
  }

  return payload
}

/** Yeni bildirim oluşturur; ana işlemi engellemez. */
export async function createNotification(
  input: CreateNotificationInput,
): Promise<void> {
  const payload = buildInsertPayload(input)

  let response = await supabase.from('notifications').insert(payload)

  if (response.error && isPostgrestSchemaError(response.error)) {
    const minimal: Record<string, unknown> = {
      user_id: input.user_id,
      title: input.title,
      message: input.message,
      type: input.type,
      is_read: false,
    }
    response = await supabase.from('notifications').insert(minimal)
  }

  if (response.error) {
    logSupabaseError('createNotification', response.error, {
      type: input.type,
      userId: input.user_id,
    })
  } else if (import.meta.env.DEV) {
    console.info('[notifications] created', {
      type: input.type,
      userId: input.user_id,
    })
  }
}

export async function fetchNotifications(
  limit = 50,
): Promise<FetchNotificationsResult> {
  const auth = await getAuthSessionContext()
  if (!auth.session) {
    return { notifications: [], error: auth.error ?? 'Oturum bulunamadı.' }
  }

  const { userId } = auth.session

  const response = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (response.error) {
    logSupabaseError('fetchNotifications', response.error)
    return {
      notifications: [],
      error: formatNotificationFetchError(response.error),
    }
  }

  return { notifications: normalizeRows(response.data), error: null }
}

export async function fetchUnreadNotificationCount(): Promise<FetchUnreadCountResult> {
  const auth = await getAuthSessionContext()
  if (!auth.session) {
    return { count: 0, error: auth.error ?? 'Oturum bulunamadı.' }
  }

  const { userId } = auth.session

  const counted = await supabase
    .from('notifications')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('is_read', false)

  if (!counted.error) {
    return { count: counted.count ?? 0, error: null }
  }

  if (!isPostgrestSchemaError(counted.error)) {
    logSupabaseError('fetchUnreadNotificationCount', counted.error)
    return { count: 0, error: formatNotificationFetchError(counted.error) }
  }

  const { notifications, error } = await fetchNotifications(100)
  if (error) {
    return { count: 0, error }
  }

  return {
    count: notifications.filter((row) => !row.is_read).length,
    error: null,
  }
}

async function updateNotificationReadState(
  filter: { id?: string; userId: string; all?: boolean },
  read: boolean,
): Promise<{ error: PostgrestError | null }> {
  const readPayloads: Record<string, unknown>[] = [
    { is_read: read },
    { read },
    { is_read: read, read_at: read ? new Date().toISOString() : null },
  ]

  for (const payload of readPayloads) {
    let query = supabase.from('notifications').update(payload).eq('user_id', filter.userId)

    if (filter.id) {
      query = query.eq('id', filter.id)
    } else if (filter.all) {
      query = query.eq('is_read', false)
    }

    const response = await query

    if (!response.error) {
      return { error: null }
    }

    if (!isPostgrestSchemaError(response.error)) {
      return { error: response.error }
    }
  }

  return {
    error: {
      message: 'Bildirim okundu işaretlenemedi.',
      details: '',
      hint: '',
      code: 'notification_update',
    } as PostgrestError,
  }
}

export async function markNotificationAsRead(
  notificationId: string,
): Promise<{ success: boolean; error: string | null }> {
  const auth = await getAuthSessionContext()
  if (!auth.session) {
    return { success: false, error: auth.error ?? 'Oturum bulunamadı.' }
  }

  const { error } = await updateNotificationReadState(
    { id: notificationId, userId: auth.session.userId },
    true,
  )

  if (error) {
    logSupabaseError('markNotificationAsRead', error, { notificationId })
    return { success: false, error: formatNotificationUpdateError(error) }
  }

  return { success: true, error: null }
}

export async function markAllNotificationsAsRead(): Promise<{
  success: boolean
  error: string | null
}> {
  const auth = await getAuthSessionContext()
  if (!auth.session) {
    return { success: false, error: auth.error ?? 'Oturum bulunamadı.' }
  }

  const { error } = await updateNotificationReadState(
    { userId: auth.session.userId, all: true },
    true,
  )

  if (error) {
    logSupabaseError('markAllNotificationsAsRead', error)
    return { success: false, error: formatNotificationUpdateError(error) }
  }

  return { success: true, error: null }
}
