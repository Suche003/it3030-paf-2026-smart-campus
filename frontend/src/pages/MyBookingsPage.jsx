// frontend/src/pages/MyBookingsPage.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyBookings, cancelBooking } from '../services/bookingService';
import '../styles/BookingsList.css';

export default function MyBookingsPage() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'calendar'

  const loadBookings = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await getMyBookings();
      console.log('Bookings loaded:', response.data);
      setBookings(response.data || []);
    } catch (err) {
      console.error('Error loading bookings:', err);
      setError(err.response?.data?.message || 'Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    
    try {
      await cancelBooking(id);
      alert('✅ Booking cancelled successfully');
      loadBookings();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel booking');
    }
  };

  const handleEdit = (id) => {
    navigate(`/bookings/edit/${id}`);
  };

  const getStatusBadge = (status) => {
    const classes = {
      PENDING: 'status-pending',
      APPROVED: 'status-approved',
      REJECTED: 'status-rejected',
      CANCELLED: 'status-cancelled',
      CANCELED: 'status-cancelled'
    };
    return `status-badge ${classes[status] || ''}`;
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'PENDING': return '⏳';
      case 'APPROVED': return '✅';
      case 'REJECTED': return '❌';
      case 'CANCELLED': return '🚫';
      default: return '📋';
    }
  };

  // Calendar view component
  const CalendarView = () => {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    
    const getDaysInMonth = (date) => {
      return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    };
    
    const getFirstDayOfMonth = (date) => {
      return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    };
    
    const bookingsByDate = bookings.reduce((acc, booking) => {
      if (booking.status === 'APPROVED') {
        const date = booking.bookingDate;
        if (!acc[date]) acc[date] = [];
        acc[date].push(booking);
      }
      return acc;
    }, {});
    
    const renderCalendar = () => {
      const daysInMonth = getDaysInMonth(currentMonth);
      const firstDay = getFirstDayOfMonth(currentMonth);
      const days = [];
      
      for (let i = 0; i < firstDay; i++) {
        days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
      }
      
      for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const dayBookings = bookingsByDate[dateStr] || [];
        
        days.push(
          <div key={day} className="calendar-day">
            <span className="day-number">{day}</span>
            {dayBookings.length > 0 && (
              <div className="day-bookings">
                {dayBookings.map((b, idx) => (
                  <div key={idx} className="day-booking" title={b.resourceName}>
                    {b.resourceName?.substring(0, 10)}
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      }
      
      return days;
    };
    
    return (
      <div className="calendar-container">
        <div className="calendar-header">
          <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}>
            ◀ Previous
          </button>
          <h3>{currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}</h3>
          <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}>
            Next ▶
          </button>
        </div>
        <div className="calendar-weekdays">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="weekday">{day}</div>
          ))}
        </div>
        <div className="calendar-grid">
          {renderCalendar()}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="page-header">
          <h1 className="page-title">My Bookings</h1>
          <p className="page-subtitle">Loading your bookings...</p>
        </div>
        <div className="loading-spinner">⏳ Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        <div className="page-header">
          <h1 className="page-title">My Bookings</h1>
          <p className="page-subtitle">View and manage your booking requests</p>
        </div>
        <div className="empty-state error-state">
          <span style={{ fontSize: '48px' }}>⚠️</span>
          <p>{error}</p>
          <button onClick={loadBookings} className="retry-btn">Try Again</button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">📅 My Bookings</h1>
          <p className="page-subtitle">View and manage your booking requests</p>
        </div>
        <div className="header-actions">
          <button 
            onClick={() => navigate('/bookings/new')}
            className="new-booking-btn"
          >
            + New Booking
          </button>
          <button 
            onClick={() => setViewMode(viewMode === 'table' ? 'calendar' : 'table')}
            className="view-toggle-btn"
          >
            {viewMode === 'table' ? '📅 Calendar View' : '📋 Table View'}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-cards">
        <div className="stat-card">
          <div className="stat-value">{bookings.length}</div>
          <div className="stat-label">Total</div>
        </div>
        <div className="stat-card pending">
          <div className="stat-value">{bookings.filter(b => b.status === 'PENDING').length}</div>
          <div className="stat-label">Pending</div>
        </div>
        <div className="stat-card approved">
          <div className="stat-value">{bookings.filter(b => b.status === 'APPROVED').length}</div>
          <div className="stat-label">Approved</div>
        </div>
        <div className="stat-card rejected">
          <div className="stat-value">{bookings.filter(b => b.status === 'REJECTED').length}</div>
          <div className="stat-label">Rejected</div>
        </div>
      </div>

      {viewMode === 'calendar' ? (
        <div className="calendar-wrapper">
          <CalendarView />
        </div>
      ) : (
        bookings.length === 0 ? (
          <div className="empty-state">
            <span style={{ fontSize: '48px' }}>📭</span>
            <h3>No Bookings Found</h3>
            <p>You haven't made any booking requests yet.</p>
            <button onClick={() => navigate('/bookings/new')} className="create-booking-btn">
              Create Your First Booking
            </button>
          </div>
        ) : (
          <div className="bookings-table-wrapper">
            <table className="bookings-table">
              <thead>
                <tr>
                  <th>Resource</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Purpose</th>
                  <th>Attendees</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking) => (
                  <tr key={booking.id}>
                    <td>
                      <strong>{booking.resourceName}</strong>
                      <small>{booking.resourceId ? `ID: ${booking.resourceId}` : ''}</small>
                    </td>
                    <td>{booking.bookingDate}</td>
                    <td>{booking.startTime} - {booking.endTime}</td>
                    <td title={booking.purpose}>
                      {booking.purpose?.length > 30 ? booking.purpose.substring(0, 30) + '...' : booking.purpose}
                    </td>
                    <td>👥 {booking.attendees || 1}</td>
                    <td>
                      <span className={getStatusBadge(booking.status)}>
                        {getStatusIcon(booking.status)} {booking.status}
                        {booking.rejectReason && (
                          <span className="reject-reason-tooltip" title={booking.rejectReason}> ⓘ</span>
                        )}
                      </span>
                      {booking.rejectReason && booking.status === 'REJECTED' && (
                        <div className="reject-reason-popup">
                          Reason: {booking.rejectReason}
                        </div>
                      )}
                    </td>
                    <td>
                      {/* PENDING: Show BOTH Edit AND Cancel buttons */}
                      {booking.status === 'PENDING' && (
                        <div className="action-buttons">
                          <button
                            onClick={() => handleEdit(booking.id)}
                            className="edit-btn-action"
                          >
                            ✏️ Edit
                          </button>
                          <button
                            onClick={() => handleCancel(booking.id)}
                            className="cancel-btn-action"
                          >
                            ❌ Cancel
                          </button>
                        </div>
                      )}
                      
                      {/* APPROVED: Show Cancel button only */}
                      {booking.status === 'APPROVED' && (
                        <div className="action-buttons">
                          <button
                            onClick={() => handleCancel(booking.id)}
                            className="cancel-btn-action"
                          >
                            ❌ Cancel
                          </button>
                        </div>
                      )}
                      
                      {/* REJECTED/CANCELLED: Show no actions or delete option */}
                      {(booking.status === 'REJECTED' || booking.status === 'CANCELLED') && (
                        <span className="no-action">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}
    </div>
  );
}