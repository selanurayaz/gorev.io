import type { PostgrestError } from '@supabase/supabase-js'

import {
  enrichServiceListItem,
  normalizeServiceListRow,
  normalizeServiceRow,
} from '@/lib/service-mapper'
import { sortTasksNewestFirst } from '@/lib/task-list-utils'
import {
  formatServiceCreateError,
  formatServiceFetchError,
  isPostgrestSchemaError,
  logSupabaseError,
} from '@/lib/supabase/errors'
import { getAuthSessionContext } from '@/lib/supabase/session'
import { supabase } from '@/lib/supabase/client'
import type {
  Service,
  ServiceCreateInput,
  ServiceListItem,
} from '@/types/service'

export type CreateServiceResult = {
  service: Service | null
  error: string | null
}

export type FetchMyServicesResult = {
  services: ServiceListItem[]
  error: string | null
}

type ServiceQueryMode = 'with_category' | 'plain'

function buildServiceInsertPayload(
  providerId: string,
  input: ServiceCreateInput,
): Record<string, unknown> {
  return {
    provider_id: providerId,
    title: input.title,
    description: input.description,
    category_id: input.category_id,
    city: input.city,
    base_price: input.base_price,
    is_active: input.is_active,
  }
}

function toServiceRows(data: unknown): Record<string, unknown>[] {
  if (!Array.isArray(data)) return []
  return data.filter(
    (row): row is Record<string, unknown> =>
      row !== null && typeof row === 'object',
  )
}

async function queryProviderServices(
  providerId: string,
  mode: ServiceQueryMode,
): Promise<{ rows: Record<string, unknown>[]; error: PostgrestError | null }> {
  const response =
    mode === 'with_category'
      ? await supabase
          .from('services')
          .select('*, categories(name)')
          .eq('provider_id', providerId)
          .order('created_at', { ascending: false })
      : await supabase
          .from('services')
          .select('*')
          .eq('provider_id', providerId)
          .order('created_at', { ascending: false })

  if (response.error) {
    return { rows: [], error: response.error }
  }

  return { rows: toServiceRows(response.data), error: null }
}

function mapServiceRows(
  rows: Record<string, unknown>[],
  categoryNames: Map<string, string>,
): ServiceListItem[] {
  return rows
    .map((row) => normalizeServiceListRow(row, categoryNames))
    .filter((service): service is ServiceListItem => service !== null)
}

/**
 * Oturum açmış kullanıcı için `services` tablosuna yeni hizmet ekler.
 * `provider_id` = Auth kullanıcı UUID'si.
 */
export async function createService(
  input: ServiceCreateInput,
): Promise<CreateServiceResult> {
  const auth = await getAuthSessionContext()
  if (!auth.session) {
    return { service: null, error: auth.error ?? 'Oturum bulunamadı.' }
  }

  const { userId } = auth.session
  const payload = buildServiceInsertPayload(userId, input)

  const { data, error } = await supabase
    .from('services')
    .insert(payload)
    .select('*')
    .single()

  if (error) {
    logSupabaseError('createService', error, { userId })
    return { service: null, error: formatServiceCreateError(error) }
  }

  if (!data || typeof data !== 'object') {
    return {
      service: null,
      error: 'Hizmet oluşturuldu ancak yanıt alınamadı.',
    }
  }

  const service = normalizeServiceRow(data as Record<string, unknown>)
  if (!service) {
    return { service: null, error: 'Hizmet kaydı doğrulanamadı.' }
  }

  if (import.meta.env.DEV) {
    console.info('[services] created', {
      serviceId: service.id,
      providerId: userId,
    })
  }

  return { service, error: null }
}

/**
 * Oturum açmış kullanıcının hizmetlerini getirir (`provider_id` = Auth UUID).
 */
export async function fetchMyServices(
  categoryNames: Map<string, string> = new Map(),
): Promise<FetchMyServicesResult> {
  const auth = await getAuthSessionContext()
  if (!auth.session) {
    return { services: [], error: auth.error ?? 'Oturum bulunamadı.' }
  }

  const { userId } = auth.session
  const modes: ServiceQueryMode[] = ['with_category', 'plain']
  let lastError: PostgrestError | null = null

  for (const mode of modes) {
    const { rows, error } = await queryProviderServices(userId, mode)

    if (!error) {
      const services = sortTasksNewestFirst(mapServiceRows(rows, categoryNames))
      if (import.meta.env.DEV) {
        console.info('[services] fetched', {
          count: services.length,
          mode,
          userId,
        })
      }
      return { services, error: null }
    }

    lastError = error
    logSupabaseError('fetchMyServices', error, { mode, userId })

    if (!isPostgrestSchemaError(error)) {
      break
    }
  }

  if (lastError) {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('provider_id', userId)

    if (!error) {
      const services = sortTasksNewestFirst(
        toServiceRows(data)
          .map((row) => normalizeServiceRow(row))
          .filter((service): service is Service => service !== null)
          .map((service) => enrichServiceListItem(service, categoryNames)),
      )
      return { services, error: null }
    }

    return { services: [], error: formatServiceFetchError(lastError) }
  }

  return { services: [], error: null }
}
