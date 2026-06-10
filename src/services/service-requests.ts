import type { PostgrestError } from '@supabase/supabase-js'

import { canRespondToOffer } from '@/lib/offer-display'
import { normalizeOfferRow, normalizeServiceRequestRow } from '@/lib/offer-mapper'
import { SERVICE_REQUEST_OFFER_MESSAGE } from '@/lib/service-request-constants'
import {
  ensureTaskHasSourceServiceId,
  findOpenServiceRequestTaskId as findOpenServiceRequestTaskIdBySource,
  isServiceRequestTaskRow,
  loadServiceRequestTaskIds,
  readSourceServiceId,
  verifyTaskSourceServiceId,
} from '@/lib/task-source'
import {
  formatOfferCreateError,
  formatOfferFetchError,
  formatOfferUpdateError,
  formatRpcError,
  formatTaskCreateError,
  formatUpdateNoRowError,
  isPostgrestPermissionError,
  isPostgrestSchemaError,
  logSupabaseError,
} from '@/lib/supabase/errors'
import { getAuthSessionContext } from '@/lib/supabase/session'
import { supabase } from '@/lib/supabase/client'
import { fetchServiceDetailById } from '@/services/marketplace'
import { fetchProfileNamesByIds } from '@/services/profiles'
import {
  notifyServiceRequestAccepted,
  notifyServiceRequestReceived,
  notifyServiceRequestRejected,
} from '@/services/notification-triggers'
import type {
  OfferActionResult,
  RequestServiceResult,
  ServiceRequestItem,
} from '@/types/offer'
import type { ServiceId, TaskId } from '@/types/index'

export type FetchServiceRequestsResult = {
  requests: ServiceRequestItem[]
  error: string | null
}

const SERVICE_REQUEST_MESSAGE = SERVICE_REQUEST_OFFER_MESSAGE
const SERVICE_REQUEST_TASK_STATUS = 'open'

const SERVICE_INFO_MISSING_ERROR =
  'Hizmet bilgisi eksik olduğu için talep oluşturulamadı.'

const TASK_SOURCE_LINK_ERROR =
  'Görev kaynak hizmete bağlanamadı. Talep oluşturulamadı.'

function toRows(data: unknown): Record<string, unknown>[] {
  if (!Array.isArray(data)) return []
  return data.filter(
    (row): row is Record<string, unknown> =>
      row !== null && typeof row === 'object',
  )
}

function buildServiceRequestTaskPayload(
  customerId: string,
  service: {
    id: string
    title: string
    description: string | null
    category_id: string | null
    city: string | null
    base_price: number | null
  },
): Record<string, unknown> {
  const price = service.base_price ?? 0

  return {
    customer_id: customerId,
    title: service.title,
    description: service.description ?? '',
    category_id: service.category_id,
    city: service.city,
    budget_min: price,
    budget_max: price,
    status: SERVICE_REQUEST_TASK_STATUS,
    source_service_id: service.id,
  }
}

function logServiceRequestStep(
  step: string,
  extra: Record<string, unknown>,
): void {
  console.info(`[service-requests] ${step}`, extra)
}

function buildServiceRequestOfferPayloads(
  taskId: TaskId,
  providerId: string,
  price: number,
  serviceId: ServiceId,
): Record<string, unknown>[] {
  const base = {
    task_id: taskId,
    provider_id: providerId,
    price,
    message: SERVICE_REQUEST_MESSAGE,
    service_id: serviceId,
  }

  return [
    base,
    {
      ...base,
      status: 'pending',
    },
    {
      task_id: taskId,
      provider_id: providerId,
      price,
      message: SERVICE_REQUEST_MESSAGE,
    },
    {
      task_id: taskId,
      provider_id: providerId,
      price,
      message: SERVICE_REQUEST_MESSAGE,
      status: 'pending',
    },
  ]
}

type StatusUpdateResult = { ok: true } | { ok: false; error: string }

