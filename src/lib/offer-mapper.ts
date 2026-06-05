import type {
  AcceptedWorkItem,
  IncomingOfferItem,
  Offer,
  OfferListItem,
  SubmittedOfferItem,
} from '@/types/offer'

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

export function normalizeOfferRow(row: Record<string, unknown>): Offer | null {
  const id = row.id
  const taskId = row.task_id ?? row.taskId
  const providerId = row.provider_id ?? row.providerId ?? row.user_id

  if (id == null || taskId == null || providerId == null) return null

  const rawPrice = row.price ?? row.amount ?? row.offer_price
  const price =
    typeof rawPrice === 'number'
      ? rawPrice
      : rawPrice != null
        ? Number(rawPrice)
        : NaN

  if (!Number.isFinite(price)) return null

  const message =
    row.message ?? row.description ?? row.note ?? row.body ?? null

  return {
    id: String(id),
    task_id: String(taskId),
    provider_id: String(providerId),
    price,
    message: message != null ? String(message) : null,
    status: row.status != null ? String(row.status) : null,
    created_at: row.created_at != null ? String(row.created_at) : undefined,
  }
}

export function normalizeOfferListRow(
  row: Record<string, unknown>,
  providerNames: Map<string, string> = new Map(),
): OfferListItem | null {
  const offer = normalizeOfferRow(row)
  if (!offer) return null

  const provider_name =
    readEmbeddedProviderName(row) ??
    providerNames.get(offer.provider_id) ??
    null

  return { ...offer, provider_name }
}

type EmbeddedTaskFields = {
  title: string | null
  city: string | null
  customer_id: string | null
  status: string | null
  category_name: string | null
}

function readEmbeddedCategoryName(
  task: Record<string, unknown>,
): string | null {
  const embedded = task.categories ?? task.category

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

function readEmbeddedTask(row: Record<string, unknown>): EmbeddedTaskFields {
  const embedded = row.tasks ?? row.task

  if (!embedded) {
    return {
      title: null,
      city: null,
      customer_id: null,
      status: null,
      category_name: null,
    }
  }

  const read = (obj: Record<string, unknown>): EmbeddedTaskFields => ({
    title:
      obj.title != null
        ? String(obj.title)
        : obj.name != null
          ? String(obj.name)
          : null,
    city: obj.city != null ? String(obj.city) : null,
    customer_id:
      obj.customer_id != null
        ? String(obj.customer_id)
        : obj.user_id != null
          ? String(obj.user_id)
          : null,
    status: obj.status != null ? String(obj.status) : null,
    category_name: readEmbeddedCategoryName(obj),
  })

  if (Array.isArray(embedded)) {
    const first = embedded[0]
    if (first && typeof first === 'object') {
      return read(first as Record<string, unknown>)
    }
    return {
      title: null,
      city: null,
      customer_id: null,
      status: null,
      category_name: null,
    }
  }

  if (typeof embedded === 'object' && embedded !== null) {
    return read(embedded as Record<string, unknown>)
  }

  return {
    title: null,
    city: null,
    customer_id: null,
    status: null,
    category_name: null,
  }
}

export function normalizeIncomingOfferRow(
  row: Record<string, unknown>,
  providerNames: Map<string, string> = new Map(),
): IncomingOfferItem | null {
  const offer = normalizeOfferListRow(row, providerNames)
  if (!offer) return null

  const task = readEmbeddedTask(row)
  const task_title = task.title?.trim() || 'Görev'

  return { ...offer, task_title }
}

export function normalizeSubmittedOfferRow(
  row: Record<string, unknown>,
): SubmittedOfferItem | null {
  const offer = normalizeOfferRow(row)
  if (!offer) return null

  const task = readEmbeddedTask(row)

  return {
    ...offer,
    task_title: task.title?.trim() || 'Görev',
    task_city: task.city?.trim() || null,
  }
}

export function readOfferEmbeddedCustomerId(
  row: Record<string, unknown>,
): string | null {
  return readEmbeddedTask(row).customer_id
}

export function normalizeAcceptedWorkRow(
  row: Record<string, unknown>,
  customerNames: Map<string, string> = new Map(),
): AcceptedWorkItem | null {
  const offer = normalizeOfferRow(row)
  if (!offer) return null

  const task = readEmbeddedTask(row)
  const customerId = task.customer_id

  return {
    ...offer,
    task_title: task.title?.trim() || 'Görev',
    task_city: task.city?.trim() || null,
    task_status: task.status,
    task_category_name: task.category_name,
    customer_name:
      customerId != null ? (customerNames.get(customerId) ?? null) : null,
  }
}
