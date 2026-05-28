type TaskListLoadingProps = {
  className?: string
}

export function TaskListLoading({ className }: TaskListLoadingProps = {}) {
  return (
    <div
      className={className ?? 'grid gap-4 sm:grid-cols-2'}
      role="status"
      aria-live="polite"
      aria-label="Görevler yükleniyor"
    >
      {Array.from({ length: 4 }, (_, index) => (
        <div
          key={index}
          className="animate-pulse rounded-2xl border border-gorev-navy-800 bg-gorev-navy-900/50 p-5"
        >
          <div className="flex justify-between gap-3">
            <div className="h-5 w-2/3 rounded-lg bg-gorev-navy-800" />
            <div className="h-5 w-16 rounded-full bg-gorev-navy-800" />
          </div>
          <div className="mt-5 space-y-3">
            <div className="h-4 w-full rounded bg-gorev-navy-800/80" />
            <div className="h-4 w-5/6 rounded bg-gorev-navy-800/80" />
            <div className="h-4 w-4/6 rounded bg-gorev-navy-800/80" />
          </div>
          <div className="mt-5 h-4 w-1/3 rounded bg-gorev-navy-800/60" />
        </div>
      ))}
      <span className="sr-only">Görevler yükleniyor…</span>
    </div>
  )
}