async function updateOfferStatusVerified(
  offerId: string,
  status: 'accepted' | 'rejected' | 'pending',
  step: string,
): Promise<StatusUpdateResult> {
  const payload = { status }

  logServiceRequestStep(`${step}.offerUpdate`, { offerId, payload })

  const { data, error } = await supabase
    .from('offers')
    .update(payload)
    .eq('id', offerId)
    .select('id, status')
    .maybeSingle()

  logServiceRequestStep(`${step}.offerUpdate.result`, {
    offerId,
    data,
    error: error?.message ?? null,
    code: error?.code ?? null,
  })

  if (error) {
    logSupabaseError(`${step}.offerUpdate`, error, { offerId, payload })
    return { ok: false, error: formatOfferUpdateError(error) }
  }

  const updatedStatus =
    data && typeof data === 'object' && 'status' in data
      ? String((data as { status: unknown }).status)
      : null

  if (updatedStatus !== status) {
    return {
      ok: false,
      error: formatUpdateNoRowError('Teklif', `offerId=${offerId}, beklenen=${status}`),
    }
  }

  return { ok: true }
}

async function updateTaskStatusVerified(
  taskId: TaskId,
  status: string,
  step: string,
): Promise<StatusUpdateResult> {
  const payload = { status }

  logServiceRequestStep(`${step}.taskUpdate`, { taskId, payload })

  const { data, error } = await supabase
    .from('tasks')
    .update(payload)
    .eq('id', taskId)
    .select('id, status')
    .maybeSingle()

  logServiceRequestStep(`${step}.taskUpdate.result`, {
    taskId,
    data,
    error: error?.message ?? null,
    code: error?.code ?? null,
  })

  if (error) {
    logSupabaseError(`${step}.taskUpdate`, error, { taskId, payload })
    return { ok: false, error: formatOfferUpdateError(error) }
  }

  const updatedStatus =
    data && typeof data === 'object' && 'status' in data
      ? String((data as { status: unknown }).status)
      : null

  if (updatedStatus !== status) {
    return {
      ok: false,
      error: formatUpdateNoRowError('Görev', `taskId=${taskId}, beklenen=${status}`),
    }
  }

  return { ok: true }
}

async function verifyOfferRowExists(offerId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('offers')
    .select('id')
    .eq('id', offerId)
    .maybeSingle()

  if (error) {
    logSupabaseError('verifyOfferRowExists', error, { offerId })
    return false
  }

  return Boolean(data && typeof data === 'object' && 'id' in data)
}

type InsertServiceRequestTaskResult = {
  taskId: TaskId | null
  error: string | null
}

