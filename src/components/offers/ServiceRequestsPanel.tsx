import { AuthAlert } from '@/components/auth/AuthAlert'
import { ServiceRequestCard } from '@/components/offers/ServiceRequestCard'
import { OffersEmptyState } from '@/components/offers/OffersEmptyState'
import { Spinner } from '@/components/ui/Spinner'
import type { ServiceRequestItem } from '@/types/offer'

type ServiceRequestsPanelProps = {
  requests: ServiceRequestItem[]
  isLoading: boolean
  error: string | null
  processingId: string | null
  actionError: string | null
  successMessage: string | null
  onReload: () => void
  onAccept: (offerId: string) => void
  onReject: (offerId: string) => void
}

export function ServiceRequestsPanel({
  requests,
  isLoading,
  error,
  processingId,
  actionError,
  successMessage,
  onReload,
  onAccept,
  onReject,
}: ServiceRequestsPanelProps) {
  if (isLoading) {
    return (
      <div
        className="flex flex-col items-center justify-center gap-4 py-16"
        role="status"
      >
        <Spinner className="h-8 w-8 text-gorev-yellow-400" />
        <p className="text-sm text-gorev-muted">Hizmet talepleri yükleniyor…</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {error ? (
        <div className="space-y-3">
          <AuthAlert message={error} variant="error" />
          <button
            type="button"
            onClick={onReload}
            className="text-sm font-medium text-gorev-yellow-400 underline-offset-4 hover:underline"
          >
            Tekrar dene
          </button>
        </div>
      ) : null}

      {actionError ? <AuthAlert message={actionError} variant="error" /> : null}

      {successMessage ? (
        <AuthAlert message={successMessage} variant="success" />
      ) : null}

      {!isLoading && !error && requests.length === 0 ? (
        <OffersEmptyState
          title="Henüz hizmet talebi yok"
          description="Hizmetlerinize gelen müşteri talepleri burada listelenir."
        />
      ) : null}

      {!isLoading && requests.length > 0 ? (
        <ul className="space-y-4">
          {requests.map((request) => (
            <li key={request.id}>
              <ServiceRequestCard
                request={request}
                processingId={processingId}
                onAccept={onAccept}
                onReject={onReject}
              />
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}
