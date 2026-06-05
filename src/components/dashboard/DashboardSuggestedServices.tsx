import { Link } from 'react-router-dom'

import { DashboardCard } from '@/components/dashboard/DashboardCard'
import { DashboardSectionFeedback } from '@/components/dashboard/DashboardSectionFeedback'

export function DashboardSuggestedServices() {
  return (
    <DashboardCard
      title="Önerilen hizmetler"
      action={
        <Link
          to="/dashboard/hizmetler"
          className="text-sm font-medium text-gorev-yellow-400 transition hover:text-gorev-yellow-300"
        >
          Hizmetler
        </Link>
      }
    >
      <DashboardSectionFeedback
        isEmpty
        emptyMessage="Öneriler yakında burada görünecek."
      />
    </DashboardCard>
  )
}
