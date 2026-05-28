import type { PostgrestError } from '@supabase/supabase-js'

import { canRespondToOffer } from '@/lib/offer-display'
import {
  normalizeIncomingOfferRow,
  normalizeOfferListRow,
  normalizeOfferRow,
  normalizeSubmittedOfferRow,
} from '@/lib/offer-mapper'
import {
  formatOfferCreateError,
  formatOfferFetchError,
  formatOfferUpdateError,
  isPostgrestSchemaError,
  logSupabaseError,
} from '@/lib/supabase/errors'
import { getAuthSessionContext } from '@/lib/supabase/session'
import { supabase } from '@/lib/supabase/client'
import {
  notifyOfferAccepted,
  notifyOfferReceived,
  notifyOfferRejected,
} from '@/services/notification-triggers'
import { fetchProfileNamesByIds } from '@/services/profiles'
import type {
  IncomingOfferItem,
  Offer,
  OfferActionResult,
  OfferCreateInput,
  OfferListItem,
  SubmittedOfferItem,
} from '@/types/offer'
import type { TaskId } from '@/types/index'

export type CreateOfferResult = {
  offer: Offer | null
  error: string | null
}

export type FetchTaskOffersResult = {
  offers: OfferListItem[]
  error: string | null
}

function toRows(data: unknown): Record<string, unknown>[] {
  if (!Array.isArray(data)) return []
  return data.filter(
    (row): row is Record<string, unknown> =>
      row !== null && typeof row === 'object',
  )
}

async function getTaskCustomerId(
  taskId: TaskId,
): Promise<{ customerId: string | null; error: PostgrestError | null }> {
  const { data, error } = await supabase
    .from('tasks')
    .select('customer_id')
    .eq('id', taskId)
    .maybeSingle()

  if (error) {
    return { customerId: null, error }
  }

  if (!data || typeof data !== 'object') {
    return { customerId: null, error: null }
  }

  const customerId = (data as Record<string, unknown>).customer_id
  return {
    customerId: customerId != null ? String(customerId) : null,
    error: null,
  }
}

/**
 * Oturum açmış kullanıcı görev sahibi değilse teklif oluşturur.
 * `provider_id` = Auth kullanıcı UUID'si.
 */
export async function createOffer(
  input: OfferCreateInput,
): Promise<CreateOfferResult> {
  const auth = await getAuthSessionContext()
  if (!auth.session) {
    return { offer: null, error: auth.error ?? 'Oturum bulunamadı.' }
  }

  const { userId } = auth.session
  const { customerId, error: taskError } = await getTaskCustomerId(input.task_id)

  if (taskError) {
    logSupabaseError('createOffer.getTask', taskError, { taskId: input.task_id })
    return { offer: null, error: formatOfferCreateError(taskError) }
  }

  if (!customerId) {
    return { offer: null, error: 'Görev bulunamadı.' }
  }

  if (customerId === userId) {
    return {
      offer: null,
      error: 'Kendi görevinize teklif veremezsiniz.',
    }
  }

  const payload = {
    task_id: input.task_id,
    provider_id: userId,
    price: input.price,
    message: input.message.trim(),
  }

  const { data, error } = await supabase
    .from('offers')
    .insert(payload)
    .select('*')
    .single()

  if (error) {
    logSupabaseError('createOffer', error, { taskId: input.task_id, userId })
    return { offer: null, error: formatOfferCreateError(error) }
  }

  if (!data || typeof data !== 'object') {
    return { offer: null, error: 'Teklif gönderildi ancak yanıt alınamadı.' }
  }

  const offer = normalizeOfferRow(data as Record<string, unknown>)
  if (!offer) {
    return { offer: null, error: 'Teklif kaydı doğrulanamadı.' }
  }

  if (import.meta.env.DEV) {
    console.info('[offers] created', { offerId: offer.id, taskId: input.task_id })
  }

  void notifyOfferReceived({
    customerId,
    offerId: offer.id,
    taskId: input.task_id,
    providerId: userId,
  })

  return { offer, error: null }
}

type OfferQueryMode = 'with_profile' | 'plain'

