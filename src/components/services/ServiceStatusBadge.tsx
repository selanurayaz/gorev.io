import {
  getServiceStatusDisplay,
  serviceStatusBadgeStyles,
} from '@/lib/service-display'
import { cn } from '@/lib/utils'

type ServiceStatusBadgeProps = {
  isActive: boolean
  className?: string
}

export function ServiceStatusBadge({
  isActive,
  className,
}: ServiceStatusBadgeProps) {
  const status = getServiceStatusDisplay(isActive)

  return (
    <span
      className={cn(
        'shrink-0 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide',
        serviceStatusBadgeStyles[status.tone],
        className,
      )}
    >
      {status.label}
    </span>
  )
}
