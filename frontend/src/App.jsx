import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'

import AdminResourceListPage from './pages/AdminResourceListPage'
import AddResourcePage from './pages/AddResourcePage'
import EditResourcePage from './pages/EditResourcePage'

import Login from './pages/Login'
import Register from './pages/Register'

import Admin from './pages/Admin'
import Student from './pages/Student'
import Lecturer from './pages/Lecturer'
import Technician from './pages/Technician'

import Notifications from './pages/Notifications'
import Profile from './pages/Profile'

import ProtectedRoute from './components/ProtectedRoute'
import Navbar from './components/Navbar'

import './styles/App.css'

export default function App() {
  const location = useLocation()

  // hide navbar in login/register
  const hideNavbar =
    location.pathname === '/login' ||
    location.pathname === '/register'

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: 'rgba(20, 20, 30, 0.92)',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.15)',
            backdropFilter: 'blur(14px)',
            borderRadius: '14px',
            padding: '14px 18px',
            fontWeight: '700'
          }
        }}
      />

      {!hideNavbar && <Navbar />}

      <main className={hideNavbar ? 'auth-module-shell' : 'admin-module-shell'}>
        <Routes>

          <Route path="/" element={<Navigate to="/login" replace />} />

          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          <Route
            path="/notifications"
            element={
              <ProtectedRoute>
                <Notifications />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin"
            element={
              <ProtectedRoute role="ADMIN">
                <Admin />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/resources"
            element={
              <ProtectedRoute role="ADMIN">
                <AdminResourceListPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/resources/add"
            element={
              <ProtectedRoute role="ADMIN">
                <AddResourcePage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/resources/edit/:id"
            element={
              <ProtectedRoute role="ADMIN">
                <EditResourcePage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/student"
            element={
              <ProtectedRoute role="STUDENT">
                <Student />
              </ProtectedRoute>
            }
          />

          <Route
            path="/lecturer"
            element={
              <ProtectedRoute role="LECTURER">
                <Lecturer />
              </ProtectedRoute>
            }
          />

          <Route
            path="/technician"
            element={
              <ProtectedRoute role="TECHNICIAN">
                <Technician />
              </ProtectedRoute>
            }
          />

        </Routes>
      </main>
    </>
  )
}