import { Link } from 'react-router-dom'

import { Container } from '@/components/ui/Container'
import { composeButtonClassName } from '@/lib/button-styles'

export function NotFoundPage() {
  return (
    <Container className="flex min-h-[50vh] flex-col items-center justify-center py-20 text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gorev-muted">
        404
      </p>
      <h1 className="mt-3 text-2xl font-semibold text-gorev-snow sm:text-3xl">
        Sayfa bulunamadı
      </h1>
      <p className="mt-2 max-w-md text-sm text-gorev-muted">
        Aradığınız adres mevcut değil veya taşınmış olabilir.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link
          to="/"
          className={composeButtonClassName(
            'primary',
            'min-h-11 justify-center px-8',
          )}
        >
          Ana sayfa
        </Link>
        <Link
          to="/kesfet"
          className={composeButtonClassName(
            'outline',
            'min-h-11 justify-center px-8',
          )}
        >
          Görev Keşfet
        </Link>
      </div>
    </Container>
  )
}
