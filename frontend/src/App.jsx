import { Routes, Route, Navigate } from 'react-router-dom'
import AdminResourceListPage from './pages/AdminResourceListPage'
import AddResourcePage from './pages/AddResourcePage'
import EditResourcePage from './pages/EditResourcePage'

import Login from "./pages/Login";
import Register from "./pages/Register";
import Admin from "./pages/Admin";
import Student from "./pages/Student";
import Lecturer from "./pages/Lecturer";
import Technician from "./pages/Technician";

// Booking Module Imports
import CreateBookingPage from './pages/CreateBookingPage';
import MyBookingsPage from './pages/MyBookingsPage';
import AdminBookingsPage from './pages/AdminBookingsPage';
import EditBookingPage from './pages/EditBookingPage';  // ✅ ADD THIS

import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";

import './styles/App.css'

export default function App() {

  return (
    <>
      <Navbar />

      <main className="admin-module-shell">
        <Routes>

          {/* 🔓 Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* 🔐 Admin Resource Module */}
          <Route path="/admin/resources" element={
            <ProtectedRoute role="ADMIN">
              <AdminResourceListPage />
            </ProtectedRoute>
          } />

          <Route path="/admin/resources/add" element={
            <ProtectedRoute role="ADMIN">
              <AddResourcePage />
            </ProtectedRoute>
          } />

          <Route path="/admin/resources/edit/:id" element={
            <ProtectedRoute role="ADMIN">
              <EditResourcePage />
            </ProtectedRoute>
          } />

          {/* ✅ BOOKING MODULE ROUTES */}
          {/* Create Booking - Any authenticated user */}
          <Route path="/bookings/new" element={
            <ProtectedRoute>
              <CreateBookingPage />
            </ProtectedRoute>
          } />

          {/* My Bookings - Any authenticated user */}
          <Route path="/my-bookings" element={
            <ProtectedRoute>
              <MyBookingsPage />
            </ProtectedRoute>
          } />

          {/* Edit Booking - Any authenticated user (for PENDING bookings) */}
          <Route path="/bookings/edit/:id" element={
            <ProtectedRoute>
              <EditBookingPage />
            </ProtectedRoute>
          } />

          {/* Admin Bookings Management - Admin only */}
          <Route path="/admin/bookings" element={
            <ProtectedRoute role="ADMIN">
              <AdminBookingsPage />
            </ProtectedRoute>
          } />

          {/* 🔐 Dashboards */}
          <Route path="/admin" element={
            <ProtectedRoute role="ADMIN">
              <Admin />
            </ProtectedRoute>
          } />

          <Route path="/student" element={
            <ProtectedRoute role="STUDENT">
              <Student />
            </ProtectedRoute>
          } />

          <Route path="/lecturer" element={
            <ProtectedRoute role="LECTURER">
              <Lecturer />
            </ProtectedRoute>
          } />

          <Route path="/technician" element={
            <ProtectedRoute role="TECHNICIAN">
              <Technician />
            </ProtectedRoute>
          } />

          {/* 🔁 Default Redirect */}
          <Route path="/" element={<Navigate to="/login" replace />} />

        </Routes>
      </main>
    </>
  )
}