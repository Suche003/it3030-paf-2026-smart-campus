import { useEffect, useState } from 'react';
import { getAllBookings } from '../services/bookingService';
import './Technician.css';

function Technician() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState('table');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const userEmail = localStorage.getItem('email');
  const userName = localStorage.getItem('name') || 'Technician';

  const loadBookings = async () => {
    setLoading(true);
    try {
      const response = await getAllBookings();
      const rawData = response.data || [];
      const sorted = [...rawData].sort((a, b) => b.id - a.id);
      setBookings(sorted);
    } catch (err) {
      console.error(err);
      setError('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const getStatusBadge = (status) => {
    const config = {
      PENDING: { class: 'status-pending', icon: '⏳', label: 'Pending' },
      APPROVED: { class: 'status-approved', icon: '✅', label: 'Approved' },
      REJECTED: { class: 'status-rejected', icon: '❌', label: 'Rejected' },
      CANCELLED: { class: 'status-cancelled', icon: '🚫', label: 'Cancelled' }
    };
    const c = config[status] || { class: '', icon: '📋', label: status };
    return <span className={`status-badge ${c.class}`}>{c.icon} {c.label}</span>;
  };

  const filteredBookings = bookings.filter(b => {
    if (filterStatus !== 'ALL' && b.status !== filterStatus) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (b.resourceName?.toLowerCase().includes(term) ||
              b.userEmail?.toLowerCase().includes(term) ||
              b.purpose?.toLowerCase().includes(term));
    }
    return true;
  });

  // Calendar helpers
  const getDaysInMonth = (date) => new Date(date.getFullYear(), date.getMonth()+1, 0).getDate();
  const getFirstDayOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  const getBookingsForDate = (year, month, day) => {
    const ds = `${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
    return bookings.filter(b => b.bookingDate === ds);
  };
  const changeMonth = (delta) => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth()+delta, 1));
  const getStatusColor = (s) => {
    if(s==='APPROVED') return '#4caf50';
    if(s==='PENDING') return '#ffc107';
    if(s==='REJECTED') return '#f44336';
    return '#9e9e9e';
  };
  const renderCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const today = new Date();
    const cells = [];
    for(let i=0; i<firstDay; i++) cells.push(<div key={`e-${i}`} className="cal-day empty"></div>);
    for(let d=1; d<=daysInMonth; d++) {
      const dayBookings = getBookingsForDate(year, month, d);
      const has = dayBookings.length > 0;
      const isToday = year===today.getFullYear() && month===today.getMonth() && d===today.getDate();
      let dotColor = '#aaa';
      if(has) {
        if(dayBookings.some(b=>b.status==='PENDING')) dotColor='#ffc107';
        else if(dayBookings.some(b=>b.status==='APPROVED')) dotColor='#4caf50';
        else if(dayBookings.some(b=>b.status==='REJECTED')) dotColor='#f44336';
      }
      cells.push(
        <div key={d} className={`cal-day ${has?'has-booking':''} ${isToday?'today':''}`} onClick={() => has && setSelectedBooking(dayBookings[0])}>
          <span className="day-number">{d}</span>
          {has && <div className="day-dot" style={{backgroundColor:dotColor}}></div>}
        </div>
      );
    }
    return cells;
  };

  const stats = {
    total: bookings.length,
    pending: bookings.filter(b=>b.status==='PENDING').length,
    approved: bookings.filter(b=>b.status==='APPROVED').length,
    rejected: bookings.filter(b=>b.status==='REJECTED').length
  };

  if(loading) return <div className="technician-dashboard loading-state">Loading bookings...</div>;
  if(error) return <div className="technician-dashboard error-state">{error}</div>;

  return (
    <div className="technician-dashboard">
      <div className="dashboard-header">
        <div><h1>🔧 Technician Dashboard</h1><p>Welcome, {userName} ({userEmail})</p><span className="subtitle">View all campus resource bookings</span></div>
        <div className="stats-badge"><span>📋 Total Bookings: {stats.total}</span></div>
      </div>

      <div className="filters-bar">
        <div className="status-filters">
          <button className={filterStatus==='ALL'?'active':''} onClick={()=>setFilterStatus('ALL')}>All ({stats.total})</button>
          <button className={filterStatus==='PENDING'?'active':''} onClick={()=>setFilterStatus('PENDING')}>Pending ({stats.pending})</button>
          <button className={filterStatus==='APPROVED'?'active':''} onClick={()=>setFilterStatus('APPROVED')}>Approved ({stats.approved})</button>
          <button className={filterStatus==='REJECTED'?'active':''} onClick={()=>setFilterStatus('REJECTED')}>Rejected ({stats.rejected})</button>
        </div>
        <input type="text" placeholder="🔍 Search by resource, user, purpose..." value={searchTerm} onChange={e=>setSearchTerm(e.target.value)} className="search-input" />
      </div>

      <div className="view-toggle">
        <button className={viewMode==='table'?'active':''} onClick={()=>setViewMode('table')}>📋 Table View</button>
        <button className={viewMode==='calendar'?'active':''} onClick={()=>setViewMode('calendar')}>📅 Calendar View</button>
      </div>

      {viewMode === 'table' && (
        filteredBookings.length === 0 ? <div className="empty-state">No bookings match your filters.</div> :
        <div className="table-container">
          <table className="bookings-table">
            <thead><tr><th>ID</th><th>Resource</th><th>User</th><th>Date</th><th>Time</th><th>Purpose</th><th>Status</th></tr></thead>
            <tbody>
              {filteredBookings.map(b => (
                <tr key={b.id} onClick={() => setSelectedBooking(b)} style={{cursor:'pointer'}}>
                  <td>#{b.id}</td><td><strong>{b.resourceName}</strong></td><td>{b.userEmail || `User ${b.userId}`}</td>
                  <td>{b.bookingDate}</td><td>{b.startTime} - {b.endTime}</td><td>{b.purpose?.substring(0,40)}</td><td>{getStatusBadge(b.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {viewMode === 'calendar' && (
        <div className="calendar-wrapper">
          <div className="cal-nav"><button onClick={()=>changeMonth(-1)}>◀ Previous</button><h3>{currentDate.toLocaleString('default',{month:'long', year:'numeric'})}</h3><button onClick={()=>changeMonth(1)}>Next ▶</button></div>
          <div className="cal-weekdays">{['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d=><div key={d} className="cal-weekday">{d}</div>)}</div>
          <div className="cal-grid">{renderCalendar()}</div>
          <div className="cal-legend"><span><span className="legend-dot pending"></span> Pending</span><span><span className="legend-dot approved"></span> Approved</span><span><span className="legend-dot rejected"></span> Rejected</span></div>
        </div>
      )}

      {selectedBooking && (
        <div className="modal-overlay" onClick={()=>setSelectedBooking(null)}>
          <div className="modal-content" onClick={e=>e.stopPropagation()}>
            <div className="modal-header"><h3>📅 Booking Details</h3><button className="modal-close" onClick={()=>setSelectedBooking(null)}>✕</button></div>
            <div className="modal-body">
              <p><strong>Resource:</strong> {selectedBooking.resourceName}</p><p><strong>User:</strong> {selectedBooking.userEmail || `User ${selectedBooking.userId}`}</p>
              <p><strong>Date:</strong> {selectedBooking.bookingDate}</p><p><strong>Time:</strong> {selectedBooking.startTime} - {selectedBooking.endTime}</p>
              <p><strong>Purpose:</strong> {selectedBooking.purpose}</p><p><strong>Attendees:</strong> {selectedBooking.attendees || 1}</p>
              <p><strong>Status:</strong> {getStatusBadge(selectedBooking.status)}</p>
              {selectedBooking.rejectReason && <p><strong>Rejection Reason:</strong> {selectedBooking.rejectReason}</p>}
            </div>
            <div className="modal-footer"><button className="modal-close-btn" onClick={()=>setSelectedBooking(null)}>Close</button></div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Technician;