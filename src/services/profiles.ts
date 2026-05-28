import type { PostgrestError } from '@supabase/supabase-js'

import { normalizeProfileRow } from '@/lib/profile-mapper'
import {
  formatProfileFetchError,
  formatProfileSaveError,
  isPostgrestFilterError,
  logSupabaseError,
} from '@/lib/supabase/errors'
import { getAuthSessionContext } from '@/lib/supabase/session'
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

function buildProfilePayload(input: ProfileUpdateInput) {
  return {
    full_name: input.full_name.trim() || null,
    city: input.city.trim() || null,
    role: input.role.trim() || null,
    bio: input.bio.trim() || null,
  }
}

function readProfileDisplayName(row: Record<string, unknown>): string | null {
  const name = row.full_name ?? row.display_name ?? row.name
  if (typeof name === 'string' && name.trim()) return name.trim()
  return null
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

/** Marketplace için görev sahibi adlarını toplu getirir. */
export async function fetchProfileNamesByIds(
  userIds: string[],
): Promise<Map<string, string>> {
  const uniqueIds = [...new Set(userIds.filter(Boolean))]
  if (uniqueIds.length === 0) return new Map()

  const nameMap = new Map<string, string>()

  const assignRows = (rows: unknown) => {
    if (!Array.isArray(rows)) return
    for (const row of rows) {
      if (!row || typeof row !== 'object') continue
      const record = row as Record<string, unknown>
      const name = readProfileDisplayName(record)
      if (!name) continue

      const id = record.id != null ? String(record.id) : null
      const userId =
        record.user_id != null ? String(record.user_id) : null

      if (id) nameMap.set(id, name)
      if (userId) nameMap.set(userId, name)
    }
  }

  const byId = await supabase
    .from('profiles')
    .select('id, user_id, full_name, display_name, name')
    .in('id', uniqueIds)

  if (!byId.error) {
    assignRows(byId.data)
  } else {
    logSupabaseError('fetchProfileNamesByIds.id', byId.error)
  }

  const missing = uniqueIds.filter((id) => !nameMap.has(id))
  if (missing.length > 0) {
    const byUserId = await supabase
      .from('profiles')
      .select('id, user_id, full_name, display_name, name')
      .in('user_id', missing)

    if (!byUserId.error) {
      assignRows(byUserId.data)
    } else {
      logSupabaseError('fetchProfileNamesByIds.user_id', byUserId.error)
    }
  }

  return nameMap
}