async function queryOffersForTask(
  taskId: TaskId,
  mode: OfferQueryMode,
): Promise<{ rows: Record<string, unknown>[]; error: PostgrestError | null }> {
  const response =
    mode === 'with_profile'
      ? await supabase
          .from('offers')
          .select('*, profiles(full_name)')
          .eq('task_id', taskId)
          .order('created_at', { ascending: false })
      : await supabase
          .from('offers')
          .select('*')
          .eq('task_id', taskId)
          .order('created_at', { ascending: false })

  if (response.error) {
    return { rows: [], error: response.error }
  }

  return { rows: toRows(response.data), error: null }
}

/**
 * Görev sahibine ait teklifleri getirir; başka kullanıcılara boş liste döner.
 */
export async function fetchOffersForTaskOwner(
  taskId: TaskId,
): Promise<FetchTaskOffersResult> {
  const auth = await getAuthSessionContext()
  if (!auth.session) {
    return { offers: [], error: null }
  }

  const { customerId, error: taskError } = await getTaskCustomerId(taskId)

  if (taskError) {
    logSupabaseError('fetchOffers.getTask', taskError, { taskId })
    return { offers: [], error: formatOfferFetchError(taskError) }
  }

  if (!customerId || customerId !== auth.session.userId) {
    return { offers: [], error: null }
  }

  const modes: OfferQueryMode[] = ['with_profile', 'plain']
  let lastError: PostgrestError | null = null

  for (const mode of modes) {
    const { rows, error } = await queryOffersForTask(taskId, mode)

    if (!error) {
      let providerNames = new Map<string, string>()
      let offers = rows
        .map((row) => normalizeOfferListRow(row, providerNames))
        .filter((offer): offer is OfferListItem => offer !== null)

      const missingProviderIds = [
        ...new Set(
          offers
            .filter((o) => !o.provider_name)
            .map((o) => o.provider_id),
        ),
      ]

      if (missingProviderIds.length > 0) {
        providerNames = await fetchProfileNamesByIds(missingProviderIds)
        offers = offers.map((offer) => ({
          ...offer,
          provider_name:
            offer.provider_name ??
            providerNames.get(offer.provider_id) ??
            null,
        }))
      }

      if (import.meta.env.DEV) {
        console.info('[offers] fetched for owner', {
          taskId,
          count: offers.length,
          mode,
        })
      }

      return { offers, error: null }
    }

    lastError = error
    logSupabaseError('fetchOffersForTaskOwner', error, { mode, taskId })

    if (!isPostgrestSchemaError(error)) {
      break
    }
  }

  if (lastError) {
    return { offers: [], error: formatOfferFetchError(lastError) }
  }

  return { offers: [], error: null }
}

export type FetchIncomingOffersResult = {
  offers: IncomingOfferItem[]
  error: string | null
}

export type FetchSubmittedOffersResult = {
  offers: SubmittedOfferItem[]
  error: string | null
}

type IncomingOfferQueryMode = 'with_joins' | 'plain'

async function queryIncomingOffers(
  userId: string,
  mode: IncomingOfferQueryMode,
): Promise<{ rows: Record<string, unknown>[]; error: PostgrestError | null }> {
  const response =
    mode === 'with_joins'
      ? await supabase
          .from('offers')
          .select('*, tasks!inner(title, customer_id), profiles(full_name)')
          .eq('tasks.customer_id', userId)
          .order('created_at', { ascending: false })
      : await supabase
          .from('offers')
          .select('*')
          .order('created_at', { ascending: false })

  if (response.error) {
    return { rows: [], error: response.error }
  }

  return { rows: toRows(response.data), error: null }
}

