import { AuthAlert } from '@/components/auth/AuthAlert'
import { MarketplaceEmpty } from '@/components/marketplace/MarketplaceEmpty'
import { MarketplaceFilters } from '@/components/marketplace/MarketplaceFilters'
import { MarketplaceTaskGrid } from '@/components/marketplace/MarketplaceTaskGrid'
import { TaskListLoading } from '@/components/tasks/TaskListLoading'
import type { MarketplaceFilters as Filters } from '@/lib/marketplace-filters'
import type { ServiceCategory } from '@/types/category'
import type { MarketplaceTask } from '@/types/task'

type MarketplaceOpenTasksPanelProps = {
  tasks: MarketplaceTask[]
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

export function MarketplaceOpenTasksPanel({
  tasks,
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
}: MarketplaceOpenTasksPanelProps) {
  return (
    <div
      className="space-y-6"
      role="tabpanel"
      aria-label="Açık görevler"
    >
      <MarketplaceFilters
        filters={filters}
        categories={categories}
        onFilterChange={setFilter}
        onClear={clearFilters}
        hasActiveFilters={hasActiveFilters}
        disabled={isLoading}
        searchPlaceholder="Başlık, kategori, şehir veya görev sahibi…"
      />

      <p className="text-sm text-gorev-muted">
        {isLoading
          ? 'Açık görevler yükleniyor…'
          : hasActiveFilters
            ? `${visibleCount} sonuç · toplam ${totalCount} açık görev`
            : `${totalCount} açık görev · en yeniler önce`}
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
        <TaskListLoading className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3" />
      ) : null}

      {!isLoading && !error && tasks.length === 0 ? (
        <MarketplaceEmpty
          hasFilters={hasActiveFilters}
          onClearFilters={hasActiveFilters ? clearFilters : undefined}
        />
      ) : null}

      {!isLoading && tasks.length > 0 ? (
        <MarketplaceTaskGrid tasks={tasks} />
      ) : null}
    </div>
  )
}
