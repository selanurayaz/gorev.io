import type { TaskStatusTone } from '@/lib/task-display'

export const offerStatusBadgeStyles: Record<TaskStatusTone, string> = {
  yellow:
    'border-gorev-yellow-400/30 bg-gorev-yellow-400/10 text-gorev-yellow-300',
  green:
    'border-gorev-green-500/30 bg-gorev-green-500/10 text-gorev-green-400',
  muted: 'border-gorev-navy-700 bg-gorev-navy-900/60 text-gorev-muted',
  red: 'border-red-500/30 bg-red-500/10 text-red-300',
}

export function normalizeOfferStatus(
  status: string | null | undefined,
): string {
  return (status ?? 'pending').trim().toLowerCase()
}

export function isOfferPending(status: string | null | undefined): boolean {
  const value = normalizeOfferStatus(status)
  return (
    value === 'pending' ||
    value === 'open' ||
    value === 'beklemede' ||
    value === ''
  )
}

export function canRespondToOffer(status: string | null | undefined): boolean {
  return isOfferPending(status)
}

export function getOfferStatusDisplay(status: string | null | undefined): {
  label: string
  tone: TaskStatusTone
} {
  const value = normalizeOfferStatus(status)

  if (value === 'accepted' || value === 'kabul' || value === 'kabul_edildi') {
    return { label: 'Kabul edildi', tone: 'green' }
  }

  if (value === 'rejected' || value === 'reddedildi' || value === 'red') {
    return { label: 'Reddedildi', tone: 'red' }
  }

  if (value === 'withdrawn' || value === 'iptal' || value === 'iptal_edildi') {
    return { label: 'İptal edildi', tone: 'muted' }
  }

  return { label: 'Beklemede', tone: 'yellow' }
}
