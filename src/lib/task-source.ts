import type { PostgrestError } from '@supabase/supabase-js'

import { isPostgrestSchemaError } from '@/lib/supabase/errors'
import { supabase } from '@/lib/supabase/client'
import { SERVICE_REQUEST_OFFER_MESSAGE } from '@/lib/service-request-constants'
import type { ServiceId, TaskId } from '@/types/index'

/** Görevin bir hizmet talebinden türeyip türemediğini okur. */
export function readSourceServiceId(
  row: Record<string, unknown>,
): string | null {
  const id = row.source_service_id ?? row.sourceServiceId

  return id != null ? String(id) : null
}

export function isServiceRequestTaskRow(
  row: Record<string, unknown>,
): boolean {
  return readSourceServiceId(row) != null
}

function toTaskRows(data: unknown): Record<string, unknown>[] {
  if (!Array.isArray(data)) return []
  return data.filter(
    (row): row is Record<string, unknown> =>
      row !== null && typeof row === 'object',
  )
}

/** Şema uyumlu görev satırı okuma — source_service_id yoksa daha dar select dener. */
export async function fetchTaskRowById(
  taskId: TaskId,
  selects: readonly string[],
): Promise<{ row: Record<string, unknown> | null; error: PostgrestError | null }> {
  let lastError: PostgrestError | null = null

  for (const select of selects) {
    const response = await supabase
      .from('tasks')
      .select(select)
      .eq('id', taskId)
      .maybeSingle()

    if (!response.error) {
      if (!response.data || typeof response.data !== 'object') {
        return { row: null, error: null }
      }
      return { row: response.data as Record<string, unknown>, error: null }
    }

    lastError = response.error
    if (!isPostgrestSchemaError(response.error)) {
      return { row: null, error: response.error }
    }
  }

  return { row: null, error: lastError }
}

const TASK_REVIEW_SELECTS = [
  'id, customer_id, status, source_service_id',
  'id, customer_id, status',
  '*',
] as const

/** Değerlendirme akışı için görev satırı (source_service_id dahil, mümkünse). */
export async function fetchTaskRowForReview(
  taskId: TaskId,
): Promise<{ row: Record<string, unknown> | null; error: PostgrestError | null }> {
  return fetchTaskRowById(taskId, TASK_REVIEW_SELECTS)
}

/** Hizmet talebi teklifinden service_id okur (eski görevler için yedek). */
export async function resolveServiceIdFromServiceRequestOffer(
  taskId: TaskId,
): Promise<ServiceId | null> {
  const response = await supabase
    .from('offers')
    .select('service_id, message')
    .eq('task_id', taskId)
    .limit(10)

  if (response.error) {
    return null
  }

  for (const row of toTaskRows(response.data)) {
    if (String(row.message ?? '').trim() !== SERVICE_REQUEST_OFFER_MESSAGE) {
      continue
    }

    const serviceId = row.service_id ?? row.serviceId
    if (serviceId != null) {
      return String(serviceId) as ServiceId
    }
  }

  return null
}

function normalizeServiceIdKey(id: string): string {
  return id.trim().toLowerCase()
}

/** Görevin source_service_id değerinin beklenen hizmetle eşleştiğini doğrular. */
export async function verifyTaskSourceServiceId(
  taskId: TaskId,
  expectedServiceId: ServiceId,
): Promise<boolean> {
  const expected = normalizeServiceIdKey(expectedServiceId)

  for (const select of ['id, source_service_id', '*'] as const) {
    const response = await supabase
      .from('tasks')
      .select(select)
      .eq('id', taskId)
      .maybeSingle()

    if (response.error) {
      if (isPostgrestSchemaError(response.error)) continue
      return false
    }

    if (!response.data || typeof response.data !== 'object') {
      return false
    }

    const actual = readSourceServiceId(response.data as Record<string, unknown>)
    if (actual != null && normalizeServiceIdKey(actual) === expected) {
      return true
    }
  }

  return false
}

/** Görevin kaynak hizmet bağlantısını doğrular; eksikse yazar. */
export async function ensureTaskHasSourceServiceId(
  taskId: TaskId,
  serviceId: ServiceId,
): Promise<{ ok: boolean; error: PostgrestError | null }> {
  const { row, error: readError } = await fetchTaskRowById(taskId, [
    'id, source_service_id',
    '*',
  ])

  if (readError) {
    return { ok: false, error: readError }
  }

  if (!row) {
    return { ok: false, error: null }
  }

  const current = readSourceServiceId(row)
  if (
    current != null &&
    normalizeServiceIdKey(current) === normalizeServiceIdKey(serviceId)
  ) {
    return { ok: true, error: null }
  }

  if (current != null) {
    return { ok: true, error: null }
  }

  const update = await supabase
    .from('tasks')
    .update({ source_service_id: serviceId })
    .eq('id', taskId)
    .select('id, source_service_id')
    .maybeSingle()

  if (update.error) {
    return { ok: false, error: update.error }
  }

  const verified = await verifyTaskSourceServiceId(taskId, serviceId)
  return { ok: verified, error: null }
}

/** Müşteri + hizmet için açık hizmet talebi görevini bulur. */
export async function findOpenServiceRequestTaskId(
  customerId: string,
  serviceId: string,
  openStatuses: readonly string[],
): Promise<TaskId | null> {
  const response = await supabase
    .from('tasks')
    .select('id, status, source_service_id')
    .eq('customer_id', customerId)
    .eq('source_service_id', serviceId)
    .order('created_at', { ascending: false })
    .limit(5)

  if (response.error) {
    if (isPostgrestSchemaError(response.error)) {
      return null
    }
    return null
  }

  const openRow = toTaskRows(response.data).find((row) => {
    const status = String(row.status ?? '').toLowerCase()
    return openStatuses.some((value) => value === status)
  })

  if (openRow?.id != null) {
    return String(openRow.id) as TaskId
  }

  return null
}

/** Teklif mesajından hizmet talebi görev kimliklerini toplar. */
export async function loadServiceRequestTaskIdsFromOffers(): Promise<Set<string>> {
  const response = await supabase
    .from('offers')
    .select('task_id, message')
    .not('task_id', 'is', null)

  if (response.error) {
    return new Set()
  }

  const ids = new Set<string>()
  for (const row of toTaskRows(response.data)) {
    const message = String(row.message ?? '').trim()
    if (
      message === SERVICE_REQUEST_OFFER_MESSAGE &&
      row.task_id != null
    ) {
      ids.add(String(row.task_id))
    }
  }

  return ids
}

/** Hizmet talebi görev kimlikleri (source_service_id + teklif mesajı). */
export async function loadAllServiceRequestTaskIds(): Promise<Set<string>> {
  const [fromSource, fromOffers] = await Promise.all([
    loadServiceRequestTaskIds(),
    loadServiceRequestTaskIdsFromOffers(),
  ])

  return new Set([...fromSource, ...fromOffers])
}

/** Hizmet talebinden türeyen görev kimliklerini toplar. */
export async function loadServiceRequestTaskIds(): Promise<Set<string>> {
  const response = await supabase
    .from('tasks')
    .select('id, source_service_id')
    .not('source_service_id', 'is', null)

  if (response.error) {
    return new Set()
  }

  const ids = new Set<string>()
  for (const row of toTaskRows(response.data)) {
    if (row.id != null && readSourceServiceId(row) != null) {
      ids.add(String(row.id))
    }
  }

  return ids
}
