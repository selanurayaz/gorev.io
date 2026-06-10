import { ProfileSettingsForm } from '@/components/profile/ProfileSettingsForm'
import { DashboardCard } from '@/components/dashboard/DashboardCard'

export function ProfileSettingsPage() {
  return (
    <div className="mx-auto min-w-0 max-w-2xl">
      <DashboardCard
        title="Profil ayarları"
        action={
          <span className="text-xs text-gorev-muted">Hesap bilgileriniz</span>
        }
      >
        <ProfileSettingsForm />
      </DashboardCard>
    </div>
  )
}
