import {
  formatTaskBudgetRange,
  formatTaskCreatedAt,
} from '@/lib/task-display'
import type { TaskListItem } from '@/types/task'

import { TaskStatusBadge } from '@/components/tasks/TaskStatusBadge'

type TaskCardProps = {
  task: TaskListItem
}

export function TaskCard({ task }: TaskCardProps) {
  const categoryLabel = task.category_name ?? 'Kategori belirtilmedi'
  const cityLabel = task.city?.trim() || 'Şehir belirtilmedi'

  return (
    <article className="flex h-full flex-col rounded-2xl border border-gorev-navy-800 bg-gradient-to-b from-gorev-navy-900/80 to-gorev-navy-950/90 p-5 shadow-[0_1px_0_0_rgba(255,255,255,0.04)_inset] transition hover:border-gorev-navy-700 hover:shadow-lg hover:shadow-black/20">
      <div className="flex items-start justify-between gap-3">
        <h3 className="min-w-0 flex-1 text-base font-semibold leading-snug tracking-tight text-gorev-snow">
          {task.title}
        </h3>
        <TaskStatusBadge status={task.status} />
      </div>

      <dl className="mt-4 flex flex-1 flex-col gap-3 text-sm">
        <div className="flex items-start justify-between gap-3">
          <dt className="shrink-0 text-gorev-muted">Kategori</dt>
          <dd className="text-right font-medium text-gorev-snow">{categoryLabel}</dd>
        </div>
        <div className="flex items-start justify-between gap-3">
          <dt className="shrink-0 text-gorev-muted">Şehir</dt>
          <dd className="text-right font-medium text-gorev-snow">{cityLabel}</dd>
        </div>
        <div className="flex items-start justify-between gap-3">
          <dt className="shrink-0 text-gorev-muted">Bütçe</dt>
          <dd className="text-right font-semibold text-gorev-yellow-300">
            {formatTaskBudgetRange(task)}
          </dd>
        </div>
      </dl>

      <footer className="mt-5 flex items-center justify-between gap-2 border-t border-gorev-navy-800 pt-4">
        <span className="text-xs text-gorev-muted">Oluşturulma</span>
        <time
          className="text-xs font-medium text-gorev-snow"
          dateTime={task.created_at}
        >
          {formatTaskCreatedAt(task.created_at)}
        </time>
      </footer>
    </article>
  )
}
