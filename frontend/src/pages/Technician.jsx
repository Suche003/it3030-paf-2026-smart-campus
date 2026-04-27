import { Link } from "react-router-dom"
import "../styles/AdminResourceListPage.css"

export default function Technician() {
  const user = JSON.parse(localStorage.getItem("user") || "{}")
  const userName = user.name || "Technician"

  return (
    <div className="page-container">

      <div className="page-header">
        <div>
          <h1 className="page-title">Welcome, {userName}</h1>
          <p className="page-subtitle">
            UniGo Technician Dashboard - Manage booking requests
          </p>
        </div>
      </div>

      <div className="resource-grid">

        {/* BOOKING REQUESTS */}
        <div className="resource-card">
          <h2 className="resource-card-name">Booking Requests</h2>
          <p>Approve or reject resource booking requests</p>

          <Link to="/technician/bookings" className="primary-link-btn">
            View Requests
          </Link>
        </div>

        {/* FUTURE FEATURE */}
        <div className="resource-card">
          <h2 className="resource-card-name">Tickets</h2>
          <p>Manage support tickets (Coming soon)</p>

          <button className="primary-link-btn" disabled>
            Coming Soon
          </button>
        </div>

      </div>
    </div>
  )
}