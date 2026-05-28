import { Link } from 'react-router-dom'

import { AuthAlert } from '@/components/auth/AuthAlert'
import { OffersEmptyState } from '@/components/offers/OffersEmptyState'
import { SubmittedOfferCard } from '@/components/offers/SubmittedOfferCard'
import { Spinner } from '@/components/ui/Spinner'
import { composeButtonClassName } from '@/lib/button-styles'
import type { SubmittedOfferItem } from '@/types/offer'

type SubmittedOffersPanelProps = {
  offers: SubmittedOfferItem[]
  isLoading: boolean
  error: string | null
  onReload: () => void
}

export function SubmittedOffersPanel({
  offers,
  isLoading,
  error,
  onReload,
}: SubmittedOffersPanelProps) {
  return (
    <div
      className="space-y-4"
      role="tabpanel"
      aria-label="Verdiğim teklifler"
    >
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

      {isLoading ? (
        <div
          className="flex flex-col items-center justify-center gap-3 py-16"
          role="status"
        >
          <Spinner className="h-8 w-8 text-gorev-yellow-400" />
          <p className="text-sm text-gorev-muted">
            Verdiğiniz teklifler yükleniyor…
          </p>
        </div>
      ) : null}

      {!isLoading && !error && offers.length === 0 ? (
        <div className="space-y-4">
          <OffersEmptyState
            title="Henüz teklif göndermediniz"
            description="Görev Keşfet üzerinden ilgilendiğiniz görevlere teklif verebilirsiniz."
          />
          <div className="flex justify-center">
            <Link
              to="/kesfet"
              className={composeButtonClassName(
                'primary',
                'inline-flex min-h-11 items-center justify-center px-8',
              )}
            >
              Görev Keşfet
            </Link>
          </div>
        </div>
      ) : null}

      {!isLoading && offers.length > 0 ? (
        <ul className="space-y-4">
          {offers.map((offer) => (
            <li key={offer.id}>
              <SubmittedOfferCard offer={offer} />
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}
