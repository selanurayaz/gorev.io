import type { DashboardNavIcon } from '@/components/dashboard/DashboardNavIcons'

export type DashboardNavItem = {
  to: string
  label: string
  icon: DashboardNavIcon
  end?: boolean
}

export const dashboardNavItems: DashboardNavItem[] = [
  { to: '/dashboard', label: 'Ana Sayfa', icon: 'home', end: true },
  { to: '/kesfet', label: 'Görev Keşfet', icon: 'discover' },
  { to: '/dashboard/gorevlerim', label: 'Görevlerim', icon: 'tasks' },
  { to: '/dashboard/hizmetler', label: 'Hizmetler', icon: 'services' },
  { to: '/dashboard/mesajlar', label: 'Mesajlar', icon: 'messages' },
  { to: '/dashboard/profil', label: 'Profil', icon: 'profile' },
]