async function insertServiceRequestTask(
  customerId: string,
  service: {
    id: string
    title: string
    description: string | null
    category_id: string | null
    city: string | null
    base_price: number | null
  },
): Promise<InsertServiceRequestTaskResult> {
  if (!service.id?.trim()) {
    console.warn('[service-requests] insertServiceRequestTask.missingServiceId', {
      service,
      customerId,
    })
    return { taskId: null, error: SERVICE_INFO_MISSING_ERROR }
  }

  const serviceId = service.id.trim() as ServiceId
  const payload = buildServiceRequestTaskPayload(customerId, {
    ...service,
    id: serviceId,
  })

  logServiceRequestStep('insertServiceRequestTask.beforeInsert', {
    payload,
    customerId,
    service: {
      id: service.id,
      title: service.title,
      base_price: service.base_price,
    },
  })

  const { data, error } = await supabase
    .from('tasks')
    .insert(payload)
    .select('id, source_service_id')
    .single()

  if (error) {
    logSupabaseError('insertServiceRequestTask', error, {
      customerId,
      serviceId: service.id,
      payload,
    })
    return {
      taskId: null,
      error: formatTaskCreateError(error),
    }
  }

  if (!data || typeof data !== 'object' || !('id' in data)) {
    return { taskId: null, error: TASK_SOURCE_LINK_ERROR }
  }

  const taskId = String((data as { id: unknown }).id) as TaskId
  const insertedSource = readSourceServiceId(data as Record<string, unknown>)

  logServiceRequestStep('insertServiceRequestTask.afterInsert', {
    taskId,
    insertedSourceServiceId: insertedSource,
    expectedServiceId: serviceId,
  })

  let verified = await verifyTaskSourceServiceId(taskId, serviceId)

  if (!verified) {
    const linked = await ensureTaskHasSourceServiceId(taskId, serviceId)
    if (!linked.ok) {
      logSupabaseError('insertServiceRequestTask.linkSource', linked.error, {
        taskId,
        serviceId,
      })
    }
    verified = await verifyTaskSourceServiceId(taskId, serviceId)
  }

  if (!verified) {
    console.error('[service-requests] insertServiceRequestTask.verifyFailed', {
      taskId,
      expectedServiceId: serviceId,
      insertedSourceServiceId: insertedSource,
    })
    await supabase.from('tasks').delete().eq('id', taskId)
    return { taskId: null, error: TASK_SOURCE_LINK_ERROR }
  }

  logServiceRequestStep('insertServiceRequestTask.success', {
    taskId,
    sourceServiceId: serviceId,
    verified: true,
  })

  return { taskId, error: null }
}

async function requireVerifiedTaskSourceServiceId(
  taskId: TaskId,
  serviceId: ServiceId,
): Promise<{ ok: boolean; error: string | null }> {
  if (!serviceId?.trim()) {
    return { ok: false, error: SERVICE_INFO_MISSING_ERROR }
  }

  const linked = await ensureTaskHasSourceServiceId(taskId, serviceId)
  if (!linked.ok) {
    logSupabaseError('requireVerifiedTaskSourceServiceId', linked.error, {
      taskId,
      serviceId,
    })
  }

  const verified = await verifyTaskSourceServiceId(taskId, serviceId)
  if (!verified) {
    console.error('[service-requests] requireVerifiedTaskSourceServiceId.failed', {
      taskId,
      serviceId,
    })
    return { ok: false, error: TASK_SOURCE_LINK_ERROR }
  }

  return { ok: true, error: null }
}

async function insertServiceRequestOffer(
  taskId: TaskId,
  providerId: string,
  price: number,
  customerId: string,
  serviceId: ServiceId,
): Promise<{ offerId: string | null; error: PostgrestError | null }> {
  const payloads = buildServiceRequestOfferPayloads(
    taskId,
    providerId,
    price,
    serviceId,
  )

  let lastError: PostgrestError | null = null

  for (const [index, payload] of payloads.entries()) {
    const cleaned = Object.fromEntries(
      Object.entries(payload).filter(([, value]) => value !== undefined),
    )

    logServiceRequestStep('insertServiceRequestOffer.attempt', {
      attempt: index + 1,
      payload: cleaned,
      taskId,
      providerId,
      customerId,
    })

    const { data, error } = await supabase
      .from('offers')
      .insert(cleaned)
      .select('id')
      .single()

    if (!error && data && typeof data === 'object' && 'id' in data) {
      const offerId = String((data as { id: unknown }).id)
      const verified = await verifyOfferRowExists(offerId)
      logServiceRequestStep('insertServiceRequestOffer.success', {
        offerId,
        verified,
      })
      if (!verified) {
        const verifyError = {
          message:
            'Teklif eklendi ancak doğrulama sorgusu satır döndürmedi (RLS SELECT?).',
          code: 'offer_verify_failed',
        } as PostgrestError
        return { offerId: null, error: verifyError }
      }
      return { offerId, error: null }
    }

    lastError = error
    if (error) {
      logSupabaseError('insertServiceRequestOffer', error, {
        taskId,
        providerId,
        customerId,
        attempt: index + 1,
        payload: cleaned,
        isRls: isPostgrestPermissionError(error),
      })
      if (!isPostgrestSchemaError(error)) {
        return { offerId: null, error }
      }
    }
  }

  return { offerId: null, error: lastError }
}

