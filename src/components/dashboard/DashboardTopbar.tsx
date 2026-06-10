import { NotificationBell } from '@/components/notifications/NotificationBell'
import { useProfile } from '@/hooks/useProfile'
import { cn } from '@/lib/utils'

type DashboardTopbarProps = {
  title: string
  subtitle?: string
  onMenuClick: () => void
}

function MenuIcon() {
  return (
    <svg
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
      />
    </svg>
  )
}

export function DashboardTopbar({
  title,
  subtitle,
  onMenuClick,
}: DashboardTopbarProps) {
  const { user, displayName, isLoading: profileLoading } = useProfile()

  return (
    <header className="sticky top-0 z-30 border-b border-gorev-navy-800 bg-gorev-navy-950/90 backdrop-blur-xl supports-[backdrop-filter]:bg-gorev-navy-950/75">
      <div className="flex items-center justify-between gap-2 px-3 py-3.5 sm:gap-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            className={cn(
              'inline-flex shrink-0 items-center justify-center rounded-xl border border-gorev-navy-700 bg-gorev-navy-900/60 p-2.5 text-gorev-snow transition hover:border-gorev-yellow-400/40 lg:hidden',
            )}
            onClick={onMenuClick}
            aria-label="Menüyü aç"
          >
            <MenuIcon />
          </button>
          <div className="min-w-0">
            <h1 className="truncate text-lg font-semibold tracking-tight text-gorev-snow sm:text-xl">
              {title}
            </h1>
            {subtitle ? (
              <p className="truncate text-xs text-gorev-muted sm:text-sm">
                {subtitle}
              </p>
            ) : null}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-3">
          <NotificationBell />
          <div
            className="hidden max-w-[7.5rem] truncate rounded-full bg-gradient-to-br from-gorev-navy-800 to-gorev-navy-900 px-3 py-1.5 text-sm font-semibold text-gorev-snow ring-1 ring-gorev-navy-700 min-[400px]:block sm:max-w-none"
            title={user?.email ?? undefined}
          >
            <span className="hidden sm:inline">Merhaba, </span>
            <span className="truncate text-gorev-yellow-400">
              {profileLoading ? '…' : displayName}
            </span>
          </div>
        </div>
      </div>
    </header>
  )
}
