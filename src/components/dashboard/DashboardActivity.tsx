import { DashboardCard } from '@/components/dashboard/DashboardCard'
import { DashboardSectionFeedback } from '@/components/dashboard/DashboardSectionFeedback'
import { formatTaskCreatedAt } from '@/lib/task-display'
import { cn } from '@/lib/utils'
import type { DashboardActivityItem } from '@/types/dashboard'

const dotColors = {
  offer: 'bg-gorev-yellow-400',
  publish: 'bg-gorev-green-500',
  message: 'bg-gorev-muted',
  complete: 'bg-gorev-green-400',
  default: 'bg-gorev-navy-700',
} as const

type DashboardActivityProps = {
  activity: DashboardActivityItem[]
  isLoading: boolean
  error: string | null
  onRetry?: () => void
}

export function DashboardActivity({
  activity,
  isLoading,
  error,
  onRetry,
}: DashboardActivityProps) {
  return (
    <DashboardCard title="Son aktivite">
      <DashboardSectionFeedback
        isLoading={isLoading}
        error={error}
        onRetry={onRetry}
        loadingLabel="Aktivite yükleniyor…"
        isEmpty={!isLoading && !error && activity.length === 0}
        emptyMessage="Henüz aktivite bulunmuyor."
      />

      {!isLoading && !error && activity.length > 0 ? (
        <ul className="space-y-0 p-5 sm:p-6">
          {activity.map((item, index) => (
            <li
              key={item.id}
              className={cn(
                'relative flex gap-4 pb-6 pl-1',
                index < activity.length - 1 &&
                  'ml-2 border-l border-gorev-navy-800',
              )}
            >
              <span
                className={cn(
                  'absolute -left-[5px] top-1.5 h-2.5 w-2.5 shrink-0 rounded-full ring-4 ring-gorev-navy-950',
                  dotColors[item.type],
                )}
                aria-hidden
              />
              <div className="min-w-0 flex-1 pl-4">
                <p className="text-sm leading-relaxed text-gorev-snow">
                  {item.text}
                </p>
                <p className="mt-1 text-xs text-gorev-muted">
                  {formatTaskCreatedAt(item.time)}
                </p>
              </div>
            </li>
          ))}
        </ul>
      ) : null}
    </DashboardCard>
  )
}
