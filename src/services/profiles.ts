import type { PostgrestError } from '@supabase/supabase-js'

import { normalizeProfileRow } from '@/lib/profile-mapper'
import {
  formatProfileFetchError,
  formatProfileSaveError,
  isPostgrestFilterError,
  logSupabaseError,
} from '@/lib/supabase/errors'
import { supabase } from '@/lib/supabase/client'
import type { Profile, ProfileUpdateInput } from '@/types/profile'

export type FetchProfileOptions = {
  /** Auth kullanıcı e-postası — satır yoksa veya `email` sütunu yoksa yedek. */
  email?: string | null
}

export type FetchProfileResult = {
  profile: Profile | null
  error: string | null
}

type ProfileIdColumn = 'id' | 'user_id'

type AuthSessionContext = {
  userId: string
  email: string | null
}

async function getAuthSessionContext(): Promise<
  | { session: AuthSessionContext; error: null }
  | { session: null; error: string }
> {
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession()

  if (sessionError) {
    logSupabaseError('getSession', sessionError)
    return { session: null, error: 'Oturum doğrulanamadı. Lütfen tekrar giriş yapın.' }
  }

  if (!session?.user) {
    return { session: null, error: 'Oturum bulunamadı. Lütfen tekrar giriş yapın.' }
  }

  return {
    session: {
      userId: session.user.id,
      email: session.user.email ?? null,
    },
    error: null,
  }
}

function buildProfilePayload(input: ProfileUpdateInput) {
  return {
    full_name: input.full_name.trim() || null,
    city: input.city.trim() || null,
    role: input.role.trim() || null,
    bio: input.bio.trim() || null,
  }
}

async function queryProfileRow(
  column: ProfileIdColumn,
  userId: string,
): Promise<{ row: Record<string, unknown> | null; error: PostgrestError | null }> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq(column, userId)
    .maybeSingle()

  if (error) {
    return { row: null, error }
  }

  if (!data || typeof data !== 'object') {
    return { row: null, error: null }
  }

  return { row: data as Record<string, unknown>, error: null }
}

/**
 * Oturum açmış kullanıcının profil satırını getirir.
 * `id` ve `user_id` filtrelerini dener; `select('*')` ile şema uyumsuzluğu (400) riskini azaltır.
 */
export async function fetchProfileByUserId(
  userId: string,
  options: FetchProfileOptions = {},
): Promise<FetchProfileResult> {
  const auth = await getAuthSessionContext()
  if (!auth.session) {
    return { profile: null, error: auth.error ?? 'Oturum bulunamadı.' }
  }

  const authUserId = auth.session.userId
  const authEmail = options.email ?? auth.session.email

  if (authUserId !== userId && import.meta.env.DEV) {
    console.warn('[profiles] userId mismatch; using session user id', {
      passedUserId: userId,
      sessionUserId: authUserId,
    })
  }

  const columns: ProfileIdColumn[] = ['id', 'user_id']
  let lastError: PostgrestError | null = null

  for (const column of columns) {
    const { row, error } = await queryProfileRow(column, authUserId)

    if (!error) {
      const profile = normalizeProfileRow(row, authUserId, authEmail)
      if (import.meta.env.DEV) {
        console.info('[profiles] loaded', {
          filterColumn: column,
          userId: authUserId,
          hasRow: Boolean(row),
          full_name: profile?.full_name ?? null,
        })
      }
      return { profile, error: null }
    }

    lastError = error
    logSupabaseError('fetchProfileByUserId', error, {
      column,
      userId: authUserId,
    })

    if (!isPostgrestFilterError(error)) {
      break
    }
  }

  if (lastError) {
    return {
      profile: null,
      error: formatProfileFetchError(lastError),
    }
  }

  return {
    profile: normalizeProfileRow(null, authUserId, authEmail),
    error: null,
  }
}

export type UpdateProfileResult = {
  profile: Profile | null
  error: string | null
}

/**
 * `profiles.id` = oturum açmış kullanıcının Auth UUID'si ile günceller.
 * Satır yoksa `upsert` dener.
 */
export async function updateProfileByUserId(
  input: ProfileUpdateInput,
): Promise<UpdateProfileResult> {
  const auth = await getAuthSessionContext()
  if (!auth.session) {
    return { profile: null, error: auth.error ?? 'Oturum bulunamadı.' }
  }

  const { userId, email } = auth.session
  const payload = buildProfilePayload(input)

  const { data: updated, error: updateError } = await supabase
    .from('profiles')
    .update(payload)
    .eq('id', userId)
    .select('*')
    .maybeSingle()

  if (updateError) {
    logSupabaseError('updateProfileByUserId', updateError, { userId })
    return { profile: null, error: formatProfileSaveError(updateError) }
  }

  if (updated && typeof updated === 'object') {
    const profile = normalizeProfileRow(
      updated as Record<string, unknown>,
      userId,
      email,
    )
    if (import.meta.env.DEV) {
      console.info('[profiles] updated', { userId })
    }
    return { profile, error: null }
  }

  const upsertRow = {
    id: userId,
    email,
    ...payload,
  }

  const { data: inserted, error: upsertError } = await supabase
    .from('profiles')
    .upsert(upsertRow, { onConflict: 'id' })
    .select('*')
    .single()

  if (upsertError) {
    logSupabaseError('upsertProfileByUserId', upsertError, { userId })
    return { profile: null, error: formatProfileSaveError(upsertError) }
  }

  const profile = normalizeProfileRow(
    inserted as Record<string, unknown>,
    userId,
    email,
  )

  if (import.meta.env.DEV) {
    console.info('[profiles] upserted', { userId })
  }

  return { profile, error: null }
}