async function enrichIncomingOffers(
  rows: Record<string, unknown>[],
  userId: string,
): Promise<IncomingOfferItem[]> {
  const taskIds = [
    ...new Set(
      await supabase
        .from('tasks')
        .select('id')
        .eq('customer_id', userId)
        .then(({ data }) =>
          Array.isArray(data)
            ? data
                .map((t) =>
                  t && typeof t === 'object' && 'id' in t
                    ? String((t as { id: unknown }).id)
                    : null,
                )
                .filter((id): id is string => Boolean(id))
            : [],
        ),
    ),
  ]

  const taskTitleById = new Map<string, string>()
  if (taskIds.length > 0) {
    const { data: tasks } = await supabase
      .from('tasks')
      .select('id, title')
      .in('id', taskIds)

    if (Array.isArray(tasks)) {
      for (const task of tasks) {
        if (!task || typeof task !== 'object') continue
        const record = task as Record<string, unknown>
        if (record.id != null && record.title != null) {
          taskTitleById.set(String(record.id), String(record.title))
        }
      }
    }
  }

  const taskIdSet = new Set(taskIds)
  let providerNames = new Map<string, string>()

  let offers = rows
    .filter((row) => {
      const taskId = row.task_id ?? row.taskId
      return taskId != null && taskIdSet.has(String(taskId))
    })
    .map((row) => {
      const embedded = row.tasks ?? row.task
      if (!embedded && row.task_id != null) {
        const title = taskTitleById.get(String(row.task_id))
        if (title) {
          return { ...row, tasks: { title } }
        }
      }
      return row
    })
    .map((row) => normalizeIncomingOfferRow(row, providerNames))
    .filter((offer): offer is IncomingOfferItem => offer !== null)

  const missingProviderIds = [
    ...new Set(
      offers.filter((o) => !o.provider_name).map((o) => o.provider_id),
    ),
  ]

  if (missingProviderIds.length > 0) {
    providerNames = await fetchProfileNamesByIds(missingProviderIds)
    offers = offers.map((offer) => ({
      ...offer,
      provider_name:
        offer.provider_name ?? providerNames.get(offer.provider_id) ?? null,
    }))
  }

  return offers
}

/** Oturum açmış kullanıcının görevlerine gelen tüm teklifler. */
export async function fetchIncomingOffersForOwner(): Promise<FetchIncomingOffersResult> {
  const auth = await getAuthSessionContext()
  if (!auth.session) {
    return { offers: [], error: auth.error ?? 'Oturum bulunamadı.' }
  }

  const { userId } = auth.session
  const modes: IncomingOfferQueryMode[] = ['with_joins', 'plain']
  let lastError: PostgrestError | null = null

  for (const mode of modes) {
    const { rows, error } = await queryIncomingOffers(userId, mode)

    if (!error) {
      const offers =
        mode === 'with_joins'
          ? await (async () => {
              let providerNames = new Map<string, string>()
              let list = rows
                .map((row) => normalizeIncomingOfferRow(row, providerNames))
                .filter((o): o is IncomingOfferItem => o !== null)

              const missing = [
                ...new Set(
                  list.filter((o) => !o.provider_name).map((o) => o.provider_id),
                ),
              ]
              if (missing.length > 0) {
                providerNames = await fetchProfileNamesByIds(missing)
                list = list.map((offer) => ({
                  ...offer,
                  provider_name:
                    offer.provider_name ??
                    providerNames.get(offer.provider_id) ??
                    null,
                }))
              }
              return list
            })()
          : await enrichIncomingOffers(rows, userId)

      if (import.meta.env.DEV) {
        console.info('[offers] incoming', { count: offers.length, mode })
      }

      return { offers, error: null }
    }

    lastError = error
    logSupabaseError('fetchIncomingOffersForOwner', error, { mode, userId })

    if (!isPostgrestSchemaError(error)) {
      break
    }
  }

  if (lastError) {
    return { offers: [], error: formatOfferFetchError(lastError) }
  }

  return { offers: [], error: null }
}

type SubmittedOfferQueryMode = 'with_task' | 'plain'

async function querySubmittedOffers(
  providerId: string,
  mode: SubmittedOfferQueryMode,
): Promise<{ rows: Record<string, unknown>[]; error: PostgrestError | null }> {
  const response =
    mode === 'with_task'
      ? await supabase
          .from('offers')
          .select('*, tasks(title, city)')
          .eq('provider_id', providerId)
          .order('created_at', { ascending: false })
      : await supabase
          .from('offers')
          .select('*')
          .eq('provider_id', providerId)
          .order('created_at', { ascending: false })

  if (response.error) {
    return { rows: [], error: response.error }
  }

  return { rows: toRows(response.data), error: null }
}

