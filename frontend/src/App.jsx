import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'

import AdminResourceListPage from './pages/AdminResourceListPage'
import AddResourcePage from './pages/AddResourcePage'
import EditResourcePage from './pages/EditResourcePage'

import AddTicketPage from './pages/AddTicketPage'
import StudentTicketListPage from './pages/StudentTicketListPage'
import EditTicketPage from './pages/EditTicketPage'

import AdminTicketListPage from './pages/AdminTicketListPage'

import TechnicianTicketPage from './pages/TechnicianTicketPage'

import './styles/App.css'

export default function App() {
  return (
    <main className="admin-module-shell">

      <Toaster position="top-right" />

      <Routes>

        {/* DEFAULT */}
        <Route path="/" element={<Navigate to="/admin/resources" replace />} />

        {/* ADMIN RESOURCE */}
        <Route path="/admin/resources" element={<AdminResourceListPage />} />
        <Route path="/admin/resources/add" element={<AddResourcePage />} />
        <Route path="/admin/resources/edit/:id" element={<EditResourcePage />} />

        {/* STUDENT TICKETS */}
        <Route path="/student/tickets" element={<StudentTicketListPage />} />
        <Route path="/student/tickets/create" element={<AddTicketPage />} />
        <Route path="/student/tickets/edit/:id" element={<EditTicketPage />} />

        {/* ADMIN TICKETS */}
        <Route path="/admin/tickets" element={<AdminTicketListPage />} />

        {/* TECHNICIAN */}
        <Route path="/technician/tickets" element={<TechnicianTicketPage />} />

      </Routes>

    </main>
  )
}