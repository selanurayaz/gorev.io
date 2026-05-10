import type { ButtonHTMLAttributes } from 'react'

import { Spinner } from '@/components/ui/Spinner'
import {
  composeButtonClassName,
  type ButtonVariant,
} from '@/lib/button-styles'
import { cn } from '@/lib/utils'

export type { ButtonVariant }

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
  loading?: boolean
}

export function Button({
  className,
  variant = 'primary',
  type = 'button',
  loading = false,
  disabled,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled ?? loading}
      aria-busy={loading || undefined}
      className={composeButtonClassName(
        variant,
        cn('gap-2', loading && 'cursor-wait', className),
      )}
      {...props}
    >
      {loading ? (
        <Spinner className="h-5 w-5 shrink-0" aria-hidden />
      ) : null}
      <span>{children}</span>
    </button>
  )
}
