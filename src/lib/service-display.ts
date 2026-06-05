import { formatTryAmount } from '@/utils/format'
import type { Service } from '@/types/service'

export type ServiceStatusTone = 'green' | 'muted'

export const serviceStatusBadgeStyles: Record<ServiceStatusTone, string> = {
  green:
    'border-gorev-green-500/30 bg-gorev-green-500/10 text-gorev-green-400',
  muted: 'border-gorev-navy-700 bg-gorev-navy-900/60 text-gorev-muted',
}

export function formatServiceBasePrice(service: Service): string {
  if (service.base_price == null) return 'Fiyat belirtilmedi'
  return formatTryAmount(service.base_price)
}

export function getServiceStatusDisplay(
  isActive: boolean,
): { label: string; tone: ServiceStatusTone } {
  return isActive
    ? { label: 'Yayında', tone: 'green' }
    : { label: 'Pasif', tone: 'muted' }
}
