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
import { fetchUserRatingSummary } from '@/services/reviews'
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
    fetchUserRatingSummary(userId),
    fetchRecentNotifications(userId, ACTIVITY_LIMIT),
  ])

  if (unreadResult.error) {
    logSupabaseError('fetchDashboard.unreadMessages', unreadResult.error)
  }
  if (ratingResult.error && import.meta.env.DEV) {
    console.warn('[dashboard] rating', ratingResult.error)
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
    ratingResult.summary.averageRating,
    ratingResult.summary.reviewCount,
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
