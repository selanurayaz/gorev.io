import type { User } from '@supabase/supabase-js'

function readMetaString(
  meta: Record<string, unknown> | undefined,
  key: string,
): string | undefined {
  const value = meta?.[key]
  return typeof value === 'string' && value.trim() ? value.trim() : undefined
}

/** Profil ve karşılama metinleri için görünen ad. */
export function getUserDisplayName(user: User | null): string {
  if (!user) return 'Kullanıcı'

  const meta = user.user_metadata as Record<string, unknown> | undefined
  const fullName =
    readMetaString(meta, 'full_name') ??
    readMetaString(meta, 'fullName') ??
    readMetaString(meta, 'name')

  if (fullName) {
    return fullName.split(/\s+/)[0] ?? fullName
  }

  const email = user.email
  if (email) return email.split('@')[0] ?? 'Kullanıcı'

  return 'Kullanıcı'
}
