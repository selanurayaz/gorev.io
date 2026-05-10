import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

type LandingSectionProps = {
  id?: string
  children: ReactNode
  className?: string
  /** Extra vertical padding for dense sections */
  dense?: boolean
}

export function LandingSection({
  id,
  children,
  className,
  dense,
}: LandingSectionProps) {
  return (
    <section
      id={id}
      className={cn(
        'scroll-mt-24 border-t border-gorev-navy-900/80',
        dense ? 'py-14 sm:py-16' : 'py-16 sm:py-20 lg:py-24',
        className,
      )}
    >
      {children}
    </section>
  )
}
