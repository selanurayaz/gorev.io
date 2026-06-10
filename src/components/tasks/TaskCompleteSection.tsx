import { AuthAlert } from '@/components/auth/AuthAlert'
import { Button } from '@/components/ui/Button'
import type { TaskId } from '@/types/index'

type TaskCompleteSectionProps = {
  taskId: TaskId
  isCompleting: boolean
  error: string | null
  successMessage: string | null
  onComplete: () => void
}

export function TaskCompleteSection({
  taskId,
  isCompleting,
  error,
  successMessage,
  onComplete,
}: TaskCompleteSectionProps) {
  return (
    <section className="rounded-2xl border border-gorev-navy-800 bg-gorev-navy-900/40 p-5 sm:p-6">
      <h2 className="text-lg font-semibold text-gorev-snow">İşi tamamla</h2>
      <p className="mt-1 text-sm text-gorev-muted">
        Hizmet tamamlandığında aşağıdaki düğmeye basın; ardından hizmet
        verene değerlendirme bırakabilirsiniz.
      </p>

      {successMessage ? (
        <div className="mt-4">
          <AuthAlert message={successMessage} variant="success" />
        </div>
      ) : null}
      {error ? (
        <div className="mt-4">
          <AuthAlert message={error} variant="error" />
        </div>
      ) : null}

      <Button
        type="button"
        className="mt-5 min-h-11 w-full justify-center sm:w-auto"
        loading={isCompleting}
        disabled={isCompleting || Boolean(successMessage)}
        onClick={onComplete}
        data-task-id={taskId}
      >
        Tamamlandı
      </Button>
    </section>
  )
}
