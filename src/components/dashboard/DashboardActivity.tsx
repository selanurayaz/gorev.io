import { activityFeed } from '@/data/dashboard-content'

import { DashboardCard } from '@/components/dashboard/DashboardCard'
import { cn } from '@/lib/utils'

const dotColors = {
  offer: 'bg-gorev-yellow-400',
  publish: 'bg-gorev-green-500',
  message: 'bg-gorev-muted',
  complete: 'bg-gorev-green-400',
} as const

export function DashboardActivity() {
  return (
    <DashboardCard title="Son aktivite">
      <ul className="space-y-0 p-5 sm:p-6">
        {activityFeed.map((item, index) => (
          <li
            key={item.id}
            className={cn(
              'relative flex gap-4 pb-6 pl-1',
              index < activityFeed.length - 1 &&
                'border-l border-gorev-navy-800 ml-2',
            )}
          >
            <span
              className={cn(
                'absolute -left-[5px] top-1.5 h-2.5 w-2.5 shrink-0 rounded-full ring-4 ring-gorev-navy-950',
                dotColors[item.type],
              )}
              aria-hidden
            />
            <div className="min-w-0 flex-1 pl-4">
              <p className="text-sm leading-relaxed text-gorev-snow">
                {item.text}
              </p>
              <p className="mt-1 text-xs text-gorev-muted">{item.time}</p>
            </div>
          </li>
        ))}
      </ul>
      <p className="border-t border-gorev-navy-800 px-5 py-3 text-center text-xs text-gorev-muted sm:px-6">
        Canlı aktivite akışı yakında — şimdilik örnek kayıtlar.
      </p>
    </DashboardCard>
  )
}
