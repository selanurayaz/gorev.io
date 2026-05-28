type MarketplaceEmptyProps = {
  hasFilters: boolean
  onClearFilters?: () => void
}

export function MarketplaceEmpty({
  hasFilters,
  onClearFilters,
}: MarketplaceEmptyProps) {
  return (
    <div className="rounded-2xl border border-dashed border-gorev-navy-700 bg-gorev-navy-900/30 px-6 py-12 text-center sm:px-10">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gorev-green-400">
        {hasFilters ? 'Sonuç yok' : 'Henüz açık görev yok'}
      </p>
      <h3 className="mt-3 text-xl font-semibold text-gorev-snow">
        {hasFilters
          ? 'Filtrelere uygun görev bulunamadı'
          : 'Yakında yeni görevler burada'}
      </h3>
      <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-gorev-muted">
        {hasFilters
          ? 'Farklı bir arama deneyin veya filtreleri temizleyerek tüm açık ilanları görün.'
          : 'Şu anda yayında açık görev bulunmuyor. Daha sonra tekrar kontrol edin.'}
      </p>
      {hasFilters && onClearFilters ? (
        <button
          type="button"
          onClick={onClearFilters}
          className="mt-6 text-sm font-medium text-gorev-yellow-400 underline-offset-4 hover:underline"
        >
          Filtreleri temizle
        </button>
      ) : null}
    </div>
  )
}
