import { formatCityLabel } from '@/lib/cities'
import {
  formatTaskBudgetRange,
  formatTaskCreatedAt,
} from '@/lib/task-display'
import type { MarketplaceTask } from '@/types/task'

import { TaskStatusBadge } from '@/components/tasks/TaskStatusBadge'

type TaskDetailPanelProps = {
  task: MarketplaceTask
}

export function TaskDetailPanel({ task }: TaskDetailPanelProps) {
  const categoryLabel = task.category_name ?? 'Kategori belirtilmedi'
  const ownerLabel = task.owner_name?.trim() || 'Belirtilmedi'

  return (
    <section className="rounded-2xl border border-gorev-navy-800 bg-gradient-to-b from-gorev-navy-900/80 to-gorev-navy-950/90 p-6 sm:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gorev-green-400">
            Görev detayı
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-gorev-snow sm:text-3xl">
            {task.title}
          </h1>
        </div>
        <TaskStatusBadge status={task.status} className="self-start" />
      </div>

      {task.description ? (
        <div className="mt-6">
          <h2 className="text-sm font-semibold text-gorev-snow">Açıklama</h2>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-gorev-muted">
            {task.description}
          </p>
        </div>
      ) : null}

      <dl className="mt-6 grid gap-4 border-t border-gorev-navy-800 pt-6 sm:grid-cols-2">
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-gorev-muted">
            Kategori
          </dt>
          <dd className="mt-1 text-sm font-medium text-gorev-snow">
            {categoryLabel}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-gorev-muted">
            Şehir
          </dt>
          <dd className="mt-1 text-sm font-medium text-gorev-snow">
            {formatCityLabel(task.city)}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-gorev-muted">
            Bütçe aralığı
          </dt>
          <dd className="mt-1 text-sm font-semibold text-gorev-yellow-300">
            {formatTaskBudgetRange(task)}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-gorev-muted">
            Görev sahibi
          </dt>
          <dd className="mt-1 text-sm font-medium text-gorev-green-400">
            {ownerLabel}
          </dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="text-xs font-medium uppercase tracking-wide text-gorev-muted">
            Oluşturulma
          </dt>
          <dd className="mt-1 text-sm text-gorev-snow">
            <time dateTime={task.created_at}>
              {formatTaskCreatedAt(task.created_at)}
            </time>
          </dd>
        </div>
      </dl>
    </section>
  )
}
