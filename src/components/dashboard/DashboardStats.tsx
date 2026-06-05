import { buildDashboardStatDisplays } from '@/lib/dashboard-display'
import { DashboardSectionFeedback } from '@/components/dashboard/DashboardSectionFeedback'
import type { DashboardStats as DashboardStatsData } from '@/types/dashboard'

type DashboardStatsProps = {
  stats: DashboardStatsData | null
  isLoading: boolean
  error: string | null
  onRetry?: () => void
}

export function DashboardStats({
  stats,
  isLoading,
  error,
  onRetry,
}: DashboardStatsProps) {
  if (isLoading || error || !stats) {
    return (
      <section aria-label="Özet istatistikler">
        <DashboardSectionFeedback
          isLoading={isLoading}
          error={error}
          onRetry={onRetry}
          loadingLabel="İstatistikler yükleniyor…"
        />
      </section>
    )
  }

  const items = buildDashboardStatDisplays(stats)

  return (
    <section aria-label="Özet istatistikler">
      <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {items.map((stat) => (
          <li key={stat.id}>
            <article className="rounded-2xl border border-gorev-navy-800 bg-gorev-navy-900/50 p-5 transition duration-200 hover:border-gorev-yellow-400/25 hover:bg-gorev-navy-900/70">
              <p className="text-xs font-medium uppercase tracking-wide text-gorev-muted">
                {stat.label}
              </p>
              <p className="mt-2 font-mono text-3xl font-semibold tracking-tight text-gorev-snow">
                {stat.value}
              </p>
              <p className="mt-2 text-xs font-medium text-gorev-muted">
                {stat.hint}
              </p>
            </article>
          </li>
        ))}
      </ul>
    </section>
  )
}
