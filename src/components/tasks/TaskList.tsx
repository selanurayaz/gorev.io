import { taskDetailPath } from '@/lib/paths'
import type { TaskListItem } from '@/types/task'

import { TaskCard } from '@/components/tasks/TaskCard'

type TaskListProps = {
  tasks: TaskListItem[]
}

export function TaskList({ tasks }: TaskListProps) {
  return (
    <ul className="grid list-none gap-4 sm:grid-cols-2">
      {tasks.map((task) => (
        <li key={task.id}>
          <TaskCard task={task} detailHref={taskDetailPath(task.id)} />
        </li>
      ))}
    </ul>
  )
}
