import { Outlet } from 'react-router-dom'

import { SiteFooter } from '@/components/landing/SiteFooter'
import { SiteHeader } from '@/components/layout/SiteHeader'

export function MainLayout() {
  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />

      <main className="flex-1">
        <Outlet />
      </main>

      <SiteFooter />
    </div>
  )
}
