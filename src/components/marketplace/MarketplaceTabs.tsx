import { cn } from '@/lib/utils'

export type MarketplaceTabId = 'tasks' | 'services'

type MarketplaceTabsProps = {
  activeTab: MarketplaceTabId
  onChange: (tab: MarketplaceTabId) => void
  taskCount?: number
  serviceCount?: number
}

const tabs: { id: MarketplaceTabId; label: string }[] = [
  { id: 'tasks', label: 'Açık Görevler' },
  { id: 'services', label: 'Hizmetler' },
]

export function MarketplaceTabs({
  activeTab,
  onChange,
  taskCount,
  serviceCount,
}: MarketplaceTabsProps) {
  return (
    <div
      className="flex flex-wrap gap-2 rounded-xl border border-gorev-navy-800 bg-gorev-navy-900/50 p-1.5"
      role="tablist"
      aria-label="Keşfet sekmeleri"
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id
        const count = tab.id === 'tasks' ? taskCount : serviceCount

        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            className={cn(
              'min-h-11 flex-1 rounded-lg px-4 py-2.5 text-sm font-semibold transition sm:flex-none sm:px-6',
              isActive
                ? 'bg-gorev-navy-800 text-gorev-snow shadow-sm ring-1 ring-gorev-yellow-400/25'
                : 'text-gorev-muted hover:bg-gorev-navy-800/60 hover:text-gorev-snow',
            )}
          >
            {tab.label}
            {count !== undefined ? (
              <span
                className={cn(
                  'ml-2 inline-flex min-w-[1.25rem] justify-center rounded-full px-1.5 py-0.5 text-[10px] font-bold',
                  isActive
                    ? 'bg-gorev-yellow-400/20 text-gorev-yellow-300'
                    : 'bg-gorev-navy-700 text-gorev-muted',
                )}
              >
                {count}
              </span>
            ) : null}
          </button>
        )
      })}
    </div>
  )
}
