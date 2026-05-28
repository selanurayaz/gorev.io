import { Link } from 'react-router-dom'

import { DashboardCard } from '@/components/dashboard/DashboardCard'
import { TaskCreateForm } from '@/components/tasks/TaskCreateForm'
import { composeButtonClassName } from '@/lib/button-styles'

export function CreateTaskPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gorev-green-400">
            Yeni ilan
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-gorev-snow">
            Görev Oluştur
          </h1>
          <p className="mt-2 text-sm text-gorev-muted">
            İhtiyacınızı tanımlayın; doğru uzmanlardan teklif alın.
          </p>
        </div>
        <Link
          to="/dashboard/gorevlerim"
          className={composeButtonClassName(
            'outline',
            'inline-flex min-h-10 items-center justify-center px-4 text-sm',
          )}
        >
          Görevlerime dön
        </Link>
      </div>

      <DashboardCard title="Görev bilgileri">
        <TaskCreateForm />
      </DashboardCard>
    </div>
  )
}
