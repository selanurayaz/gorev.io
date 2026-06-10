import { Link, useParams } from 'react-router-dom'

import { AuthAlert } from '@/components/auth/AuthAlert'
import { ReviewList } from '@/components/reviews/ReviewList'
import { ServiceDetailPanel } from '@/components/services/ServiceDetailPanel'
import { ServiceRequestSection } from '@/components/services/ServiceRequestSection'
import { Container } from '@/components/ui/Container'
import { Spinner } from '@/components/ui/Spinner'
import { useAuth } from '@/hooks/useAuth'
import { useRequestService } from '@/hooks/useRequestService'
import { useServiceDetail } from '@/hooks/useServiceDetail'
import { useServiceReviews } from '@/hooks/useServiceReviews'
import type { ServiceId } from '@/types/index'

export function ServiceDetailPage() {
  const { serviceId } = useParams<{ serviceId: string }>()
  const id = serviceId as ServiceId | undefined

  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  const { service, isLoading, error, reload } = useServiceDetail(id)

  const {
    reviews,
    isLoading: reviewsLoading,
    error: reviewsError,
    reload: reloadReviews,
  } = useServiceReviews(id)

  const {
    isSubmitting,
    error: requestError,
    successMessage,
    submit,
  } = useRequestService()

  const isOwner = Boolean(
    user?.id && service?.provider_id && user.id === service.provider_id,
  )

  return (
    <div className="border-b border-gorev-navy-800/80 bg-gorev-navy-950 pb-16 pt-6 sm:pt-10">
      <Container className="min-w-0 max-w-3xl space-y-6">
        <Link
          to="/kesfet"
          className="inline-flex text-sm font-medium text-gorev-yellow-400 transition hover:text-gorev-yellow-300"
        >
          ← Keşfet
        </Link>

        {isLoading ? (
          <div
            className="flex flex-col items-center justify-center gap-4 py-20"
            role="status"
          >
            <Spinner className="h-8 w-8 text-gorev-yellow-400" />
            <p className="text-sm text-gorev-muted">Hizmet yükleniyor…</p>
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

        {service && !isLoading ? (
          <>
            <ServiceDetailPanel service={service} />

            <div className="rounded-2xl border border-gorev-navy-800 bg-gorev-navy-900/40 p-5">
              <h2 className="text-sm font-semibold text-gorev-snow">
                Hizmet değerlendirmeleri
              </h2>
              <div className="mt-3">
                <ReviewList
                  reviews={reviews}
                  isLoading={reviewsLoading}
                  error={reviewsError}
                  onRetry={reloadReviews}
                />
              </div>
            </div>

            {!authLoading ? (
              <ServiceRequestSection
                service={service}
                isAuthenticated={isAuthenticated}
                isOwner={isOwner}
                isSubmitting={isSubmitting}
                error={requestError}
                successMessage={successMessage}
                onRequest={() => {
                  if (service) {
                    console.info('[ServiceDetailPage] hizmet talep et', {
                      id: service.id,
                      title: service.title,
                      provider_id: service.provider_id,
                      base_price: service.base_price,
                    })
                  }
                  if (id) void submit(id)
                }}
              />
            ) : null}
          </>
        ) : null}
      </Container>
    </div>
  )
}
