import { AuthAlert } from '@/components/auth/AuthAlert'
import { CustomerActiveWorkTaskCard } from '@/components/offers/CustomerActiveWorkTaskCard'
import { Spinner } from '@/components/ui/Spinner'
import { useCustomerActiveWork } from '@/hooks/useCustomerActiveWork'
import type { TaskListItem } from '@/types/task'

type WorkListProps = {
  tasks: TaskListItem[]
  onUpdated: () => void
}

function WorkList({ tasks, onUpdated }: WorkListProps) {
  if (tasks.length === 0) return null

  return (
    <ul className="space-y-4">
      {tasks.map((task) => (
        <CustomerActiveWorkTaskCard
          key={task.id}
          task={task}
          onUpdated={onUpdated}
        />
      ))}
    </ul>
  )
}

export function CustomerActiveWorkSection() {
  const {
    serviceRequestOngoing,
    serviceRequestCompleted,
    otherOngoing,
    otherCompleted,
    tasks,
    isLoading,
    error,
    reload,
  } = useCustomerActiveWork()

  if (isLoading) {
    return (
      <div
        className="flex items-center justify-center gap-3 py-8"
        role="status"
      >
        <Spinner className="h-6 w-6 text-gorev-yellow-400" />
        <span className="text-sm text-gorev-muted">Aktif işler yükleniyor…</span>
      </div>
    )
  }

  if (error) {
    return (
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
    )
  }

  if (tasks.length === 0) {
    return (
      <section className="rounded-2xl border border-dashed border-gorev-navy-800 bg-gorev-navy-900/20 px-6 py-10 text-center">
        <p className="text-sm font-medium text-gorev-snow">
          Henüz devam eden veya tamamlanan işiniz yok
        </p>
        <p className="mt-2 text-sm text-gorev-muted">
          Kabul edilen hizmet talepleri ve görevler burada listelenir.
        </p>
      </section>
    )
  }

  const hasServiceRequests =
    serviceRequestOngoing.length > 0 || serviceRequestCompleted.length > 0
  const hasOtherWork = otherOngoing.length > 0 || otherCompleted.length > 0

  return (
    <div className="space-y-8">
      {hasServiceRequests ? (
        <section className="space-y-6">
          <header>
            <h2 className="text-lg font-semibold text-gorev-snow">
              Hizmet talepleriniz
            </h2>
            <p className="mt-1 text-sm text-gorev-muted">
              Kabul edilen hizmet taleplerini tamamlayın ve hizmet verene
              değerlendirme bırakın.
            </p>
          </header>

          {serviceRequestOngoing.length > 0 ? (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gorev-snow">
                Devam eden hizmet talepleriniz
              </h3>
              <WorkList tasks={serviceRequestOngoing} onUpdated={() => void reload()} />
            </div>
          ) : null}

          {serviceRequestCompleted.length > 0 ? (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gorev-snow">
                Tamamlanan hizmet talepleriniz
              </h3>
              <WorkList
                tasks={serviceRequestCompleted}
                onUpdated={() => void reload()}
              />
            </div>
          ) : null}
        </section>
      ) : null}

      {hasOtherWork ? (
        <section className="space-y-6">
          <header>
            <h2 className="text-lg font-semibold text-gorev-snow">
              Diğer görevleriniz
            </h2>
            <p className="mt-1 text-sm text-gorev-muted">
              Kabul edilmiş tekliflerle devam eden ve tamamlanan görevler.
            </p>
          </header>

          {otherOngoing.length > 0 ? (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gorev-snow">
                Devam eden görevleriniz
              </h3>
              <WorkList tasks={otherOngoing} onUpdated={() => void reload()} />
            </div>
          ) : null}

          {otherCompleted.length > 0 ? (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gorev-snow">
                Tamamlanan görevleriniz
              </h3>
              <WorkList tasks={otherCompleted} onUpdated={() => void reload()} />
            </div>
          ) : null}
        </section>
      ) : null}
    </div>
  )
}
