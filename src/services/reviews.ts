import type { PostgrestError } from '@supabase/supabase-js'

import {
  normalizeReviewListRow,
  normalizeReviewRow,
} from '@/lib/review-mapper'
import {
  formatReviewCreateError,
  formatReviewFetchError,
  isPostgrestFilterError,
  isPostgrestSchemaError,
  logSupabaseError,
} from '@/lib/supabase/errors'
import { getAuthSessionContext } from '@/lib/supabase/session'
import { supabase } from '@/lib/supabase/client'
import {
  logReviewInsertContext,
  resolveServiceRequestReviewContext,
  SERVICE_REVIEW_LINK_ERROR,
} from '@/lib/service-request-review'
import { ensureTaskHasSourceServiceId, fetchTaskRowForReview } from '@/lib/task-source'
import { isTaskCompletedStatus } from '@/lib/task-status'
import { fetchAcceptedProviderIdForTask } from '@/services/offers'
import { fetchProfileNamesByIds } from '@/services/profiles'
import type {
  Review,
  ReviewCreateInput,
  ReviewListItem,
  UserRatingSummary,
} from '@/types/review'
import type { ServiceId, TaskId } from '@/types/index'

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

export type FetchUserReviewsResult = {
  reviews: ReviewListItem[]
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

function readReviewServiceId(row: Record<string, unknown>): string | null {
  const id = row.service_id ?? row.serviceId
  return id != null ? String(id) : null
}

function normalizeEntityId(id: string): string {
  return id.trim().toLowerCase()
}

function findMatchingServiceId(
  serviceId: string,
  candidates: ServiceId[],
): ServiceId | null {
  const normalized = normalizeEntityId(serviceId)
  return (
    candidates.find((candidate) => normalizeEntityId(candidate) === normalized) ??
    null
  )
}

type RpcServiceRatingRow = {
  service_id: string
  average_rating: number | string
  review_count: number | string
}

async function fetchServiceRatingSummariesViaRpc(
  serviceIds: ServiceId[],
): Promise<Map<string, UserRatingSummary> | null> {
  const uniqueIds = [...new Set(serviceIds.filter(Boolean))]
  const summaries = new Map<string, UserRatingSummary>()

  for (const serviceId of uniqueIds) {
    summaries.set(serviceId, emptySummary())
  }

  if (uniqueIds.length === 0) return summaries

  const response = await supabase.rpc('get_service_rating_summaries', {
    p_service_ids: uniqueIds,
  })

  if (response.error) {
    if (isPostgrestSchemaError(response.error)) {
      return null
    }
    logSupabaseError('fetchServiceRatingSummariesViaRpc', response.error, {
      count: uniqueIds.length,
    })
    return null
  }

  for (const row of toRows(response.data) as RpcServiceRatingRow[]) {
    const serviceId = row.service_id
    if (!serviceId) continue

    const matchedId = findMatchingServiceId(String(serviceId), uniqueIds)
    if (!matchedId) continue

    const averageRating = Number(row.average_rating)
    const reviewCount = Number(row.review_count)

    if (!Number.isFinite(averageRating) || !Number.isFinite(reviewCount)) {
      continue
    }

    summaries.set(matchedId, {
      averageRating,
      reviewCount,
    })
  }

  return summaries
}

async function queryReviewsForServiceIdViaRpc(
  serviceId: ServiceId,
  limit: number,
): Promise<{ rows: Record<string, unknown>[]; error: PostgrestError | null }> {
  const response = await supabase.rpc('get_service_review_rows', {
    p_service_id: serviceId,
    p_limit: limit,
  })

  if (response.error) {
    if (isPostgrestSchemaError(response.error)) {
      return { rows: [], error: null }
    }
    return { rows: [], error: response.error }
  }

  return { rows: toRows(response.data), error: null }
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

function emptySummary(): UserRatingSummary {
  return { averageRating: null, reviewCount: 0 }
}

function buildRatingSummary(ratings: number[]): UserRatingSummary {
  if (ratings.length === 0) {
    return emptySummary()
  }

  const sum = ratings.reduce((total, value) => total + value, 0)
  return {
    averageRating: sum / ratings.length,
    reviewCount: ratings.length,
  }
}

function groupRatingsByReviewedUser(
  rows: Record<string, unknown>[],
): Map<string, number[]> {
  const grouped = new Map<string, number[]>()

  for (const row of rows) {
    const userId = readReviewedUserId(row)
    const rating = readReviewRating(row)
    if (!userId || rating == null) continue

    const existing = grouped.get(userId) ?? []
    existing.push(rating)
    grouped.set(userId, existing)
  }

  return grouped
}

function filterRowsByServiceIds(
  rows: Record<string, unknown>[],
  serviceIds: Set<string>,
): Record<string, unknown>[] {
  return rows.filter((row) => {
    const serviceId = readReviewServiceId(row)
    return serviceId != null && serviceIds.has(serviceId)
  })
}

async function queryServiceReviewRowsByServiceIds(
  serviceIds: ServiceId[],
): Promise<{ rows: Record<string, unknown>[]; error: PostgrestError | null }> {
  const idSet = new Set(serviceIds.filter(Boolean))
  if (idSet.size === 0) {
    return { rows: [], error: null }
  }

  const uniqueIds = [...idSet]

  const batch = await supabase
    .from('reviews')
    .select('rating, service_id')
    .in('service_id', uniqueIds)

  if (!batch.error) {
    return { rows: toRows(batch.data), error: null }
  }

  if (
    !isPostgrestSchemaError(batch.error) &&
    !isPostgrestFilterError(batch.error)
  ) {
    logSupabaseError('queryServiceReviewRowsByServiceIds.batch', batch.error, {
      count: uniqueIds.length,
    })
    return { rows: [], error: batch.error }
  }

  let lastError: PostgrestError | null = batch.error

  const perServiceRows: Record<string, unknown>[] = []

  for (const serviceId of uniqueIds) {
    const single = await supabase
      .from('reviews')
      .select('rating, service_id')
      .eq('service_id', serviceId)

    if (!single.error) {
      perServiceRows.push(...toRows(single.data))
      continue
    }

    lastError = single.error
    if (
      !isPostgrestSchemaError(single.error) &&
      !isPostgrestFilterError(single.error)
    ) {
      return { rows: [], error: single.error }
    }
  }

  if (perServiceRows.length > 0) {
    return { rows: perServiceRows, error: null }
  }

  for (const select of ['rating, service_id', '*'] as const) {
    const broad = await supabase
      .from('reviews')
      .select(select)
      .not('service_id', 'is', null)

    if (!broad.error) {
      const filtered = filterRowsByServiceIds(toRows(broad.data), idSet)
      return { rows: filtered, error: null }
    }

    lastError = broad.error
    if (
      !isPostgrestSchemaError(broad.error) &&
      !isPostgrestFilterError(broad.error)
    ) {
      return { rows: [], error: broad.error }
    }
  }

  return { rows: [], error: lastError }
}

async function queryReviewsForServiceId(
  serviceId: ServiceId,
  limit: number,
): Promise<{ rows: Record<string, unknown>[]; error: PostgrestError | null }> {
  let lastError: PostgrestError | null = null

  for (const select of [...REVIEW_LIST_WITH_REVIEWER_SELECTS, '*'] as const) {
    const response = await supabase
      .from('reviews')
      .select(select)
      .eq('service_id', serviceId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (!response.error) {
      return { rows: toRows(response.data), error: null }
    }

    lastError = response.error
    if (
      !isPostgrestSchemaError(response.error) &&
      !isPostgrestFilterError(response.error)
    ) {
      return { rows: [], error: response.error }
    }
  }

  for (const select of [...REVIEW_LIST_WITH_REVIEWER_SELECTS, '*'] as const) {
    const response = await supabase
      .from('reviews')
      .select(select)
      .not('service_id', 'is', null)
      .order('created_at', { ascending: false })
      .limit(Math.max(limit * 3, limit))

    if (!response.error) {
      const filtered = filterRowsByServiceIds(toRows(response.data), new Set([serviceId]))
      return { rows: filtered.slice(0, limit), error: null }
    }

    lastError = response.error
    if (
      !isPostgrestSchemaError(response.error) &&
      !isPostgrestFilterError(response.error)
    ) {
      return { rows: [], error: response.error }
    }
  }

  return { rows: [], error: lastError }
}

function groupRatingsByServiceId(
  rows: Record<string, unknown>[],
): Map<string, number[]> {
  const grouped = new Map<string, number[]>()

  for (const row of rows) {
    const serviceId = readReviewServiceId(row)
    const rating = readReviewRating(row)
    if (!serviceId || rating == null) continue

    const key = normalizeEntityId(serviceId)
    const existing = grouped.get(key) ?? []
    existing.push(rating)
    grouped.set(key, existing)
  }

  return grouped
}

type ReviewedUserQueryMode = 'reviewed_user_id' | 'reviewee_id' | 'user_id'

/** Değerlendiren profili — reviews → profiles çift FK nedeniyle açık ilişki adı gerekir. */
const REVIEW_LIST_WITH_REVIEWER_SELECTS = [
  '*, profiles!reviews_reviewer_id_fkey(full_name)',
  '*, profiles!reviewer_id(full_name)',
  '*, reviewer:profiles!reviews_reviewer_id_fkey(full_name)',
] as const

async function queryReviewsForReviewedUser(
  userId: string,
  limit: number,
  reviewedColumn: ReviewedUserQueryMode,
  withProfile: boolean,
): Promise<{ rows: Record<string, unknown>[]; error: PostgrestError | null }> {
  const selects = withProfile
    ? [...REVIEW_LIST_WITH_REVIEWER_SELECTS, '*']
    : (['*'] as const)

  let lastError: PostgrestError | null = null

  for (const select of selects) {
    const response = await supabase
      .from('reviews')
      .select(select)
      .eq(reviewedColumn, userId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (!response.error) {
      return { rows: toRows(response.data), error: null }
    }

    lastError = response.error
    if (!isPostgrestSchemaError(response.error)) {
      return { rows: [], error: response.error }
    }
  }

  return { rows: [], error: lastError }
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

async function queryReviewByServiceAndReviewer(
  serviceId: ServiceId,
  reviewerId: string,
  reviewedUserId: string,
): Promise<{ review: Review | null; error: PostgrestError | null }> {
  const response = await supabase
    .from('reviews')
    .select('*')
    .eq('service_id', serviceId)
    .eq('reviewer_id', reviewerId)
    .eq('reviewed_user_id', reviewedUserId)
    .maybeSingle()

  if (response.error) {
    if (isPostgrestSchemaError(response.error)) {
      return { review: null, error: null }
    }
    return { review: null, error: response.error }
  }

  if (!response.data || typeof response.data !== 'object') {
    return { review: null, error: null }
  }

  return {
    review: normalizeReviewRow(response.data as Record<string, unknown>),
    error: null,
  }
}

/** Hizmete bırakılan son değerlendirmeler (yalnızca service_id eşleşenler). */
export async function fetchReviewsForService(
  serviceId: ServiceId,
  limit = 10,
): Promise<FetchUserReviewsResult> {
  const rpcResult = await queryReviewsForServiceIdViaRpc(serviceId, limit)
  const { rows, error } =
    rpcResult.rows.length > 0 || rpcResult.error
      ? rpcResult
      : await queryReviewsForServiceId(serviceId, limit)

  if (error) {
    logSupabaseError('fetchReviewsForService', error, { serviceId })
    return { reviews: [], error: formatReviewFetchError(error) }
  }

  let reviewerNames = new Map<string, string>()
  let reviews = rows
    .map((row) => normalizeReviewListRow(row, reviewerNames))
    .filter((review): review is ReviewListItem => review !== null)

  const missingReviewerIds = [
    ...new Set(
      reviews
        .filter((review) => !review.reviewer_name)
        .map((review) => review.reviewer_id),
    ),
  ]

  if (missingReviewerIds.length > 0) {
    reviewerNames = await fetchProfileNamesByIds(missingReviewerIds)
    reviews = rows
      .map((row) => normalizeReviewListRow(row, reviewerNames))
      .filter((review): review is ReviewListItem => review !== null)
  }

  return { reviews, error: null }
}

/** Tek hizmet için ortalama puan (yalnızca reviews.service_id eşleşenler). */
export async function fetchServiceRatingSummary(
  serviceId: ServiceId,
): Promise<FetchUserRatingSummaryResult> {
  const { rows, error } = await queryServiceReviewRowsByServiceIds([serviceId])

  if (error) {
    if (isPostgrestSchemaError(error) || isPostgrestFilterError(error)) {
      return { summary: emptySummary(), error: null }
    }
    logSupabaseError('fetchServiceRatingSummary', error, { serviceId })
    return {
      summary: emptySummary(),
      error: formatReviewFetchError(error),
    }
  }

  const ratings = rows
    .filter((row) => readReviewServiceId(row) === serviceId)
    .map((row) => readReviewRating(row))
    .filter((value): value is number => value !== null)

  return { summary: buildRatingSummary(ratings), error: null }
}

/** Marketplace kartları için hizmet bazlı puan özetleri. */
export async function fetchServiceRatingSummariesByIds(
  serviceIds: ServiceId[],
): Promise<Map<string, UserRatingSummary>> {
  const uniqueIds = [...new Set(serviceIds.filter(Boolean))]
  const summaries = new Map<string, UserRatingSummary>()

  for (const serviceId of uniqueIds) {
    summaries.set(serviceId, emptySummary())
  }

  if (uniqueIds.length === 0) return summaries

  const rpcSummaries = await fetchServiceRatingSummariesViaRpc(uniqueIds)
  if (rpcSummaries) {
    if (import.meta.env.DEV) {
      const withRatings = [...rpcSummaries.entries()].filter(
        ([, summary]) => summary.reviewCount > 0,
      )
      console.info('[reviews] service ratings via rpc', {
        requested: uniqueIds.length,
        withRatings: withRatings.length,
      })
    }
    return rpcSummaries
  }

  const { rows, error } = await queryServiceReviewRowsByServiceIds(uniqueIds)

  if (error) {
    if (!isPostgrestSchemaError(error) && !isPostgrestFilterError(error)) {
      logSupabaseError('fetchServiceRatingSummariesByIds', error, {
        count: uniqueIds.length,
      })
    }
    return summaries
  }

  const grouped = groupRatingsByServiceId(rows)

  for (const serviceId of uniqueIds) {
    const ratings = grouped.get(normalizeEntityId(serviceId)) ?? []
    if (ratings.length > 0) {
      summaries.set(serviceId, buildRatingSummary(ratings))
    }
  }

  if (import.meta.env.DEV) {
    const withRatings = [...summaries.entries()].filter(
      ([, summary]) => summary.reviewCount > 0,
    )
    console.info('[reviews] service ratings via query', {
      requested: uniqueIds.length,
      rows: rows.length,
      withRatings: withRatings.length,
    })
  }

  return summaries
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

/** Kullanıcıya bırakılan son değerlendirmeler. */
export async function fetchReviewsForUser(
  userId: string,
  limit = 5,
): Promise<FetchUserReviewsResult> {
  const columns: ReviewedUserQueryMode[] = [
    'reviewed_user_id',
    'reviewee_id',
    'user_id',
  ]

  let lastError: PostgrestError | null = null

  for (const column of columns) {
    for (const withProfile of [true, false] as const) {
      const { rows, error } = await queryReviewsForReviewedUser(
        userId,
        limit,
        column,
        withProfile,
      )

      if (!error) {
        let reviewerNames = new Map<string, string>()
        let reviews = rows
          .map((row) => normalizeReviewListRow(row, reviewerNames))
          .filter((review): review is ReviewListItem => review !== null)

        const missingReviewerIds = [
          ...new Set(
            reviews
              .filter((review) => !review.reviewer_name)
              .map((review) => review.reviewer_id),
          ),
        ]

        if (missingReviewerIds.length > 0) {
          reviewerNames = await fetchProfileNamesByIds(missingReviewerIds)
          reviews = rows
            .map((row) => normalizeReviewListRow(row, reviewerNames))
            .filter((review): review is ReviewListItem => review !== null)
        }

        return { reviews, error: null }
      }

      lastError = error
      if (!isPostgrestSchemaError(error)) {
        logSupabaseError('fetchReviewsForUser', error, { userId, column })
        return {
          reviews: [],
          error: formatReviewFetchError(error),
        }
      }
    }
  }

  if (lastError) {
    return { reviews: [], error: formatReviewFetchError(lastError) }
  }

  return { reviews: [], error: null }
}

/** Birden fazla kullanıcı için puan özetleri (marketplace vb.). */
export async function fetchUserRatingSummariesByIds(
  userIds: string[],
): Promise<Map<string, UserRatingSummary>> {
  const uniqueIds = [...new Set(userIds.filter(Boolean))]
  const summaries = new Map<string, UserRatingSummary>()

  for (const userId of uniqueIds) {
    summaries.set(userId, emptySummary())
  }

  if (uniqueIds.length === 0) return summaries

  for (const reviewedColumn of [
    'reviewed_user_id',
    'reviewee_id',
    'user_id',
  ] as const) {
    const response = await supabase
      .from('reviews')
      .select(`rating, ${reviewedColumn}`)
      .in(reviewedColumn, uniqueIds)

    if (response.error) {
      if (isPostgrestSchemaError(response.error)) continue
      logSupabaseError('fetchUserRatingSummariesByIds', response.error, {
        reviewedColumn,
      })
      break
    }

    const grouped = groupRatingsByReviewedUser(toRows(response.data))

    for (const userId of uniqueIds) {
      const ratings = grouped.get(userId) ?? []
      if (ratings.length > 0) {
        summaries.set(userId, buildRatingSummary(ratings))
      }
    }

    const hasAny = [...summaries.values()].some(
      (summary) => summary.reviewCount > 0,
    )
    if (hasAny || toRows(response.data).length === 0) {
      return summaries
    }
  }

  const fallback = await supabase
    .from('reviews')
    .select('rating, reviewed_user_id')

  if (!fallback.error) {
    const grouped = groupRatingsByReviewedUser(
      toRows(fallback.data).filter((row) => {
        const id = readReviewedUserId(row)
        return id != null && uniqueIds.includes(id)
      }),
    )

    for (const userId of uniqueIds) {
      const ratings = grouped.get(userId) ?? []
      if (ratings.length > 0) {
        summaries.set(userId, buildRatingSummary(ratings))
      }
    }
  }

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

  const { row: taskRow, error: taskError } = await fetchTaskRowForReview(
    input.task_id,
  )

  if (taskError) {
    logSupabaseError('createTaskReview.task', taskError, {
      taskId: input.task_id,
    })
    return { review: null, error: formatReviewCreateError(taskError) }
  }

  if (!taskRow) {
    return { review: null, error: 'Görev bulunamadı.' }
  }

  const task = taskRow
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

  const reviewContext = await resolveServiceRequestReviewContext(
    input.task_id,
    input.reviewed_user_id,
    input.service_id ?? null,
  )

  const serviceId = reviewContext.serviceId

  if (reviewContext.isServiceRequest && !serviceId) {
    console.warn('[reviews] service request review blocked — no service_id', {
      taskId: reviewContext.task.id,
      taskSourceServiceId: reviewContext.task.source_service_id,
      offerId: reviewContext.offer?.id ?? null,
      offerTaskId: reviewContext.offer?.task_id ?? null,
      offerServiceId: reviewContext.offer?.service_id ?? null,
    })
    return { review: null, error: SERVICE_REVIEW_LINK_ERROR }
  }

  if (reviewContext.isServiceRequest && serviceId) {
    await ensureTaskHasSourceServiceId(input.task_id, serviceId)
  }

  if (serviceId) {
    const existingService = await queryReviewByServiceAndReviewer(
      serviceId,
      userId,
      input.reviewed_user_id,
    )
    if (existingService.error && !isPostgrestSchemaError(existingService.error)) {
      logSupabaseError('createTaskReview.existingService', existingService.error, {
        serviceId,
      })
      return {
        review: null,
        error: formatReviewCreateError(existingService.error),
      }
    }
    if (existingService.review) {
      return {
        review: null,
        error: 'Bu hizmet için zaten değerlendirme bıraktınız.',
      }
    }
  }

  const existingTask = await queryReviewByTaskAndReviewer(input.task_id, userId)
  if (existingTask.review) {
    return {
      review: null,
      error: 'Bu görev için zaten değerlendirme bıraktınız.',
    }
  }

  const basePayload = {
    reviewer_id: userId,
    reviewed_user_id: input.reviewed_user_id,
    rating: input.rating,
    comment: input.comment.trim(),
    task_id: input.task_id,
  }

  const insertPayload: Record<string, unknown> = serviceId
    ? { ...basePayload, service_id: serviceId }
    : basePayload

  logReviewInsertContext(reviewContext, insertPayload)

  const { data, error } = await supabase
    .from('reviews')
    .insert(insertPayload)
    .select('id, task_id, service_id, reviewer_id, reviewed_user_id, rating, comment, created_at')
    .single()

  if (error) {
    if (isDuplicateReviewError(error)) {
      return {
        review: null,
        error: serviceId
          ? 'Bu hizmet için zaten değerlendirme bıraktınız.'
          : 'Bu görev için zaten değerlendirme bıraktınız.',
      }
    }

    logSupabaseError('createTaskReview', error, {
      taskId: input.task_id,
      serviceId,
    })
    return { review: null, error: formatReviewCreateError(error) }
  }

  if (!data || typeof data !== 'object') {
    return { review: null, error: 'Değerlendirme kaydedilemedi.' }
  }

  let review = normalizeReviewRow(data as Record<string, unknown>)
  if (!review) {
    return { review: null, error: 'Değerlendirme kaydı doğrulanamadı.' }
  }

  if (serviceId && !review.service_id) {
    const patched = await supabase
      .from('reviews')
      .update({ service_id: serviceId })
      .eq('id', review.id)
      .select('*')
      .maybeSingle()

    if (!patched.error && patched.data && typeof patched.data === 'object') {
      const normalized = normalizeReviewRow(
        patched.data as Record<string, unknown>,
      )
      if (normalized) {
        review = normalized
      }
    }
  }

  if (reviewContext.isServiceRequest && !review.service_id) {
    await supabase.from('reviews').delete().eq('id', review.id)
    console.error('[reviews] insert verification failed — service_id null', {
      reviewId: review.id,
      taskId: input.task_id,
      expectedServiceId: serviceId,
      insertPayload,
    })
    return { review: null, error: SERVICE_REVIEW_LINK_ERROR }
  }

  if (serviceId && !review.service_id) {
    await supabase.from('reviews').delete().eq('id', review.id)
    return { review: null, error: SERVICE_REVIEW_LINK_ERROR }
  }

  const verify = await supabase
    .from('reviews')
    .select('id, service_id, task_id')
    .eq('id', review.id)
    .maybeSingle()

  const verifiedServiceId =
    verify.data &&
    typeof verify.data === 'object' &&
    (verify.data as { service_id?: unknown }).service_id != null
      ? String((verify.data as { service_id: unknown }).service_id)
      : null

  if (reviewContext.isServiceRequest && !verifiedServiceId) {
    await supabase.from('reviews').delete().eq('id', review.id)
    console.error('[reviews] db verification failed — service_id null', {
      reviewId: review.id,
      verifyError: verify.error?.message,
      expectedServiceId: serviceId,
    })
    return { review: null, error: SERVICE_REVIEW_LINK_ERROR }
  }

  if (verifiedServiceId && !review.service_id) {
    review = { ...review, service_id: verifiedServiceId }
  }

  console.info('[reviews] created', {
    reviewId: review.id,
    taskId: input.task_id,
    serviceId: review.service_id,
    verifiedServiceId,
    resolution: reviewContext.resolution,
  })

  return { review, error: null }
}
