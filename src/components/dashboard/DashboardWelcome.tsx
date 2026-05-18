import { useAuth } from '@/hooks/useAuth'
import { composeButtonClassName } from '@/lib/button-styles'
import { getUserDisplayName } from '@/lib/user-display'

export function DashboardWelcome() {
  const { user } = useAuth()
  const displayName = getUserDisplayName(user)

  const hour = new Date().getHours()
  const greeting =
    hour < 12 ? 'Günaydın' : hour < 18 ? 'İyi günler' : 'İyi akşamlar'

  return (
    <section className="relative overflow-hidden rounded-2xl border border-gorev-navy-800 bg-gradient-to-br from-gorev-navy-900 via-gorev-navy-950 to-gorev-navy-900 p-6 sm:p-8">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_80%_at_100%_0%,rgba(250,204,21,0.1),transparent_50%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_0%_100%,rgba(34,197,94,0.12),transparent_55%)]"
        aria-hidden
      />
      <div className="relative flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gorev-green-400">
            Kontrol paneli
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-gorev-snow sm:text-3xl">
            {greeting}, {displayName}
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-gorev-muted sm:text-base">
            Bugün 3 aktif görevin var. Yeni teklifler ve mesajlar için özet
            aşağıda — hızlıca aksiyon alabilirsin.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:shrink-0">
          <button
            type="button"
            className={composeButtonClassName(
              'primary',
              'min-h-11 justify-center px-6',
            )}
          >
            Yeni görev oluştur
          </button>
          <button
            type="button"
            className={composeButtonClassName(
              'outline',
              'min-h-11 justify-center px-6',
            )}
          >
            Teklifleri gör
          </button>
        </div>
      </div>
    </section>
  )
}
