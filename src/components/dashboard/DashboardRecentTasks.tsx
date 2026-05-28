import { Link } from 'react-router-dom'

import { recentTasks } from '@/data/dashboard-content'

import { DashboardCard } from '@/components/dashboard/DashboardCard'
import { cn } from '@/lib/utils'

const statusStyles = {
  yellow:
    'border-gorev-yellow-400/30 bg-gorev-yellow-400/10 text-gorev-yellow-300',
  green:
    'border-gorev-green-500/30 bg-gorev-green-500/10 text-gorev-green-400',
  muted: 'border-gorev-navy-700 bg-gorev-navy-900/60 text-gorev-muted',
} as const

export function DashboardRecentTasks() {
  return (
    <DashboardCard
      title="Son görevler"
      action={
        <Link
          to="/dashboard/gorevlerim"
          className="text-sm font-medium text-gorev-yellow-400 transition hover:text-gorev-yellow-300"
        >
          Tümünü gör
        </Link>
      }
    >
      <ul className="divide-y divide-gorev-navy-800">
        {recentTasks.map((task) => (
          <li key={task.id}>
            <button
              type="button"
              className="flex w-full flex-col gap-3 px-5 py-4 text-left transition hover:bg-gorev-navy-900/40 sm:flex-row sm:items-center sm:justify-between sm:px-6"
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-medium text-gorev-snow">{task.title}</h3>
                  <span
                    className={cn(
                      'rounded-full border px-2 py-0.5 text-[11px] font-semibold',
                      statusStyles[task.statusTone],
                    )}
                  >
                    {task.status}
                  </span>
                </div>
                <p className="mt-1 text-sm text-gorev-muted">{task.location}</p>
              </div>
              <div className="flex shrink-0 flex-col items-start gap-1 sm:items-end">
                <p className="text-sm font-semibold text-gorev-snow">
                  {task.budget}
                </p>
                <p className="text-xs text-gorev-muted">{task.updatedAt}</p>
              </div>
            </button>
          </li>
        ))}
      </ul>
    </DashboardCard>
  )
}
