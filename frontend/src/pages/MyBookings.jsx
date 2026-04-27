import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { getMyBookings } from "../services/bookingService";
import "../styles/AdminResourceListPage.css";

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      const userId = localStorage.getItem("userId") || 2; // testing fallback
      const res = await getMyBookings(userId);
      setBookings(res.data);
    } catch {
      toast.error("Failed to load bookings");
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">My Bookings</h1>
          <p className="page-subtitle">Track your UniGo resource booking requests</p>
        </div>
      </div>

      <div className="resource-grid">
        {bookings.length === 0 ? (
          <p className="info-text">No booking requests found.</p>
        ) : (
          bookings.map((booking) => (
            <div className="resource-card" key={booking.id}>
              <h2 className="resource-card-name">
                {booking.resource?.name || "Resource"}
              </h2>

              <div className="resource-card-meta">
                <span className="resource-code">
                  {booking.resource?.codeName}
                </span>

                <span
                  className={`status-toggle-btn ${
                    booking.status === "APPROVED"
                      ? "active"
                      : booking.status === "REJECTED"
                      ? "inactive"
                      : ""
                  }`}
                >
                  {booking.status}
                </span>
              </div>

              <p><strong>Date:</strong> {booking.bookingDate}</p>
              <p><strong>Time:</strong> {booking.startTime} - {booking.endTime}</p>
              <p><strong>Purpose:</strong> {booking.purpose}</p>

              {booking.reviewNote && (
                <p><strong>Review Note:</strong> {booking.reviewNote}</p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}