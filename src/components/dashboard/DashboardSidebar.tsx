import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'

import { DashboardNavIcon } from '@/components/dashboard/DashboardNavIcons'
import { Spinner } from '@/components/ui/Spinner'
import { dashboardNavItems } from '@/config/dashboard-nav'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/lib/utils'

type DashboardSidebarProps = {
  onNavigate?: () => void
  className?: string
}

const itemClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition duration-200',
    isActive
      ? 'bg-gorev-navy-800 text-gorev-snow shadow-inner shadow-black/20'
      : 'text-gorev-muted hover:bg-gorev-navy-900/80 hover:text-gorev-snow',
  )

export function DashboardSidebar({
  onNavigate,
  className,
}: DashboardSidebarProps) {
  const navigate = useNavigate()
  const { signOut } = useAuth()
  const [loggingOut, setLoggingOut] = useState(false)

  async function handleLogout() {
    setLoggingOut(true)
    await signOut()
    setLoggingOut(false)
    onNavigate?.()
    navigate('/giris', { replace: true })
  }

  return (
    <aside
      className={cn('flex h-full flex-col', className)}
      aria-label="Panel menüsü"
    >
      <div className="border-b border-gorev-navy-800 px-4 py-5">
        <NavLink
          to="/"
          className="text-lg font-semibold tracking-tight text-gorev-snow transition hover:text-gorev-yellow-300"
          onClick={onNavigate}
        >
          görev<span className="text-gorev-yellow-400">.io</span>
        </NavLink>
        <p className="mt-1 text-xs text-gorev-muted">Kontrol paneli</p>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {dashboardNavItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={itemClass}
            onClick={onNavigate}
          >
            <DashboardNavIcon name={item.icon} className="h-5 w-5 shrink-0" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-gorev-navy-800 p-3">
        <button
          type="button"
          disabled={loggingOut}
          onClick={() => void handleLogout()}
          className={cn(
            itemClass({ isActive: false }),
            'w-full hover:bg-red-500/10 hover:text-red-300 disabled:opacity-60',
          )}
        >
          {loggingOut ? (
            <Spinner className="h-5 w-5 shrink-0" aria-hidden />
          ) : (
            <DashboardNavIcon name="logout" className="h-5 w-5 shrink-0" />
          )}
          Çıkış
        </button>
      </div>
    </aside>
  )
}
