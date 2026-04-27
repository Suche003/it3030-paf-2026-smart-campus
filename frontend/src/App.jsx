import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'

import AdminResourceListPage from './pages/AdminResourceListPage'
import AddResourcePage from './pages/AddResourcePage'
import EditResourcePage from './pages/EditResourcePage'
import ViewResourcePage from './pages/ViewResourcePage'
import ResourceBrowsePage from './pages/ResourceBrowsePage'

import Login from './pages/Login'
import Register from './pages/Register'
import Admin from './pages/Admin'
import Student from './pages/Student'
import Lecturer from './pages/Lecturer'
import Notifications from './pages/Notifications'
import Profile from './pages/Profile'
import MyBookings from './pages/MyBookings'
import Technician from './pages/Technician'
import TechnicianBookings from './pages/TechnicianBookings'

import ProtectedRoute from './components/ProtectedRoute'
import Navbar from './components/Navbar'

import './styles/App.css'

export default function App() {
  const location = useLocation()

  const noNavbarPages = ['/login', '/register', '/admin/resources']
  const hideNavbar = noNavbarPages.includes(location.pathname)

  const noShellPages = ['/login', '/register', '/admin/resources']
  const noShell = noShellPages.includes(location.pathname)

  return (
    <>
      <Toaster position="top-right" />

      {!hideNavbar && <Navbar />}

      <main className={noShell ? 'plain-module-shell' : 'admin-module-shell'}>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />

          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />

          {/* ADMIN */}
          <Route path="/admin" element={<ProtectedRoute role="ADMIN"><Admin /></ProtectedRoute>} />
          <Route path="/admin/resources" element={<ProtectedRoute role="ADMIN"><AdminResourceListPage /></ProtectedRoute>} />
          <Route path="/admin/resources/add" element={<ProtectedRoute role="ADMIN"><AddResourcePage /></ProtectedRoute>} />
          <Route path="/admin/resources/edit/:id" element={<ProtectedRoute role="ADMIN"><EditResourcePage /></ProtectedRoute>} />
          <Route path="/admin/resources/view/:id" element={<ProtectedRoute role="ADMIN"><ViewResourcePage /></ProtectedRoute>} />

          {/* STUDENT */}
          <Route path="/student" element={<ProtectedRoute role="STUDENT"><Student /></ProtectedRoute>} />
          <Route path="/student/resources" element={<ProtectedRoute role="STUDENT"><ResourceBrowsePage /></ProtectedRoute>} />
          <Route path="/student/resources/view/:id" element={<ProtectedRoute role="STUDENT"><ViewResourcePage /></ProtectedRoute>} />
          <Route path="/student/bookings" element={<ProtectedRoute role="STUDENT"><MyBookings /></ProtectedRoute>} />

          {/* LECTURER */}
          <Route path="/lecturer" element={<ProtectedRoute role="LECTURER"><Lecturer /></ProtectedRoute>} />
          <Route path="/lecturer/resources" element={<ProtectedRoute role="LECTURER"><ResourceBrowsePage /></ProtectedRoute>} />
          <Route path="/lecturer/resources/view/:id" element={<ProtectedRoute role="LECTURER"><ViewResourcePage /></ProtectedRoute>} />
          <Route path="/lecturer/bookings" element={<ProtectedRoute role="LECTURER"><MyBookings /></ProtectedRoute>} />

          {/* TECHNICIAN */}
          <Route path="/technician" element={<ProtectedRoute role="TECHNICIAN"><Technician /></ProtectedRoute>} />
          <Route path="/technician/bookings" element={<ProtectedRoute role="TECHNICIAN"><TechnicianBookings /></ProtectedRoute>} />
        </Routes>
      </main>
    </>
  )
}