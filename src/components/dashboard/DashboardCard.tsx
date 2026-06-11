import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

type DashboardCardProps = {
  children: ReactNode
  className?: string
  title?: string
  action?: ReactNode
}

export function DashboardCard({
  children,
  className,
  title,
  action,
}: DashboardCardProps) {
  return (
    <section
      className={cn(
        'overflow-x-hidden rounded-2xl border border-gorev-navy-800 bg-gradient-to-b from-gorev-navy-900/70 to-gorev-navy-950/90 shadow-[0_1px_0_0_rgba(255,255,255,0.04)_inset]',
        className,
      )}
    >
      {title ? (
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gorev-navy-800 px-3 py-3 sm:gap-4 sm:px-6 sm:py-4">
          <h2 className="min-w-0 text-base font-semibold tracking-tight text-gorev-snow">
            {title}
          </h2>
          {action ? <div className="shrink-0">{action}</div> : null}
        </div>
      ) : null}
      {children}
    </section>
  )
}
