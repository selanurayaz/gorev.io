import type { PostgrestError } from '@supabase/supabase-js'

import { normalizeReviewRow } from '@/lib/review-mapper'
import {
  formatReviewCreateError,
  formatReviewFetchError,
  isPostgrestSchemaError,
  logSupabaseError,
} from '@/lib/supabase/errors'
import { getAuthSessionContext } from '@/lib/supabase/session'
import { supabase } from '@/lib/supabase/client'
import { isTaskCompletedStatus } from '@/lib/task-status'
import { fetchAcceptedProviderIdForTask } from '@/services/offers'
import type {
  Review,
  ReviewCreateInput,
  UserRatingSummary,
} from '@/types/review'
import type { TaskId } from '@/types/index'

export type CreateReviewResult = {
  review: Review | null
  error: string | null
}

export type FetchTaskReviewResult = {
  review: Review | null
  error: string | null
}

export type FetchUserRatingSummaryResult = {
  summary: UserRatingSummary
  error: string | null
}

function toRows(data: unknown): Record<string, unknown>[] {
  if (!Array.isArray(data)) return []
  return data.filter(
    (row): row is Record<string, unknown> =>
      row !== null && typeof row === 'object',
  )
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

function buildRatingSummary(ratings: number[]): UserRatingSummary {
  if (ratings.length === 0) {
    return { averageRating: null, reviewCount: 0 }
  }

  const sum = ratings.reduce((total, value) => total + value, 0)
  return {
    averageRating: sum / ratings.length,
    reviewCount: ratings.length,
  }
}

function isDuplicateReviewError(error: PostgrestError): boolean {
  return (
    error.code === '23505' ||
    /duplicate|unique|already exists/i.test(error.message)
  )
}

async function queryReviewByTaskAndReviewer(
  taskId: TaskId,
  reviewerId: string,
): Promise<{ review: Review | null; error: PostgrestError | null }> {
  const withTask = await supabase
    .from('reviews')
    .select('*')
    .eq('task_id', taskId)
    .eq('reviewer_id', reviewerId)
    .maybeSingle()

  if (!withTask.error) {
    if (!withTask.data || typeof withTask.data !== 'object') {
      return { review: null, error: null }
    }
    return {
      review: normalizeReviewRow(withTask.data as Record<string, unknown>),
      error: null,
    }
  }

  if (!isPostgrestSchemaError(withTask.error)) {
    return { review: null, error: withTask.error }
  }

  const fallback = await supabase
    .from('reviews')
    .select('*')
    .eq('reviewer_id', reviewerId)

  if (fallback.error) {
    return { review: null, error: fallback.error }
  }

  const review = toRows(fallback.data)
    .filter((row) => {
      const rowTaskId = row.task_id ?? row.taskId
      return rowTaskId != null && String(rowTaskId) === taskId
    })
    .map((row) => normalizeReviewRow(row))
    .find((row): row is Review => row !== null)

  return { review: review ?? null, error: null }
}

/** Oturum açmış kullanıcının belirli görev için değerlendirmesini getirir. */
export async function fetchTaskReviewByReviewer(
  taskId: TaskId,
): Promise<FetchTaskReviewResult> {
  const auth = await getAuthSessionContext()
  if (!auth.session) {
    return { review: null, error: auth.error ?? 'Oturum bulunamadı.' }
  }

  const { review, error } = await queryReviewByTaskAndReviewer(
    taskId,
    auth.session.userId,
  )

  if (error) {
    logSupabaseError('fetchTaskReviewByReviewer', error, { taskId })
    return { review: null, error: formatReviewFetchError(error) }
  }

  return { review, error: null }
}

/** Kullanıcı için ortalama puan ve değerlendirme sayısı. */
export async function fetchUserRatingSummary(
  userId: string,
): Promise<FetchUserRatingSummaryResult> {
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
      logSupabaseError('fetchUserRatingSummary', response.error, { userId })
      return {
        summary: { averageRating: null, reviewCount: 0 },
        error: formatReviewFetchError(response.error),
      }
    }

    const ratings = toRows(response.data)
      .map((row) => readReviewRating(row))
      .filter((value): value is number => value !== null)

    return { summary: buildRatingSummary(ratings), error: null }
  }

  const fallback = await supabase
    .from('reviews')
    .select('rating, reviewed_user_id')

  if (fallback.error) {
    if (isPostgrestSchemaError(fallback.error)) {
      return {
        summary: { averageRating: null, reviewCount: 0 },
        error: null,
      }
    }
    return {
      summary: { averageRating: null, reviewCount: 0 },
      error: formatReviewFetchError(fallback.error),
    }
  }

  const ratings = toRows(fallback.data)
    .filter((row) => readReviewedUserId(row) === userId)
    .map((row) => readReviewRating(row))
    .filter((value): value is number => value !== null)

  return { summary: buildRatingSummary(ratings), error: null }
}

