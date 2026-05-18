import { suggestedServices } from '@/data/dashboard-content'

import { DashboardCard } from '@/components/dashboard/DashboardCard'

export function DashboardSuggestedServices() {
  return (
    <DashboardCard
      title="Önerilen hizmetler"
      action={
        <button
          type="button"
          className="text-sm font-medium text-gorev-yellow-400 transition hover:text-gorev-yellow-300"
        >
          Keşfet
        </button>
      }
    >
      <ul className="grid gap-4 p-5 sm:grid-cols-2 sm:p-6 lg:grid-cols-1 xl:grid-cols-1">
        {suggestedServices.map((svc) => (
          <li key={svc.id}>
            <button
              type="button"
              className="flex h-full w-full flex-col rounded-xl border border-gorev-navy-800 bg-gorev-navy-950/50 p-4 text-left transition duration-200 hover:border-gorev-green-500/35 hover:bg-gorev-navy-900/60"
            >
              <p className="text-xs font-medium uppercase tracking-wide text-gorev-green-400">
                {svc.category}
              </p>
              <h3 className="mt-2 text-sm font-semibold leading-snug text-gorev-snow">
                {svc.title}
              </h3>
              <p className="mt-1 text-xs text-gorev-muted">{svc.provider}</p>
              <div className="mt-4 flex items-center justify-between gap-2 border-t border-gorev-navy-800 pt-3">
                <span className="text-sm font-semibold text-gorev-snow">
                  {svc.priceLabel}
                </span>
                <span className="text-xs text-gorev-yellow-400">
                  ★ {svc.rating.toFixed(1).replace('.', ',')}
                </span>
              </div>
            </button>
          </li>
        ))}
      </ul>
    </DashboardCard>
  )
}
