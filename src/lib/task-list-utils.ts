import type { Task } from '@/types/task'

export function sortTasksNewestFirst<T extends Pick<Task, 'id' | 'created_at'>>(
  tasks: T[],
): T[] {
  return [...tasks].sort((a, b) => {
    const aTime = a.created_at ? new Date(a.created_at).getTime() : 0
    const bTime = b.created_at ? new Date(b.created_at).getTime() : 0
    if (bTime !== aTime) return bTime - aTime
    return b.id.localeCompare(a.id)
  })
}
