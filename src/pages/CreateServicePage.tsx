import { Link } from 'react-router-dom'

import { DashboardCard } from '@/components/dashboard/DashboardCard'
import { ServiceCreateForm } from '@/components/services/ServiceCreateForm'
import { composeButtonClassName } from '@/lib/button-styles'

export function CreateServicePage() {
  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gorev-green-400">
            Yeni hizmet
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-gorev-snow">
            Hizmet Oluştur
          </h1>
          <p className="mt-2 text-sm text-gorev-muted">
            Sunduğunuz hizmeti tanıtın; müşteriler sizi keşfetsin.
          </p>
        </div>
        <Link
          to="/dashboard/hizmetler"
          className={composeButtonClassName(
            'outline',
            'inline-flex min-h-10 items-center justify-center px-4 text-sm',
          )}
        >
          Hizmetlerime dön
        </Link>
      </div>

      <DashboardCard title="Hizmet bilgileri">
        <ServiceCreateForm />
      </DashboardCard>
    </div>
  )
}
