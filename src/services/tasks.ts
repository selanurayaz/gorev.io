import type { PostgrestError } from '@supabase/supabase-js'

import {
  enrichTaskListItem,
  normalizeTaskListRow,
  normalizeTaskRow,
} from '@/lib/task-mapper'
import { sortTasksNewestFirst } from '@/lib/task-list-utils'
import {
  formatTaskCreateError,
  formatTaskFetchError,
  isPostgrestSchemaError,
  logSupabaseError,
} from '@/lib/supabase/errors'
import { getAuthSessionContext } from '@/lib/supabase/session'
import { supabase } from '@/lib/supabase/client'
import type { Task, TaskCreateInput, TaskListItem } from '@/types/task'

export type CreateTaskResult = {
  task: Task | null
  error: string | null
}

function buildTaskInsertPayload(
  customerId: string,
  input: TaskCreateInput,
): Record<string, unknown> {
  return {
    customer_id: customerId,
    title: input.title,
    description: input.description,
    category_id: input.category_id,
    city: input.city,
    budget_min: input.budget_min,
    budget_max: input.budget_max,
  }
}

/**
 * Oturum açmış kullanıcı için `tasks` tablosuna yeni görev ekler.
 * `customer_id` = Auth kullanıcı UUID'si.
 */
export async function createTask(
  input: TaskCreateInput,
): Promise<CreateTaskResult> {
  const auth = await getAuthSessionContext()
  if (!auth.session) {
    return { task: null, error: auth.error ?? 'Oturum bulunamadı.' }
  }

  const { userId } = auth.session
  const payload = buildTaskInsertPayload(userId, input)

  const { data, error } = await supabase
    .from('tasks')
    .insert(payload)
    .select('*')
    .single()

  if (error) {
    logSupabaseError('createTask', error, { userId })
    return { task: null, error: formatTaskCreateError(error) }
  }

  if (!data || typeof data !== 'object') {
    return { task: null, error: 'Görev oluşturuldu ancak yanıt alınamadı.' }
  }

  const task = normalizeTaskRow(data as Record<string, unknown>)
  if (!task) {
    return { task: null, error: 'Görev kaydı doğrulanamadı.' }
  }

  if (import.meta.env.DEV) {
    console.info('[tasks] created', { taskId: task.id, customerId: userId })
  }

  return { task, error: null }
}

export type FetchMyTasksResult = {
  tasks: TaskListItem[]
  error: string | null
}

type TaskQueryMode = 'with_category' | 'plain'

function toTaskRows(data: unknown): Record<string, unknown>[] {
  if (!Array.isArray(data)) return []
  return data.filter(
    (row): row is Record<string, unknown> =>
      row !== null && typeof row === 'object',
  )
}

async function queryCustomerTasks(
  customerId: string,
  mode: TaskQueryMode,
): Promise<{ rows: Record<string, unknown>[]; error: PostgrestError | null }> {
  const response =
    mode === 'with_category'
      ? await supabase
          .from('tasks')
          .select('*, categories(name)')
          .eq('customer_id', customerId)
          .order('created_at', { ascending: false })
      : await supabase
          .from('tasks')
          .select('*')
          .eq('customer_id', customerId)
          .order('created_at', { ascending: false })

  if (response.error) {
    return { rows: [], error: response.error }
  }

  return { rows: toTaskRows(response.data), error: null }
}

function mapTaskRows(
  rows: Record<string, unknown>[],
  categoryNames: Map<string, string>,
): TaskListItem[] {
  return rows
    .map((row) => normalizeTaskListRow(row, categoryNames))
    .filter((task): task is TaskListItem => task !== null)
}

/**
 * Oturum açmış kullanıcının görevlerini getirir (`customer_id` = Auth UUID).
 * En yeni görevler önce sıralanır.
 */
export async function fetchMyTasks(
  categoryNames: Map<string, string> = new Map(),
): Promise<FetchMyTasksResult> {
  const auth = await getAuthSessionContext()
  if (!auth.session) {
    return { tasks: [], error: auth.error ?? 'Oturum bulunamadı.' }
  }

  const { userId } = auth.session
  const modes: TaskQueryMode[] = ['with_category', 'plain']
  let lastError: PostgrestError | null = null

  for (const mode of modes) {
    const { rows, error } = await queryCustomerTasks(userId, mode)

    if (!error) {
      const tasks = sortTasksNewestFirst(mapTaskRows(rows, categoryNames))
      if (import.meta.env.DEV) {
        console.info('[tasks] fetched', { count: tasks.length, mode, userId })
      }
      return { tasks, error: null }
    }

    lastError = error
    logSupabaseError('fetchMyTasks', error, { mode, userId })

    if (!isPostgrestSchemaError(error)) {
      break
    }
  }

  if (lastError) {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('customer_id', userId)

    if (!error) {
      const tasks = sortTasksNewestFirst(
        toTaskRows(data)
          .map((row) => normalizeTaskRow(row))
          .filter((task): task is Task => task !== null)
          .map((task) => enrichTaskListItem(task, categoryNames)),
      )
      return { tasks, error: null }
    }

    return { tasks: [], error: formatTaskFetchError(lastError) }
  }

  return { tasks: [], error: null }
}
