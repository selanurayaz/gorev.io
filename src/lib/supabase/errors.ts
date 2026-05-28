import type { AuthError, PostgrestError } from '@supabase/supabase-js'

type SupabaseLogError = PostgrestError | AuthError | Error

/** Geliştirme ortamında Supabase hatalarını konsola yazar. */
export function logSupabaseError(
  context: string,
  error: SupabaseLogError | null | undefined,
  extra?: Record<string, unknown>,
): void {
  if (!error) return

  const postgrest = error as PostgrestError
  console.error(`[supabase] ${context}`, {
    code: 'code' in error ? error.code : undefined,
    message: error.message,
    details: postgrest.details,
    hint: postgrest.hint,
    ...extra,
  })
}

/** PostgREST: sütun yok / geçersiz select ifadesi (genelde HTTP 400). */
export function isPostgrestSchemaError(error: PostgrestError): boolean {
  return (
    error.code === 'PGRST204' ||
    error.code === '42703' ||
    /column|schema cache|does not exist/i.test(error.message)
  )
}

/** Filtre sütunu veya tablo eşleşmesi sorunu olabilir. */
export function isPostgrestFilterError(error: PostgrestError): boolean {
  return (
    isPostgrestSchemaError(error) ||
    error.code === 'PGRST100' ||
    /filter|operator|invalid/i.test(error.message)
  )
}

export function formatProfileFetchError(error: PostgrestError): string {
  if (import.meta.env.DEV) {
    return `Profil yüklenemedi (${error.code ?? 'hata'}): ${error.message}`
  }
  return 'Profil bilgileri yüklenemedi. Lütfen sayfayı yenileyin.'
}

export function formatProfileSaveError(error: PostgrestError): string {
  if (import.meta.env.DEV) {
    return `Kayıt başarısız (${error.code ?? 'hata'}): ${error.message}`
  }
  return 'Profil güncellenemedi. Lütfen tekrar deneyin.'
}
