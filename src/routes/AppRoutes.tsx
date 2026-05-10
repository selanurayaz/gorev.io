import { Route, Routes } from 'react-router-dom'

import { MainLayout } from '@/layouts/MainLayout'
import { HomePage } from '@/pages/HomePage'

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route index element={<HomePage />} />
      </Route>
    </Routes>
  )
}
