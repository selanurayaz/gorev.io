import { Link, useLocation } from 'react-router-dom'

import { AuthAlert } from '@/components/auth/AuthAlert'
import { ServiceList } from '@/components/services/ServiceList'
import { ServiceListEmpty } from '@/components/services/ServiceListEmpty'
import { ServiceListLoading } from '@/components/services/ServiceListLoading'
import { useMyServices } from '@/hooks/useMyServices'
import { composeButtonClassName } from '@/lib/button-styles'

type ServiceCreatedState = {
  serviceCreated?: boolean
  serviceTitle?: string
}

export function MyServicesPage() {
  const location = useLocation()
  const state = (location.state ?? {}) as ServiceCreatedState
  const showSuccess = Boolean(state.serviceCreated)

  const { services, serviceRatings, serviceCount, isLoading, error, reload } =
    useMyServices()

  return (
    <div className="mx-auto min-w-0 max-w-4xl space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gorev-green-400">
            Hizmetler
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-gorev-snow sm:text-3xl">
            Hizmet listeniz
          </h1>
          <p className="mt-2 text-sm text-gorev-muted">
            {isLoading
              ? 'Hizmetleriniz yükleniyor…'
              : serviceCount > 0
                ? `${serviceCount} hizmet listeleniyor · en yeniler önce`
                : 'Henüz yayınlanmış hizmetiniz yok'}
          </p>
        </div>
        <Link
          to="/dashboard/hizmet-olustur"
          className={composeButtonClassName(
            'primary',
            'inline-flex min-h-11 shrink-0 items-center justify-center px-6',
          )}
        >
          Yeni hizmet oluştur
        </Link>
      </div>

      {showSuccess ? (
        <AuthAlert
          variant="success"
          message={
            state.serviceTitle
              ? `“${state.serviceTitle}” hizmetiniz yayına alındı ve listeye eklendi.`
              : 'Hizmetiniz başarıyla oluşturuldu ve listeye eklendi.'
          }
        />
      ) : null}

      {error ? (
        <div className="space-y-3">
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

      {isLoading ? <ServiceListLoading /> : null}

      {!isLoading && !error && services.length === 0 ? (
        <ServiceListEmpty />
      ) : null}

      {!isLoading && services.length > 0 ? (
        <ServiceList services={services} serviceRatings={serviceRatings} />
      ) : null}
    </div>
  )
}
