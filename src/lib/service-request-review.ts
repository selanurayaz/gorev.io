import { SERVICE_REQUEST_OFFER_MESSAGE } from '@/lib/service-request-constants'
import { isPostgrestSchemaError } from '@/lib/supabase/errors'
import { supabase } from '@/lib/supabase/client'
import { readSourceServiceId } from '@/lib/task-source'
import type { ServiceId, TaskId } from '@/types/index'

export const SERVICE_REVIEW_LINK_ERROR =
  'Bu değerlendirme ilgili hizmete bağlanamadı. Lütfen tekrar deneyin.'

export type ServiceRequestReviewContext = {
  isServiceRequest: boolean
  serviceId: ServiceId | null
  resolution: string | null
  task: {
    id: TaskId
    source_service_id: string | null
    title: string | null
  }
  offer: {
    id: string
    task_id: string
    service_id: string | null
    message: string | null
  } | null
}

function toRows(data: unknown): Record<string, unknown>[] {
  if (!Array.isArray(data)) return []
  return data.filter(
    (row): row is Record<string, unknown> =>
      row !== null && typeof row === 'object',
  )
}

function readOfferServiceId(row: Record<string, unknown>): string | null {
  const id = row.service_id ?? row.serviceId
  return id != null ? String(id) : null
}

function isServiceRequestOfferMessage(message: unknown): boolean {
  const text = String(message ?? '').trim().toLowerCase()
  const expected = SERVICE_REQUEST_OFFER_MESSAGE.trim().toLowerCase()
  return text === expected || text.includes('hizmet talep')
}

async function fetchAcceptedOfferForTask(
  taskId: TaskId,
  providerId: string,
): Promise<Record<string, unknown> | null> {
  const selects = [
    'id, task_id, service_id, message, provider_id, status',
    'id, task_id, message, provider_id, status',
    '*',
  ] as const

  for (const select of selects) {
    const response = await supabase
      .from('offers')
      .select(select)
      .eq('task_id', taskId)
      .eq('provider_id', providerId)
      .order('created_at', { ascending: false })
      .limit(5)

    if (response.error) {
      if (isPostgrestSchemaError(response.error)) continue
      return null
    }

    const accepted = toRows(response.data).find((row) => {
      const status = String(row.status ?? '').toLowerCase()
      return status === 'accepted'
    })

    if (accepted) return accepted

    const latest = toRows(response.data)[0]
    if (latest) return latest
  }

  return null
}

async function fetchTaskRowForServiceLink(
  taskId: TaskId,
): Promise<Record<string, unknown> | null> {
  const selects = [
    'id, title, source_service_id, customer_id',
    'id, title, customer_id',
    '*',
  ] as const

  for (const select of selects) {
    const response = await supabase
      .from('tasks')
      .select(select)
      .eq('id', taskId)
      .maybeSingle()

    if (!response.error && response.data && typeof response.data === 'object') {
      return response.data as Record<string, unknown>
    }

    if (response.error && !isPostgrestSchemaError(response.error)) {
      return null
    }
  }

  return null
}

async function resolveServiceIdByProviderAndTaskTitle(
  providerId: string,
  taskTitle: string | null,
): Promise<ServiceId | null> {
  const title = taskTitle?.trim()
  if (!title) return null

  const response = await supabase
    .from('services')
    .select('id, title, provider_id, is_active')
    .eq('provider_id', providerId)
    .eq('title', title)
    .eq('is_active', true)
    .limit(1)
    .maybeSingle()

  if (response.error || !response.data || typeof response.data !== 'object') {
    return null
  }

  const id = (response.data as { id?: unknown }).id
  return id != null ? (String(id) as ServiceId) : null
}

/** Hizmet talebi değerlendirmesi için service_id ve bağlam çözümlemesi. */
export async function resolveServiceRequestReviewContext(
  taskId: TaskId,
  providerId: string,
  inputServiceId?: ServiceId | null,
): Promise<ServiceRequestReviewContext> {
  const taskRow = await fetchTaskRowForServiceLink(taskId)
  const offerRow = await fetchAcceptedOfferForTask(taskId, providerId)

  const task = {
    id: taskId,
    source_service_id: taskRow ? readSourceServiceId(taskRow) : null,
    title:
      taskRow?.title != null ? String(taskRow.title) : null,
  }

  const offer = offerRow
    ? {
        id: String(offerRow.id ?? ''),
        task_id: String(offerRow.task_id ?? offerRow.taskId ?? taskId),
        service_id: readOfferServiceId(offerRow),
        message:
          offerRow.message != null ? String(offerRow.message) : null,
      }
    : null

  const titleMatch = await resolveServiceIdByProviderAndTaskTitle(
    providerId,
    task.title,
  )

  const isServiceRequest = Boolean(
    (offer?.message && isServiceRequestOfferMessage(offer.message)) ||
      offer?.service_id ||
      task.source_service_id ||
      titleMatch,
  )

  const candidates: Array<{ id: ServiceId; resolution: string }> = []
  const seen = new Set<string>()

  const addCandidate = (id: ServiceId, resolution: string) => {
    const key = id.trim().toLowerCase()
    if (seen.has(key)) return
    seen.add(key)
    candidates.push({ id, resolution })
  }

  if (task.source_service_id) {
    addCandidate(task.source_service_id as ServiceId, 'task.source_service_id')
  }

  if (inputServiceId) {
    addCandidate(inputServiceId, 'input.service_id')
  }

  if (offer?.service_id) {
    addCandidate(offer.service_id as ServiceId, 'offer.service_id')
  }

  if (isServiceRequest && titleMatch) {
    addCandidate(titleMatch, 'services.title+provider_id')
  }

  const winner = candidates[0] ?? null

  return {
    isServiceRequest,
    serviceId: winner?.id ?? null,
    resolution: winner?.resolution ?? null,
    task,
    offer,
  }
}

export function logReviewInsertContext(
  context: ServiceRequestReviewContext,
  insertPayload: Record<string, unknown>,
): void {
  console.info('[reviews] insert payload', {
    payload: insertPayload,
    task: {
      id: context.task.id,
      source_service_id: context.task.source_service_id,
      title: context.task.title,
    },
    offer: context.offer
      ? {
          id: context.offer.id,
          task_id: context.offer.task_id,
          service_id: context.offer.service_id,
          message: context.offer.message,
        }
      : null,
    resolvedServiceId: insertPayload.service_id ?? null,
    resolution: context.resolution,
    isServiceRequest: context.isServiceRequest,
  })
}
