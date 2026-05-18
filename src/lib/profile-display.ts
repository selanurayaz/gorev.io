import type { User } from '@supabase/supabase-js'

import type { Profile } from '@/types/profile'

/** E-posta adresinden @ öncesi kullanıcı adı. */
export function getEmailUsername(user: User | null): string {
  if (!user?.email) return 'Kullanıcı'
  return user.email.split('@')[0] || 'Kullanıcı'
}

/**
 * Karşılama metni için görünen ad: `profiles.full_name`, yoksa e-posta kullanıcı adı.
 */
export function getProfileDisplayName(
  profile: Profile | null,
  user: User | null,
): string {
  const fullName = profile?.full_name?.trim()
  if (fullName) return fullName
  return getEmailUsername(user)
}
