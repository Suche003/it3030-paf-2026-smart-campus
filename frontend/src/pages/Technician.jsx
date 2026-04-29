import { Link, useNavigate } from "react-router-dom";
import "../styles/StudentLecturerDashboard.css";

export default function Technician() {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userName = user.name || localStorage.getItem("name") || "Technician";

  const logout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className="sl-dashboard-page">
      <div className="student-header">
        <div>
          <span className="student-brand">UniGo</span>
          <h1>Welcome, {userName}</h1>
          <p>Technician Dashboard - Manage assigned support tickets</p>
        </div>

        <div className="student-header-actions">
          <Link to="/notifications" className="student-icon-btn">
            🔔 Notifications
          </Link>

          <Link to="/profile" className="student-icon-btn profile">
            👤 Profile
          </Link>

          <button onClick={logout} className="student-logout-btn">
            Logout
          </button>
        </div>
      </div>

      <div className="student-action-grid">
        <Link to="/technician/tickets" className="student-action-card tickets">
          <div>
            <span className="student-card-icon">🎫</span>
            <h2>Assigned Tickets</h2>
            <p>
              View tickets assigned by admin, update progress, submit resolutions,
              and close completed work.
            </p>
          </div>

          <span className="student-card-arrow">→</span>
        </Link>
      </div>
    </div>
  );
}