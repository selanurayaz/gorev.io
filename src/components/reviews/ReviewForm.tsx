import type { FormEvent } from 'react'

import { AuthAlert } from '@/components/auth/AuthAlert'
import { StarRatingInput } from '@/components/reviews/StarRatingInput'
import { Button } from '@/components/ui/Button'
import { TextareaField } from '@/components/ui/TextareaField'
import type { ReviewFormErrors } from '@/lib/review-form'
import type { ReviewFormValues } from '@/types/review'

type ReviewFormProps = {
  form: ReviewFormValues
  fieldErrors: ReviewFormErrors
  isSubmitting: boolean
  submitError: string | null
  successMessage: string | null
  setField: <K extends keyof ReviewFormValues>(
    key: K,
    value: ReviewFormValues[K],
  ) => void
  onSubmit: () => void | Promise<boolean>
  disabled?: boolean
}

export function ReviewForm({
  form,
  fieldErrors,
  isSubmitting,
  submitError,
  successMessage,
  setField,
  onSubmit,
  disabled = false,
}: ReviewFormProps) {
  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    void onSubmit()
  }

  const formDisabled = disabled || isSubmitting || Boolean(successMessage)

  return (
    <form className="space-y-5" onSubmit={handleSubmit} noValidate>
      {successMessage ? (
        <AuthAlert message={successMessage} variant="success" />
      ) : null}
      {submitError ? <AuthAlert message={submitError} variant="error" /> : null}

      <StarRatingInput
        value={form.rating}
        onChange={(value) => setField('rating', value)}
        error={fieldErrors.rating}
        disabled={formDisabled}
      />

      <TextareaField
        label="Yorum"
        name="comment"
        placeholder="Hizmet verenle çalışma deneyiminizi kısaca yazın…"
        value={form.comment}
        onChange={(e) => setField('comment', e.target.value)}
        error={fieldErrors.comment}
        hint="En az 10 karakter. Deneyiminizi net anlatın."
        required
        disabled={formDisabled}
        rows={4}
      />

      <Button
        type="submit"
        className="min-h-11 w-full justify-center sm:w-auto"
        loading={isSubmitting}
        disabled={formDisabled}
      >
        Değerlendirmeyi gönder
      </Button>
    </form>
  )
}
