import { cn } from '@/lib/utils'

type AuthAlertProps = {
  message: string
  variant?: 'error' | 'success' | 'info'
}

const variants = {
  error: 'border-red-500/40 bg-red-500/10 text-red-200',
  success: 'border-gorev-green-500/35 bg-gorev-green-500/10 text-gorev-snow',
  info: 'border-gorev-navy-700 bg-gorev-navy-900/60 text-gorev-muted',
} as const

export function AuthAlert({ message, variant = 'error' }: AuthAlertProps) {
  return (
    <p
      role={variant === 'error' ? 'alert' : 'status'}
      className={cn(
        'rounded-xl border px-4 py-3 text-sm leading-relaxed',
        variants[variant],
      )}
    >
      {message}
    </p>
  )
}
