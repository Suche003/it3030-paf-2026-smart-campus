import { Link, useLocation } from 'react-router-dom'
import '../styles/Navbar.css'

export default function Navbar({ user, onLogout }) {
  const location = useLocation()
  const isAdmin = user?.role === 'ADMIN'
  const isAuthenticated = !!user
  
  const isActive = (path) => location.pathname.startsWith(path)
  
  if (!isAuthenticated) return null
  
  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to={isAdmin ? "/admin/resources" : "/bookings"} className="nav-logo">
          🏫 Smart Campus
        </Link>
        
        <div className="nav-links">
          {/* USER ONLY */}
          {!isAdmin && (
            <>
              <Link to="/bookings" className={`nav-link ${isActive('/bookings') ? 'active' : ''}`}>
                📅 Book Now
              </Link>
              <Link to="/my-bookings" className={`nav-link ${isActive('/my-bookings') ? 'active' : ''}`}>
                📋 My Bookings
              </Link>
            </>
          )}
          
          {/* ADMIN ONLY */}
          {isAdmin && (
            <>
              <div className="nav-dropdown">
                <button className="nav-dropbtn">📦 Resources ▼</button>
                <div className="nav-dropdown-content">
                  <Link to="/admin/resources">All Resources</Link>
                  <Link to="/admin/resources/add">Add Resource</Link>
                </div>
              </div>
              <Link to="/admin/bookings" className={`nav-link ${isActive('/admin/bookings') ? 'active' : ''}`}>
                📊 All Bookings
              </Link>
            </>
          )}
          
          <div className="user-section">
            <span className="user-name">👤 {user?.name}</span>
            <span className={`user-role ${isAdmin ? 'admin' : ''}`}>
              {isAdmin ? 'ADMIN' : 'USER'}
            </span>
            <button onClick={onLogout} className="logout-nav-btn">
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}