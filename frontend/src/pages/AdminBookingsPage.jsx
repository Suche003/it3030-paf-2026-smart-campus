import { useEffect, useState } from 'react';
import { getAllBookings, approveBooking, rejectBooking } from '../services/bookingService';
import '../styles/AdminBookings.css';

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [showAnalytics, setShowAnalytics] = useState(true); // default open
  const [successMessage, setSuccessMessage] = useState('');
  const [actionLoading, setActionLoading] = useState(null);

  // Load bookings with sorting (newest first)
  const loadBookings = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await getAllBookings();
      const rawData = response.data || [];
      // Sort by id descending (newest first)
      const sorted = [...rawData].sort((a, b) => b.id - a.id);
      setBookings(sorted);
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

  // Helper: get today's date in YYYY-MM-DD
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  // Filter and search
  useEffect(() => {
    let filtered = [...bookings];
    
    // Status filter
    if (activeFilter !== 'ALL') {
      if (activeFilter === 'TODAY') {
        const today = getTodayDate();
        filtered = filtered.filter(b => b.bookingDate === today);
      } else {
        filtered = filtered.filter(b => b.status === activeFilter);
      }
    }
    
    // Search term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(b => 
        (b.userEmail && b.userEmail.toLowerCase().includes(term)) ||
        (b.resourceName && b.resourceName.toLowerCase().includes(term)) ||
        (b.purpose && b.purpose.toLowerCase().includes(term))
      );
    }
    setFilteredBookings(filtered);
  }, [bookings, activeFilter, searchTerm]);

  const showSuccess = (message) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleApprove = async (id) => {
    if (!window.confirm('✅ Are you sure you want to APPROVE this booking?')) return;
    setActionLoading(id);
    try {
      await approveBooking(id);
      showSuccess('✅ Booking approved successfully!');
      await loadBookings();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to approve booking');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id) => {
    if (!rejectReason.trim()) {
      alert('❌ Please provide a reason for rejection');
      return;
    }
    setActionLoading(id);
    try {
      await rejectBooking(id, rejectReason);
      showSuccess('❌ Booking rejected successfully!');
      setShowRejectModal(null);
      setRejectReason('');
      await loadBookings();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to reject booking');
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      PENDING: { class: 'status-pending', icon: '⏳', label: 'Pending' },
      APPROVED: { class: 'status-approved', icon: '✅', label: 'Approved' },
      REJECTED: { class: 'status-rejected', icon: '❌', label: 'Rejected' },
      CANCELLED: { class: 'status-cancelled', icon: '🚫', label: 'Cancelled' }
    };
    const config = statusConfig[status] || { class: '', icon: '📋', label: status };
    return (
      <span className={`status-badge ${config.class}`}>
        {config.icon} {config.label}
      </span>
    );
  };

  const getCount = (filterType) => {
    if (filterType === 'ALL') return bookings.length;
    if (filterType === 'TODAY') {
      const today = getTodayDate();
      return bookings.filter(b => b.bookingDate === today).length;
    }
    return bookings.filter(b => b.status === filterType).length;
  };

  // Enhanced Analytics
  const analytics = {
    total: bookings.length,
    approved: bookings.filter(b => b.status === 'APPROVED').length,
    pending: bookings.filter(b => b.status === 'PENDING').length,
    rejected: bookings.filter(b => b.status === 'REJECTED').length,
    cancelled: bookings.filter(b => b.status === 'CANCELLED').length,
    approvalRate: bookings.length > 0 
      ? Math.round((bookings.filter(b => b.status === 'APPROVED').length / bookings.length) * 100)
      : 0,
    todayBookings: bookings.filter(b => b.bookingDate === getTodayDate()).length,
    // Most popular resource
    topResource: (() => {
      const resourceCount = {};
      bookings.forEach(b => {
        if (b.resourceName) {
          resourceCount[b.resourceName] = (resourceCount[b.resourceName] || 0) + 1;
        }
      });
      let top = { name: 'None', count: 0 };
      Object.entries(resourceCount).forEach(([name, count]) => {
        if (count > top.count) top = { name, count };
      });
      return top;
    })()
  };

  if (loading) {
    return (
      <div className="admin-bookings-container">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading bookings...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-bookings-container">
        <div className="error-state">
          <span className="error-icon">⚠️</span>
          <p>{error}</p>
          <button className="retry-btn" onClick={loadBookings}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-bookings-container">
      {successMessage && <div className="success-toast">{successMessage}</div>}

      <div className="bookings-header">
        <div className="header-title">
          <h1>📋 Admin - Booking Management</h1>
          <p>Review and manage all campus booking requests</p>
        </div>
        <div className="header-buttons">
          <button className="analytics-btn" onClick={() => setShowAnalytics(!showAnalytics)}>
            {showAnalytics ? '📊 Hide Analytics' : '📊 Show Analytics'}
          </button>
          <button className="refresh-btn" onClick={loadBookings}>🔄 Refresh</button>
        </div>
      </div>

      {showAnalytics && (
        <div className="analytics-panel">
          <h3>📈 Booking Analytics Dashboard</h3>
          <div className="analytics-stats">
            <div className="stat-card"><div className="stat-value">{analytics.total}</div><div className="stat-label">Total Bookings</div></div>
            <div className="stat-card approved"><div className="stat-value">{analytics.approved}</div><div className="stat-label">✅ Approved</div></div>
            <div className="stat-card pending"><div className="stat-value">{analytics.pending}</div><div className="stat-label">⏳ Pending</div></div>
            <div className="stat-card rejected"><div className="stat-value">{analytics.rejected}</div><div className="stat-label">❌ Rejected</div></div>
            <div className="stat-card cancelled"><div className="stat-value">{analytics.cancelled}</div><div className="stat-label">🚫 Cancelled</div></div>
            <div className="stat-card rate"><div className="stat-value">{analytics.approvalRate}%</div><div className="stat-label">Approval Rate</div></div>
            <div className="stat-card today"><div className="stat-value">{analytics.todayBookings}</div><div className="stat-label">📅 Today's Bookings</div></div>
            <div className="stat-card top-resource"><div className="stat-value" title={analytics.topResource.name}>{analytics.topResource.name.length > 12 ? analytics.topResource.name.substring(0,12)+'..' : analytics.topResource.name}</div><div className="stat-label">🏆 Most Booked</div></div>
          </div>
        </div>
      )}

      <div className="filter-section">
        <div className="filter-buttons">
          <button className={`filter-chip ${activeFilter === 'ALL' ? 'active' : ''}`} onClick={() => setActiveFilter('ALL')}>All <span className="count">{getCount('ALL')}</span></button>
          <button className={`filter-chip ${activeFilter === 'TODAY' ? 'active' : ''}`} onClick={() => setActiveFilter('TODAY')}>📅 Today <span className="count">{getCount('TODAY')}</span></button>
          <button className={`filter-chip pending ${activeFilter === 'PENDING' ? 'active' : ''}`} onClick={() => setActiveFilter('PENDING')}>⏳ Pending <span className="count">{getCount('PENDING')}</span></button>
          <button className={`filter-chip approved ${activeFilter === 'APPROVED' ? 'active' : ''}`} onClick={() => setActiveFilter('APPROVED')}>✅ Approved <span className="count">{getCount('APPROVED')}</span></button>
          <button className={`filter-chip rejected ${activeFilter === 'REJECTED' ? 'active' : ''}`} onClick={() => setActiveFilter('REJECTED')}>❌ Rejected <span className="count">{getCount('REJECTED')}</span></button>
          <button className={`filter-chip cancelled ${activeFilter === 'CANCELLED' ? 'active' : ''}`} onClick={() => setActiveFilter('CANCELLED')}>🚫 Cancelled <span className="count">{getCount('CANCELLED')}</span></button>
        </div>
        <div className="search-wrapper">
          <input type="text" placeholder="🔍 Search by user, resource, or purpose..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="search-input" />
          {searchTerm && <button className="clear-search" onClick={() => setSearchTerm('')}>✕</button>}
        </div>
      </div>

      <div className="results-info">
        <span>📋 Showing {filteredBookings.length} of {bookings.length} bookings</span>
        {searchTerm && <span className="search-term"> matching "{searchTerm}"</span>}
        {activeFilter === 'TODAY' && <span className="search-term"> (Today only)</span>}
      </div>

      {filteredBookings.length === 0 ? (
        <div className="empty-state"><div className="empty-emoji">📭</div><h3>No bookings found</h3><p>Try changing your filters or search term</p></div>
      ) : (
        <div className="table-container">
          <table className="bookings-table">
            <thead>
              <tr><th>ID</th><th>User Email</th><th>Resource</th><th>Date</th><th>Time</th><th>Purpose</th><th>Attendees</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {filteredBookings.map((booking) => (
                <tr key={booking.id} className="booking-row">
                  <td className="col-id">#{booking.id}</td>
                  <td className="col-email">{booking.userEmail || `User ${booking.userId}`}</td>
                  <td className="col-resource"><strong>{booking.resourceName || `Resource ${booking.resourceId}`}</strong></td>
                  <td className="col-date">{booking.bookingDate}</td>
                  <td className="col-time">{booking.startTime} - {booking.endTime}</td>
                  <td className="col-purpose" title={booking.purpose}>{booking.purpose?.length > 35 ? booking.purpose.substring(0,35)+'...' : booking.purpose}</td>
                  <td className="col-attendees">{booking.attendees || 1}</td>
                  <td className="col-status">{getStatusBadge(booking.status)}</td>
                  <td className="col-actions">
                    {booking.status === 'PENDING' ? (
                      <div className="action-buttons">
                        <button className="btn-approve" onClick={() => handleApprove(booking.id)} disabled={actionLoading === booking.id}>{actionLoading === booking.id ? '...' : '✅ Approve'}</button>
                        <button className="btn-reject" onClick={() => setShowRejectModal(booking.id)} disabled={actionLoading === booking.id}>❌ Reject</button>
                      </div>
                    ) : <span className="no-actions">—</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showRejectModal && (
        <div className="modal-overlay" onClick={() => setShowRejectModal(null)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header"><h3>❌ Reject Booking #{showRejectModal}</h3><button className="modal-close" onClick={() => setShowRejectModal(null)}>✕</button></div>
            <div className="modal-body"><p>Please provide a reason for rejecting this booking:</p><textarea placeholder="Example: Resource unavailable, Time slot conflict, Invalid request..." value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} rows="4" autoFocus /></div>
            <div className="modal-footer"><button className="modal-cancel" onClick={() => { setShowRejectModal(null); setRejectReason(''); }}>Cancel</button><button className="modal-confirm" onClick={() => handleReject(showRejectModal)}>Confirm Reject</button></div>
          </div>
        </div>
      )}
    </div>
  );
}