type OffersEmptyStateProps = {
  title: string
  description: string
}

export function OffersEmptyState({ title, description }: OffersEmptyStateProps) {
  return (
    <div className="rounded-2xl border border-dashed border-gorev-navy-700 bg-gorev-navy-900/30 px-6 py-12 text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gorev-green-400">
        Henüz teklif yok
      </p>
      <h3 className="mt-3 text-lg font-semibold text-gorev-snow">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-gorev-muted">
        {description}
      </p>
    </div>
  )
}
