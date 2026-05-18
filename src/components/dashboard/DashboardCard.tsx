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
        'overflow-hidden rounded-2xl border border-gorev-navy-800 bg-gradient-to-b from-gorev-navy-900/70 to-gorev-navy-950/90 shadow-[0_1px_0_0_rgba(255,255,255,0.04)_inset]',
        className,
      )}
    >
      {title ? (
        <div className="flex items-center justify-between gap-4 border-b border-gorev-navy-800 px-5 py-4 sm:px-6">
          <h2 className="text-base font-semibold tracking-tight text-gorev-snow">
            {title}
          </h2>
          {action}
        </div>
      ) : null}
      {children}
    </section>
  )
}
