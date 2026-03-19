import { Routes, Route, Link } from 'react-router-dom'
import ResourceListPage from './pages/ResourceListPage'
import AddResourcePage from './pages/AddResourcePage'
import EditResourcePage from './pages/EditResourcePage'

export default function App() {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Smart Campus - Resource Management</h1>

      <nav style={{ marginBottom: '20px' }}>
        <Link to="/" style={{ marginRight: '15px' }}>All Resources</Link>
        <Link to="/add">Add Resource</Link>
      </nav>

      <Routes>
        <Route path="/" element={<ResourceListPage />} />
        <Route path="/add" element={<AddResourcePage />} />
        <Route path="/edit/:id" element={<EditResourcePage />} />
      </Routes>
    </div>
  )
}