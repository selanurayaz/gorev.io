import type { TaskId } from '@/types/index'

export function taskDetailPath(taskId: TaskId): string {
  return `/kesfet/gorev/${taskId}`
}
