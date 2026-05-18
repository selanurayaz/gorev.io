import type { AuthError } from '@supabase/supabase-js'

/** Supabase Auth hatalarını Türkçe kullanıcı mesajına çevirir. */
export function mapAuthError(error: AuthError | Error | null): string {
  if (!error) {
    return 'Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.'
  }

  const message = error.message.toLowerCase()

  if (message.includes('invalid login credentials')) {
    return 'E-posta veya şifre hatalı.'
  }
  if (message.includes('email not confirmed')) {
    return 'E-posta adresin henüz doğrulanmamış. Gelen kutunu kontrol et.'
  }
  if (message.includes('user already registered')) {
    return 'Bu e-posta adresi zaten kayıtlı.'
  }
  if (message.includes('password should be at least')) {
    return 'Şifre en az 6 karakter olmalı (tercihen 8+).'
  }
  if (message.includes('unable to validate email')) {
    return 'Geçerli bir e-posta adresi girin.'
  }
  if (message.includes('rate limit') || message.includes('too many requests')) {
    return 'Çok fazla deneme yapıldı. Lütfen bir süre sonra tekrar dene.'
  }
  if (message.includes('network') || message.includes('fetch')) {
    return 'Bağlantı hatası. İnternet bağlantını kontrol et.'
  }

  return error.message || 'İşlem tamamlanamadı. Lütfen tekrar deneyin.'
}
