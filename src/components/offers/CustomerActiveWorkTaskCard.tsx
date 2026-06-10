import { Link } from 'react-router-dom'

import { TaskOwnerWorkPanel } from '@/components/tasks/TaskOwnerWorkPanel'
import { TaskStatusBadge } from '@/components/tasks/TaskStatusBadge'
import { taskDetailPath } from '@/lib/paths'
import type { TaskListItem } from '@/types/task'
import type { TaskId } from '@/types/index'

type CustomerActiveWorkTaskCardProps = {
  task: TaskListItem
  onUpdated: () => void
}

export function CustomerActiveWorkTaskCard({
  task,
  onUpdated,
}: CustomerActiveWorkTaskCardProps) {
  return (
    <li className="rounded-2xl border border-gorev-navy-800 bg-gorev-navy-900/40 p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link
            to={taskDetailPath(task.id)}
            className="text-base font-semibold text-gorev-snow transition hover:text-gorev-yellow-300"
          >
            {task.title}
          </Link>
          <p className="mt-1 text-xs text-gorev-muted">
            {task.category_name ?? 'Kategori belirtilmedi'}
          </p>
        </div>
        <TaskStatusBadge status={task.status} />
      </div>
      <div className="mt-4">
        <TaskOwnerWorkPanel
          taskId={task.id as TaskId}
          onUpdated={onUpdated}
          onReviewSubmitted={onUpdated}
        />
      </div>
    </li>
  )
}
