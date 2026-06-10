import { AuthAlert } from '@/components/auth/AuthAlert'
import { TaskReviewSection } from '@/components/reviews/TaskReviewSection'
import { TaskCompleteSection } from '@/components/tasks/TaskCompleteSection'
import { Spinner } from '@/components/ui/Spinner'
import { useCompleteTask } from '@/hooks/useCompleteTask'
import { useTaskWorkContext } from '@/hooks/useTaskWorkContext'
import { cn } from '@/lib/utils'
import type { TaskId } from '@/types/index'

type TaskOwnerWorkPanelProps = {
  taskId: TaskId
  className?: string
  onUpdated?: () => void
  onReviewSubmitted?: () => void
}

/** Görev sahibi için tamamlama ve değerlendirme akışı. */
export function TaskOwnerWorkPanel({
  taskId,
  className,
  onUpdated,
  onReviewSubmitted,
}: TaskOwnerWorkPanelProps) {
  const {
    isOwner,
    isInProgress,
    isCompleted,
    isLoading,
    error,
    reload,
  } = useTaskWorkContext(taskId)

  const {
    isCompleting,
    error: completeError,
    successMessage: completeSuccess,
    complete,
  } = useCompleteTask(() => {
    void reload()
    onUpdated?.()
  })

  if (isLoading) {
    return (
      <div
        className={cn(
          'flex items-center justify-center gap-2 py-4 text-sm text-gorev-muted',
          className,
        )}
        role="status"
      >
        <Spinner className="h-5 w-5 text-gorev-yellow-400" />
        <span>İş durumu yükleniyor…</span>
      </div>
    )
  }

  if (!isOwner) return null

  if (error) {
    return (
      <div className={cn('space-y-2', className)}>
        <AuthAlert message={error} variant="error" />
      </div>
    )
  }

  if (!isInProgress && !isCompleted) return null

  return (
    <div className={cn('space-y-4', className)}>
      {isInProgress ? (
        <TaskCompleteSection
          taskId={taskId}
          isCompleting={isCompleting}
          error={completeError}
          successMessage={completeSuccess}
          onComplete={() => void complete(taskId)}
        />
      ) : null}

      {isCompleted ? (
        <TaskReviewSection
          taskId={taskId}
          enabled
          onSubmitted={onReviewSubmitted}
        />
      ) : null}
    </div>
  )
}
