import { Link } from 'react-router-dom'

import { formatCityLabel } from '@/lib/cities'
import { formatTaskCreatedAt } from '@/lib/task-display'
import { taskDetailPath } from '@/lib/paths'
import { formatTryAmount } from '@/utils/format'
import type { SubmittedOfferItem } from '@/types/offer'

import { OfferStatusBadge } from '@/components/offers/OfferStatusBadge'

type SubmittedOfferCardProps = {
  offer: SubmittedOfferItem
}

export function SubmittedOfferCard({ offer }: SubmittedOfferCardProps) {
  return (
    <article className="min-w-0 rounded-2xl border border-gorev-navy-800 bg-gradient-to-b from-gorev-navy-900/80 to-gorev-navy-950/90 p-4 transition hover:border-gorev-navy-700 sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <Link
            to={taskDetailPath(offer.task_id)}
            className="text-base font-semibold text-gorev-snow transition hover:text-gorev-yellow-300"
          >
            {offer.task_title}
          </Link>
          <p className="mt-1 text-sm text-gorev-muted">
            {formatCityLabel(offer.task_city)}
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
    </article>
  )
}
