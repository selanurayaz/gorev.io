import type { ServiceId, TaskId } from '@/types/index'

export type ReviewSubmittedDetail = {
  taskId: TaskId
  serviceId: ServiceId | null
}

const REVIEW_SUBMITTED_EVENT = 'gorev:review-submitted'

export function emitReviewSubmitted(detail: ReviewSubmittedDetail): void {
  if (typeof window === 'undefined') return
  window.dispatchEvent(
    new CustomEvent<ReviewSubmittedDetail>(REVIEW_SUBMITTED_EVENT, {
      detail,
    }),
  )
}

export function subscribeReviewSubmitted(
  handler: (detail: ReviewSubmittedDetail) => void,
): () => void {
  if (typeof window === 'undefined') {
    return () => undefined
  }

  const listener = (event: Event) => {
    const custom = event as CustomEvent<ReviewSubmittedDetail>
    if (!custom.detail) return
    handler(custom.detail)
  }

  window.addEventListener(REVIEW_SUBMITTED_EVENT, listener)
  return () => {
    window.removeEventListener(REVIEW_SUBMITTED_EVENT, listener)
  }
}
