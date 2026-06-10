import { Link } from 'react-router-dom'

import { AuthAlert } from '@/components/auth/AuthAlert'
import { Button } from '@/components/ui/Button'
import { composeButtonClassName } from '@/lib/button-styles'
import type { MarketplaceService } from '@/types/service'

type ServiceRequestSectionProps = {
  service: MarketplaceService
  isAuthenticated: boolean
  isOwner: boolean
  isSubmitting: boolean
  error: string | null
  successMessage: string | null
  onRequest: () => void
}

export function ServiceRequestSection({
  service,
  isAuthenticated,
  isOwner,
  isSubmitting,
  error,
  successMessage,
  onRequest,
}: ServiceRequestSectionProps) {
  if (isOwner) {
    return (
      <section className="rounded-2xl border border-gorev-navy-800 bg-gorev-navy-900/40 p-5">
        <p className="text-sm text-gorev-muted">
          Bu sizin hizmetiniz. Talepleri{' '}
          <Link
            to="/dashboard/teklifler?sekme=talepler"
            className="font-medium text-gorev-yellow-400 underline-offset-4 hover:underline"
          >
            Teklifler → Hizmet Talepleri
          </Link>{' '}
          bölümünden yönetebilirsiniz.
        </p>
      </section>
    )
  }

  if (!isAuthenticated) {
    return (
      <section className="rounded-2xl border border-gorev-navy-800 bg-gorev-navy-900/40 p-5">
        <p className="text-sm text-gorev-muted">
          Hizmet talep etmek için giriş yapmanız gerekir.
        </p>
        <Link
          to="/giris"
          className={composeButtonClassName(
            'primary',
            'mt-4 inline-flex min-h-11 items-center justify-center px-6',
          )}
        >
          Giriş yap
        </Link>
      </section>
    )
  }

  if (service.base_price == null) {
    return (
      <section className="rounded-2xl border border-gorev-navy-800 bg-gorev-navy-900/40 p-5">
        <AuthAlert
          variant="error"
          message="Bu hizmetin fiyatı belirtilmemiş; talep gönderilemiyor."
        />
      </section>
    )
  }

  return (
    <section className="rounded-2xl border border-gorev-navy-800 bg-gorev-navy-900/40 p-5">
      <h2 className="text-sm font-semibold text-gorev-snow">Hizmet talebi</h2>
      <p className="mt-2 text-sm leading-relaxed text-gorev-muted">
        Talebiniz hizmet verene iletilir. Kabul edildiğinde mesajlaşma açılır ve
        iş birlikte ilerletilir.
      </p>

      {error ? (
        <div className="mt-4">
          <AuthAlert message={error} variant="error" />
        </div>
      ) : null}

      {successMessage ? (
        <div className="mt-4">
          <AuthAlert message={successMessage} variant="success" />
        </div>
      ) : null}

      <Button
        type="button"
        className="mt-5 min-h-11 w-full justify-center sm:w-auto sm:px-8"
        loading={isSubmitting}
        onClick={onRequest}
      >
        Hizmet Talep Et
      </Button>
    </section>
  )
}
