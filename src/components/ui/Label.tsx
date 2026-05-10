import type { LabelHTMLAttributes } from 'react'

import { cn } from '@/lib/utils'

type LabelProps = LabelHTMLAttributes<HTMLLabelElement> & {
  requiredIndicator?: boolean
}

export function Label({
  className,
  children,
  requiredIndicator,
  ...props
}: LabelProps) {
  return (
    <label
      className={cn(
        'block text-sm font-medium text-gorev-snow',
        className,
      )}
      {...props}
    >
      {children}
      {requiredIndicator ? (
        <span className="text-gorev-yellow-400" aria-hidden>
          {' '}
          *
        </span>
      ) : null}
    </label>
  )
}
