import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import AdminResourceListPage from './pages/AdminResourceListPage'
import AddResourcePage from './pages/AddResourcePage'
import EditResourcePage from './pages/EditResourcePage'
import './styles/App.css'

export default function App() {
  return (
    <main className="admin-module-shell">
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
          },
          success: {
            style: {
              border: '1px solid rgba(139,255,176,0.4)',
              boxShadow: '0 0 18px rgba(139,255,176,0.18)'
            }
          },
          error: {
            style: {
              border: '1px solid rgba(255,140,168,0.4)',
              boxShadow: '0 0 18px rgba(255,140,168,0.18)'
            }
          }
        }}
      />

      <Routes>
        <Route path="/" element={<Navigate to="/admin/resources" replace />} />
        <Route path="/admin/resources" element={<AdminResourceListPage />} />
        <Route path="/admin/resources/add" element={<AddResourcePage />} />
        <Route path="/admin/resources/edit/:id" element={<EditResourcePage />} />
      </Routes>
    </main>
  )
}