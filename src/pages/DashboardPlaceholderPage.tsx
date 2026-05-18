import { Link } from 'react-router-dom'

import { DashboardCard } from '@/components/dashboard/DashboardCard'
import { composeButtonClassName } from '@/lib/button-styles'

type DashboardPlaceholderPageProps = {
  title: string
  description: string
}

export function DashboardPlaceholderPage({
  title,
  description,
}: DashboardPlaceholderPageProps) {
  return (
    <div className="mx-auto max-w-2xl">
      <DashboardCard>
        <div className="p-6 text-center sm:p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gorev-green-400">
            Yakında
          </p>
          <h2 className="mt-3 text-2xl font-semibold text-gorev-snow">{title}</h2>
          <p className="mt-4 text-sm leading-relaxed text-gorev-muted">
            {description}
          </p>
          <Link
            to="/dashboard"
            className={composeButtonClassName(
              'outline',
              'mt-8 inline-flex min-h-11 items-center justify-center px-6',
            )}
          >
            Ana sayfaya dön
          </Link>
        </div>
      </DashboardCard>
    </div>
  )
}
