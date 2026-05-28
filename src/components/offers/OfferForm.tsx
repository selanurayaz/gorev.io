import type { FormEvent } from 'react'

import { AuthAlert } from '@/components/auth/AuthAlert'
import { Button } from '@/components/ui/Button'
import { TextareaField } from '@/components/ui/TextareaField'
import { TextField } from '@/components/ui/TextField'
import { useCreateOffer } from '@/hooks/useCreateOffer'
import type { TaskId } from '@/types/index'

type OfferFormProps = {
  taskId: TaskId
  onSuccess?: () => void
}

export function OfferForm({ taskId, onSuccess }: OfferFormProps) {
  const {
    form,
    fieldErrors,
    isSubmitting,
    submitError,
    successMessage,
    setField,
    submit,
  } = useCreateOffer(taskId)

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const ok = await submit()
    if (ok) onSuccess?.()
  }

  const formDisabled = isSubmitting || Boolean(successMessage)

  return (
    <form className="space-y-5" onSubmit={handleSubmit} noValidate>
      {successMessage ? (
        <AuthAlert message={successMessage} variant="success" />
      ) : null}
      {submitError ? <AuthAlert message={submitError} variant="error" /> : null}

      <TextField
        label="Teklif fiyatı (₺)"
        name="price"
        type="number"
        inputMode="decimal"
        min={1}
        step={50}
        placeholder="1500"
        value={form.price}
        onChange={(e) => setField('price', e.target.value)}
        error={fieldErrors.price}
        required
        disabled={formDisabled}
        hint="Bu görev için teklif ettiğiniz toplam tutar."
      />

      <TextareaField
        label="Mesajınız"
        name="message"
        placeholder="Deneyiminizi, sürenizi ve neden sizi seçmeleri gerektiğini kısaca yazın…"
        value={form.message}
        onChange={(e) => setField('message', e.target.value)}
        error={fieldErrors.message}
        required
        disabled={formDisabled}
        rows={5}
        hint="Görev sahibi teklifinizle birlikte bu mesajı görecek."
      />

      <Button
        type="submit"
        className="min-h-11 w-full justify-center sm:w-auto sm:px-8"
        loading={isSubmitting}
        disabled={formDisabled}
      >
        Teklifi gönder
      </Button>
    </form>
  )
}