/** Oturum açmış kullanıcının gönderdiği teklifler. */
export async function fetchSubmittedOffersByProvider(): Promise<FetchSubmittedOffersResult> {
  const auth = await getAuthSessionContext()
  if (!auth.session) {
    return { offers: [], error: auth.error ?? 'Oturum bulunamadı.' }
  }

  const { userId } = auth.session
  const modes: SubmittedOfferQueryMode[] = ['with_task', 'plain']
  let lastError: PostgrestError | null = null

  for (const mode of modes) {
    const { rows, error } = await querySubmittedOffers(userId, mode)

    if (!error) {
      const offers = rows
        .map((row) => normalizeSubmittedOfferRow(row))
        .filter((offer): offer is SubmittedOfferItem => offer !== null)

      if (import.meta.env.DEV) {
        console.info('[offers] submitted', { count: offers.length, mode })
      }

      return { offers, error: null }
    }

    lastError = error
    logSupabaseError('fetchSubmittedOffersByProvider', error, { mode, userId })

    if (!isPostgrestSchemaError(error)) {
      break
    }
  }

  if (lastError) {
    return { offers: [], error: formatOfferFetchError(lastError) }
  }

  return { offers: [], error: null }
}

type OfferWithTaskRow = {
  offer: Offer
  taskId: TaskId
  customerId: string
}

async function getOfferWithTaskForOwner(
  offerId: string,
  ownerId: string,
): Promise<{ row: OfferWithTaskRow | null; error: string | null }> {
  const modes = ['with_task', 'plain'] as const

  for (const mode of modes) {
    const response =
      mode === 'with_task'
        ? await supabase
            .from('offers')
            .select('*, tasks(id, customer_id, title)')
            .eq('id', offerId)
            .maybeSingle()
        : await supabase
            .from('offers')
            .select('*')
            .eq('id', offerId)
            .maybeSingle()

    if (response.error) {
      if (!isPostgrestSchemaError(response.error)) {
        logSupabaseError('getOfferWithTaskForOwner', response.error, { offerId })
        return { row: null, error: formatOfferFetchError(response.error) }
      }
      continue
    }

    if (!response.data || typeof response.data !== 'object') {
      return { row: null, error: 'Teklif bulunamadı.' }
    }

    const record = response.data as Record<string, unknown>
    const offer = normalizeOfferRow(record)
    if (!offer) {
      return { row: null, error: 'Teklif kaydı okunamadı.' }
    }

    let customerId: string | null = null
    const embedded = record.tasks ?? record.task
    if (embedded && typeof embedded === 'object' && !Array.isArray(embedded)) {
      const task = embedded as Record<string, unknown>
      customerId =
        task.customer_id != null ? String(task.customer_id) : null
    }

    if (!customerId) {
      const fromTask = await getTaskCustomerId(offer.task_id)
      customerId = fromTask.customerId
    }

    if (!customerId) {
      return { row: null, error: 'Görev bulunamadı.' }
    }

    if (customerId !== ownerId) {
      return { row: null, error: 'Bu teklifi yönetme yetkiniz yok.' }
    }

    return {
      row: { offer, taskId: offer.task_id, customerId },
      error: null,
    }
  }

  return { row: null, error: 'Teklif bulunamadı.' }
}

async function rejectOtherPendingOffers(
  taskId: TaskId,
  acceptedOfferId: string,
): Promise<PostgrestError | null> {
  const { data: siblings, error: fetchError } = await supabase
    .from('offers')
    .select('id, status, provider_id')
    .eq('task_id', taskId)
    .neq('id', acceptedOfferId)

  if (fetchError) return fetchError

  const toReject = (Array.isArray(siblings) ? siblings : []).filter((row) => {
    if (!row || typeof row !== 'object') return false
    const status = (row as { status?: unknown }).status
    return canRespondToOffer(
      status != null ? String(status) : null,
    )
  })

  if (toReject.length === 0) return null

  const ids = toReject
    .map((row) => (row as { id: unknown }).id)
    .filter((id): id is string | number => id != null)
    .map(String)

  const { error } = await supabase
    .from('offers')
    .update({ status: 'rejected' })
    .in('id', ids)

  if (!error) {
    for (const row of toReject) {
      const record = row as Record<string, unknown>
      const providerId = record.provider_id ?? record.providerId
      const offerId = record.id
      if (providerId == null || offerId == null) continue

      void notifyOfferRejected({
        providerId: String(providerId),
        offerId: String(offerId),
        taskId,
      })
    }
  }

  return error
}

