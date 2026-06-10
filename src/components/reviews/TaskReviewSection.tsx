import { AuthAlert } from '@/components/auth/AuthAlert'
import { ReviewForm } from '@/components/reviews/ReviewForm'
import { ReviewSubmittedCard } from '@/components/reviews/ReviewSubmittedCard'
import { Spinner } from '@/components/ui/Spinner'
import { useTaskReview } from '@/hooks/useTaskReview'
import type { TaskId } from '@/types/index'

type TaskReviewSectionProps = {
  taskId: TaskId
  enabled: boolean
  onSubmitted?: () => void
}

export function TaskReviewSection({
  taskId,
  enabled,
  onSubmitted,
}: TaskReviewSectionProps) {
  const {
    providerId,
    existingReview,
    form,
    fieldErrors,
    isLoading,
    isSubmitting,
    error,
    submitError,
    successMessage,
    setField,
    submit,
    reload,
  } = useTaskReview(taskId, enabled, onSubmitted)

  if (!enabled) return null

  if (isLoading) {
    return (
      <section
        className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-gorev-navy-800 bg-gorev-navy-900/40 px-5 py-10 sm:px-6"
        role="status"
      >
        <Spinner className="h-7 w-7 text-gorev-yellow-400" />
        <p className="text-sm text-gorev-muted">Değerlendirme bilgisi yükleniyor…</p>
      </section>
    )
  }

  if (error) {
    return (
      <section className="space-y-3 rounded-2xl border border-gorev-navy-800 bg-gorev-navy-900/40 p-5 sm:p-6">
        <AuthAlert message={error} variant="error" />
        <button
          type="button"
          onClick={() => void reload()}
          className="text-sm font-medium text-gorev-yellow-400 underline-offset-4 hover:underline"
        >
          Tekrar dene
        </button>
      </section>
    )
  }

  if (!providerId) {
    return (
      <section className="rounded-2xl border border-dashed border-gorev-navy-700 bg-gorev-navy-900/30 px-5 py-8 text-center sm:px-6">
        <p className="text-sm text-gorev-muted">
          Bu görev için kabul edilmiş hizmet veren bulunamadı; değerlendirme
          şu an yapılamıyor.
        </p>
      </section>
    )
  }

  return (
    <section className="rounded-2xl border border-gorev-navy-800 bg-gorev-navy-900/40 p-5 sm:p-6">
      <h2 className="text-lg font-semibold text-gorev-snow">
        Hizmet vereni değerlendirin
      </h2>
      <p className="mt-1 text-sm text-gorev-muted">
        Tamamlanan görev için 1–5 arası puan ve kısa bir yorum bırakın.
      </p>

      <div className="mt-5">
        {existingReview ? (
          <ReviewSubmittedCard review={existingReview} />
        ) : (
          <ReviewForm
            form={form}
            fieldErrors={fieldErrors}
            isSubmitting={isSubmitting}
            submitError={submitError}
            successMessage={successMessage}
            setField={setField}
            onSubmit={submit}
          />
        )}
      </div>
    </section>
  )
}
