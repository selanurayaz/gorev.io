import type { ReviewFormValues } from '@/types/review'

export const emptyReviewForm: ReviewFormValues = {
  rating: 0,
  comment: '',
}

export type ReviewFormErrors = Partial<Record<keyof ReviewFormValues, string>>

export function validateReviewForm(values: ReviewFormValues): ReviewFormErrors {
  const errors: ReviewFormErrors = {}

  if (!Number.isInteger(values.rating) || values.rating < 1 || values.rating > 5) {
    errors.rating = '1 ile 5 arasında bir puan seçin.'
  }

  const comment = values.comment.trim()
  if (!comment) {
    errors.comment = 'Yorum yazın.'
  } else if (comment.length < 10) {
    errors.comment = 'Yorum en az 10 karakter olmalı.'
  } else if (comment.length > 1000) {
    errors.comment = 'Yorum en fazla 1000 karakter olabilir.'
  }

  return errors
}
