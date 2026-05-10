import { cn } from '@/lib/utils'

type FieldErrorProps = {
  id: string
  message?: string
  className?: string
}

export function FieldError({ id, message, className }: FieldErrorProps) {
  if (!message) return null

  return (
    <p
      id={id}
      role="alert"
      className={cn('mt-1.5 text-sm text-red-400', className)}
    >
      {message}
    </p>
  )
}
