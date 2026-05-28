import { Navigate, Route, Routes } from 'react-router-dom'

import { GuestRoute } from '@/components/auth/GuestRoute'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { AuthLayout } from '@/layouts/AuthLayout'
import { DashboardLayout } from '@/layouts/DashboardLayout'
import { MainLayout } from '@/layouts/MainLayout'
import { DashboardPage } from '@/pages/DashboardPage'
import { CreateTaskPage } from '@/pages/CreateTaskPage'
import { DashboardPlaceholderPage } from '@/pages/DashboardPlaceholderPage'
import { MyTasksPage } from '@/pages/MyTasksPage'
import { ProfileSettingsPage } from '@/pages/ProfileSettingsPage'
import { ForgotPasswordPage } from '@/pages/ForgotPasswordPage'
import { HomePage } from '@/pages/HomePage'
import { LoginPage } from '@/pages/LoginPage'
import { RegisterPage } from '@/pages/RegisterPage'

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route index element={<HomePage />} />
      </Route>

      <Route path="login" element={<Navigate to="/giris" replace />} />

      <Route element={<GuestRoute />}>
        <Route element={<AuthLayout />}>
          <Route path="giris" element={<LoginPage />} />
          <Route path="kayit" element={<RegisterPage />} />
          <Route path="sifremi-unuttum" element={<ForgotPasswordPage />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route path="dashboard" element={<DashboardLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="gorevlerim" element={<MyTasksPage />} />
          <Route path="gorev-olustur" element={<CreateTaskPage />} />
          <Route
            path="hizmetler"
            element={
              <DashboardPlaceholderPage
                title="Hizmetler"
                description="Sunduğunuz hizmet paketleri ve aldığınız hizmetler bu bölümde yer alacak."
              />
            }
          />
          <Route
            path="mesajlar"
            element={
              <DashboardPlaceholderPage
                title="Mesajlar"
                description="Teklifler ve sohbetler için birleşik mesajlaşma arayüzü yakında."
              />
            }
          />
          <Route path="profil" element={<ProfileSettingsPage />} />
        </Route>
      </Route>
    </Routes>
  )
}
