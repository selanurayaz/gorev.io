import { Outlet } from 'react-router-dom'

import { SiteFooter } from '@/components/landing/SiteFooter'
import { SiteHeader } from '@/components/layout/SiteHeader'

export function MainLayout() {
  return (
    <div className="flex min-h-dvh min-w-0 flex-col overflow-x-clip">
      <SiteHeader />

      <main className="flex-1">
        <Outlet />
      </main>

      <SiteFooter />
    </div>
  )
}
