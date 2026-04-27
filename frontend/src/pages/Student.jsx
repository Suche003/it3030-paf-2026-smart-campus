import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getMyBookings } from "../services/bookingService";
import "../styles/StudentLecturerDashboard.css";

export default function Student() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userName = user.name || localStorage.getItem("name") || "Student";

  const [counts, setCounts] = useState({
    approved: 0,
    pending: 0,
    rejected: 0,
  });

  useEffect(() => {
    loadCounts();
  }, []);

  const loadCounts = async () => {
    try {
      const userId = localStorage.getItem("userId");
      const res = await getMyBookings(userId);

      setCounts({
        approved: res.data.filter((b) => b.status === "APPROVED").length,
        pending: res.data.filter((b) => b.status === "PENDING").length,
        rejected: res.data.filter((b) => b.status === "REJECTED").length,
      });
    } catch {
      console.log("Failed to load booking counts");
    }
  };

  return (
    <div className="sl-dashboard-page">
      <div className="sl-topbar">
        <div>
          <h1>Welcome, {userName}</h1>
          <p>UniGo Student Dashboard</p>
        </div>

        <Link to="/profile" className="sl-profile-chip">
          <span className="sl-profile-icon">👤</span>
          My Profile
        </Link>
      </div>

      <div className="sl-hero-card">
        <div>
          <h2>Book Campus Resources</h2>
          <p>Browse available venues and equipment, view details, and send booking requests.</p>
        </div>

        <Link to="/student/resources" className="sl-main-btn">
          Book Resource
        </Link>
      </div>

      <div className="sl-stats-grid">
        <div className="sl-stat-card approved">
          <span>Approved Bookings</span>
          <h3>{counts.approved}</h3>
          <p>Current bookings confirmed by technician</p>
        </div>

        <div className="sl-stat-card pending">
          <span>Waiting Review</span>
          <h3>{counts.pending}</h3>
          <p>Requests waiting for approval</p>
        </div>

        <div className="sl-stat-card rejected">
          <span>Not Approved</span>
          <h3>{counts.rejected}</h3>
          <p>Requests rejected by technician</p>
        </div>
      </div>

      <div className="sl-bottom-card">
        <div>
          <h2>My Booking History</h2>
          <p>View all booking requests with Pending, Approved, and Rejected status.</p>
        </div>

        <Link to="/student/bookings" className="sl-secondary-btn">
          View My Bookings
        </Link>
      </div>
    </div>
  );
}