import { useNavigate } from "react-router-dom";
import "./Admin.css";

export default function Admin() {
  const navigate = useNavigate();

  return (
    <div className="admin-dashboard">
      <h1 className="admin-title">Admin Dashboard</h1>

      <div className="admin-cards">

        {/* Resource Management */}
        <div
          className="admin-card"
          onClick={() => navigate("/admin/resources")}
        >
          <div className="admin-icon">📦</div>
          <h2>Resource Management</h2>
          <p>Manage all campus resources</p>
        </div>

        {/* User Management */}
        <div
          className="admin-card"
          onClick={() => navigate("/admin/users")}
        >
          <div className="admin-icon">👥</div>
          <h2>User Management</h2>
          <p>Manage staff and system users</p>
        </div>

      </div>
    </div>
  );
}