import {
  getTaskStatusDisplay,
  taskStatusBadgeStyles,
} from '@/lib/task-display'
import { cn } from '@/lib/utils'

type TaskStatusBadgeProps = {
  status: string | null | undefined
  className?: string
}

export function TaskStatusBadge({ status, className }: TaskStatusBadgeProps) {
  const { label, tone } = getTaskStatusDisplay(status)

  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold tracking-wide',
        taskStatusBadgeStyles[tone],
        className,
      )}
    >
      {label}
    </span>
  )
}
