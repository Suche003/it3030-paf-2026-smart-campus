import { Link } from 'react-router-dom'

export default function UserNavbar() {
  return (
    <nav className="user-navbar">
      <div className="nav-container">
        <div className="nav-logo">🏫 Smart Campus</div>
        <div className="nav-links">
          <Link to="/bookings">Book Now</Link>
          <Link to="/my-bookings">My Bookings</Link>
          <Link to="/admin" onClick={() => localStorage.setItem('userRole', 'ADMIN')}>
            Admin Panel
          </Link>
        </div>
      </div>
    </nav>
  )
}