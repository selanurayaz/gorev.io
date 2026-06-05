import { AuthAlert } from '@/components/auth/AuthAlert'
import { DashboardActivity } from '@/components/dashboard/DashboardActivity'
import { DashboardRecentTasks } from '@/components/dashboard/DashboardRecentTasks'
import { DashboardStats } from '@/components/dashboard/DashboardStats'
import { DashboardSuggestedServices } from '@/components/dashboard/DashboardSuggestedServices'
import { DashboardWelcome } from '@/components/dashboard/DashboardWelcome'
import { useDashboard } from '@/hooks/useDashboard'

export function DashboardPage() {
  const { data, isLoading, error, reload } = useDashboard()

  return (
    <div className="mx-auto max-w-7xl space-y-6 sm:space-y-8">
      <DashboardWelcome stats={data?.stats ?? null} isLoading={isLoading} />

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

      <DashboardStats
        stats={data?.stats ?? null}
        isLoading={isLoading}
        error={error}
        onRetry={reload}
      />

      <div className="grid gap-6 lg:grid-cols-3 lg:gap-8">
        <div className="space-y-6 lg:col-span-2 lg:space-y-8">
          <DashboardRecentTasks
            tasks={data?.recentTasks ?? []}
            isLoading={isLoading}
            error={error}
            onRetry={reload}
          />
          <DashboardActivity
            activity={data?.activity ?? []}
            isLoading={isLoading}
            error={error}
            onRetry={reload}
          />
        </div>
        <div className="lg:col-span-1">
          <DashboardSuggestedServices />
        </div>
      </div>
    </div>
  )
}
