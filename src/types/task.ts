import type { TaskId } from '@/types/index'

/** `tasks` tablosu — oluşturma ve yönlendirme için temel alanlar. */
export type Task = {
  id: TaskId
  customer_id: string
  title: string
  description: string | null
  category_id: string | null
  city: string | null
  budget_min: number | null
  budget_max: number | null
  status?: string | null
  created_at?: string
}

/** Liste görünümü — kategori adı istemci tarafında zenginleştirilir. */
export type TaskListItem = Task & {
  category_name: string | null
}

/** Keşfet / marketplace — görev sahibi adı dahil. */
export type MarketplaceTask = TaskListItem & {
  owner_name: string | null
}

export type TaskFormValues = {
  title: string
  description: string
  category_id: string
  city: string
  budget_min: string
  budget_max: string
}

export type TaskCreateInput = {
  title: string
  description: string
  category_id: string
  city: string
  budget_min: number
  budget_max: number
}
