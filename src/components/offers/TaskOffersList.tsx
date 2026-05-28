import { formatTaskCreatedAt } from '@/lib/task-display'
import { formatTryAmount } from '@/utils/format'
import type { OfferListItem } from '@/types/offer'

import { AuthAlert } from '@/components/auth/AuthAlert'
import { Spinner } from '@/components/ui/Spinner'

type TaskOffersListProps = {
  offers: OfferListItem[]
  isLoading: boolean
  error: string | null
  onRetry?: () => void
}

export function TaskOffersList({
  offers,
  isLoading,
  error,
  onRetry,
}: TaskOffersListProps) {
  if (isLoading) {
    return (
      <div
        className="flex flex-col items-center justify-center gap-3 py-10"
        role="status"
      >
        <Spinner className="h-7 w-7 text-gorev-yellow-400" />
        <p className="text-sm text-gorev-muted">Teklifler yükleniyor…</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-3">
        <AuthAlert message={error} variant="error" />
        {onRetry ? (
          <button
            type="button"
            onClick={() => void onRetry()}
            className="text-sm font-medium text-gorev-yellow-400 underline-offset-4 hover:underline"
          >
            Tekrar dene
          </button>
        ) : null}
      </div>
    )
  }

  if (offers.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-gorev-navy-700 bg-gorev-navy-900/30 px-4 py-8 text-center text-sm text-gorev-muted">
        Bu göreve henüz teklif gelmedi. İlanınız yayında kaldığı sürece
        hizmet verenler teklif gönderebilir.
      </p>
    )
  }

  return (
    <ul className="space-y-3">
      {offers.map((offer) => (
        <li
          key={offer.id}
          className="rounded-xl border border-gorev-navy-800 bg-gorev-navy-950/50 p-4 transition hover:border-gorev-navy-700"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <p className="font-semibold text-gorev-snow">
                {offer.provider_name ?? 'Hizmet veren'}
              </p>
              {offer.message ? (
                <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-gorev-muted">
                  {offer.message}
                </p>
              ) : null}
            </div>
            <div className="shrink-0 text-left sm:text-right">
              <p className="text-lg font-semibold text-gorev-yellow-300">
                {formatTryAmount(offer.price)}
              </p>
              <p className="mt-1 text-xs text-gorev-muted">
                {formatTaskCreatedAt(offer.created_at)}
              </p>
            </div>
          </div>
        </li>
      ))}
    </ul>
  )
}
