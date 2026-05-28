import { Link, useLocation } from 'react-router-dom'

import { AuthAlert } from '@/components/auth/AuthAlert'
import { TaskList } from '@/components/tasks/TaskList'
import { TaskListEmpty } from '@/components/tasks/TaskListEmpty'
import { TaskListLoading } from '@/components/tasks/TaskListLoading'
import { useMyTasks } from '@/hooks/useMyTasks'
import { composeButtonClassName } from '@/lib/button-styles'

type TaskCreatedState = {
  taskCreated?: boolean
  taskTitle?: string
}

export function MyTasksPage() {
  const location = useLocation()
  const state = (location.state ?? {}) as TaskCreatedState
  const showSuccess = Boolean(state.taskCreated)

  const { tasks, taskCount, isLoading, error, reload } = useMyTasks()

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gorev-green-400">
            Görevlerim
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-gorev-snow sm:text-3xl">
            Görev listeniz
          </h1>
          <p className="mt-2 text-sm text-gorev-muted">
            {isLoading
              ? 'Görevleriniz yükleniyor…'
              : taskCount > 0
                ? `${taskCount} görev listeleniyor · en yeniler önce`
                : 'Henüz yayınlanmış göreviniz yok'}
          </p>
        </div>
        <Link
          to="/dashboard/gorev-olustur"
          className={composeButtonClassName(
            'primary',
            'inline-flex min-h-11 shrink-0 items-center justify-center px-6',
          )}
        >
          Yeni görev oluştur
        </Link>
      </div>

      {showSuccess ? (
        <AuthAlert
          variant="success"
          message={
            state.taskTitle
              ? `“${state.taskTitle}” göreviniz yayına alındı ve listeye eklendi.`
              : 'Göreviniz başarıyla oluşturuldu ve listeye eklendi.'
          }
        />
      ) : null}

      {error ? (
        <div className="space-y-3">
          <AuthAlert message={error} variant="error" />
          <button
            type="button"
            onClick={() => void reload()}
            className="text-sm font-medium text-gorev-yellow-400 underline-offset-4 hover:underline"
          >
            Tekrar dene
          </button>
        </div>
      ) : null}

      {isLoading ? <TaskListLoading /> : null}

      {!isLoading && !error && tasks.length === 0 ? <TaskListEmpty /> : null}

      {!isLoading && tasks.length > 0 ? <TaskList tasks={tasks} /> : null}
    </div>
  )
}
