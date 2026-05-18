import { DashboardActivity } from '@/components/dashboard/DashboardActivity'
import { DashboardRecentTasks } from '@/components/dashboard/DashboardRecentTasks'
import { DashboardStats } from '@/components/dashboard/DashboardStats'
import { DashboardSuggestedServices } from '@/components/dashboard/DashboardSuggestedServices'
import { DashboardWelcome } from '@/components/dashboard/DashboardWelcome'

export function DashboardPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-6 sm:space-y-8">
      <DashboardWelcome />
      <DashboardStats />

      <div className="grid gap-6 lg:grid-cols-3 lg:gap-8">
        <div className="space-y-6 lg:col-span-2 lg:space-y-8">
          <DashboardRecentTasks />
          <DashboardActivity />
        </div>
        <div className="lg:col-span-1">
          <DashboardSuggestedServices />
        </div>
      </div>
    </div>
  )
}