async function findOpenServiceRequestTaskId(
  customerId: string,
  serviceId: string,
): Promise<TaskId | null> {
  return findOpenServiceRequestTaskIdBySource(customerId, serviceId, [
    SERVICE_REQUEST_TASK_STATUS,
    'open',
  ])
}

/** Müşteri bir hizmet için talep oluşturur (görev + teklif kaydı). */
export async function requestService(
  serviceId: ServiceId,
): Promise<RequestServiceResult> {
  const auth = await getAuthSessionContext()
  if (!auth.session) {
    return {
      taskId: null,
      offerId: null,
      providerId: null,
      error: auth.error ?? 'Oturum bulunamadı.',
    }
  }

  const { userId } = auth.session
  const { service, error: fetchError } = await fetchServiceDetailById(serviceId)

  if (fetchError) {
    return {
      taskId: null,
      offerId: null,
      providerId: null,
      error: fetchError,
    }
  }

  if (!service) {
    return {
      taskId: null,
      offerId: null,
      providerId: null,
      error: 'Hizmet bulunamadı veya yayında değil.',
    }
  }

  if (service.provider_id === userId) {
    return {
      taskId: null,
      offerId: null,
      providerId: null,
      error: 'Kendi hizmetiniz için talep oluşturamazsınız.',
    }
  }

  if (service.base_price == null) {
    return {
      taskId: null,
      offerId: null,
      providerId: null,
      error: 'Bu hizmetin fiyatı belirtilmemiş; talep gönderilemiyor.',
    }
  }

  if (!service.id?.trim()) {
    console.warn('[service-requests] requestService.missingServiceId', { service })
    return {
      taskId: null,
      offerId: null,
      providerId: null,
      error: SERVICE_INFO_MISSING_ERROR,
    }
  }

  console.info('[service-requests] requestService.service', {
    id: service.id,
    title: service.title,
    provider_id: service.provider_id,
    base_price: service.base_price,
    category_id: service.category_id,
    city: service.city,
  })

  let taskId: TaskId | null = await findOpenServiceRequestTaskId(
    userId,
    serviceId,
  )

  if (taskId) {
    const linkResult = await requireVerifiedTaskSourceServiceId(taskId, serviceId)
    if (!linkResult.ok) {
      return {
        taskId: null,
        offerId: null,
        providerId: null,
        error: linkResult.error ?? TASK_SOURCE_LINK_ERROR,
      }
    }

    const { data: existingOffer, error: existingOfferError } = await supabase
      .from('offers')
      .select('id, status, provider_id')
      .eq('task_id', taskId)
      .eq('provider_id', service.provider_id)
      .maybeSingle()

    if (existingOfferError) {
      logSupabaseError('requestService.existingOffer', existingOfferError, {
        taskId,
      })
    }

    if (existingOffer && typeof existingOffer === 'object') {
      const status = String(
        (existingOffer as { status?: unknown }).status ?? '',
      )
      const existingOfferId = String((existingOffer as { id: unknown }).id)
      if (canRespondToOffer(status) || status === 'accepted') {
        return {
          taskId,
          offerId: existingOfferId,
          providerId: service.provider_id,
          error: 'Bu hizmet için zaten bekleyen bir talebiniz var.',
        }
      }
    } else {
      logServiceRequestStep('requestService.retryOfferOnExistingTask', {
        taskId,
        serviceId,
      })
      const { offerId: retriedOfferId, error: retryOfferError } =
        await insertServiceRequestOffer(
          taskId,
          service.provider_id,
          service.base_price,
          userId,
          service.id,
        )

      if (retriedOfferId) {
        const offerId = retriedOfferId
        void notifyServiceRequestReceived({
          providerId: service.provider_id,
          customerId: userId,
          offerId,
          taskId,
          serviceId: service.id,
          serviceTitle: service.title,
        })
        return {
          taskId,
          offerId,
          providerId: service.provider_id,
          error: null,
        }
      }

      if (retryOfferError) {
        return {
          taskId,
          offerId: null,
          providerId: service.provider_id,
          error: formatOfferCreateError(retryOfferError),
        }
      }
    }
  }

  if (!taskId) {
    const taskResult = await insertServiceRequestTask(userId, service)
    taskId = taskResult.taskId

    if (taskResult.error || !taskId) {
      return {
        taskId: null,
        offerId: null,
        providerId: null,
        error: taskResult.error ?? TASK_SOURCE_LINK_ERROR,
      }
    }
  }

  const finalLink = await requireVerifiedTaskSourceServiceId(taskId, serviceId)
  if (!finalLink.ok) {
    return {
      taskId: null,
      offerId: null,
      providerId: null,
      error: finalLink.error ?? TASK_SOURCE_LINK_ERROR,
    }
  }

  const { offerId, error: offerError } = await insertServiceRequestOffer(
    taskId,
    service.provider_id,
    service.base_price,
    userId,
    service.id,
  )

  if (offerError || !offerId) {
    logServiceRequestStep('requestService.offerFailed', {
      taskId,
      providerId: service.provider_id,
      offerError: offerError?.message,
      offerCode: offerError?.code,
    })
    return {
      taskId,
      offerId: null,
      providerId: service.provider_id,
      error: offerError
        ? formatOfferCreateError(offerError)
        : 'Talep kaydı oluşturulamadı.',
    }
  }

  void notifyServiceRequestReceived({
    providerId: service.provider_id,
    customerId: userId,
    offerId,
    taskId,
    serviceId: service.id,
    serviceTitle: service.title,
  })

  if (import.meta.env.DEV) {
    console.info('[service-requests] created', {
      taskId,
      offerId,
      serviceId,
    })
  }

  return {
    taskId,
    offerId,
    providerId: service.provider_id,
    error: null,
  }
}

