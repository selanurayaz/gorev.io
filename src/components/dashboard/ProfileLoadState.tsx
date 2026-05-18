import { AuthAlert } from '@/components/auth/AuthAlert'
import { Spinner } from '@/components/ui/Spinner'
import { cn } from '@/lib/utils'

type ProfileLoadStateProps = {
  isLoading?: boolean
  error: string | null
  onRetry?: () => void
  className?: string
}

/** Profil yüklenirken / hata durumunda karşılama alanı için yardımcı UI. */
export function ProfileLoadState({
  isLoading = false,
  error,
  onRetry,
  className,
}: ProfileLoadStateProps) {
  if (!isLoading && !error) return null

  return (
    <div className={cn('mt-3 space-y-3', className)}>
      {isLoading ? (
        <div
          className="flex items-center gap-2 text-sm text-gorev-muted"
          role="status"
          aria-live="polite"
        >
          <Spinner className="h-4 w-4 text-gorev-yellow-400" aria-hidden />
          Profil yükleniyor…
        </div>
      ) : null}

      {error ? (
        <div className="space-y-2">
          <AuthAlert message={error} variant="error" />
          {onRetry ? (
            <button
              type="button"
              onClick={() => void onRetry()}
              className="text-sm font-medium text-gorev-yellow-400 underline-offset-4 transition hover:text-gorev-yellow-300 hover:underline"
            >
              Tekrar dene
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