/** Görev sahibi teklifi kabul eder; görev `in_progress`, diğer bekleyen teklifler reddedilir. */
export async function acceptOffer(offerId: string): Promise<OfferActionResult> {
  const auth = await getAuthSessionContext()
  if (!auth.session) {
    return { success: false, error: auth.error ?? 'Oturum bulunamadı.', message: null }
  }

  const { row, error: loadError } = await getOfferWithTaskForOwner(
    offerId,
    auth.session.userId,
  )

  if (loadError || !row) {
    return { success: false, error: loadError ?? 'Teklif bulunamadı.', message: null }
  }

  if (!canRespondToOffer(row.offer.status)) {
    return {
      success: false,
      error: 'Yalnızca beklemedeki teklifler yanıtlanabilir.',
      message: null,
    }
  }

  const { error: acceptError } = await supabase
    .from('offers')
    .update({ status: 'accepted' })
    .eq('id', offerId)

  if (acceptError) {
    logSupabaseError('acceptOffer.updateOffer', acceptError, { offerId })
    return {
      success: false,
      error: formatOfferUpdateError(acceptError),
      message: null,
    }
  }

  const { error: taskError } = await supabase
    .from('tasks')
    .update({ status: 'in_progress' })
    .eq('id', row.taskId)

  if (taskError) {
    logSupabaseError('acceptOffer.updateTask', taskError, {
      taskId: row.taskId,
    })
    return {
      success: false,
      error: formatOfferUpdateError(taskError),
      message: null,
    }
  }

  const rejectError = await rejectOtherPendingOffers(row.taskId, offerId)
  if (rejectError) {
    logSupabaseError('acceptOffer.rejectOthers', rejectError, {
      taskId: row.taskId,
    })
  }

  if (import.meta.env.DEV) {
    console.info('[offers] accepted', { offerId, taskId: row.taskId })
  }

  void notifyOfferAccepted({
    providerId: row.offer.provider_id,
    offerId,
    taskId: row.taskId,
  })

  return {
    success: true,
    error: null,
    message: 'Teklif kabul edildi. Görev durumu “Devam ediyor” olarak güncellendi.',
  }
}

/** Görev sahibi teklifi reddeder. */
export async function rejectOffer(offerId: string): Promise<OfferActionResult> {
  const auth = await getAuthSessionContext()
  if (!auth.session) {
    return { success: false, error: auth.error ?? 'Oturum bulunamadı.', message: null }
  }

  const { row, error: loadError } = await getOfferWithTaskForOwner(
    offerId,
    auth.session.userId,
  )

  if (loadError || !row) {
    return { success: false, error: loadError ?? 'Teklif bulunamadı.', message: null }
  }

  if (!canRespondToOffer(row.offer.status)) {
    return {
      success: false,
      error: 'Yalnızca beklemedeki teklifler yanıtlanabilir.',
      message: null,
    }
  }

  const { error } = await supabase
    .from('offers')
    .update({ status: 'rejected' })
    .eq('id', offerId)

  if (error) {
    logSupabaseError('rejectOffer', error, { offerId })
    return {
      success: false,
      error: formatOfferUpdateError(error),
      message: null,
    }
  }

  if (import.meta.env.DEV) {
    console.info('[offers] rejected', { offerId })
  }

  void notifyOfferRejected({
    providerId: row.offer.provider_id,
    offerId,
    taskId: row.taskId,
  })

  return {
    success: true,
    error: null,
    message: 'Teklif reddedildi.',
  }
}