type ServiceRequestQueryMode = 'with_task' | 'plain'

function readEmbeddedTaskRow(
  row: Record<string, unknown>,
): Record<string, unknown> | null {
  const taskEmbedded = row.tasks ?? row.task
  if (!taskEmbedded || typeof taskEmbedded !== 'object') return null

  if (Array.isArray(taskEmbedded)) {
    const first = taskEmbedded[0]
    return first && typeof first === 'object'
      ? (first as Record<string, unknown>)
      : null
  }

  return taskEmbedded as Record<string, unknown>
}

function collectSourceServiceIds(rows: Record<string, unknown>[]): string[] {
  const ids = new Set<string>()

  for (const row of rows) {
    const taskRow = readEmbeddedTaskRow(row)
    if (!taskRow) continue

    const sourceId = readSourceServiceId(taskRow)
    if (sourceId) ids.add(sourceId)
  }

  return [...ids]
}

async function fetchServiceTitlesByIds(
  serviceIds: string[],
): Promise<Map<string, string>> {
  const uniqueIds = [...new Set(serviceIds.filter(Boolean))]
  if (uniqueIds.length === 0) return new Map()

  const { data, error } = await supabase
    .from('services')
    .select('id, title')
    .in('id', uniqueIds)

  if (error) {
    if (!isPostgrestSchemaError(error)) {
      logSupabaseError('fetchServiceTitlesByIds', error, {
        count: uniqueIds.length,
      })
    }
    return new Map()
  }

  const titles = new Map<string, string>()
  for (const row of toRows(data)) {
    const id = row.id != null ? String(row.id) : null
    const title = row.title != null ? String(row.title).trim() : null
    if (id && title) titles.set(id, title)
  }

  return titles
}

