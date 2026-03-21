import { Routes, Route, Navigate } from 'react-router-dom'
import AdminResourceListPage from './pages/AdminResourceListPage'
import AddResourcePage from './pages/AddResourcePage'
import EditResourcePage from './pages/EditResourcePage'
import './styles/App.css'

export default function App() {
  return (
    <div className="app-shell">
      <Routes>
        <Route path="/" element={<Navigate to="/admin/resources" replace />} />
        <Route path="/admin/resources" element={<AdminResourceListPage />} />
        <Route path="/admin/resources/add" element={<AddResourcePage />} />
        <Route path="/admin/resources/edit/:id" element={<EditResourcePage />} />
      </Routes>
    </div>
  )
}