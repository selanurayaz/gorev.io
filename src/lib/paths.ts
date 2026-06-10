import type { ServiceId, TaskId } from '@/types/index'

export function taskDetailPath(taskId: TaskId): string {
  return `/kesfet/gorev/${taskId}`
}

export function serviceDetailPath(serviceId: ServiceId): string {
  return `/kesfet/hizmet/${serviceId}`
}

export function messageThreadPath(taskId: TaskId, otherUserId: string): string {
  const params = new URLSearchParams({
    gorev: taskId,
    karsi: otherUserId,
  })
  return `/dashboard/mesajlar?${params.toString()}`
}