/** Birden fazla kullanıcı için puan özetleri (marketplace vb.). */
export async function fetchUserRatingSummariesByIds(
  userIds: string[],
): Promise<Map<string, UserRatingSummary>> {
  const uniqueIds = [...new Set(userIds.filter(Boolean))]
  const summaries = new Map<string, UserRatingSummary>()

  if (uniqueIds.length === 0) return summaries

  await Promise.all(
    uniqueIds.map(async (userId) => {
      const { summary } = await fetchUserRatingSummary(userId)
      summaries.set(userId, summary)
    }),
  )

  return summaries
}

/**
 * Görev sahibi, tamamlanan görev için hizmet verene değerlendirme bırakır.
 */
export async function createTaskReview(
  input: ReviewCreateInput,
): Promise<CreateReviewResult> {
  const auth = await getAuthSessionContext()
  if (!auth.session) {
    return { review: null, error: auth.error ?? 'Oturum bulunamadı.' }
  }

  const { userId } = auth.session

  if (input.reviewed_user_id === userId) {
    return {
      review: null,
      error: 'Kendinizi değerlendiremezsiniz.',
    }
  }

  if (
    !Number.isInteger(input.rating) ||
    input.rating < 1 ||
    input.rating > 5
  ) {
    return { review: null, error: 'Geçerli bir puan seçin (1–5).' }
  }

  const { data: taskRow, error: taskError } = await supabase
    .from('tasks')
    .select('id, customer_id, status')
    .eq('id', input.task_id)
    .maybeSingle()

  if (taskError) {
    logSupabaseError('createTaskReview.task', taskError, {
      taskId: input.task_id,
    })
    return { review: null, error: formatReviewCreateError(taskError) }
  }

  if (!taskRow || typeof taskRow !== 'object') {
    return { review: null, error: 'Görev bulunamadı.' }
  }

  const task = taskRow as Record<string, unknown>
  const customerId = task.customer_id ?? task.user_id

  if (customerId == null || String(customerId) !== userId) {
    return {
      review: null,
      error: 'Yalnızca görev sahibi değerlendirme bırakabilir.',
    }
  }

  if (!isTaskCompletedStatus(task.status != null ? String(task.status) : null)) {
    return {
      review: null,
      error: 'Değerlendirme yalnızca tamamlanan görevler için yapılabilir.',
    }
  }

  const acceptedProviderId = await fetchAcceptedProviderIdForTask(
    input.task_id,
  )

  if (!acceptedProviderId) {
    return {
      review: null,
      error: 'Bu görev için kabul edilmiş hizmet veren bulunamadı.',
    }
  }

  if (acceptedProviderId !== input.reviewed_user_id) {
    return {
      review: null,
      error: 'Değerlendirme yalnızca kabul edilen hizmet verene bırakılabilir.',
    }
  }

  const existing = await queryReviewByTaskAndReviewer(input.task_id, userId)
  if (existing.review) {
    return {
      review: null,
      error: 'Bu görev için zaten değerlendirme bıraktınız.',
    }
  }

  const payload: Record<string, unknown> = {
    reviewer_id: userId,
    reviewed_user_id: input.reviewed_user_id,
    rating: input.rating,
    comment: input.comment.trim(),
    task_id: input.task_id,
  }

  const { data, error } = await supabase
    .from('reviews')
    .insert(payload)
    .select('*')
    .single()

  if (error) {
    if (isDuplicateReviewError(error)) {
      return {
        review: null,
        error: 'Bu görev için zaten değerlendirme bıraktınız.',
      }
    }

    if (isPostgrestSchemaError(error)) {
      const fallbackPayload = {
        reviewer_id: userId,
        reviewed_user_id: input.reviewed_user_id,
        rating: input.rating,
        comment: input.comment.trim(),
      }

      const retry = await supabase
        .from('reviews')
        .insert(fallbackPayload)
        .select('*')
        .single()

      if (retry.error) {
        logSupabaseError('createTaskReview.retry', retry.error, {
          taskId: input.task_id,
        })
        return {
          review: null,
          error: isDuplicateReviewError(retry.error)
            ? 'Bu görev için zaten değerlendirme bıraktınız.'
            : formatReviewCreateError(retry.error),
        }
      }

      if (!retry.data || typeof retry.data !== 'object') {
        return {
          review: null,
          error: 'Değerlendirme kaydedildi ancak yanıt alınamadı.',
        }
      }

      const review = normalizeReviewRow(retry.data as Record<string, unknown>)
      return review
        ? { review, error: null }
        : { review: null, error: 'Değerlendirme kaydı doğrulanamadı.' }
    }

    logSupabaseError('createTaskReview', error, { taskId: input.task_id })
    return { review: null, error: formatReviewCreateError(error) }
  }

  if (!data || typeof data !== 'object') {
    return {
      review: null,
      error: 'Değerlendirme kaydedildi ancak yanıt alınamadı.',
    }
  }

  const review = normalizeReviewRow(data as Record<string, unknown>)
  if (!review) {
    return { review: null, error: 'Değerlendirme kaydı doğrulanamadı.' }
  }

  if (import.meta.env.DEV) {
    console.info('[reviews] created', {
      reviewId: review.id,
      taskId: input.task_id,
    })
  }

  return { review, error: null }
}
