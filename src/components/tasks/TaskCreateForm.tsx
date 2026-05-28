import { useMemo, type FormEvent } from 'react'

import { AuthAlert } from '@/components/auth/AuthAlert'
import { Button } from '@/components/ui/Button'
import { ComboboxField } from '@/components/ui/ComboboxField'
import { Spinner } from '@/components/ui/Spinner'
import { TextareaField } from '@/components/ui/TextareaField'
import { CitySelectField } from '@/components/ui/CitySelectField'
import { TextField } from '@/components/ui/TextField'
import { useCategories } from '@/hooks/useCategories'
import { useCreateTask } from '@/hooks/useCreateTask'

export function TaskCreateForm() {
  const {
    categories,
    isLoading: categoriesLoading,
    error: categoriesError,
    reload: reloadCategories,
  } = useCategories()

  const {
    form,
    fieldErrors,
    isSubmitting,
    submitError,
    successMessage,
    setField,
    submit,
  } = useCreateTask()

  const categoryOptions = useMemo(
    () =>
      categories.map((category) => ({
        value: category.id,
        label: category.name,
      })),
    [categories],
  )

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    void submit()
  }

  if (categoriesLoading) {
    return (
      <div
        className="flex flex-col items-center justify-center gap-4 py-16"
        role="status"
        aria-live="polite"
      >
        <Spinner className="h-8 w-8 text-gorev-yellow-400" />
        <p className="text-sm text-gorev-muted">Kategoriler yükleniyor…</p>
      </div>
    )
  }

  if (categoriesError) {
    return (
      <div className="space-y-4 p-5 sm:p-6">
        <AuthAlert message={categoriesError} variant="error" />
        <button
          type="button"
          onClick={() => void reloadCategories()}
          className="text-sm font-medium text-gorev-yellow-400 underline-offset-4 hover:underline"
        >
          Tekrar dene
        </button>
      </div>
    )
  }

  const formDisabled = isSubmitting || Boolean(successMessage)

  return (
    <form className="space-y-5 p-5 sm:p-6" onSubmit={handleSubmit} noValidate>
      {successMessage ? (
        <AuthAlert message={successMessage} variant="success" />
      ) : null}
      {submitError ? <AuthAlert message={submitError} variant="error" /> : null}

      <TextField
        label="Görev başlığı"
        name="title"
        placeholder="Örn. Haftalık ofis temizliği (90 m²)"
        value={form.title}
        onChange={(e) => setField('title', e.target.value)}
        error={fieldErrors.title}
        required
        disabled={formDisabled}
        autoComplete="off"
      />

      <TextareaField
        label="Açıklama"
        name="description"
        placeholder="İşin kapsamını, süreyi, konumu ve beklentilerinizi net yazın…"
        value={form.description}
        onChange={(e) => setField('description', e.target.value)}
        error={fieldErrors.description}
        hint="Ne kadar detaylı olursa, o kadar isabetli teklif alırsınız."
        required
        disabled={formDisabled}
        rows={5}
      />

      <ComboboxField
        label="Kategori"
        name="category_id"
        value={form.category_id}
        onValueChange={(next) => setField('category_id', next)}
        error={fieldErrors.category_id}
        options={categoryOptions}
        placeholder={
          categoryOptions.length > 0
            ? 'Kategori seçin…'
            : 'Kategori bulunamadı'
        }
        required
        disabled={formDisabled || categoryOptions.length === 0}
        hint="Hizmet türünü seçin; ilanınız doğru uzmanlara ulaşır."
        searchable
        searchPlaceholder="Kategori ara…"
        emptyMessage="Bu aramayla eşleşen kategori yok."
      />

      <CitySelectField
        label="Şehir"
        name="city"
        value={form.city}
        onValueChange={(value) => setField('city', value)}
        error={fieldErrors.city}
        required
        disabled={formDisabled}
        placeholder="İl seçin…"
      />

      <div className="grid gap-5 sm:grid-cols-2">
        <TextField
          label="Minimum bütçe (₺)"
          name="budget_min"
          type="number"
          inputMode="decimal"
          min={0}
          step={50}
          placeholder="1500"
          value={form.budget_min}
          onChange={(e) => setField('budget_min', e.target.value)}
          error={fieldErrors.budget_min}
          required
          disabled={formDisabled}
        />
        <TextField
          label="Maksimum bütçe (₺)"
          name="budget_max"
          type="number"
          inputMode="decimal"
          min={0}
          step={50}
          placeholder="2400"
          value={form.budget_max}
          onChange={(e) => setField('budget_max', e.target.value)}
          error={fieldErrors.budget_max}
          hint="Teklifler bu aralıkta toplanır."
          required
          disabled={formDisabled}
        />
      </div>

      <div className="flex flex-col gap-3 border-t border-gorev-navy-800 pt-6 sm:flex-row sm:justify-between">
        <p className="text-xs leading-relaxed text-gorev-muted sm:max-w-xs sm:self-center">
          Gönderdiğinizde ilanınız yayına alınır ve uygun hizmet verenlerden
          teklif almaya başlarsınız.
        </p>
        <Button
          type="submit"
          className="min-h-11 w-full justify-center px-8 sm:w-auto"
          loading={isSubmitting}
          disabled={formDisabled || categoryOptions.length === 0}
        >
          Görevi yayınla
        </Button>
      </div>
    </form>
  )
}
