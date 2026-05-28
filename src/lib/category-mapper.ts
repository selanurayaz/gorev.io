import type { ServiceCategory } from '@/types/category'

export function normalizeCategoryRow(
  row: Record<string, unknown>,
): ServiceCategory | null {
  const id = row.id
  if (id === undefined || id === null) return null

  const name =
    row.name ?? row.title ?? row.label ?? row.category_name ?? null

  if (name === undefined || name === null || String(name).trim() === '') {
    return null
  }

  const sortOrder = row.sort_order ?? row.position ?? row.order

  return {
    id: String(id),
    name: String(name).trim(),
    slug: row.slug != null ? String(row.slug) : null,
    sort_order:
      typeof sortOrder === 'number'
        ? sortOrder
        : sortOrder != null
          ? Number(sortOrder)
          : null,
  }
}
