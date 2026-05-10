import type { ButtonHTMLAttributes } from 'react'

import {
  composeButtonClassName,
  type ButtonVariant,
} from '@/lib/button-styles'

export type { ButtonVariant }

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
}

export function Button({
  className,
  variant = 'primary',
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={composeButtonClassName(variant, className)}
      {...props}
    />
  )
}
