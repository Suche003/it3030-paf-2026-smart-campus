import { Link } from 'react-router-dom';
import './Admin.css';

function Admin() {
  const userEmail = localStorage.getItem('email');
  const userName = localStorage.getItem('name') || 'Admin';

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h1>Admin Dashboard</h1>
        <p>Welcome back, {userName} 👋</p>
        <p className="user-email">{userEmail}</p>
      </div>

      <div className="dashboard-cards">
        {/* Booking Management Card */}
        <Link to="/admin/bookings" className="dashboard-card booking-card">
          <div className="card-icon">📅</div>
          <h3>Booking Management</h3>
          <p>View, approve, or reject all booking requests</p>
          <span className="card-link">Manage Bookings →</span>
        </Link>

        {/* Resources Management Card */}
        <Link to="/admin/resources" className="dashboard-card resources-card">
          <div className="card-icon">🏢</div>
          <h3>Resource Management</h3>
          <p>Add, edit, or remove campus resources</p>
          <span className="card-link">Manage Resources →</span>
        </Link>

        {/* ✅ NEW: Resource Calendar Card */}
        <Link to="/resource-calendar" className="dashboard-card calendar-card">
          <div className="card-icon">📅</div>
          <h3>Resource Calendar</h3>
          <p>View resource-wise booking calendar</p>
          <span className="card-link">View Calendar →</span>
        </Link>

        {/* Users Management Card (Optional) */}
        <div className="dashboard-card users-card">
          <div className="card-icon">👥</div>
          <h3>User Management</h3>
          <p>Manage system users and roles</p>
          <span className="card-link coming-soon">Coming Soon</span>
        </div>

        {/* Reports Card (Optional) */}
        <div className="dashboard-card reports-card">
          <div className="card-icon">📊</div>
          <h3>Analytics & Reports</h3>
          <p>View booking statistics and insights</p>
          <span className="card-link coming-soon">Coming Soon</span>
        </div>
      </div>
    </div>
  );
}

export default Admin;