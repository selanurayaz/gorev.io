import type { PostgrestError } from '@supabase/supabase-js'

import {
  isDashboardActiveTaskStatus,
  isDashboardCompletedTaskStatus,
} from '@/lib/task-status'
import { isPostgrestSchemaError, logSupabaseError } from '@/lib/supabase/errors'
import { getAuthSessionContext } from '@/lib/supabase/session'
import { supabase } from '@/lib/supabase/client'
import { normalizeNotificationRow } from '@/lib/notification-mapper'
import { fetchCategories } from '@/services/categories'
import { fetchMyTasks } from '@/services/tasks'
import type {
  DashboardActivityItem,
  DashboardData,
  DashboardStats,
} from '@/types/dashboard'
import type { AppNotification } from '@/types/notification'

export type FetchDashboardResult = {
  data: DashboardData | null
  error: string | null
}

const RECENT_TASK_LIMIT = 3
const ACTIVITY_LIMIT = 5

function toRows(data: unknown): Record<string, unknown>[] {
  if (!Array.isArray(data)) return []
  return data.filter(
    (row): row is Record<string, unknown> =>
      row !== null && typeof row === 'object',
  )
}

function readMessageIsRead(row: Record<string, unknown>): boolean {
  if (row.is_read === true || row.read === true) return true
  if (row.is_read === false || row.read === false) return false
  if (row.read_at != null || row.readAt != null) return true
  return false
}

async function fetchUnreadMessagesCount(
  userId: string,
): Promise<{ count: number; error: PostgrestError | null }> {
  const counted = await supabase
    .from('messages')
    .select('id', { count: 'exact', head: true })
    .eq('receiver_id', userId)
    .eq('is_read', false)

  if (!counted.error) {
    return { count: counted.count ?? 0, error: null }
  }

  if (!isPostgrestSchemaError(counted.error)) {
    return { count: 0, error: counted.error }
  }

  const { data, error } = await supabase
    .from('messages')
    .select('id, is_read, read, read_at')
    .eq('receiver_id', userId)

  if (error) {
    return { count: 0, error }
  }

  const count = toRows(data).filter((row) => !readMessageIsRead(row)).length
  return { count, error: null }
}

function readReviewRating(row: Record<string, unknown>): number | null {
  const raw = row.rating ?? row.score ?? row.stars ?? row.value
  if (raw == null) return null
  const value = Number(raw)
  return Number.isFinite(value) ? value : null
}

function readReviewedUserId(row: Record<string, unknown>): string | null {
  const id =
    row.reviewed_user_id ??
    row.reviewedUserId ??
    row.reviewee_id ??
    row.revieweeId ??
    row.user_id
  return id != null ? String(id) : null
}

async function fetchAverageRating(
  userId: string,
): Promise<{
  average: number | null
  count: number
  error: PostgrestError | null
}> {
  for (const reviewedColumn of [
    'reviewed_user_id',
    'reviewee_id',
    'user_id',
  ] as const) {
    const response = await supabase
      .from('reviews')
      .select(`rating, ${reviewedColumn}`)
      .eq(reviewedColumn, userId)

    if (response.error) {
      if (isPostgrestSchemaError(response.error)) continue
      return { average: null, count: 0, error: response.error }
    }

    const ratings = toRows(response.data)
      .map((row) => readReviewRating(row))
      .filter((value): value is number => value !== null)

    if (ratings.length === 0) {
      return { average: null, count: 0, error: null }
    }

    const sum = ratings.reduce((total, value) => total + value, 0)
    return {
      average: sum / ratings.length,
      count: ratings.length,
      error: null,
    }
  }

  const fallback = await supabase.from('reviews').select('rating, reviewed_user_id')

  if (fallback.error) {
    if (isPostgrestSchemaError(fallback.error)) {
      return { average: null, count: 0, error: null }
    }
    return { average: null, count: 0, error: fallback.error }
  }

  const ratings = toRows(fallback.data)
    .filter((row) => readReviewedUserId(row) === userId)
    .map((row) => readReviewRating(row))
    .filter((value): value is number => value !== null)

  if (ratings.length === 0) {
    return { average: null, count: 0, error: null }
  }

  const sum = ratings.reduce((total, value) => total + value, 0)
  return {
    average: sum / ratings.length,
    count: ratings.length,
    error: null,
  }
}

async function fetchRecentNotifications(
  userId: string,
  limit: number,
): Promise<{ notifications: AppNotification[]; error: PostgrestError | null }> {
  const response = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (response.error) {
    return { notifications: [], error: response.error }
  }

  const notifications = toRows(response.data)
    .map((row) => normalizeNotificationRow(row))
    .filter((row): row is AppNotification => row !== null)

  return { notifications, error: null }
}

function mapNotificationToActivity(
  notification: AppNotification,
): DashboardActivityItem {
  const type: DashboardActivityItem['type'] =
    notification.type === 'offer_accepted'
      ? 'complete'
      : notification.type === 'offer_received' ||
          notification.type === 'offer_rejected'
        ? 'offer'
        : notification.type === 'message_received'
          ? 'message'
          : 'default'

  return {
    id: notification.id,
    text: notification.message || notification.title,
    time: notification.created_at,
    type,
  }
}

function buildStatsFromTasks(
  tasks: { status?: string | null }[],
  unreadMessages: number,
  averageRating: number | null,
  reviewCount: number,
): DashboardStats {
  const activeTasks = tasks.filter((task) =>
    isDashboardActiveTaskStatus(task.status),
  ).length
  const completedTasks = tasks.filter((task) =>
    isDashboardCompletedTaskStatus(task.status),
  ).length

  return {
    activeTasks,
    completedTasks,
    unreadMessages,
    averageRating,
    reviewCount,
  }
}

/** Oturum açmış kullanıcı için panel özeti. */
export async function fetchDashboardData(): Promise<FetchDashboardResult> {
  const auth = await getAuthSessionContext()
  if (!auth.session) {
    return { data: null, error: auth.error ?? 'Oturum bulunamadı.' }
  }

  const { userId } = auth.session

  const { categories } = await fetchCategories()

  const categoryNames = new Map(
    categories.map((category) => [category.id, category.name]),
  )

  const [
    tasksResult,
    unreadResult,
    ratingResult,
    notificationsResult,
  ] = await Promise.all([
    fetchMyTasks(categoryNames),
    fetchUnreadMessagesCount(userId),
    fetchAverageRating(userId),
    fetchRecentNotifications(userId, ACTIVITY_LIMIT),
  ])

  if (unreadResult.error) {
    logSupabaseError('fetchDashboard.unreadMessages', unreadResult.error)
  }
  if (ratingResult.error) {
    logSupabaseError('fetchDashboard.rating', ratingResult.error)
  }
  if (notificationsResult.error) {
    logSupabaseError('fetchDashboard.notifications', notificationsResult.error)
  }

  if (tasksResult.error) {
    return {
      data: null,
      error: tasksResult.error,
    }
  }

  const stats = buildStatsFromTasks(
    tasksResult.tasks,
    unreadResult.count,
    ratingResult.average,
    ratingResult.count,
  )

  const recentTasks = tasksResult.tasks.slice(0, RECENT_TASK_LIMIT)
  const activity = notificationsResult.notifications.map(mapNotificationToActivity)

  if (import.meta.env.DEV) {
    console.info('[dashboard] loaded', {
      activeTasks: stats.activeTasks,
      recentTasks: recentTasks.length,
      activity: activity.length,
    })
  }

  return {
    data: {
      stats,
      recentTasks,
      activity,
    },
    error: null,
  }
}
