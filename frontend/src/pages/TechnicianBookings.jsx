import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  getPendingBookings,
  approveBooking,
  rejectBooking,
} from "../services/bookingService";
import "../styles/AdminResourceListPage.css";

export default function TechnicianBookings() {
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    loadPending();
  }, []);

  const loadPending = async () => {
    try {
      const res = await getPendingBookings();
      setBookings(res.data);
    } catch {
      toast.error("Failed to load pending bookings");
    }
  };

  const handleApprove = async (id) => {
    try {
      await approveBooking(id, "Approved by technician");
      toast.success("Booking approved");
      loadPending();
    } catch (err) {
      toast.error(err.response?.data || "Approve failed");
    }
  };

  const handleReject = async (id) => {
    try {
      await rejectBooking(id, "Rejected by technician");
      toast.success("Booking rejected");
      loadPending();
    } catch {
      toast.error("Reject failed");
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Booking Requests</h1>
          <p className="page-subtitle">
            Review and manage UniGo resource booking requests
          </p>
        </div>
      </div>

      <div className="resource-grid">
        {bookings.length === 0 ? (
          <p className="info-text">No pending booking requests.</p>
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
                <span className="status-toggle-btn">
                  {booking.status}
                </span>
              </div>

              <p><strong>User:</strong> {booking.user?.name || booking.user?.email}</p>
              <p><strong>Date:</strong> {booking.bookingDate}</p>
              <p><strong>Time:</strong> {booking.startTime} - {booking.endTime}</p>
              <p><strong>Purpose:</strong> {booking.purpose}</p>

              <div className="resource-actions">
                <button
                  className="primary-link-btn"
                  onClick={() => handleApprove(booking.id)}
                >
                  Approve
                </button>

                <button
                  className="danger-btn"
                  onClick={() => handleReject(booking.id)}
                >
                  Reject
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}