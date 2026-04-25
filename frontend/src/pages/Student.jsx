// frontend/src/pages/Student.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyBookings, cancelBooking } from '../services/bookingService';
import './Student.css';

function Student() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('bookings');
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'calendar'
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [successMessage, setSuccessMessage] = useState('');

  const userEmail = localStorage.getItem('email');
  const userName = localStorage.getItem('name') || 'Student';

  const loadBookings = async () => {
    setLoading(true);
    try {
      const response = await getMyBookings();
      setBookings(response.data || []);
    } catch (err) {
      setError('Failed to load your bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const showSuccess = (msg) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this booking?')) return;
    try {
      await cancelBooking(id);
      showSuccess('✅ Booking cancelled successfully!');
      loadBookings();
      setSelectedBooking(null);
    } catch (err) {
      alert('Failed to cancel booking');
    }
  };

  const handleEdit = (id) => navigate(`/bookings/edit/${id}`);
  const handleNewBooking = () => navigate('/bookings/new');

  const getStatusBadge = (status) => {
    const config = {
      PENDING: { class: 'status-pending', icon: '⏳', label: 'Pending' },
      APPROVED: { class: 'status-approved', icon: '✅', label: 'Approved' },
      REJECTED: { class: 'status-rejected', icon: '❌', label: 'Rejected' },
      CANCELLED: { class: 'status-cancelled', icon: '🚫', label: 'Cancelled' },
    };
    const c = config[status] || { class: '', icon: '📋', label: status };
    return (
      <span className={`status-badge ${c.class}`}>
        {c.icon} {c.label}
      </span>
    );
  };

  // ---------- Calendar Helpers ----------
  const getDaysInMonth = (date) =>
    new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const getFirstDayOfMonth = (date) =>
    new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  const getBookingsForDate = (year, month, day) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return bookings.filter((b) => b.bookingDate === dateStr);
  };
  const changeMonth = (delta) =>
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + delta, 1));

  const getPriorityColor = (status) => {
    if (status === 'PENDING') return '#ffc107';
    if (status === 'APPROVED') return '#4caf50';
    if (status === 'REJECTED') return '#f44336';
    return '#9e9e9e';
  };

  const renderCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const today = new Date();
    const cells = [];

    // Empty cells before month starts
    for (let i = 0; i < firstDay; i++) {
      cells.push(<div key={`empty-${i}`} className="cal-day empty"></div>);
    }

    // Days of month
    for (let day = 1; day <= daysInMonth; day++) {
      const dayBookings = getBookingsForDate(year, month, day);
      const hasBookings = dayBookings.length > 0;
      const isToday =
        year === today.getFullYear() &&
        month === today.getMonth() &&
        day === today.getDate();

      let dotColor = '#aaa';
      if (hasBookings) {
        if (dayBookings.some((b) => b.status === 'PENDING')) dotColor = '#ffc107';
        else if (dayBookings.some((b) => b.status === 'APPROVED')) dotColor = '#4caf50';
        else if (dayBookings.some((b) => b.status === 'REJECTED')) dotColor = '#f44336';
        else dotColor = '#9e9e9e';
      }

      cells.push(
        <div
          key={day}
          className={`cal-day ${hasBookings ? 'has-booking' : ''} ${isToday ? 'today' : ''}`}
          onClick={() => hasBookings && setSelectedBooking(dayBookings[0])}
        >
          <span className="day-number">{day}</span>
          {hasBookings && <div className="day-dot" style={{ backgroundColor: dotColor }}></div>}
        </div>
      );
    }
    return cells;
  };

  // Statistics
  const stats = {
    total: bookings.length,
    pending: bookings.filter((b) => b.status === 'PENDING').length,
    approved: bookings.filter((b) => b.status === 'APPROVED').length,
    rejected: bookings.filter((b) => b.status === 'REJECTED').length,
  };

  if (loading) {
    return <div className="student-dashboard loading-state">Loading your bookings...</div>;
  }

  return (
    <div className="student-dashboard">
      {/* Success Toast */}
      {successMessage && <div className="success-toast">{successMessage}</div>}

      {/* Header */}
      <div className="dashboard-header">
        <div className="welcome-section">
          <h1>🎓 Student Dashboard</h1>
          <p>Welcome back, {userName}!</p>
          <span className="user-email">{userEmail}</span>
        </div>
        <button className="new-booking-btn" onClick={handleNewBooking}>
          + New Booking
        </button>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card total">
          <div className="stat-value">{stats.total}</div>
          <div className="stat-label">Total Bookings</div>
        </div>
        <div className="stat-card pending">
          <div className="stat-value">{stats.pending}</div>
          <div className="stat-label">⏳ Pending</div>
        </div>
        <div className="stat-card approved">
          <div className="stat-value">{stats.approved}</div>
          <div className="stat-label">✅ Approved</div>
        </div>
        <div className="stat-card rejected">
          <div className="stat-value">{stats.rejected}</div>
          <div className="stat-label">❌ Rejected</div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="tab-navigation">
        <button
          className={`tab-btn ${activeTab === 'bookings' ? 'active' : ''}`}
          onClick={() => setActiveTab('bookings')}
        >
          📋 My Bookings
        </button>
        <button
          className={`tab-btn ${activeTab === 'info' ? 'active' : ''}`}
          onClick={() => setActiveTab('info')}
        >
          ℹ️ How to Book
        </button>
      </div>

      {/* Bookings Tab */}
      {activeTab === 'bookings' && (
        <>
          <div className="view-toggle-inline">
            <button
              className={`view-mode-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
            >
              📋 List View
            </button>
            <button
              className={`view-mode-btn ${viewMode === 'calendar' ? 'active' : ''}`}
              onClick={() => setViewMode('calendar')}
            >
              📅 Calendar View
            </button>
          </div>

          {bookings.length === 0 ? (
            <div className="empty-state">
              <div className="empty-emoji">📭</div>
              <h3>No Bookings Yet</h3>
              <button className="create-booking-btn" onClick={handleNewBooking}>
                + Create Your First Booking
              </button>
            </div>
          ) : (
            <>
              {/* LIST VIEW */}
              {viewMode === 'list' && (
                <div className="bookings-list">
                  {bookings.map((booking) => (
                    <div key={booking.id} className="booking-card">
                      <div className="booking-header">
                        <div className="booking-id">Booking #{booking.id}</div>
                        <div className="booking-status">
                          {getStatusBadge(booking.status)}
                        </div>
                      </div>
                      <div className="booking-details">
                        <div className="detail-row">
                          <span className="detail-label">📌 Resource:</span>
                          <span className="detail-value">
                            {booking.resourceName || `Resource ${booking.resourceId}`}
                          </span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">📅 Date:</span>
                          <span className="detail-value">{booking.bookingDate}</span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">⏰ Time:</span>
                          <span className="detail-value">
                            {booking.startTime} - {booking.endTime}
                          </span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">📝 Purpose:</span>
                          <span className="detail-value">{booking.purpose}</span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">👥 Attendees:</span>
                          <span className="detail-value">{booking.attendees || 1}</span>
                        </div>
                        {booking.rejectReason && (
                          <div className="detail-row reject-reason">
                            <span className="detail-label">❌ Rejection Reason:</span>
                            <span className="detail-value">{booking.rejectReason}</span>
                          </div>
                        )}
                      </div>
                      <div className="booking-actions">
                        {booking.status === 'PENDING' && (
                          <>
                            <button
                              className="action-btn edit-btn"
                              onClick={() => handleEdit(booking.id)}
                            >
                              ✏️ Edit
                            </button>
                            <button
                              className="action-btn cancel-btn"
                              onClick={() => handleCancel(booking.id)}
                            >
                              ❌ Cancel
                            </button>
                          </>
                        )}
                        {booking.status === 'APPROVED' && (
                          <button
                            className="action-btn cancel-btn"
                            onClick={() => handleCancel(booking.id)}
                          >
                            ❌ Cancel Booking
                          </button>
                        )}
                        {booking.status === 'REJECTED' && (
                          <button className="action-btn new-btn" onClick={handleNewBooking}>
                            📅 Book Again
                          </button>
                        )}
                        {booking.status === 'CANCELLED' && (
                          <span className="cancelled-label">Booking Cancelled</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* CALENDAR VIEW */}
              {viewMode === 'calendar' && (
                <div className="calendar-wrapper">
                  <div className="cal-nav">
                    <button onClick={() => changeMonth(-1)}>◀ Previous</button>
                    <h3>
                      {currentDate.toLocaleString('default', {
                        month: 'long',
                        year: 'numeric',
                      })}
                    </h3>
                    <button onClick={() => changeMonth(1)}>Next ▶</button>
                  </div>
                  <div className="cal-weekdays">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                      <div key={day} className="cal-weekday">
                        {day}
                      </div>
                    ))}
                  </div>
                  <div className="cal-grid">{renderCalendar()}</div>
                  <div className="cal-legend">
                    <span>
                      <span className="legend-dot pending"></span> Pending
                    </span>
                    <span>
                      <span className="legend-dot approved"></span> Approved
                    </span>
                    <span>
                      <span className="legend-dot rejected"></span> Rejected
                    </span>
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* Info Tab */}
      {activeTab === 'info' && (
        <div className="info-section">
          <div className="info-card">
            <h3>📖 How to Book a Resource</h3>
            <div className="steps">
              <div className="step">
                <div className="step-number">1</div>
                <div className="step-content">
                  <h4>Click "New Booking" Button</h4>
                  <p>Start by clicking the "+ New Booking" button at the top</p>
                </div>
              </div>
              <div className="step">
                <div className="step-number">2</div>
                <div className="step-content">
                  <h4>Select Resource & Time</h4>
                  <p>Choose the resource, date and time slot</p>
                </div>
              </div>
              <div className="step">
                <div className="step-number">3</div>
                <div className="step-content">
                  <h4>Submit Request</h4>
                  <p>Add purpose and attendees → status becomes <span className="highlight">PENDING</span></p>
                </div>
              </div>
              <div className="step">
                <div className="step-number">4</div>
                <div className="step-content">
                  <h4>Wait for Approval</h4>
                  <p>Admin will review and approve/reject your request</p>
                </div>
              </div>
            </div>
          </div>
          <div className="info-card">
            <h3>📌 Tips & Rules</h3>
            <ul className="tips-list">
              <li>✅ Bookings must be made at least 1 day in advance</li>
              <li>✅ Maximum 4 hours per booking slot</li>
              <li>✅ You can edit/cancel only <span className="highlight">PENDING</span> bookings</li>
              <li>✅ Approved bookings can be cancelled up to 2 hours before start time</li>
            </ul>
          </div>
        </div>
      )}

      {/* Modal for Calendar Click Details */}
      {selectedBooking && (
        <div className="modal-overlay" onClick={() => setSelectedBooking(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>📅 Booking Details</h3>
              <button className="modal-close" onClick={() => setSelectedBooking(null)}>
                ✕
              </button>
            </div>
            <div className="modal-body">
              <p>
                <strong>Resource:</strong> {selectedBooking.resourceName}
              </p>
              <p>
                <strong>Date:</strong> {selectedBooking.bookingDate}
              </p>
              <p>
                <strong>Time:</strong> {selectedBooking.startTime} - {selectedBooking.endTime}
              </p>
              <p>
                <strong>Purpose:</strong> {selectedBooking.purpose}
              </p>
              <p>
                <strong>Attendees:</strong> {selectedBooking.attendees || 1}
              </p>
              <p>
                <strong>Status:</strong> {getStatusBadge(selectedBooking.status)}
              </p>
              {selectedBooking.rejectReason && (
                <p>
                  <strong>Rejection Reason:</strong> {selectedBooking.rejectReason}
                </p>
              )}
            </div>
            <div className="modal-footer">
              {selectedBooking.status === 'PENDING' && (
                <>
                  <button
                    className="modal-edit-btn"
                    onClick={() => {
                      setSelectedBooking(null);
                      handleEdit(selectedBooking.id);
                    }}
                  >
                    ✏️ Edit
                  </button>
                  <button
                    className="modal-cancel-btn"
                    onClick={() => {
                      setSelectedBooking(null);
                      handleCancel(selectedBooking.id);
                    }}
                  >
                    ❌ Cancel
                  </button>
                </>
              )}
              {selectedBooking.status === 'APPROVED' && (
                <button
                  className="modal-cancel-btn"
                  onClick={() => {
                    setSelectedBooking(null);
                    handleCancel(selectedBooking.id);
                  }}
                >
                  ❌ Cancel
                </button>
              )}
              <button className="modal-close-btn" onClick={() => setSelectedBooking(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Student;