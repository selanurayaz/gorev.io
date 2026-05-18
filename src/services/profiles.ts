import { supabase } from '@/lib/supabase/client'
import type { Profile } from '@/types/profile'

const PROFILE_COLUMNS = 'id, full_name, email, created_at, updated_at'

export type FetchProfileResult = {
  profile: Profile | null
  error: string | null
}

/** Oturum açmış kullanıcının `profiles` satırını getirir. */
export async function fetchProfileByUserId(
  userId: string,
): Promise<FetchProfileResult> {
  const { data, error } = await supabase
    .from('profiles')
    .select(PROFILE_COLUMNS)
    .eq('id', userId)
    .maybeSingle()

  if (error) {
    return {
      profile: null,
      error: 'Profil bilgileri yüklenemedi. Lütfen sayfayı yenileyin.',
    }
  }

  return { profile: data as Profile | null, error: null }
}
