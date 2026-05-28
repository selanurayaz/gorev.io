import { forwardRef, useId } from 'react'
import type { SelectHTMLAttributes } from 'react'

import { cn } from '@/lib/utils'

import { FieldError } from '@/components/ui/FieldError'
import { Label } from '@/components/ui/Label'

export type SelectOption = {
  value: string
  label: string
  disabled?: boolean
}

export type SelectFieldProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label: string
  error?: string
  hint?: string
  labelClassName?: string
  options: SelectOption[]
  placeholder?: string
}

const selectClassName =
  'mt-2 block min-h-11 w-full appearance-none rounded-xl border bg-gorev-navy-950/70 bg-[length:1rem] bg-[right_0.75rem_center] bg-no-repeat px-4 py-2.5 pr-10 text-sm text-gorev-snow shadow-inner shadow-black/20 outline-none transition focus:border-gorev-yellow-400/45 focus:ring-2 focus:ring-gorev-yellow-400/25 disabled:cursor-not-allowed disabled:opacity-60'

const chevronSvg =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2394a3b8'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E\")"

export const SelectField = forwardRef<HTMLSelectElement, SelectFieldProps>(
  function SelectField(
    {
      label,
      error,
      hint,
      id: idProp,
      className,
      labelClassName,
      required,
      options,
      placeholder = 'Seçin…',
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
        <select
          ref={ref}
          id={id}
          aria-invalid={Boolean(error)}
          aria-required={required}
          aria-describedby={describedBy}
          className={cn(
            selectClassName,
            error
              ? 'border-red-500/60 focus:border-red-400/70 focus:ring-red-400/20'
              : 'border-gorev-navy-700 hover:border-gorev-navy-600',
            className,
          )}
          style={{ backgroundImage: chevronSvg }}
          {...props}
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </option>
          ))}
        </select>
        <FieldError id={errorId} message={error} />
      </div>
    )
  },
)