function isServiceRequestOfferRow(
  row: Record<string, unknown>,
  serviceRequestTaskIds: Set<string>,
): boolean {
  const taskId = row.task_id ?? row.taskId
  if (taskId != null && serviceRequestTaskIds.has(String(taskId))) {
    return true
  }

  const taskRow = readEmbeddedTaskRow(row)
  if (taskRow && isServiceRequestTaskRow(taskRow)) {
    return true
  }

  const message = String(row.message ?? '').trim()
  return message === SERVICE_REQUEST_OFFER_MESSAGE
}

async function enrichOfferRowsWithTasks(
  rows: Record<string, unknown>[],
): Promise<Record<string, unknown>[]> {
  const needsTask = rows.filter((row) => !readEmbeddedTaskRow(row))
  if (needsTask.length === 0) return rows

  const taskIds = [
    ...new Set(
      needsTask
        .map((row) => row.task_id ?? row.taskId)
        .filter((id): id is string | number => id != null)
        .map(String),
    ),
  ]

  if (taskIds.length === 0) return rows

  const { data, error } = await supabase
    .from('tasks')
    .select('id, title, city, customer_id, source_service_id')
    .in('id', taskIds)

  if (error || !Array.isArray(data)) {
    if (error && !isPostgrestSchemaError(error)) {
      logSupabaseError('enrichOfferRowsWithTasks', error, { count: taskIds.length })
    }
    return rows
  }

  const taskById = new Map(
    toRows(data).map((task) => [String(task.id), task]),
  )

  return rows.map((row) => {
    if (readEmbeddedTaskRow(row)) return row

    const taskId = row.task_id ?? row.taskId
    if (taskId == null) return row

    const task = taskById.get(String(taskId))
    return task ? { ...row, tasks: task } : row
  })
}

