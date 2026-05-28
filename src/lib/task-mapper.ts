import type { Task, TaskListItem } from '@/types/task'

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

export function normalizeTaskRow(row: Record<string, unknown>): Task | null {
  const id = row.id
  if (id === undefined || id === null) return null

  const customerId = row.customer_id ?? row.user_id ?? row.owner_id

  return {
    id: String(id),
    customer_id: customerId != null ? String(customerId) : '',
    title: String(row.title ?? ''),
    description: row.description != null ? String(row.description) : null,
    category_id:
      row.category_id != null
        ? String(row.category_id)
        : row.category != null
          ? String(row.category)
          : null,
    city: row.city != null ? String(row.city) : null,
    budget_min:
      typeof row.budget_min === 'number'
        ? row.budget_min
        : row.budget_min != null
          ? Number(row.budget_min)
          : null,
    budget_max:
      typeof row.budget_max === 'number'
        ? row.budget_max
        : row.budget_max != null
          ? Number(row.budget_max)
          : null,
    status: row.status != null ? String(row.status) : null,
    created_at: row.created_at != null ? String(row.created_at) : undefined,
  }
}

export function enrichTaskListItem(
  task: Task,
  categoryNames: Map<string, string>,
  embeddedCategoryName?: string | null,
): TaskListItem {
  const category_name =
    embeddedCategoryName ??
    (task.category_id ? categoryNames.get(task.category_id) ?? null : null)

  return { ...task, category_name }
}

export function normalizeTaskListRow(
  row: Record<string, unknown>,
  categoryNames: Map<string, string>,
): TaskListItem | null {
  const task = normalizeTaskRow(row)
  if (!task) return null

  return enrichTaskListItem(
    task,
    categoryNames,
    readEmbeddedCategoryName(row),
  )
}
