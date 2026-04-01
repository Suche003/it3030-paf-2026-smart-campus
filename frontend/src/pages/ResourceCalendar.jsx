import { useEffect, useState } from 'react';
import { getAllResources } from '../services/resourceService';
import { getAllBookings } from '../services/bookingService';
import './ResourceCalendar.css';

export default function ResourceCalendar() {
  const [resources, setResources] = useState([]);
  const [selectedResource, setSelectedResource] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    loadResources();
    loadBookings();
  }, []);

  const loadResources = async () => {
    try {
      const res = await getAllResources();
      setResources(res.data || []);
    } catch (err) {
      console.error('Failed to load resources', err);
    }
  };

  const loadBookings = async () => {
    try {
      const res = await getAllBookings();
      setBookings(res.data || []);
    } catch (err) {
      console.error('Failed to load bookings', err);
    }
  };

  const getResourceBookings = () => {
    if (!selectedResource) return [];
    return bookings.filter(b => b.resourceId === selectedResource.id && b.status === 'APPROVED');
  };

  const getDaysInMonth = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const getFirstDayOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();

  const renderCalendar = () => {
    const resourceBookings = getResourceBookings();
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const cells = [];

    for (let i = 0; i < firstDay; i++) {
      cells.push(<div key={`empty-${i}`} className="cal-cell empty"></div>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
      const dayBookings = resourceBookings.filter(b => b.bookingDate === dateStr);
      cells.push(
        <div key={day} className="cal-cell">
          <div className="day-num">{day}</div>
          {dayBookings.map(b => (
            <div key={b.id} className="booking-slot" title={`${b.startTime}-${b.endTime}: ${b.purpose}`}>
              {b.startTime} {b.resourceName}
            </div>
          ))}
        </div>
      );
    }
    return cells;
  };

  return (
    <div className="resource-calendar-container">
      <h2>📅 Resource Booking Calendar</h2>
      <select
        onChange={(e) => {
          const res = resources.find(r => r.id === parseInt(e.target.value));
          setSelectedResource(res);
        }}
        className="resource-selector"
        value={selectedResource?.id || ''}
      >
        <option value="">-- Select Resource --</option>
        {resources.map(r => (
          <option key={r.id} value={r.id}>{r.name} ({r.type})</option>
        ))}
      </select>

      {selectedResource && (
        <>
          <div className="cal-nav">
            <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth()-1, 1))}>◀</button>
            <h3>{currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</h3>
            <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth()+1, 1))}>▶</button>
          </div>
          <div className="cal-grid">{renderCalendar()}</div>
        </>
      )}
    </div>
  );
}