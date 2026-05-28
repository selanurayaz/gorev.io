import { Link } from 'react-router-dom'

import { composeButtonClassName } from '@/lib/button-styles'

export function TaskListEmpty() {
  return (
    <div className="rounded-2xl border border-dashed border-gorev-navy-700 bg-gorev-navy-900/30 px-6 py-12 text-center sm:px-10">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gorev-green-400">
        Henüz görev yok
      </p>
      <h3 className="mt-3 text-xl font-semibold text-gorev-snow">
        İlk görevinizi oluşturun
      </h3>
      <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-gorev-muted">
        İhtiyacınızı paylaşın; uygun hizmet verenlerden teklif almaya başlayın.
        Oluşturduğunuz görevler burada listelenecek.
      </p>
      <Link
        to="/dashboard/gorev-olustur"
        className={composeButtonClassName(
          'primary',
          'mt-8 inline-flex min-h-11 items-center justify-center px-8',
        )}
      >
        Görev oluştur
      </Link>
    </div>
  )
}
