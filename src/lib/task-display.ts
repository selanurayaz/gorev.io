import { formatTryAmount } from '@/utils/format'
import type { Task } from '@/types/task'

export type TaskStatusTone = 'yellow' | 'green' | 'muted' | 'red'

export const taskStatusBadgeStyles: Record<TaskStatusTone, string> = {
  yellow:
    'border-gorev-yellow-400/30 bg-gorev-yellow-400/10 text-gorev-yellow-300',
  green:
    'border-gorev-green-500/30 bg-gorev-green-500/10 text-gorev-green-400',
  muted: 'border-gorev-navy-700 bg-gorev-navy-900/60 text-gorev-muted',
  red: 'border-red-500/30 bg-red-500/10 text-red-300',
}

export function formatTaskBudgetRange(task: Task): string {
  const { budget_min: min, budget_max: max } = task

  if (min != null && max != null) {
    if (min === max) return formatTryAmount(min)
    return `${formatTryAmount(min)} – ${formatTryAmount(max)}`
  }

  if (min != null) return `${formatTryAmount(min)}'den`
  if (max != null) return `${formatTryAmount(max)}'ye kadar`

  return 'Bütçe belirtilmedi'
}

export function formatTaskCreatedAt(
  createdAt?: string,
  locale = 'tr-TR',
): string {
  if (!createdAt) return '—'

  const date = new Date(createdAt)
  if (Number.isNaN(date.getTime())) return '—'

  return new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date)
}

export function getTaskStatusDisplay(
  status: string | null | undefined,
): { label: string; tone: TaskStatusTone } {
  const value = (status ?? 'draft').trim().toLowerCase()

  if (
    value === 'open' ||
    value === 'published' ||
    value === 'active' ||
    value === 'yayinda' ||
    value === 'yayında' ||
    value === 'pending_offers' ||
    value === 'awaiting_offers'
  ) {
    return { label: 'Teklif bekleniyor', tone: 'yellow' }
  }

  if (
    value === 'in_progress' ||
    value === 'ongoing' ||
    value === 'assigned' ||
    value === 'devam' ||
    value === 'devam_ediyor'
  ) {
    return { label: 'Devam ediyor', tone: 'green' }
  }

  if (
    value === 'completed' ||
    value === 'done' ||
    value === 'closed' ||
    value === 'tamamlandi' ||
    value === 'tamamlandı'
  ) {
    return { label: 'Tamamlandı', tone: 'green' }
  }

  if (
    value === 'cancelled' ||
    value === 'canceled' ||
    value === 'iptal' ||
    value === 'iptal_edildi'
  ) {
    return { label: 'İptal edildi', tone: 'red' }
  }

  if (value === 'draft' || value === 'taslak') {
    return { label: 'Taslak', tone: 'muted' }
  }

  if (value) {
    return {
      label: status!.trim(),
      tone: 'muted',
    }
  }

  return { label: 'Taslak', tone: 'muted' }
}
