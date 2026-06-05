import { Link } from 'react-router-dom'

import { TaskStatusBadge } from '@/components/tasks/TaskStatusBadge'
import { formatCityLabel } from '@/lib/cities'
import { formatTaskCreatedAt } from '@/lib/task-display'
import { taskDetailPath } from '@/lib/paths'
import { cn } from '@/lib/utils'
import { formatTryAmount } from '@/utils/format'
import type { AcceptedWorkItem } from '@/types/offer'

type AcceptedWorkCardProps = {
  item: AcceptedWorkItem
  className?: string
}

export function AcceptedWorkCard({ item, className }: AcceptedWorkCardProps) {
  const categoryLabel = item.task_category_name ?? 'Kategori belirtilmedi'
  const cityLabel = formatCityLabel(item.task_city)
  const customerLabel = item.customer_name?.trim() || 'Görev sahibi'

  const article = (
    <article
      className={cn(
        'flex h-full flex-col rounded-2xl border border-gorev-navy-800 bg-gradient-to-b from-gorev-navy-900/80 to-gorev-navy-950/90 p-5 shadow-[0_1px_0_0_rgba(255,255,255,0.04)_inset] transition duration-200 hover:-translate-y-0.5 hover:border-gorev-navy-700 hover:shadow-lg hover:shadow-black/25',
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="min-w-0 flex-1 text-base font-semibold leading-snug tracking-tight text-gorev-snow">
          {item.task_title}
        </h3>
        <TaskStatusBadge status={item.task_status} />
      </div>

      <dl className="mt-4 flex flex-1 flex-col gap-3 text-sm">
        <div className="flex items-start justify-between gap-3">
          <dt className="shrink-0 text-gorev-muted">Kategori</dt>
          <dd className="text-right font-medium text-gorev-snow">
            {categoryLabel}
          </dd>
        </div>
        <div className="flex items-start justify-between gap-3">
          <dt className="shrink-0 text-gorev-muted">Şehir</dt>
          <dd className="text-right font-medium text-gorev-snow">
            {cityLabel}
          </dd>
        </div>
        <div className="flex items-start justify-between gap-3">
          <dt className="shrink-0 text-gorev-muted">Kabul edilen fiyat</dt>
          <dd className="text-right font-semibold text-gorev-yellow-300">
            {formatTryAmount(item.price)}
          </dd>
        </div>
        <div className="flex items-start justify-between gap-3">
          <dt className="shrink-0 text-gorev-muted">Görev sahibi</dt>
          <dd className="text-right font-medium text-gorev-green-400">
            {customerLabel}
          </dd>
        </div>
      </dl>

      <footer className="mt-5 flex items-center justify-between gap-2 border-t border-gorev-navy-800 pt-4">
        <span className="text-xs text-gorev-muted">Oluşturulma</span>
        <time
          className="text-xs font-medium text-gorev-snow"
          dateTime={item.created_at}
        >
          {formatTaskCreatedAt(item.created_at)}
        </time>
      </footer>
    </article>
  )

  return (
    <Link
      to={taskDetailPath(item.task_id)}
      className="group block h-full rounded-2xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gorev-yellow-400"
    >
      {article}
    </Link>
  )
}
