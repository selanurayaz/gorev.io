import { useSearchParams } from 'react-router-dom'

import { CustomerActiveWorkSection } from '@/components/offers/CustomerActiveWorkSection'
import { IncomingOffersPanel } from '@/components/offers/IncomingOffersPanel'
import { OfferTabs, type OfferTabId } from '@/components/offers/OfferTabs'
import { ServiceRequestsPanel } from '@/components/offers/ServiceRequestsPanel'
import { SubmittedOffersPanel } from '@/components/offers/SubmittedOffersPanel'
import { useIncomingOffers } from '@/hooks/useIncomingOffers'
import { useOfferActions } from '@/hooks/useOfferActions'
import { useServiceRequestActions } from '@/hooks/useServiceRequestActions'
import { useServiceRequests } from '@/hooks/useServiceRequests'
import { useSubmittedOffers } from '@/hooks/useSubmittedOffers'

function parseInitialTab(param: string | null): OfferTabId {
  if (param === 'talepler' || param === 'requests') return 'requests'
  if (param === 'submitted' || param === 'gonderilen') return 'submitted'
  return 'incoming'
}

export function OffersPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const activeTab = parseInitialTab(searchParams.get('sekme'))

  const {
    offers: incomingOffers,
    isLoading: incomingLoading,
    error: incomingError,
    reload: reloadIncoming,
  } = useIncomingOffers()

  const {
    offers: submittedOffers,
    isLoading: submittedLoading,
    error: submittedError,
    reload: reloadSubmitted,
  } = useSubmittedOffers()

  const {
    requests: serviceRequests,
    isLoading: requestsLoading,
    error: requestsError,
    reload: reloadRequests,
  } = useServiceRequests()

  const {
    processingId: offerProcessingId,
    actionError: offerActionError,
    successMessage: offerSuccessMessage,
    accept: acceptOffer,
    reject: rejectOffer,
    clearMessages: clearOfferMessages,
  } = useOfferActions(() => {
    void reloadIncoming()
    void reloadSubmitted()
  })

  const {
    processingId: requestProcessingId,
    actionError: requestActionError,
    successMessage: requestSuccessMessage,
    accept: acceptRequest,
    reject: rejectRequest,
    clearMessages: clearRequestMessages,
  } = useServiceRequestActions(() => {
    void reloadRequests()
    void reloadSubmitted()
  })

  function handleTabChange(tab: OfferTabId) {
    clearOfferMessages()
    clearRequestMessages()

    const sekme =
      tab === 'requests'
        ? 'talepler'
        : tab === 'submitted'
          ? 'gonderilen'
          : 'gelen'

    setSearchParams({ sekme })
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gorev-green-400">
          Teklif yönetimi
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-gorev-snow sm:text-3xl">
          Teklifler
        </h1>
        <p className="mt-2 text-sm text-gorev-muted">
          Görevlerinize gelen teklifleri, hizmet taleplerini veya verdiğiniz
          teklifleri yönetin.
        </p>
      </header>

      <OfferTabs
        activeTab={activeTab}
        onChange={handleTabChange}
        incomingCount={
          incomingLoading ? undefined : incomingOffers.length
        }
        requestsCount={
          requestsLoading ? undefined : serviceRequests.length
        }
        submittedCount={
          submittedLoading ? undefined : submittedOffers.length
        }
      />

      {activeTab === 'incoming' ? (
        <>
          <CustomerActiveWorkSection />
          <IncomingOffersPanel
          offers={incomingOffers}
          isLoading={incomingLoading}
          error={incomingError}
          processingId={offerProcessingId}
          actionError={offerActionError}
          successMessage={offerSuccessMessage}
          onReload={() => void reloadIncoming()}
          onClearMessages={clearOfferMessages}
          onAccept={(id) => void acceptOffer(id)}
          onReject={(id) => void rejectOffer(id)}
        />
        </>
      ) : null}

      {activeTab === 'requests' ? (
        <ServiceRequestsPanel
          requests={serviceRequests}
          isLoading={requestsLoading}
          error={requestsError}
          processingId={requestProcessingId}
          actionError={requestActionError}
          successMessage={requestSuccessMessage}
          onReload={() => void reloadRequests()}
          onAccept={(id) => void acceptRequest(id)}
          onReject={(id) => void rejectRequest(id)}
        />
      ) : null}

      {activeTab === 'submitted' ? (
        <SubmittedOffersPanel
          offers={submittedOffers}
          isLoading={submittedLoading}
          error={submittedError}
          onReload={() => void reloadSubmitted()}
        />
      ) : null}
    </div>
  )
}
