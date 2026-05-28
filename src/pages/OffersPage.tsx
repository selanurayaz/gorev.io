import { useState } from 'react'

import { IncomingOffersPanel } from '@/components/offers/IncomingOffersPanel'
import { OfferTabs, type OfferTabId } from '@/components/offers/OfferTabs'
import { SubmittedOffersPanel } from '@/components/offers/SubmittedOffersPanel'
import { useIncomingOffers } from '@/hooks/useIncomingOffers'
import { useOfferActions } from '@/hooks/useOfferActions'
import { useSubmittedOffers } from '@/hooks/useSubmittedOffers'

export function OffersPage() {
  const [activeTab, setActiveTab] = useState<OfferTabId>('incoming')

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
    processingId,
    actionError,
    successMessage,
    accept,
    reject,
    clearMessages,
  } = useOfferActions(() => {
    void reloadIncoming()
    void reloadSubmitted()
  })

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
          Görevlerinize gelen teklifleri yönetin veya verdiğiniz teklifleri
          takip edin.
        </p>
      </header>

      <OfferTabs
        activeTab={activeTab}
        onChange={(tab) => {
          clearMessages()
          setActiveTab(tab)
        }}
        incomingCount={
          incomingLoading ? undefined : incomingOffers.length
        }
        submittedCount={
          submittedLoading ? undefined : submittedOffers.length
        }
      />

      {activeTab === 'incoming' ? (
        <IncomingOffersPanel
          offers={incomingOffers}
          isLoading={incomingLoading}
          error={incomingError}
          processingId={processingId}
          actionError={actionError}
          successMessage={successMessage}
          onReload={() => void reloadIncoming()}
          onClearMessages={clearMessages}
          onAccept={(id) => void accept(id)}
          onReject={(id) => void reject(id)}
        />
      ) : (
        <SubmittedOffersPanel
          offers={submittedOffers}
          isLoading={submittedLoading}
          error={submittedError}
          onReload={() => void reloadSubmitted()}
        />
      )}
    </div>
  )
}
