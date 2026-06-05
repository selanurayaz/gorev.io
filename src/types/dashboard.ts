import type { TaskListItem } from '@/types/task'

export type DashboardStats = {
  activeTasks: number
  completedTasks: number
  unreadMessages: number
  averageRating: number | null
  reviewCount: number
}

export type DashboardStatDisplay = {
  id: string
  label: string
  value: string
  hint: string
}

export type DashboardActivityItem = {
  id: string
  text: string
  time: string
  type: 'offer' | 'publish' | 'message' | 'complete' | 'default'
}

export type DashboardData = {
  stats: DashboardStats
  recentTasks: TaskListItem[]
  activity: DashboardActivityItem[]
}
