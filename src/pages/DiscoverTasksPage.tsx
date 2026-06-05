import { useState } from 'react'
import { Link } from 'react-router-dom'

import { MarketplaceOpenTasksPanel } from '@/components/marketplace/MarketplaceOpenTasksPanel'
import { MarketplaceServicesPanel } from '@/components/marketplace/MarketplaceServicesPanel'
import {
  MarketplaceTabs,
  type MarketplaceTabId,
} from '@/components/marketplace/MarketplaceTabs'
import { Container } from '@/components/ui/Container'
import { useAuth } from '@/hooks/useAuth'
import { useMarketplace } from '@/hooks/useMarketplace'
import { useMarketplaceServices } from '@/hooks/useMarketplaceServices'
import { composeButtonClassName } from '@/lib/button-styles'

const tabDescriptions: Record<MarketplaceTabId, string> = {
  tasks:
    'Yayında olan açık görevlere göz atın; yeteneklerinize uygun ilanlara teklif verin.',
  services:
    'Aktif hizmet ilanlarını keşfedin; hizmet verenleri kategori ve şehre göre bulun.',
}

export function DiscoverTasksPage() {
  const { isAuthenticated } = useAuth()
  const [activeTab, setActiveTab] = useState<MarketplaceTabId>('tasks')

  const tasksMarketplace = useMarketplace()
  const servicesMarketplace = useMarketplaceServices(true)

  return (
    <div className="border-b border-gorev-navy-800/80 bg-gradient-to-b from-gorev-navy-900/50 to-gorev-navy-950 pb-16 pt-8 sm:pt-12">
      <Container>
        <div className="space-y-8">
          <header className="relative overflow-hidden rounded-2xl border border-gorev-navy-800 bg-gradient-to-br from-gorev-navy-900 via-gorev-navy-950 to-gorev-navy-900 p-6 sm:p-8">
            <div
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_80%_at_100%_0%,rgba(250,204,21,0.08),transparent_50%)]"
              aria-hidden
            />
            <div
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_0%_100%,rgba(34,197,94,0.1),transparent_55%)]"
              aria-hidden
            />
            <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gorev-green-400">
                  Marketplace
                </p>
                <h1 className="mt-2 text-3xl font-semibold tracking-tight text-gorev-snow sm:text-4xl">
                  Görev Keşfet
                </h1>
                <p className="mt-3 text-sm leading-relaxed text-gorev-muted sm:text-base">
                  {tabDescriptions[activeTab]}
                </p>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row sm:shrink-0">
                {isAuthenticated ? (
                  <Link
                    to="/dashboard/gorev-olustur"
                    className={composeButtonClassName(
                      'primary',
                      'min-h-11 justify-center px-6',
                    )}
                  >
                    Görev oluştur
                  </Link>
                ) : (
                  <Link
                    to="/kayit"
                    className={composeButtonClassName(
                      'primary',
                      'min-h-11 justify-center px-6',
                    )}
                  >
                    Ücretsiz kayıt ol
                  </Link>
                )}
                <Link
                  to={isAuthenticated ? '/dashboard' : '/giris'}
                  className={composeButtonClassName(
                    'outline',
                    'min-h-11 justify-center px-6',
                  )}
                >
                  {isAuthenticated ? 'Panele git' : 'Giriş yap'}
                </Link>
              </div>
            </div>
          </header>

          <MarketplaceTabs
            activeTab={activeTab}
            onChange={setActiveTab}
            taskCount={
              tasksMarketplace.isLoading
                ? undefined
                : tasksMarketplace.totalCount
            }
            serviceCount={
              servicesMarketplace.isLoading
                ? undefined
                : servicesMarketplace.totalCount
            }
          />

          {activeTab === 'tasks' ? (
            <MarketplaceOpenTasksPanel
              tasks={tasksMarketplace.tasks}
              totalCount={tasksMarketplace.totalCount}
              visibleCount={tasksMarketplace.visibleCount}
              categories={tasksMarketplace.categories}
              filters={tasksMarketplace.filters}
              setFilter={tasksMarketplace.setFilter}
              clearFilters={tasksMarketplace.clearFilters}
              hasActiveFilters={tasksMarketplace.hasActiveFilters}
              isLoading={tasksMarketplace.isLoading}
              error={tasksMarketplace.error}
              reload={tasksMarketplace.reload}
            />
          ) : (
            <MarketplaceServicesPanel
              services={servicesMarketplace.services}
              totalCount={servicesMarketplace.totalCount}
              visibleCount={servicesMarketplace.visibleCount}
              categories={servicesMarketplace.categories}
              filters={servicesMarketplace.filters}
              setFilter={servicesMarketplace.setFilter}
              clearFilters={servicesMarketplace.clearFilters}
              hasActiveFilters={servicesMarketplace.hasActiveFilters}
              isLoading={servicesMarketplace.isLoading}
              error={servicesMarketplace.error}
              reload={servicesMarketplace.reload}
            />
          )}
        </div>
      </Container>
    </div>
  )
}
