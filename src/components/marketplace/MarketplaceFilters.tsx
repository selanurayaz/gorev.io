import { CitySelectField } from '@/components/ui/CitySelectField'
import { ComboboxField } from '@/components/ui/ComboboxField'
import { TextField } from '@/components/ui/TextField'
import type { MarketplaceFilters as Filters } from '@/lib/marketplace-filters'
import type { ServiceCategory } from '@/types/category'

type MarketplaceFiltersProps = {
  filters: Filters
  categories: ServiceCategory[]
  onFilterChange: <K extends keyof Filters>(
    key: K,
    value: Filters[K],
  ) => void
  onClear: () => void
  hasActiveFilters: boolean
  disabled?: boolean
  searchPlaceholder?: string
}

export function MarketplaceFilters({
  filters,
  categories,
  onFilterChange,
  onClear,
  hasActiveFilters,
  disabled = false,
  searchPlaceholder = 'Başlık, kategori veya şehir…',
}: MarketplaceFiltersProps) {
  const categoryOptions = categories.map((category) => ({
    value: category.id,
    label: category.name,
  }))

  return (
    <div className="rounded-2xl border border-gorev-navy-800 bg-gorev-navy-900/40 p-4 sm:p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-sm font-semibold text-gorev-snow">Filtrele</h2>
          <p className="mt-1 text-xs text-gorev-muted">
            Arama, kategori ve şehre göre daraltın
          </p>
        </div>
        {hasActiveFilters ? (
          <button
            type="button"
            disabled={disabled}
            onClick={onClear}
            className="text-sm font-medium text-gorev-yellow-400 underline-offset-4 transition hover:text-gorev-yellow-300 hover:underline disabled:opacity-60"
          >
            Filtreleri temizle
          </button>
        ) : null}
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <TextField
          label="Ara"
          name="marketplace_search"
          placeholder={searchPlaceholder}
          value={filters.search}
          onChange={(e) => onFilterChange('search', e.target.value)}
          disabled={disabled}
          autoComplete="off"
        />

        <ComboboxField
          label="Kategori"
          name="marketplace_category"
          value={filters.categoryId}
          onValueChange={(value) => onFilterChange('categoryId', value)}
          options={categoryOptions}
          placeholder="Tüm kategoriler"
          disabled={disabled || categoryOptions.length === 0}
          searchable={categoryOptions.length > 4}
          searchPlaceholder="Kategori ara…"
          emptyMessage="Kategori bulunamadı."
        />

        <CitySelectField
          label="Şehir"
          name="marketplace_city"
          value={filters.city}
          onValueChange={(value) => onFilterChange('city', value)}
          placeholder="Tüm şehirler"
          allowEmpty
          disabled={disabled}
          searchPlaceholder="İl ara…"
        />
      </div>
    </div>
  )
}
