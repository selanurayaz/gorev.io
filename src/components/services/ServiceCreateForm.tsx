import { useMemo, type FormEvent } from 'react'

import { AuthAlert } from '@/components/auth/AuthAlert'
import { Button } from '@/components/ui/Button'
import { ComboboxField } from '@/components/ui/ComboboxField'
import { Spinner } from '@/components/ui/Spinner'
import { TextareaField } from '@/components/ui/TextareaField'
import { CitySelectField } from '@/components/ui/CitySelectField'
import { TextField } from '@/components/ui/TextField'
import { useCategories } from '@/hooks/useCategories'
import { useCreateService } from '@/hooks/useCreateService'
import { cn } from '@/lib/utils'

export function ServiceCreateForm() {
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
  } = useCreateService()

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
        label="Hizmet başlığı"
        name="title"
        placeholder="Örn. Profesyonel ofis temizliği"
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
        placeholder="Sunduğunuz hizmetin kapsamını, süresini ve dahil olanları yazın…"
        value={form.description}
        onChange={(e) => setField('description', e.target.value)}
        error={fieldErrors.description}
        hint="Ne kadar net olursa, müşteriler sizi o kadar kolay bulur."
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
        hint="Hizmetinizin ait olduğu kategoriyi seçin."
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

      <TextField
        label="Başlangıç fiyatı (₺)"
        name="base_price"
        type="number"
        inputMode="decimal"
        min={0}
        step={50}
        placeholder="1500"
        value={form.base_price}
        onChange={(e) => setField('base_price', e.target.value)}
        error={fieldErrors.base_price}
        hint="Hizmetiniz için başlangıç fiyatınızı belirtin."
        required
        disabled={formDisabled}
      />

      <div className="rounded-xl border border-gorev-navy-800 bg-gorev-navy-900/40 p-4">
        <label className="flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            name="is_active"
            checked={form.is_active}
            onChange={(e) => setField('is_active', e.target.checked)}
            disabled={formDisabled}
            className={cn(
              'mt-0.5 h-4 w-4 shrink-0 rounded border-gorev-navy-600 bg-gorev-navy-950',
              'text-gorev-yellow-400 focus:ring-2 focus:ring-gorev-yellow-400/40 focus:ring-offset-0',
            )}
          />
          <span>
            <span className="block text-sm font-medium text-gorev-snow">
              Hizmeti yayında tut
            </span>
            <span className="mt-1 block text-xs leading-relaxed text-gorev-muted">
              İşaretliyken hizmetiniz aktif olarak listelenir. Kaldırırsanız
              pasif duruma geçer.
            </span>
          </span>
        </label>
      </div>

      <div className="flex flex-col gap-3 border-t border-gorev-navy-800 pt-6 sm:flex-row sm:justify-between">
        <p className="text-xs leading-relaxed text-gorev-muted sm:max-w-xs sm:self-center">
          Sunduğunuz hizmet paketi, görev ilanlarından ayrı olarak
          listelenir.
        </p>
        <Button
          type="submit"
          className="min-h-11 w-full justify-center px-8 sm:w-auto"
          loading={isSubmitting}
          disabled={formDisabled || categoryOptions.length === 0}
        >
          Hizmeti yayınla
        </Button>
      </div>
    </form>
  )
}
