import { AuthAlert } from '@/components/auth/AuthAlert'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { usePriceSuggestion } from '@/hooks/usePriceSuggestion'
import { toPriceFieldValue } from '@/lib/price-suggestion'
import { cn } from '@/lib/utils'
import { formatTryAmount } from '@/utils/format'
import type { ListingType } from '@/types/price-suggestion'

type AiPriceSuggestionPanelProps = {
  listingType: ListingType
  title: string
  description: string
  category: string
  city: string
  disabled?: boolean
  onApplyTask?: (budgetMin: string, budgetMax: string) => void
  onApplyService?: (basePrice: string) => void
}

function SparkleIcon() {
  return (
    <svg
      className="h-4 w-4 shrink-0"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.847a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.847.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z"
      />
    </svg>
  )
}

export function AiPriceSuggestionPanel({
  listingType,
  title,
  description,
  category,
  city,
  disabled = false,
  onApplyTask,
  onApplyService,
}: AiPriceSuggestionPanelProps) {
  const { suggestion, isLoading, error, suggest, reset } = usePriceSuggestion()

  const canRequest = Boolean(
    title.trim() &&
      description.trim() &&
      category.trim() &&
      city.trim() &&
      !disabled,
  )

  async function handleSuggest() {
    reset()
    await suggest({
      title: title.trim(),
      description: description.trim(),
      category: category.trim(),
      city: city.trim(),
      listing_type: listingType,
    })
  }

  function handleApply() {
    if (!suggestion) return

    if (listingType === 'task' && onApplyTask) {
      onApplyTask(
        toPriceFieldValue(suggestion.minimum_price),
        toPriceFieldValue(suggestion.maximum_price),
      )
      return
    }

    if (listingType === 'service' && onApplyService) {
      onApplyService(toPriceFieldValue(suggestion.suggested_price))
    }
  }

  return (
    <section
      className={cn(
        'rounded-xl border border-gorev-navy-800 bg-gradient-to-br from-gorev-navy-900/70 to-gorev-navy-950/80 p-4 sm:p-5',
        'ring-1 ring-gorev-yellow-400/10',
      )}
      aria-label="AI fiyat önerisi"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="flex items-center gap-2 text-sm font-semibold text-gorev-snow">
            <SparkleIcon />
            AI fiyat asistanı
          </p>
          <p className="mt-1 text-xs leading-relaxed text-gorev-muted">
            Başlık, açıklama, kategori ve şehre göre Türkiye pazarı için tahmini
            fiyat aralığı önerisi alın. Sonuçlar bağlayıcı değildir.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          className="min-h-10 w-full shrink-0 px-4 sm:w-auto"
          loading={isLoading}
          disabled={!canRequest || isLoading}
          onClick={() => void handleSuggest()}
        >
          AI ile fiyat öner
        </Button>
      </div>

      {!canRequest && !disabled ? (
        <p className="mt-3 text-xs text-gorev-muted">
          Öneri almak için başlık, açıklama, kategori ve şehir alanlarını
          doldurun.
        </p>
      ) : null}

      {isLoading ? (
        <div
          className="mt-4 flex items-center gap-3 rounded-lg border border-gorev-navy-800 bg-gorev-navy-900/50 px-4 py-3"
          role="status"
        >
          <Spinner className="h-5 w-5 text-gorev-yellow-400" />
          <p className="text-sm text-gorev-muted">
            AI fiyat önerisi hazırlanıyor…
          </p>
        </div>
      ) : null}

      {error ? (
        <div className="mt-4 space-y-2">
          <AuthAlert message={error} variant="error" />
          <button
            type="button"
            onClick={() => void handleSuggest()}
            disabled={!canRequest || isLoading}
            className="text-sm font-medium text-gorev-yellow-400 underline-offset-4 hover:underline disabled:opacity-60"
          >
            Tekrar dene
          </button>
        </div>
      ) : null}

      {suggestion && !isLoading ? (
        <div className="mt-4 space-y-4 rounded-lg border border-gorev-yellow-400/20 bg-gorev-yellow-400/5 p-4">
          <div className="space-y-2 text-sm">
            <p className="font-semibold text-gorev-snow">
              Önerilen fiyat:{' '}
              <span className="text-gorev-yellow-300">
                {formatTryAmount(suggestion.suggested_price)}
              </span>
            </p>
            <p className="text-gorev-snow">
              Aralık:{' '}
              <span className="font-medium text-gorev-yellow-300">
                {formatTryAmount(suggestion.minimum_price)} –{' '}
                {formatTryAmount(suggestion.maximum_price)}
              </span>
            </p>
            <p className="leading-relaxed text-gorev-muted">
              <span className="font-medium text-gorev-snow">Sebep: </span>
              {suggestion.short_reason}
            </p>
          </div>

          <Button
            type="button"
            variant="secondary"
            className="min-h-10 w-full justify-center sm:w-auto"
            disabled={disabled}
            onClick={handleApply}
          >
            {listingType === 'task'
              ? 'Bütçe aralığını forma uygula'
              : 'Önerilen fiyatı forma uygula'}
          </Button>
        </div>
      ) : null}
    </section>
  )
}
