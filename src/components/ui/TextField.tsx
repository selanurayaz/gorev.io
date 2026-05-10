import { forwardRef, useId } from 'react'
import type { InputHTMLAttributes } from 'react'

import { cn } from '@/lib/utils'

import { FieldError } from '@/components/ui/FieldError'
import { Label } from '@/components/ui/Label'

export type TextFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string
  error?: string
  hint?: string
  labelClassName?: string
}

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  function TextField(
    {
      label,
      error,
      hint,
      id: idProp,
      className,
      labelClassName,
      required,
      'aria-describedby': ariaDescribedBy,
      ...props
    },
    ref,
  ) {
    const uid = useId()
    const id = idProp ?? uid
    const errorId = `${id}-error`
    const hintId = `${id}-hint`

    const describedBy =
      [ariaDescribedBy, hint ? hintId : undefined, error ? errorId : undefined]
        .filter(Boolean)
        .join(' ') || undefined

    return (
      <div className="w-full">
        <Label
          htmlFor={id}
          className={labelClassName}
          requiredIndicator={Boolean(required)}
        >
          {label}
        </Label>
        {hint ? (
          <p id={hintId} className="mt-1 text-xs text-gorev-muted">
            {hint}
          </p>
        ) : null}
        <input
          ref={ref}
          id={id}
          aria-invalid={Boolean(error)}
          aria-required={required}
          aria-describedby={describedBy}
          className={cn(
            'mt-2 block min-h-11 w-full rounded-xl border bg-gorev-navy-950/70 px-4 py-2.5 text-sm text-gorev-snow shadow-inner shadow-black/20 outline-none transition placeholder:text-gorev-muted focus:border-gorev-yellow-400/45 focus:ring-2 focus:ring-gorev-yellow-400/25 disabled:cursor-not-allowed disabled:opacity-60',
            error
              ? 'border-red-500/60 focus:border-red-400/70 focus:ring-red-400/20'
              : 'border-gorev-navy-700 hover:border-gorev-navy-600',
            className,
          )}
          {...props}
        />
        <FieldError id={errorId} message={error} />
      </div>
    )
  },
)
