import {
  getOfferStatusDisplay,
  offerStatusBadgeStyles,
} from '@/lib/offer-display'
import { cn } from '@/lib/utils'

type OfferStatusBadgeProps = {
  status: string | null | undefined
  className?: string
}

export function OfferStatusBadge({ status, className }: OfferStatusBadgeProps) {
  const { label, tone } = getOfferStatusDisplay(status)

  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold tracking-wide',
        offerStatusBadgeStyles[tone],
        className,
      )}
    >
      {label}
    </span>
  )
}
