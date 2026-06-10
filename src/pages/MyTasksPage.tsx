import { CustomerActiveWorkSection } from '@/components/offers/CustomerActiveWorkSection'
import { ProviderAcceptedWorkSection } from '@/components/my-tasks/ProviderAcceptedWorkSection'

export function MyTasksPage() {
  return (
    <div className="mx-auto min-w-0 max-w-4xl space-y-8 sm:space-y-10">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gorev-green-400">
          Görevlerim
        </p>
        <h1 className="mt-1 text-xl font-semibold tracking-tight text-gorev-snow sm:text-2xl lg:text-3xl">
          Aktif ve tamamlanan işleriniz
        </h1>
        <p className="mt-2 text-sm text-gorev-muted">
          Hizmet taleplerinizi tamamlayın, değerlendirme bırakın veya kabul
          ettiğiniz görevleri yönetin.
        </p>
      </div>

      <CustomerActiveWorkSection />
      <ProviderAcceptedWorkSection />
    </div>
  )
}
