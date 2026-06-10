import { Link, useParams } from 'react-router-dom'

import { AuthAlert } from '@/components/auth/AuthAlert'
import { OfferForm } from '@/components/offers/OfferForm'
import { TaskOffersList } from '@/components/offers/TaskOffersList'
import { TaskDetailPanel } from '@/components/tasks/TaskDetailPanel'
import { TaskOwnerWorkPanel } from '@/components/tasks/TaskOwnerWorkPanel'
import { Container } from '@/components/ui/Container'
import { Spinner } from '@/components/ui/Spinner'
import { useAuth } from '@/hooks/useAuth'
import { useTaskDetail } from '@/hooks/useTaskDetail'
import { useTaskOffers } from '@/hooks/useTaskOffers'
import { composeButtonClassName } from '@/lib/button-styles'
import type { TaskId } from '@/types/index'

export function TaskDetailPage() {
  const { taskId } = useParams<{ taskId: string }>()
  const id = taskId as TaskId | undefined

  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  const { task, isLoading, error, reload } = useTaskDetail(id)

  const isOwner = Boolean(
    user?.id && task?.customer_id && user.id === task.customer_id,
  )

  const {
    offers,
    isLoading: offersLoading,
    error: offersError,
    reload: reloadOffers,
  } = useTaskOffers(id, isOwner)

  const canSubmitOffer =
    isAuthenticated &&
    !isOwner &&
    task?.status?.toLowerCase() === 'open'

  return (
    <div className="border-b border-gorev-navy-800/80 bg-gorev-navy-950 pb-16 pt-6 sm:pt-10">
      <Container className="max-w-3xl space-y-6">
        <Link
          to="/kesfet"
          className="inline-flex text-sm font-medium text-gorev-yellow-400 transition hover:text-gorev-yellow-300"
        >
          ← Görev Keşfet
        </Link>

        {isLoading ? (
          <div
            className="flex flex-col items-center justify-center gap-4 py-20"
            role="status"
          >
            <Spinner className="h-8 w-8 text-gorev-yellow-400" />
            <p className="text-sm text-gorev-muted">Görev yükleniyor…</p>
          </div>
        ) : null}

        {error && !isLoading ? (
          <div className="space-y-4">
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

        {task && !isLoading ? (
          <>
            <TaskDetailPanel task={task} />

            {isAuthenticated && isOwner && id ? (
              <TaskOwnerWorkPanel taskId={id} onUpdated={() => void reload()} />
            ) : null}

            {isOwner ? (
              <section className="rounded-2xl border border-gorev-navy-800 bg-gorev-navy-900/40 p-5 sm:p-6">
                <h2 className="text-lg font-semibold text-gorev-snow">
                  Gelen teklifler
                </h2>
                <p className="mt-1 text-sm text-gorev-muted">
                  Yalnızca siz bu teklifleri görebilirsiniz.
                </p>
                <div className="mt-5">
                  <TaskOffersList
                    offers={offers}
                    isLoading={offersLoading}
                    error={offersError}
                    onRetry={reloadOffers}
                  />
                </div>
              </section>
            ) : null}

            {!authLoading && !isAuthenticated ? (
              <section className="rounded-2xl border border-gorev-navy-800 bg-gorev-navy-900/40 p-5 sm:p-6">
                <h2 className="text-lg font-semibold text-gorev-snow">
                  Teklif verin
                </h2>
                <p className="mt-2 text-sm text-gorev-muted">
                  Bu göreve teklif göndermek için giriş yapmanız gerekir.
                </p>
                <Link
                  to="/giris"
                  className={composeButtonClassName(
                    'primary',
                    'mt-5 inline-flex min-h-11 items-center justify-center px-8',
                  )}
                >
                  Giriş yap
                </Link>
              </section>
            ) : null}

            {!authLoading && isAuthenticated && isOwner ? (
              <AuthAlert
                variant="info"
                message="Bu sizin göreviniz. Kendi ilanınıza teklif veremezsiniz; gelen teklifleri yukarıda görebilirsiniz."
              />
            ) : null}

            {!authLoading &&
            isAuthenticated &&
            !isOwner &&
            task.status?.toLowerCase() !== 'open' ? (
              <AuthAlert
                variant="info"
                message="Bu görev artık açık değil; yeni teklif kabul edilmiyor."
              />
            ) : null}

            {canSubmitOffer && id ? (
              <section className="rounded-2xl border border-gorev-navy-800 bg-gorev-navy-900/40 p-5 sm:p-6">
                <h2 className="text-lg font-semibold text-gorev-snow">
                  Teklif verin
                </h2>
                <p className="mt-1 text-sm text-gorev-muted">
                  Fiyat ve kısa bir mesajla görev sahibine ulaşın.
                </p>
                <div className="mt-5">
                  <OfferForm taskId={id} />
                </div>
              </section>
            ) : null}
          </>
        ) : null}
      </Container>
    </div>
  )
}
