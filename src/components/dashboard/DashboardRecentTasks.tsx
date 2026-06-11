import { Link } from 'react-router-dom'

import { DashboardCard } from '@/components/dashboard/DashboardCard'
import { DashboardSectionFeedback } from '@/components/dashboard/DashboardSectionFeedback'
import { formatCityLabel } from '@/lib/cities'
import { taskDetailPath } from '@/lib/paths'
import {
  formatTaskBudgetRange,
  formatTaskCreatedAt,
  getTaskStatusDisplay,
  taskStatusBadgeStyles,
} from '@/lib/task-display'
import { cn } from '@/lib/utils'
import type { TaskListItem } from '@/types/task'

type DashboardRecentTasksProps = {
  tasks: TaskListItem[]
  isLoading: boolean
  error: string | null
  onRetry?: () => void
}

export function DashboardRecentTasks({
  tasks,
  isLoading,
  error,
  onRetry,
}: DashboardRecentTasksProps) {
  const feedback = (
    <DashboardSectionFeedback
      isLoading={isLoading}
      error={error}
      onRetry={onRetry}
      loadingLabel="Görevler yükleniyor…"
      isEmpty={!isLoading && !error && tasks.length === 0}
      emptyMessage="Henüz görev oluşturmadınız."
    />
  )

  return (
    <DashboardCard
      title="Son görevler"
      action={
        <Link
          to="/dashboard/gorevlerim"
          className="text-sm font-medium text-gorev-yellow-400 transition hover:text-gorev-yellow-300"
        >
          Tümünü gör
        </Link>
      }
    >
      {feedback}

      {!isLoading && !error && tasks.length > 0 ? (
        <ul className="divide-y divide-gorev-navy-800">
          {tasks.map((task) => {
            const status = getTaskStatusDisplay(task.status)

            return (
              <li key={task.id}>
                <Link
                  to={taskDetailPath(task.id)}
                  className="flex w-full flex-col gap-2 px-4 py-3 text-left transition hover:bg-gorev-navy-900/40 sm:flex-row sm:items-center sm:justify-between sm:gap-3 sm:px-6 sm:py-4"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-medium text-gorev-snow">
                        {task.title}
                      </h3>
                      <span
                        className={cn(
                          'rounded-full border px-2 py-0.5 text-[11px] font-semibold',
                          taskStatusBadgeStyles[status.tone],
                        )}
                      >
                        {status.label}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-gorev-muted">
                      {formatCityLabel(task.city)}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col items-start gap-1 sm:items-end">
                    <p className="text-sm font-semibold text-gorev-snow">
                      {formatTaskBudgetRange(task)}
                    </p>
                    <p className="text-xs text-gorev-muted">
                      {formatTaskCreatedAt(task.created_at)}
                    </p>
                  </div>
                </Link>
              </li>
            )
          })}
        </ul>
      ) : null}
    </DashboardCard>
  )
}
