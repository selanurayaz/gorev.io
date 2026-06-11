import { Link } from 'react-router-dom'

import { ProfileLoadState } from '@/components/dashboard/ProfileLoadState'
import { useProfile } from '@/hooks/useProfile'
import { composeButtonClassName } from '@/lib/button-styles'
import type { DashboardStats } from '@/types/dashboard'

type DashboardWelcomeProps = {
  stats: DashboardStats | null
  isLoading: boolean
}

export function DashboardWelcome({ stats, isLoading }: DashboardWelcomeProps) {
  const { displayName, isLoading: profileLoading, error, refetch } = useProfile()

  const hour = new Date().getHours()
  const greeting =
    hour < 12 ? 'Günaydın' : hour < 18 ? 'İyi günler' : 'İyi akşamlar'

  let summary = 'Görevlerin ve güncellemelerin için özet aşağıda.'

  if (!isLoading && stats) {
    if (stats.activeTasks > 0 && stats.unreadMessages > 0) {
      summary = `${stats.activeTasks} aktif görevin ve ${stats.unreadMessages} okunmamış mesajın var. Özet aşağıda.`
    } else if (stats.activeTasks > 0) {
      summary = `${stats.activeTasks} aktif görevin var. Özet aşağıda.`
    } else if (stats.unreadMessages > 0) {
      summary = `${stats.unreadMessages} okunmamış mesajın var. Özet aşağıda.`
    }
  }

  return (
    <section className="relative overflow-x-hidden rounded-2xl border border-gorev-navy-800 bg-gradient-to-br from-gorev-navy-900 via-gorev-navy-950 to-gorev-navy-900 p-4 sm:p-8">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_80%_at_100%_0%,rgba(250,204,21,0.1),transparent_50%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_0%_100%,rgba(34,197,94,0.12),transparent_55%)]"
        aria-hidden
      />
      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gorev-green-400">
            Kontrol paneli
          </p>

          {profileLoading ? (
            <div
              className="mt-2 h-9 w-56 max-w-full animate-pulse rounded-lg bg-gorev-navy-800"
              aria-hidden
            />
          ) : (
            <h2 className="mt-1.5 break-words text-lg font-semibold tracking-tight text-gorev-snow sm:mt-2 sm:text-2xl lg:text-3xl">
              {greeting},{' '}
              <span className="text-gorev-yellow-300">{displayName}</span>
            </h2>
          )}

          <ProfileLoadState error={error} onRetry={refetch} />

          {!profileLoading && !isLoading ? (
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-gorev-muted sm:mt-3 sm:text-base">
              {summary}
            </p>
          ) : null}
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:shrink-0">
          <Link
            to="/dashboard/gorev-olustur"
            className={composeButtonClassName(
              'primary',
              'min-h-11 justify-center px-6',
            )}
          >
            Yeni görev oluştur
          </Link>
          <Link
            to="/dashboard/teklifler"
            className={composeButtonClassName(
              'outline',
              'min-h-11 justify-center px-6',
            )}
          >
            Teklifleri gör
          </Link>
        </div>
      </div>
    </section>
  )
}
