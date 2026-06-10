import type { Profile } from '@/types/profile'

function pickString(
  row: Record<string, unknown>,
  keys: string[],
): string | null {
  for (const key of keys) {
    const value = row[key]
    if (typeof value === 'string' && value.trim()) {
      return value.trim()
    }
  }
  return null
}

/** Ham `profiles` satırını uygulama tipine dönüştürür (farklı sütun adlarına toleranslı). */
export function normalizeProfileRow(
  row: Record<string, unknown> | null,
  authUserId: string,
  authEmail?: string | null,
): Profile | null {
  if (!row) return null

  const id = pickString(row, ['id']) ?? authUserId

  const full_name = pickString(row, [
    'full_name',
    'fullName',
    'display_name',
    'displayName',
    'name',
  ])

  const email =
    pickString(row, ['email']) ??
    (authEmail?.trim() ? authEmail.trim() : null)

  const city = pickString(row, ['city', 'location', 'sehir'])
  const role = pickString(row, ['role', 'user_role', 'account_type'])
  const bio = pickString(row, ['bio', 'about', 'description'])

  const created_at = pickString(row, ['created_at', 'createdAt']) ?? undefined
  const updated_at = pickString(row, ['updated_at', 'updatedAt']) ?? undefined

  return {
    id,
    full_name,
    email,
    city,
    role,
    bio,
    created_at,
    updated_at,
  }
}
