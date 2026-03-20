import { Link } from 'react-router-dom'

export default function AdminNavbar() {
  return (
    <nav className="admin-navbar">
      <div className="nav-container">
        <div className="nav-logo">🏫 Smart Campus Admin</div>
        <div className="nav-links">
          <Link to="/admin/resources">Resources</Link>
          <Link to="/admin/bookings">Bookings</Link>
          <Link to="/admin/dashboard">Dashboard</Link>
          <Link to="/" onClick={() => localStorage.setItem('userRole', 'USER')}>
            Switch to User
          </Link>
        </div>
      </div>
    </nav>
  )
}