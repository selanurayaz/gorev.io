import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

type AuthCardProps = {
  title: string
  description?: string
  children: ReactNode
  className?: string
}

export function AuthCard({
  title,
  description,
  children,
  className,
}: AuthCardProps) {
  return (
    <section
      className={cn(
        'w-full max-w-md rounded-[1.75rem] border border-gorev-navy-800 bg-gradient-to-b from-gorev-navy-900/75 to-gorev-navy-950/95 p-8 shadow-[0_24px_80px_-32px_rgba(0,0,0,0.85)] shadow-black/50 sm:p-10',
        className,
      )}
      aria-labelledby="auth-card-title"
    >
      <h1
        id="auth-card-title"
        className="text-center text-2xl font-semibold tracking-tight text-gorev-snow sm:text-[1.65rem]"
      >
        {title}
      </h1>
      {description ? (
        <p className="mt-3 text-center text-sm leading-relaxed text-gorev-muted">
          {description}
        </p>
      ) : null}
      <div className="mt-8">{children}</div>
    </section>
  )
}
