import { AuthAlert } from '@/components/auth/AuthAlert'
import { Spinner } from '@/components/ui/Spinner'

type DashboardSectionFeedbackProps = {
  isLoading?: boolean
  error?: string | null
  onRetry?: () => void
  loadingLabel?: string
  emptyMessage?: string
  isEmpty?: boolean
}

export function DashboardSectionFeedback({
  isLoading = false,
  error = null,
  onRetry,
  loadingLabel = 'Yükleniyor…',
  emptyMessage,
  isEmpty = false,
}: DashboardSectionFeedbackProps) {
  if (isLoading) {
    return (
      <div
        className="flex items-center justify-center gap-3 px-5 py-12 sm:px-6"
        role="status"
      >
        <Spinner className="h-7 w-7 text-gorev-yellow-400" />
        <span className="text-sm text-gorev-muted">{loadingLabel}</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-3 px-5 py-6 sm:px-6">
        <AuthAlert message={error} variant="error" />
        {onRetry ? (
          <button
            type="button"
            onClick={() => void onRetry()}
            className="text-sm font-medium text-gorev-yellow-400 underline-offset-4 hover:underline"
          >
            Tekrar dene
          </button>
        ) : null}
      </div>
    )
  }

  if (isEmpty && emptyMessage) {
    return (
      <p className="px-5 py-10 text-center text-sm text-gorev-muted sm:px-6">
        {emptyMessage}
      </p>
    )
  }

  return null
}
