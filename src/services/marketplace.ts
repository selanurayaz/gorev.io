import type { PostgrestError } from '@supabase/supabase-js'

import { normalizeMarketplaceServiceRow } from '@/lib/service-mapper'
import { isServiceRequestTaskRow } from '@/lib/task-source'
import { normalizeMarketplaceTaskRow } from '@/lib/task-mapper'
import { sortTasksNewestFirst } from '@/lib/task-list-utils'
import {
  formatServiceFetchError,
  formatTaskFetchError,
  isPostgrestSchemaError,
  logSupabaseError,
} from '@/lib/supabase/errors'
import { supabase } from '@/lib/supabase/client'
import { fetchProfileNamesByIds } from '@/services/profiles'
import { fetchServiceRatingSummariesByIds } from '@/services/reviews'
import type { MarketplaceService } from '@/types/service'
import type { MarketplaceTask } from '@/types/task'

export type FetchMarketplaceTasksResult = {
  tasks: MarketplaceTask[]
  error: string | null
}

type OpenTaskQueryMode = 'full' | 'with_category' | 'plain'

function toTaskRows(data: unknown): Record<string, unknown>[] {
  if (!Array.isArray(data)) return []
  return data.filter(
    (row): row is Record<string, unknown> =>
      row !== null && typeof row === 'object',
  )
}

async function queryOpenTasks(
  mode: OpenTaskQueryMode,
): Promise<{ rows: Record<string, unknown>[]; error: PostgrestError | null }> {
  const response =
    mode === 'full'
      ? await supabase
          .from('tasks')
          .select('*, categories(name), profiles(full_name)')
          .eq('status', 'open')
          .order('created_at', { ascending: false })
      : mode === 'with_category'
        ? await supabase
            .from('tasks')
            .select('*, categories(name)')
            .eq('status', 'open')
            .order('created_at', { ascending: false })
        : await supabase
            .from('tasks')
            .select('*')
            .eq('status', 'open')
            .order('created_at', { ascending: false })

  if (response.error) {
    return { rows: [], error: response.error }
  }

  return { rows: toTaskRows(response.data), error: null }
}

function mapMarketplaceRows(
  rows: Record<string, unknown>[],
  categoryNames: Map<string, string>,
  ownerNames: Map<string, string>,
): MarketplaceTask[] {
  return rows
    .filter((row) => !isServiceRequestTaskRow(row))
    .map((row) =>
      normalizeMarketplaceTaskRow(row, categoryNames, ownerNames),
    )
    .filter((task): task is MarketplaceTask => task !== null)
}

async function attachMissingOwnerNames(
  tasks: MarketplaceTask[],
  ownerNames: Map<string, string>,
): Promise<Map<string, string>> {
  const missingIds = [
    ...new Set(
      tasks
        .filter((task) => !task.owner_name && task.customer_id)
        .map((task) => task.customer_id),
    ),
  ].filter((id) => !ownerNames.has(id))

  if (missingIds.length === 0) return ownerNames

  const fetched = await fetchProfileNamesByIds(missingIds)
  return new Map([...ownerNames, ...fetched])
}

/**
 * `status = 'open'` olan tüm görevleri getirir (marketplace keşif).
 * En yeni görevler önce sıralanır.
 */
export async function fetchOpenMarketplaceTasks(
  categoryNames: Map<string, string> = new Map(),
): Promise<FetchMarketplaceTasksResult> {
  const modes: OpenTaskQueryMode[] = ['full', 'with_category', 'plain']
  let lastError: PostgrestError | null = null

  for (const mode of modes) {
    const { rows, error } = await queryOpenTasks(mode)

    if (!error) {
      let ownerNames = new Map<string, string>()
      let tasks = mapMarketplaceRows(rows, categoryNames, ownerNames)

      ownerNames = await attachMissingOwnerNames(tasks, ownerNames)
      if (ownerNames.size > 0) {
        tasks = tasks.map((task) =>
          task.owner_name
            ? task
            : {
                ...task,
                owner_name: ownerNames.get(task.customer_id) ?? null,
              },
        )
      }

      const sorted = sortTasksNewestFirst(tasks)

      if (import.meta.env.DEV) {
        console.info('[marketplace] fetched open tasks', {
          count: sorted.length,
          mode,
        })
      }

      return { tasks: sorted, error: null }
    }

    lastError = error
    logSupabaseError('fetchOpenMarketplaceTasks', error, { mode })

    if (!isPostgrestSchemaError(error)) {
      break
    }
  }

  if (lastError) {
    return { tasks: [], error: formatTaskFetchError(lastError) }
  }

  return { tasks: [], error: null }
}

export type FetchMarketplaceServicesResult = {
  services: MarketplaceService[]
  error: string | null
}

type ActiveServiceQueryMode = 'full' | 'with_category' | 'plain'

function toServiceRows(data: unknown): Record<string, unknown>[] {
  if (!Array.isArray(data)) return []
  return data.filter(
    (row): row is Record<string, unknown> =>
      row !== null && typeof row === 'object',
  )
}

async function queryActiveServices(
  mode: ActiveServiceQueryMode,
): Promise<{ rows: Record<string, unknown>[]; error: PostgrestError | null }> {
  const response =
    mode === 'full'
      ? await supabase
          .from('services')
          .select('*, categories(name), profiles(full_name)')
          .eq('is_active', true)
          .order('created_at', { ascending: false })
      : mode === 'with_category'
        ? await supabase
            .from('services')
            .select('*, categories(name)')
            .eq('is_active', true)
            .order('created_at', { ascending: false })
        : await supabase
            .from('services')
            .select('*')
            .eq('is_active', true)
            .order('created_at', { ascending: false })

  if (response.error) {
    return { rows: [], error: response.error }
  }

  return { rows: toServiceRows(response.data), error: null }
}

