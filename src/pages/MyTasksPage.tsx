import { AuthAlert } from '@/components/auth/AuthAlert'
import { AcceptedWorkList } from '@/components/my-tasks/AcceptedWorkList'
import { MyTasksEmpty } from '@/components/my-tasks/MyTasksEmpty'
import { TaskListLoading } from '@/components/tasks/TaskListLoading'
import { useMyTasks } from '@/hooks/useMyTasks'

export function MyTasksPage() {
  const { items, jobCount, isLoading, error, reload } = useMyTasks()

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gorev-green-400">
          Görevlerim
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-gorev-snow sm:text-3xl">
          Üzerinde çalıştığınız görevler
        </h1>
        <p className="mt-2 text-sm text-gorev-muted">
          {isLoading
            ? 'Görevleriniz yükleniyor…'
            : jobCount > 0
              ? `${jobCount} kabul edilmiş görev · en yeniler önce`
              : 'Henüz kabul edilmiş göreviniz yok'}
        </p>
      </div>

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

      {!isLoading && !error && items.length === 0 ? <MyTasksEmpty /> : null}

      {!isLoading && items.length > 0 ? (
        <AcceptedWorkList items={items} />
      ) : null}
    </div>
  )
}
