import { dashboardStats } from '@/data/dashboard-content'

import { cn } from '@/lib/utils'

export function DashboardStats() {
  return (
    <section aria-label="Özet istatistikler">
      <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {dashboardStats.map((stat) => (
          <li key={stat.id}>
            <article className="rounded-2xl border border-gorev-navy-800 bg-gorev-navy-900/50 p-5 transition duration-200 hover:border-gorev-yellow-400/25 hover:bg-gorev-navy-900/70">
              <p className="text-xs font-medium uppercase tracking-wide text-gorev-muted">
                {stat.label}
              </p>
              <p className="mt-2 font-mono text-3xl font-semibold tracking-tight text-gorev-snow">
                {stat.value}
              </p>
              <p
                className={cn(
                  'mt-2 text-xs font-medium',
                  stat.trend === 'up'
                    ? 'text-gorev-green-400'
                    : 'text-gorev-muted',
                )}
              >
                {stat.change}
              </p>
            </article>
          </li>
        ))}
      </ul>
    </section>
  )
}
