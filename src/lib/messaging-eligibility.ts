import { normalizeOfferStatus } from '@/lib/offer-display'
import { sameTaskId, sameUserId } from '@/lib/messaging-utils'

export function isOfferAccepted(status: string | null | undefined): boolean {
  const value = normalizeOfferStatus(status)
  return (
    value === 'accepted' ||
    value === 'kabul' ||
    value === 'kabul_edildi'
  )
}

export type AcceptedParticipation = {
  task_id: string
  task_title: string
  customer_id: string
  provider_id: string
}

export function getCounterpartUserId(
  participation: AcceptedParticipation,
  currentUserId: string,
): string | null {
  if (sameUserId(participation.customer_id, currentUserId)) {
    return participation.provider_id
  }
  if (sameUserId(participation.provider_id, currentUserId)) {
    return participation.customer_id
  }
  return null
}

export function canUsersMessageOnTask(
  participations: AcceptedParticipation[],
  taskId: string,
  userId: string,
  otherUserId: string,
): boolean {
  return participations.some((row) => {
    if (!sameTaskId(row.task_id, taskId)) return false

    const isCustomer = sameUserId(row.customer_id, userId)
    const isProvider = sameUserId(row.provider_id, userId)
    const otherIsCustomer = sameUserId(row.customer_id, otherUserId)
    const otherIsProvider = sameUserId(row.provider_id, otherUserId)

    return (
      (isCustomer && otherIsProvider) || (isProvider && otherIsCustomer)
    )
  })
}

