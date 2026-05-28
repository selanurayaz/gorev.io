import { AuthAlert } from '@/components/auth/AuthAlert'
import { IncomingOfferCard } from '@/components/offers/IncomingOfferCard'
import { OffersEmptyState } from '@/components/offers/OffersEmptyState'
import { Spinner } from '@/components/ui/Spinner'
import type { IncomingOfferItem } from '@/types/offer'

type IncomingOffersPanelProps = {
  offers: IncomingOfferItem[]
  isLoading: boolean
  error: string | null
  processingId: string | null
  actionError: string | null
  successMessage: string | null
  onReload: () => void
  onClearMessages: () => void
  onAccept: (offerId: string) => void
  onReject: (offerId: string) => void
}

export function IncomingOffersPanel({
  offers,
  isLoading,
  error,
  processingId,
  actionError,
  successMessage,
  onReload,
  onClearMessages,
  onAccept,
  onReject,
}: IncomingOffersPanelProps) {
  return (
    <div
      className="space-y-4"
      role="tabpanel"
      aria-label="Gelen teklifler"
    >
      {successMessage ? (
        <AuthAlert message={successMessage} variant="success" />
      ) : null}
      {actionError ? <AuthAlert message={actionError} variant="error" /> : null}

      {error ? (
        <div className="space-y-3">
          <AuthAlert message={error} variant="error" />
          <button
            type="button"
            onClick={() => {
              onClearMessages()
              onReload()
            }}
            className="text-sm font-medium text-gorev-yellow-400 underline-offset-4 hover:underline"
          >
            Tekrar dene
          </button>
        </div>
      ) : null}

      {isLoading ? (
        <div
          className="flex flex-col items-center justify-center gap-3 py-16"
          role="status"
        >
          <Spinner className="h-8 w-8 text-gorev-yellow-400" />
          <p className="text-sm text-gorev-muted">Gelen teklifler yükleniyor…</p>
        </div>
      ) : null}

      {!isLoading && !error && offers.length === 0 ? (
        <OffersEmptyState
          title="Henüz gelen teklif yok"
          description="Görevlerinize teklif geldiğinde burada görebilir ve kabul veya ret edebilirsiniz."
        />
      ) : null}

      {!isLoading && offers.length > 0 ? (
        <ul className="space-y-4">
          {offers.map((offer) => (
            <li key={offer.id}>
              <IncomingOfferCard
                offer={offer}
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
