import { Route, Routes, Navigate } from 'react-router-dom'
import './App.css'

import Home from './pages/Home'
import Login from './pages/Login'
import Signup from './pages/Signup'
import AdminDashboardPage from './admin/AdminDashboardPage'
import AdminLayout from './admin/AdminLayout'
import ProtectedRoute from './shared/ProtectedRoute'
import AdminBooksPage from './admin/AdminBooksPage'

function App() {
  return (
    <>
      <Routes>
        {/* مسیرهای عمومی */}
        <Route path='/' element={<Home />} />
        <Route path='/login' element={<Login />} />
        <Route path='/signup' element={<Signup />} />

        {/* مسیرهای محافظت‌شده - مدیر */}
        <Route element={<ProtectedRoute allowedRole="admin" />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboardPage />} />
            <Route path="books" element={<AdminBooksPage />} />
          </Route>
        </Route>

      </Routes>
    </>
  )
}

export default App