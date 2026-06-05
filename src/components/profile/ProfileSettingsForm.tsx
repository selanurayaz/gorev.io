import type { FormEvent } from 'react'

import { AuthAlert } from '@/components/auth/AuthAlert'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { TextareaField } from '@/components/ui/TextareaField'
import { CitySelectField } from '@/components/ui/CitySelectField'
import { TextField } from '@/components/ui/TextField'
import { UserRatingBadge } from '@/components/reviews/UserRatingBadge'
import { useAuth } from '@/hooks/useAuth'
import { useProfileSettings } from '@/hooks/useProfileSettings'
import { useUserRatingSummary } from '@/hooks/useUserRatingSummary'

export function ProfileSettingsForm() {
  const { user } = useAuth()
  const {
    summary: ratingSummary,
    isLoading: ratingLoading,
    error: ratingError,
    reload: reloadRating,
  } = useUserRatingSummary(user?.id)

  const {
    email,
    form,
    fieldErrors,
    isLoading,
    isSaving,
    loadError,
    saveError,
    successMessage,
    setField,
    save,
    reload,
  } = useProfileSettings()

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    void save()
  }

  if (isLoading) {
    return (
      <div
        className="flex flex-col items-center justify-center gap-4 py-16"
        role="status"
        aria-live="polite"
      >
        <Spinner className="h-8 w-8 text-gorev-yellow-400" />
        <p className="text-sm text-gorev-muted">Profil bilgileri yükleniyor…</p>
      </div>
    )
  }

  if (loadError) {
    return (
      <div className="space-y-4 p-5 sm:p-6">
        <AuthAlert message={loadError} variant="error" />
        <button
          type="button"
          onClick={() => void reload()}
          className="text-sm font-medium text-gorev-yellow-400 underline-offset-4 hover:underline"
        >
          Tekrar dene
        </button>
      </div>
    )
  }

  return (
    <form className="space-y-5 p-5 sm:p-6" onSubmit={handleSubmit} noValidate>
      <div className="rounded-xl border border-gorev-navy-800 bg-gorev-navy-900/40 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-gorev-muted">
          Ortalama puanınız
        </p>
        <div className="mt-2">
          <UserRatingBadge
            summary={ratingSummary}
            isLoading={ratingLoading}
          />
        </div>
        {ratingError ? (
          <button
            type="button"
            onClick={() => void reloadRating()}
            className="mt-2 text-sm font-medium text-gorev-yellow-400 underline-offset-4 hover:underline"
          >
            Puan bilgisini yenile
          </button>
        ) : null}
      </div>

      {successMessage ? (
        <AuthAlert message={successMessage} variant="success" />
      ) : null}
      {saveError ? <AuthAlert message={saveError} variant="error" /> : null}

      <TextField
        label="E-posta"
        name="email"
        type="email"
        value={email}
        readOnly
        disabled
        hint="E-posta Supabase Auth üzerinden yönetilir; buradan değiştirilemez."
        className="cursor-not-allowed opacity-80"
      />

      <TextField
        label="Ad soyad"
        name="full_name"
        autoComplete="name"
        placeholder="Ayşe Yılmaz"
        value={form.full_name}
        onChange={(e) => setField('full_name', e.target.value)}
        error={fieldErrors.full_name}
        required
        disabled={isSaving}
      />

      <CitySelectField
        label="Şehir"
        name="city"
        value={form.city}
        onValueChange={(value) => setField('city', value)}
        error={fieldErrors.city}
        disabled={isSaving}
        placeholder="İl seçin…"
      />

      <TextField
        label="Rol"
        name="role"
        placeholder="Örn. görev sahibi, hizmet veren"
        value={form.role}
        onChange={(e) => setField('role', e.target.value)}
        error={fieldErrors.role}
        hint="Platformdaki rolünüzü kısaca belirtin."
        disabled={isSaving}
      />

      <TextareaField
        label="Biyografi"
        name="bio"
        placeholder="Kendinizi ve sunduğunuz hizmetleri kısaca tanıtın…"
        value={form.bio}
        onChange={(e) => setField('bio', e.target.value)}
        error={fieldErrors.bio}
        hint="En fazla 500 karakter."
        disabled={isSaving}
      />

      <div className="flex flex-col gap-3 border-t border-gorev-navy-800 pt-6 sm:flex-row sm:justify-end">
        <Button
          type="submit"
          className="min-h-11 w-full justify-center px-8 sm:w-auto"
          loading={isSaving}
        >
          Değişiklikleri kaydet
        </Button>
      </div>
    </form>
  )
}
