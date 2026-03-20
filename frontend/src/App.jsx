import { useState, useEffect } from 'react'
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import AdminResourceListPage from './pages/AdminResourceListPage'
import AddResourcePage from './pages/AddResourcePage'
import EditResourcePage from './pages/EditResourcePage'
import BookingFormPage from './pages/BookingFormPage'
import MyBookingsPage from './pages/MyBookingsPage'
import AdminBookingPage from './pages/AdminBookingPage'
import './styles/App.css'

export default function App() {
  const [user, setUser] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    // Check if user is logged in
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('user')
    setUser(null)
    navigate('/')
  }

  const isAdmin = user?.role === 'ADMIN'
  const isAuthenticated = !!user

  return (
    <>
      {isAuthenticated && <Navbar user={user} onLogout={handleLogout} />}
      <main className={isAuthenticated ? "admin-module-shell" : ""}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage setUser={setUser} />} />
          
          {/* Protected User Routes */}
          <Route path="/bookings" element={
            isAuthenticated && !isAdmin ? <BookingFormPage /> : <Navigate to="/login" />
          } />
          <Route path="/my-bookings" element={
            isAuthenticated && !isAdmin ? <MyBookingsPage /> : <Navigate to="/login" />
          } />
          
          {/* Protected Admin Routes */}
          <Route path="/admin/resources" element={
            isAuthenticated && isAdmin ? <AdminResourceListPage /> : <Navigate to="/login" />
          } />
          <Route path="/admin/resources/add" element={
            isAuthenticated && isAdmin ? <AddResourcePage /> : <Navigate to="/login" />
          } />
          <Route path="/admin/resources/edit/:id" element={
            isAuthenticated && isAdmin ? <EditResourcePage /> : <Navigate to="/login" />
          } />
          <Route path="/admin/bookings" element={
            isAuthenticated && isAdmin ? <AdminBookingPage /> : <Navigate to="/login" />
          } />
        </Routes>
      </main>
    </>
  )
}