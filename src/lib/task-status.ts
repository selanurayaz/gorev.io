function normalizeStatus(status: string | null | undefined): string {
  return (status ?? '').trim().toLowerCase()
}

const OPEN_STATUSES = new Set([
  'open',
  'published',
  'active',
  'yayinda',
  'yayında',
  'pending_offers',
  'awaiting_offers',
])

const IN_PROGRESS_STATUSES = new Set([
  'in_progress',
  'ongoing',
  'assigned',
  'devam',
  'devam_ediyor',
])

const COMPLETED_STATUSES = new Set([
  'completed',
  'done',
  'closed',
  'tamamlandi',
  'tamamlandı',
])

/** Panelde aktif sayılan görev durumları (open + in_progress). */
export function isDashboardActiveTaskStatus(
  status: string | null | undefined,
): boolean {
  const value = normalizeStatus(status)
  return OPEN_STATUSES.has(value) || IN_PROGRESS_STATUSES.has(value)
}

export function isDashboardCompletedTaskStatus(
  status: string | null | undefined,
): boolean {
  return COMPLETED_STATUSES.has(normalizeStatus(status))
}
