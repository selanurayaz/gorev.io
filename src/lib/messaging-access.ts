import { sameUserId } from '@/lib/messaging-utils'

/** Oturum sahibi bu görevde mesajlaşabilir mi? (sahip veya kabul edilmiş hizmet veren) */
export function canUserMessageOnAcceptedTask(
  ownerId: string,
  providerId: string,
  currentUserId: string,
): boolean {
  return (
    sameUserId(ownerId, currentUserId) ||
    sameUserId(providerId, currentUserId)
  )
}

/**
 * Gönderim için alıcı: görev sahibi → provider, provider → görev sahibi.
 */
export function resolveMessagingReceiverId(
  ownerId: string,
  providerId: string,
  currentUserId: string,
): string | null {
  if (sameUserId(ownerId, currentUserId)) {
    return providerId
  }
  if (sameUserId(providerId, currentUserId)) {
    return ownerId
  }
  return null
}
