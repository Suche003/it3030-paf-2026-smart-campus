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

import Notifications from "./pages/Notifications";
import Profile from "./pages/Profile";

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

          {/* 🔐 PROFILE (NEW ADD - SAFE) */}
          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />

          {/* 🔐 Admin Resource Module (NO CHANGE) */}
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

          {/* 🔐 Dashboards (NO CHANGE) */}
          <Route path="/admin" element={
            <ProtectedRoute role="ADMIN">
              <Admin />
            </ProtectedRoute>
          } />

          {/* 🔔 Notifications */}
          <Route path="/notifications" element={
            <ProtectedRoute>
              <Notifications />
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