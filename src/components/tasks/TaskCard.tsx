import { Link } from 'react-router-dom'

import { formatCityLabel } from '@/lib/cities'
import {
  formatTaskBudgetRange,
  formatTaskCreatedAt,
} from '@/lib/task-display'
import { cn } from '@/lib/utils'
import type { TaskListItem } from '@/types/task'

import { TaskStatusBadge } from '@/components/tasks/TaskStatusBadge'

type TaskCardProps = {
  task: TaskListItem
  ownerName?: string | null
  className?: string
  /** Verilirse kart tıklanabilir görev detayına gider. */
  detailHref?: string
}

export function TaskCard({
  task,
  ownerName,
  className,
  detailHref,
}: TaskCardProps) {
  const categoryLabel = task.category_name ?? 'Kategori belirtilmedi'
  const cityLabel = formatCityLabel(task.city)

  const ownerLabel = ownerName?.trim() || null

  const article = (
    <article
      className={cn(
        'flex h-full flex-col rounded-2xl border border-gorev-navy-800 bg-gradient-to-b from-gorev-navy-900/80 to-gorev-navy-950/90 p-5 shadow-[0_1px_0_0_rgba(255,255,255,0.04)_inset] transition duration-200',
        detailHref &&
          'hover:-translate-y-0.5 hover:border-gorev-navy-700 hover:shadow-lg hover:shadow-black/25',
        className,
      )}
    >
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
        {ownerLabel ? (
          <div className="flex items-start justify-between gap-3">
            <dt className="shrink-0 text-gorev-muted">Görev sahibi</dt>
            <dd className="text-right font-medium text-gorev-green-400">
              {ownerLabel}
            </dd>
          </div>
        ) : null}
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

  if (detailHref) {
    return (
      <Link
        to={detailHref}
        className="group block h-full rounded-2xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gorev-yellow-400"
      >
        {article}
      </Link>
    )
  }

  return article
}
