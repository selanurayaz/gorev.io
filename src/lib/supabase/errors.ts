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

export function formatCategoryFetchError(error: PostgrestError): string {
  if (import.meta.env.DEV) {
    return `Kategoriler yüklenemedi (${error.code ?? 'hata'}): ${error.message}`
  }
  return 'Kategoriler yüklenemedi. Lütfen sayfayı yenileyin.'
}

export function formatTaskCreateError(error: PostgrestError): string {
  if (import.meta.env.DEV) {
    return `Görev oluşturulamadı (${error.code ?? 'hata'}): ${error.message}`
  }
  return 'Görev kaydedilemedi. Lütfen bilgileri kontrol edip tekrar deneyin.'
}

export function formatTaskFetchError(error: PostgrestError): string {
  if (import.meta.env.DEV) {
    return `Görevler yüklenemedi (${error.code ?? 'hata'}): ${error.message}`
  }
  return 'Görevleriniz yüklenemedi. Lütfen sayfayı yenileyin.'
}

export function formatOfferCreateError(error: PostgrestError): string {
  if (import.meta.env.DEV) {
    return `Teklif gönderilemedi (${error.code ?? 'hata'}): ${error.message}`
  }
  return 'Teklifiniz kaydedilemedi. Lütfen tekrar deneyin.'
}

export function formatOfferFetchError(error: PostgrestError): string {
  if (import.meta.env.DEV) {
    return `Teklifler yüklenemedi (${error.code ?? 'hata'}): ${error.message}`
  }
  return 'Teklifler yüklenemedi. Lütfen sayfayı yenileyin.'
}

export function formatOfferUpdateError(error: PostgrestError): string {
  if (import.meta.env.DEV) {
    return `Teklif güncellenemedi (${error.code ?? 'hata'}): ${error.message}`
  }
  return 'İşlem tamamlanamadı. Lütfen tekrar deneyin.'
}

export function formatMessageFetchError(error: PostgrestError): string {
  if (import.meta.env.DEV) {
    return `Mesajlar yüklenemedi (${error.code ?? 'hata'}): ${error.message}`
  }
  return 'Mesajlar yüklenilemedi. Lütfen sayfayı yenileyin.'
}

export function formatMessageSendError(error: PostgrestError): string {
  if (import.meta.env.DEV) {
    return `Mesaj gönderilemedi (${error.code ?? 'hata'}): ${error.message}`
  }
  return 'Mesajınız gönderilemedi. Lütfen tekrar deneyin.'
}

export function formatNotificationFetchError(error: PostgrestError): string {
  if (import.meta.env.DEV) {
    return `Bildirimler yüklenemedi (${error.code ?? 'hata'}): ${error.message}`
  }
  return 'Bildirimler yüklenemedi. Lütfen sayfayı yenileyin.'
}

export function formatNotificationUpdateError(error: PostgrestError): string {
  if (import.meta.env.DEV) {
    return `Bildirim güncellenemedi (${error.code ?? 'hata'}): ${error.message}`
  }
  return 'Bildirim güncellenemedi. Lütfen tekrar deneyin.'
}

export function formatDashboardFetchError(error: PostgrestError): string {
  if (import.meta.env.DEV) {
    return `Panel verileri yüklenemedi (${error.code ?? 'hata'}): ${error.message}`
  }
  return 'Panel verileri yüklenemedi. Lütfen sayfayı yenileyin.'
}
