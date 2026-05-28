import { Link } from 'react-router-dom'

import { formatTaskCreatedAt } from '@/lib/task-display'
import { taskDetailPath } from '@/lib/paths'
import { formatTryAmount } from '@/utils/format'
import type { IncomingOfferItem } from '@/types/offer'
import { canRespondToOffer } from '@/lib/offer-display'

import { OfferStatusBadge } from '@/components/offers/OfferStatusBadge'
import { Button } from '@/components/ui/Button'
import { composeButtonClassName } from '@/lib/button-styles'
import { cn } from '@/lib/utils'

type IncomingOfferCardProps = {
  offer: IncomingOfferItem
  processingId: string | null
  onAccept: (offerId: string) => void
  onReject: (offerId: string) => void
}

export function IncomingOfferCard({
  offer,
  processingId,
  onAccept,
  onReject,
}: IncomingOfferCardProps) {
  const isProcessing = processingId === offer.id
  const canRespond = canRespondToOffer(offer.status)

  return (
    <article className="rounded-2xl border border-gorev-navy-800 bg-gradient-to-b from-gorev-navy-900/80 to-gorev-navy-950/90 p-5 transition hover:border-gorev-navy-700">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <Link
            to={taskDetailPath(offer.task_id)}
            className="text-base font-semibold text-gorev-snow transition hover:text-gorev-yellow-300"
          >
            {offer.task_title}
          </Link>
          <p className="mt-1 text-sm text-gorev-green-400">
            {offer.provider_name ?? 'Hizmet veren'}
          </p>
        </div>
        <OfferStatusBadge status={offer.status} />
      </div>

      {offer.message ? (
        <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-gorev-muted">
          {offer.message}
        </p>
      ) : null}

      <dl className="mt-4 grid gap-3 border-t border-gorev-navy-800 pt-4 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-gorev-muted">Teklif fiyatı</dt>
          <dd className="mt-0.5 font-semibold text-gorev-yellow-300">
            {formatTryAmount(offer.price)}
          </dd>
        </div>
        <div>
          <dt className="text-gorev-muted">Gönderim</dt>
          <dd className="mt-0.5 text-gorev-snow">
            {formatTaskCreatedAt(offer.created_at)}
          </dd>
        </div>
      </dl>

      {canRespond ? (
        <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            disabled={Boolean(processingId)}
            onClick={() => onReject(offer.id)}
            className={composeButtonClassName(
              'outline',
              cn(
                'min-h-10 w-full justify-center sm:w-auto sm:px-5',
                'hover:border-red-500/40 hover:text-red-300',
              ),
            )}
          >
            Reddet
          </button>
          <Button
            type="button"
            className="min-h-10 w-full justify-center sm:w-auto sm:px-6"
            loading={isProcessing}
            disabled={Boolean(processingId && !isProcessing)}
            onClick={() => onAccept(offer.id)}
          >
            Kabul et
          </Button>
        </div>
      ) : null}
    </article>
  )
}
