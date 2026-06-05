import { AuthAlert } from '@/components/auth/AuthAlert'
import { MarketplaceFilters } from '@/components/marketplace/MarketplaceFilters'
import { MarketplaceServiceGrid } from '@/components/marketplace/MarketplaceServiceGrid'
import { MarketplaceServicesEmpty } from '@/components/marketplace/MarketplaceServicesEmpty'
import { ServiceListLoading } from '@/components/services/ServiceListLoading'
import type { MarketplaceFilters as Filters } from '@/lib/marketplace-filters'
import type { ServiceCategory } from '@/types/category'
import type { MarketplaceService } from '@/types/service'

type MarketplaceServicesPanelProps = {
  services: MarketplaceService[]
  totalCount: number
  visibleCount: number
  categories: ServiceCategory[]
  filters: Filters
  setFilter: <K extends keyof Filters>(key: K, value: Filters[K]) => void
  clearFilters: () => void
  hasActiveFilters: boolean
  isLoading: boolean
  error: string | null
  reload: () => void
}

export function MarketplaceServicesPanel({
  services,
  totalCount,
  visibleCount,
  categories,
  filters,
  setFilter,
  clearFilters,
  hasActiveFilters,
  isLoading,
  error,
  reload,
}: MarketplaceServicesPanelProps) {
  return (
    <div
      className="space-y-6"
      role="tabpanel"
      aria-label="Hizmetler"
    >
      <MarketplaceFilters
        filters={filters}
        categories={categories}
        onFilterChange={setFilter}
        onClear={clearFilters}
        hasActiveFilters={hasActiveFilters}
        disabled={isLoading}
        searchPlaceholder="Başlık, kategori, şehir veya hizmet veren…"
      />

      <p className="text-sm text-gorev-muted">
        {isLoading
          ? 'Hizmetler yükleniyor…'
          : hasActiveFilters
            ? `${visibleCount} sonuç · toplam ${totalCount} aktif hizmet`
            : `${totalCount} aktif hizmet · en yeniler önce`}
      </p>

      {error ? (
        <div className="space-y-3">
          <AuthAlert message={error} variant="error" />
          <button
            type="button"
            onClick={() => void reload()}
            className="text-sm font-medium text-gorev-yellow-400 underline-offset-4 hover:underline"
          >
            Tekrar dene
          </button>
        </div>
      ) : null}

      {isLoading ? (
        <ServiceListLoading className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3" />
      ) : null}

      {!isLoading && !error && services.length === 0 ? (
        <MarketplaceServicesEmpty
          hasFilters={hasActiveFilters}
          onClearFilters={hasActiveFilters ? clearFilters : undefined}
        />
      ) : null}

      {!isLoading && services.length > 0 ? (
        <MarketplaceServiceGrid services={services} />
      ) : null}
    </div>
  )
}
