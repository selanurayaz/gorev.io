import { Link } from 'react-router-dom'

import { formatTaskCreatedAt } from '@/lib/task-display'
import { messageThreadPath, taskDetailPath } from '@/lib/paths'
import { formatTryAmount } from '@/utils/format'
import type { ServiceRequestItem } from '@/types/offer'
import { canRespondToOffer } from '@/lib/offer-display'

import { OfferStatusBadge } from '@/components/offers/OfferStatusBadge'
import { Button } from '@/components/ui/Button'
import { composeButtonClassName } from '@/lib/button-styles'
import { cn } from '@/lib/utils'

type ServiceRequestCardProps = {
  request: ServiceRequestItem
  processingId: string | null
  onAccept: (offerId: string) => void
  onReject: (offerId: string) => void
}

export function ServiceRequestCard({
  request,
  processingId,
  onAccept,
  onReject,
}: ServiceRequestCardProps) {
  const isProcessing = processingId === request.id
  const canRespond = canRespondToOffer(request.status)
  const isAccepted = request.status?.toLowerCase() === 'accepted'

  return (
    <article className="min-w-0 rounded-2xl border border-gorev-navy-800 bg-gradient-to-b from-gorev-navy-900/80 to-gorev-navy-950/90 p-4 transition hover:border-gorev-navy-700 sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-gorev-green-400">
            Hizmet talebi
          </p>
          <Link
            to={taskDetailPath(request.task_id)}
            className="mt-1 block text-base font-semibold text-gorev-snow transition hover:text-gorev-yellow-300"
          >
            {request.service_title ?? request.task_title}
          </Link>
          <p className="mt-1 text-sm text-gorev-muted">
            {request.customer_name ?? 'Müşteri'}
            {request.task_city ? ` · ${request.task_city}` : ''}
          </p>
        </div>
        <OfferStatusBadge status={request.status} />
      </div>

      {request.message ? (
        <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-gorev-muted">
          {request.message}
        </p>
      ) : null}

      <dl className="mt-4 grid gap-3 border-t border-gorev-navy-800 pt-4 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-gorev-muted">Talep fiyatı</dt>
          <dd className="mt-0.5 font-semibold text-gorev-yellow-300">
            {formatTryAmount(request.price)}
          </dd>
        </div>
        <div>
          <dt className="text-gorev-muted">Gönderim</dt>
          <dd className="mt-0.5 text-gorev-snow">
            {formatTaskCreatedAt(request.created_at)}
          </dd>
        </div>
      </dl>

      {canRespond ? (
        <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            disabled={Boolean(processingId)}
            onClick={() => onReject(request.id)}
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
            onClick={() => onAccept(request.id)}
          >
            Kabul et
          </Button>
        </div>
      ) : null}

      {isAccepted && request.customer_id ? (
        <div className="mt-5 border-t border-gorev-navy-800 pt-4">
          <Link
            to={messageThreadPath(request.task_id, request.customer_id)}
            className="text-sm font-medium text-gorev-yellow-400 underline-offset-4 hover:underline"
          >
            Müşteriyle mesajlaş
          </Link>
        </div>
      ) : null}
    </article>
  )
}