async function queryProviderServiceRequests(
  providerId: string,
  mode: ServiceRequestQueryMode,
): Promise<{ rows: Record<string, unknown>[]; error: PostgrestError | null }> {
  const response =
    mode === 'with_task'
      ? await supabase
          .from('offers')
          .select('*, tasks(title, city, customer_id, source_service_id)')
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

/** Hizmet verene gelen müşteri talepleri. */
export async function fetchServiceRequestsForProvider(): Promise<FetchServiceRequestsResult> {
  const auth = await getAuthSessionContext()
  if (!auth.session) {
    return { requests: [], error: auth.error ?? 'Oturum bulunamadı.' }
  }

  const { userId } = auth.session
  const modes: ServiceRequestQueryMode[] = ['with_task', 'plain']
  let lastError: PostgrestError | null = null
  const serviceRequestTaskIds = await loadServiceRequestTaskIds()

  for (const mode of modes) {
    const { rows, error } = await queryProviderServiceRequests(userId, mode)

    if (!error) {
      const filtered = rows.filter((row) =>
        isServiceRequestOfferRow(row, serviceRequestTaskIds),
      )

      const enriched = await enrichOfferRowsWithTasks(filtered)
      const serviceTitles = await fetchServiceTitlesByIds(
        collectSourceServiceIds(enriched),
      )

      let customerNames = new Map<string, string>()
      let requests = enriched
        .map((row) =>
          normalizeServiceRequestRow(row, customerNames, serviceTitles),
        )
        .filter((item): item is ServiceRequestItem => item !== null)

      const missingCustomerIds = [
        ...new Set(
          requests
            .filter((item) => !item.customer_name && item.customer_id)
            .map((item) => item.customer_id as string),
        ),
      ]

      if (missingCustomerIds.length > 0) {
        customerNames = await fetchProfileNamesByIds(missingCustomerIds)
        requests = enriched
          .map((row) =>
            normalizeServiceRequestRow(row, customerNames, serviceTitles),
          )
          .filter((item): item is ServiceRequestItem => item !== null)
      }

      if (import.meta.env.DEV) {
        console.info('[service-requests] provider inbox', {
          count: requests.length,
          mode,
        })
      }

      return { requests, error: null }
    }

    lastError = error
    logSupabaseError('fetchServiceRequestsForProvider', error, { mode, userId })

    if (!isPostgrestSchemaError(error)) {
      break
    }
  }

  if (lastError) {
    return { requests: [], error: formatOfferFetchError(lastError) }
  }

  return { requests: [], error: null }
}

async function getServiceRequestForProvider(
  offerId: string,
  providerId: string,
): Promise<{
  offer: ReturnType<typeof normalizeOfferRow>
  taskId: TaskId
  customerId: string
  error: string | null
}> {
  const modes = ['with_task', 'plain'] as const

  for (const mode of modes) {
    const response =
      mode === 'with_task'
        ? await supabase
            .from('offers')
            .select('*, tasks(id, customer_id, title, source_service_id)')
            .eq('id', offerId)
            .maybeSingle()
        : await supabase
            .from('offers')
            .select('*')
            .eq('id', offerId)
            .maybeSingle()

    if (response.error) {
      if (!isPostgrestSchemaError(response.error)) {
        return {
          offer: null,
          taskId: '' as TaskId,
          customerId: '',
          error: formatOfferFetchError(response.error),
        }
      }
      continue
    }

    if (!response.data || typeof response.data !== 'object') {
      return {
        offer: null,
        taskId: '' as TaskId,
        customerId: '',
        error: 'Talep bulunamadı.',
      }
    }

    let record = response.data as Record<string, unknown>
    if (!readEmbeddedTaskRow(record)) {
      const [enriched] = await enrichOfferRowsWithTasks([record])
      record = enriched
    }

    const offer = normalizeOfferRow(record)
    if (!offer) {
      return {
        offer: null,
        taskId: '' as TaskId,
        customerId: '',
        error: 'Talep kaydı okunamadı.',
      }
    }

    if (offer.provider_id !== providerId) {
      return {
        offer: null,
        taskId: '' as TaskId,
        customerId: '',
        error: 'Bu talebi yönetme yetkiniz yok.',
      }
    }

    const taskRow = readEmbeddedTaskRow(record)
    let customerId: string | null = null
    const offerMessage = String(record.message ?? offer.message ?? '').trim()
    let isServiceRequest =
      offerMessage === SERVICE_REQUEST_OFFER_MESSAGE ||
      (taskRow != null && isServiceRequestTaskRow(taskRow))

    if (taskRow) {
      customerId =
        taskRow.customer_id != null ? String(taskRow.customer_id) : null
      isServiceRequest =
        isServiceRequest || readSourceServiceId(taskRow) != null
    }

    if (!isServiceRequest) {
      return {
        offer: null,
        taskId: '' as TaskId,
        customerId: '',
        error: 'Bu kayıt bir hizmet talebi değil.',
      }
    }

    if (!customerId) {
      const taskSelects = [
        'customer_id, source_service_id',
        'customer_id',
        '*',
      ] as const

      for (const select of taskSelects) {
        const { data, error } = await supabase
          .from('tasks')
          .select(select)
          .eq('id', offer.task_id)
          .maybeSingle()

        if (error) {
          if (isPostgrestSchemaError(error)) continue
          break
        }

        if (data && typeof data === 'object') {
          const task = data as Record<string, unknown>
          customerId =
            task.customer_id != null ? String(task.customer_id) : null
          isServiceRequest = readSourceServiceId(task) != null
        }
        break
      }
    }

    if (!customerId || !isServiceRequest) {
      return {
        offer: null,
        taskId: '' as TaskId,
        customerId: '',
        error: 'Hizmet talebi doğrulanamadı.',
      }
    }

    return {
      offer,
      taskId: offer.task_id,
      customerId,
      error: null,
    }
  }

  return {
    offer: null,
    taskId: '' as TaskId,
    customerId: '',
    error: 'Talep bulunamadı.',
  }
}

type AcceptServiceRequestRpcRow = {
  offer_id?: string
  task_id?: string
  customer_id?: string
}

function readAcceptServiceRequestRpcRow(
  data: unknown,
): AcceptServiceRequestRpcRow | null {
  if (!data || typeof data !== 'object') return null
  return data as AcceptServiceRequestRpcRow
}

/** Hizmet veren müşteri talebini kabul eder (güvenli RPC). */
export async function acceptServiceRequest(
  offerId: string,
): Promise<OfferActionResult> {
  const auth = await getAuthSessionContext()
  if (!auth.session) {
    return { success: false, error: auth.error ?? 'Oturum bulunamadı.', message: null }
  }

  logServiceRequestStep('acceptServiceRequest.rpc', {
    offerId,
    p_offer_id: offerId,
  })

  const { data, error } = await supabase.rpc('accept_service_request', {
    p_offer_id: offerId,
  })

  logServiceRequestStep('acceptServiceRequest.rpc.result', {
    offerId,
    data,
    error: error?.message ?? null,
    code: error?.code ?? null,
  })

  if (error) {
    logSupabaseError('acceptServiceRequest.rpc', error, { offerId })
    return {
      success: false,
      error: formatRpcError(
        error,
        'Hizmet talebi kabul edilemedi. Lütfen tekrar deneyin.',
      ),
      message: null,
    }
  }

  const result = readAcceptServiceRequestRpcRow(data)
  const taskId =
    result?.task_id != null ? (String(result.task_id) as TaskId) : null
  const customerId =
    result?.customer_id != null ? String(result.customer_id) : null

  if (import.meta.env.DEV) {
    console.info('[service-requests] accepted via rpc', {
      offerId,
      taskId,
      customerId,
    })
  }

  if (customerId && taskId) {
    void notifyServiceRequestAccepted({
      customerId,
      providerId: auth.session.userId,
      offerId,
      taskId,
    })
  }

  return {
    success: true,
    error: null,
    message: 'Hizmet talebi kabul edildi. Mesajlaşma artık kullanılabilir.',
  }
}

/** Hizmet veren müşteri talebini reddeder. */
export async function rejectServiceRequest(
  offerId: string,
): Promise<OfferActionResult> {
  const auth = await getAuthSessionContext()
  if (!auth.session) {
    return { success: false, error: auth.error ?? 'Oturum bulunamadı.', message: null }
  }

  const { offer, taskId, customerId, error: loadError } =
    await getServiceRequestForProvider(offerId, auth.session.userId)

  if (loadError || !offer) {
    return { success: false, error: loadError ?? 'Talep bulunamadı.', message: null }
  }

  if (!canRespondToOffer(offer.status)) {
    return {
      success: false,
      error: 'Yalnızca beklemedeki talepler yanıtlanabilir.',
      message: null,
    }
  }

  const offerUpdate = await updateOfferStatusVerified(
    offerId,
    'rejected',
    'rejectServiceRequest',
  )
  if (!offerUpdate.ok) {
    return { success: false, error: offerUpdate.error, message: null }
  }

  const taskUpdate = await updateTaskStatusVerified(
    taskId,
    'cancelled',
    'rejectServiceRequest',
  )
  if (!taskUpdate.ok) {
    return { success: false, error: taskUpdate.error, message: null }
  }

  if (import.meta.env.DEV) {
    console.info('[service-requests] rejected', { offerId, taskId })
  }

  void notifyServiceRequestRejected({
    customerId,
    providerId: auth.session.userId,
    offerId,
    taskId,
  })

  return {
    success: true,
    error: null,
    message: 'Hizmet talebi reddedildi.',
  }
}

/** Gelen teklif / verilen teklif listelerinden hizmet taleplerini ayıklamak için. */
export async function fetchServiceRequestTaskIdSet(): Promise<Set<string>> {
  return loadServiceRequestTaskIds()
}
