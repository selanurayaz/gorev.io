import { taskDetailPath } from '@/lib/paths'
import type { MarketplaceTask } from '@/types/task'

import { TaskCard } from '@/components/tasks/TaskCard'

type MarketplaceTaskGridProps = {
  tasks: MarketplaceTask[]
}

export function MarketplaceTaskGrid({ tasks }: MarketplaceTaskGridProps) {
  return (
    <ul className="grid list-none gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {tasks.map((task) => (
        <li key={task.id}>
          <TaskCard
            task={task}
            ownerName={task.owner_name}
            detailHref={taskDetailPath(task.id)}
          />
        </li>
      ))}
    </ul>
  )
}
