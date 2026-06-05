import { Link } from 'react-router-dom'

import { composeButtonClassName } from '@/lib/button-styles'

export function MyTasksEmpty() {
  return (
    <div className="rounded-2xl border border-dashed border-gorev-navy-700 bg-gorev-navy-900/30 px-6 py-12 text-center sm:px-10">
      <h3 className="text-xl font-semibold text-gorev-snow">
        Henüz kabul edilmiş göreviniz yok.
      </h3>
      <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-gorev-muted">
        Görev Keşfet bölümünden açık görevlere teklif vererek iş almaya
        başlayabilirsiniz.
      </p>
      <Link
        to="/kesfet"
        className={composeButtonClassName(
          'primary',
          'mt-8 inline-flex min-h-11 items-center justify-center px-8',
        )}
      >
        Görev Keşfet
      </Link>
    </div>
  )
}
