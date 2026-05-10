import { cn } from '@/lib/utils'

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost'

const variants: Record<ButtonVariant, string> = {
  primary:
    'bg-gorev-green-500 text-gorev-navy-950 shadow-lg shadow-gorev-green-500/20 hover:bg-gorev-green-400 hover:shadow-gorev-green-400/25',
  secondary:
    'bg-gorev-yellow-400 text-gorev-navy-950 hover:bg-gorev-yellow-300',
  outline:
    'border border-gorev-navy-700/80 bg-gorev-navy-900/40 text-gorev-snow hover:border-gorev-yellow-400/50 hover:bg-gorev-navy-900/80 hover:text-gorev-yellow-300',
  ghost:
    'text-gorev-muted hover:bg-gorev-navy-900/60 hover:text-gorev-snow',
}

const base =
  'inline-flex items-center justify-center rounded-xl px-5 py-2.5 text-sm font-semibold tracking-tight transition duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gorev-yellow-400 disabled:pointer-events-none disabled:opacity-45'

/** Shared styles for `<Button />` and anchor CTAs that must match buttons. */
export function composeButtonClassName(
  variant: ButtonVariant = 'primary',
  className?: string,
) {
  return cn(base, variants[variant], className)
}
