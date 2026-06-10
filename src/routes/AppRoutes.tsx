import { Navigate, Route, Routes } from 'react-router-dom'

import { GuestRoute } from '@/components/auth/GuestRoute'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { AuthLayout } from '@/layouts/AuthLayout'
import { DashboardLayout } from '@/layouts/DashboardLayout'
import { MainLayout } from '@/layouts/MainLayout'
import { DashboardPage } from '@/pages/DashboardPage'
import { CreateServicePage } from '@/pages/CreateServicePage'
import { CreateTaskPage } from '@/pages/CreateTaskPage'
import { MyServicesPage } from '@/pages/MyServicesPage'
import { MyTasksPage } from '@/pages/MyTasksPage'
import { ProfileSettingsPage } from '@/pages/ProfileSettingsPage'
import { DiscoverTasksPage } from '@/pages/DiscoverTasksPage'
import { MessagesPage } from '@/pages/MessagesPage'
import { NotificationsPage } from '@/pages/NotificationsPage'
import { OffersPage } from '@/pages/OffersPage'
import { ServiceDetailPage } from '@/pages/ServiceDetailPage'
import { TaskDetailPage } from '@/pages/TaskDetailPage'
import { ForgotPasswordPage } from '@/pages/ForgotPasswordPage'
import { HomePage } from '@/pages/HomePage'
import { LoginPage } from '@/pages/LoginPage'
import { RegisterPage } from '@/pages/RegisterPage'

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route index element={<HomePage />} />
        <Route path="kesfet" element={<DiscoverTasksPage />} />
        <Route path="kesfet/gorev/:taskId" element={<TaskDetailPage />} />
        <Route path="kesfet/hizmet/:serviceId" element={<ServiceDetailPage />} />
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
          <Route path="hizmetler" element={<MyServicesPage />} />
          <Route path="hizmet-olustur" element={<CreateServicePage />} />
          <Route path="teklifler" element={<OffersPage />} />
          <Route path="mesajlar" element={<MessagesPage />} />
          <Route path="bildirimler" element={<NotificationsPage />} />
          <Route path="profil" element={<ProfileSettingsPage />} />
        </Route>
      </Route>
    </Routes>
  )
}
