import type {
  MarketplaceService,
  Service,
  ServiceListItem,
} from '@/types/service'

function readEmbeddedProviderName(row: Record<string, unknown>): string | null {
  const embedded = row.profiles ?? row.profile ?? row.provider

  if (!embedded) return null

  const readName = (obj: Record<string, unknown>) =>
    obj.full_name ?? obj.fullName ?? obj.display_name ?? obj.name

  if (Array.isArray(embedded)) {
    const first = embedded[0]
    if (first && typeof first === 'object') {
      const name = readName(first as Record<string, unknown>)
      return name != null ? String(name).trim() || null : null
    }
    return null
  }

  if (typeof embedded === 'object' && embedded !== null) {
    const name = readName(embedded as Record<string, unknown>)
    return name != null ? String(name).trim() || null : null
  }

  return null
}

function readEmbeddedCategoryName(
  row: Record<string, unknown>,
): string | null {
  const embedded = row.categories ?? row.category

  if (!embedded) return null

  if (Array.isArray(embedded)) {
    const first = embedded[0]
    if (first && typeof first === 'object' && 'name' in first) {
      return String((first as Record<string, unknown>).name)
    }
    return null
  }

  if (typeof embedded === 'object' && embedded !== null && 'name' in embedded) {
    return String((embedded as Record<string, unknown>).name)
  }

  return null
}

function readBoolean(value: unknown, fallback = false): boolean {
  if (value === true || value === 'true' || value === 1) return true
  if (value === false || value === 'false' || value === 0) return false
  return fallback
}

function readPrice(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (value == null) return null
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

export function normalizeServiceRow(row: Record<string, unknown>): Service | null {
  const id = row.id
  if (id === undefined || id === null) return null

  const providerId = row.provider_id ?? row.user_id ?? row.owner_id

  return {
    id: String(id),
    provider_id: providerId != null ? String(providerId) : '',
    title: String(row.title ?? ''),
    description: row.description != null ? String(row.description) : null,
    category_id:
      row.category_id != null
        ? String(row.category_id)
        : row.category != null
          ? String(row.category)
          : null,
    city: row.city != null ? String(row.city) : null,
    base_price: readPrice(row.base_price ?? row.price ?? row.basePrice),
    is_active: readBoolean(row.is_active ?? row.isActive ?? row.active, true),
    created_at: row.created_at != null ? String(row.created_at) : undefined,
  }
}

export function enrichServiceListItem(
  service: Service,
  categoryNames: Map<string, string>,
  embeddedCategoryName?: string | null,
): ServiceListItem {
  const category_name =
    embeddedCategoryName ??
    (service.category_id
      ? categoryNames.get(service.category_id) ?? null
      : null)

  return { ...service, category_name }
}

export function normalizeServiceListRow(
  row: Record<string, unknown>,
  categoryNames: Map<string, string>,
): ServiceListItem | null {
  const service = normalizeServiceRow(row)
  if (!service) return null

  return enrichServiceListItem(
    service,
    categoryNames,
    readEmbeddedCategoryName(row),
  )
}

export function enrichMarketplaceService(
  service: ServiceListItem,
  providerNames: Map<string, string>,
  embeddedProviderName?: string | null,
): MarketplaceService {
  const provider_name =
    embeddedProviderName ??
    (service.provider_id
      ? providerNames.get(service.provider_id) ?? null
      : null)

  return { ...service, provider_name }
}

export function normalizeMarketplaceServiceRow(
  row: Record<string, unknown>,
  categoryNames: Map<string, string>,
  providerNames: Map<string, string> = new Map(),
): MarketplaceService | null {
  const listItem = normalizeServiceListRow(row, categoryNames)
  if (!listItem) return null

  return enrichMarketplaceService(
    listItem,
    providerNames,
    readEmbeddedProviderName(row),
  )
}
