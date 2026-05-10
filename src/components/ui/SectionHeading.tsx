import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

type SectionHeadingProps = {
  eyebrow?: string
  title: ReactNode
  description?: string
  align?: 'center' | 'left'
  id?: string
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = 'center',
  id,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        'max-w-2xl',
        align === 'center' && 'mx-auto text-center',
        align === 'left' && 'text-left',
      )}
    >
      {eyebrow ? (
        <p
          id={id ? `${id}-eyebrow` : undefined}
          className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-gorev-green-400"
        >
          {eyebrow}
        </p>
      ) : null}
      <h2 className="text-balance text-2xl font-semibold tracking-tight text-gorev-snow sm:text-3xl md:text-4xl">
        {title}
      </h2>
      {description ? (
        <p className="mt-4 text-pretty text-base leading-relaxed text-gorev-muted sm:text-lg">
          {description}
        </p>
      ) : null}
    </div>
  )
}
