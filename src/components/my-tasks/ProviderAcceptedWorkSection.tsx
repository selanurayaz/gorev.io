import { AuthAlert } from '@/components/auth/AuthAlert'
import { AcceptedWorkList } from '@/components/my-tasks/AcceptedWorkList'
import { TaskListLoading } from '@/components/tasks/TaskListLoading'
import { useMyTasks } from '@/hooks/useMyTasks'

export function ProviderAcceptedWorkSection() {
  const { items, jobCount, isLoading, error, reload } = useMyTasks()

  if (!isLoading && !error && items.length === 0) {
    return null
  }

  return (
    <section className="space-y-4">
      <header>
        <h2 className="text-lg font-semibold text-gorev-snow">
          Üzerinde çalıştığınız görevler
        </h2>
        <p className="mt-1 text-sm text-gorev-muted">
          {isLoading
            ? 'Görevleriniz yükleniyor…'
            : jobCount > 0
              ? `${jobCount} kabul edilmiş teklif · en yeniler önce`
              : 'Henüz kabul edilmiş göreviniz yok'}
        </p>
      </header>

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

      {!isLoading && items.length > 0 ? (
        <AcceptedWorkList items={items} />
      ) : null}
    </section>
  )
}