function mapMarketplaceServiceRows(
  rows: Record<string, unknown>[],
  categoryNames: Map<string, string>,
  providerNames: Map<string, string>,
): MarketplaceService[] {
  return rows
    .map((row) =>
      normalizeMarketplaceServiceRow(row, categoryNames, providerNames),
    )
    .filter((service): service is MarketplaceService => service !== null)
    .filter((service) => service.is_active)
}

async function attachMissingProviderNames(
  services: MarketplaceService[],
  providerNames: Map<string, string>,
): Promise<Map<string, string>> {
  const missingIds = [
    ...new Set(
      services
        .filter((service) => !service.provider_name && service.provider_id)
        .map((service) => service.provider_id),
    ),
  ].filter((id) => !providerNames.has(id))

  if (missingIds.length === 0) return providerNames

  const fetched = await fetchProfileNamesByIds(missingIds)
  return new Map([...providerNames, ...fetched])
}

/**
 * `is_active = true` olan tüm hizmetleri getirir (marketplace keşif).
 */
export async function fetchActiveMarketplaceServices(
  categoryNames: Map<string, string> = new Map(),
): Promise<FetchMarketplaceServicesResult> {
  const modes: ActiveServiceQueryMode[] = ['full', 'with_category', 'plain']
  let lastError: PostgrestError | null = null

  for (const mode of modes) {
    const { rows, error } = await queryActiveServices(mode)

    if (!error) {
      let providerNames = new Map<string, string>()
      let services = mapMarketplaceServiceRows(
        rows,
        categoryNames,
        providerNames,
      )

      providerNames = await attachMissingProviderNames(services, providerNames)
      if (providerNames.size > 0) {
        services = services.map((service) =>
          service.provider_name
            ? service
            : {
                ...service,
                provider_name:
                  providerNames.get(service.provider_id) ?? null,
              },
        )
      }

      const serviceIds = services.map((service) => service.id)
      const ratingSummaries =
        await fetchServiceRatingSummariesByIds(serviceIds)

      services = services.map((service) => ({
        ...service,
        provider_rating:
          ratingSummaries.get(service.id) ?? {
            averageRating: null,
            reviewCount: 0,
          },
      }))

      const sorted = sortTasksNewestFirst(services)

      if (import.meta.env.DEV) {
        console.info('[marketplace] fetched active services', {
          count: sorted.length,
          mode,
        })
      }

      return { services: sorted, error: null }
    }

    lastError = error
    logSupabaseError('fetchActiveMarketplaceServices', error, { mode })

    if (!isPostgrestSchemaError(error)) {
      break
    }
  }

  if (lastError) {
    return { services: [], error: formatServiceFetchError(lastError) }
  }

  return { services: [], error: null }
}

export type FetchServiceDetailResult = {
  service: MarketplaceService | null
  error: string | null
}

type ServiceDetailQueryMode = 'full' | 'with_category' | 'plain'

async function queryServiceById(
  serviceId: string,
  mode: ServiceDetailQueryMode,
): Promise<{ row: Record<string, unknown> | null; error: PostgrestError | null }> {
  const response =
    mode === 'full'
      ? await supabase
          .from('services')
          .select('*, categories(name), profiles(full_name)')
          .eq('id', serviceId)
          .maybeSingle()
      : mode === 'with_category'
        ? await supabase
            .from('services')
            .select('*, categories(name)')
            .eq('id', serviceId)
            .maybeSingle()
        : await supabase
            .from('services')
            .select('*')
            .eq('id', serviceId)
            .maybeSingle()

  if (response.error) {
    return { row: null, error: response.error }
  }

  if (!response.data || typeof response.data !== 'object') {
    return { row: null, error: null }
  }

  return { row: response.data as Record<string, unknown>, error: null }
}

/** Tekil hizmet detayı (marketplace / talep akışı). */
export async function fetchServiceDetailById(
  serviceId: string,
  categoryNames: Map<string, string> = new Map(),
): Promise<FetchServiceDetailResult> {
  const modes: ServiceDetailQueryMode[] = ['full', 'with_category', 'plain']
  let lastError: PostgrestError | null = null

  for (const mode of modes) {
    const { row, error } = await queryServiceById(serviceId, mode)

    if (!error) {
      if (!row) {
        return { service: null, error: null }
      }

      let providerNames = new Map<string, string>()
      let service = normalizeMarketplaceServiceRow(row, categoryNames, providerNames)

      if (!service || !service.is_active) {
        return { service: null, error: null }
      }

      if (!service.provider_name && service.provider_id) {
        providerNames = await fetchProfileNamesByIds([service.provider_id])
        const name = providerNames.get(service.provider_id) ?? null
        service = { ...service, provider_name: name }
      }

      const ratingSummaries = await fetchServiceRatingSummariesByIds([
        service.id,
      ])

      service = {
        ...service,
        provider_rating:
          ratingSummaries.get(service.id) ?? {
            averageRating: null,
            reviewCount: 0,
          },
      }

      if (import.meta.env.DEV) {
        console.info('[marketplace] service detail loaded', {
          serviceId,
          mode,
          found: true,
        })
      }

      return { service, error: null }
    }

    lastError = error
    logSupabaseError('fetchServiceDetailById', error, { mode, serviceId })

    if (!isPostgrestSchemaError(error)) {
      break
    }
  }

  if (lastError) {
    return { service: null, error: formatServiceFetchError(lastError) }
  }

  return { service: null, error: null }
}
