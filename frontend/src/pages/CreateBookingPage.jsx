import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createBooking, getAllBookings } from '../services/bookingService';
import API from '../services/api';
import '../styles/BookingForm.css';

export default function CreateBookingPage() {
  const navigate = useNavigate();
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingResources, setLoadingResources] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    resourceId: '',
    bookingDate: '',
    startTime: '',
    endTime: '',
    purpose: '',
    attendees: 1
  });

  // Conflict suggestion state
  const [suggestedTime, setSuggestedTime] = useState(null);
  const [checkingConflict, setCheckingConflict] = useState(false);

  // Load resources on mount
  useEffect(() => {
    loadResources();
  }, []);

  // Check conflict whenever resource, date, or time changes
  useEffect(() => {
    if (formData.resourceId && formData.bookingDate && formData.startTime && formData.endTime) {
      checkConflictAndSuggest();
    } else {
      setSuggestedTime(null);
    }
  }, [formData.resourceId, formData.bookingDate, formData.startTime, formData.endTime]);

  const loadResources = async () => {
    setLoadingResources(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      console.log('🔑 Token exists?', !!token);
      const response = await API.get('/resources');
      console.log('📦 API Response:', response.status, response.data);
      if (response.data && Array.isArray(response.data) && response.data.length > 0) {
        const activeResources = response.data.filter(r => r.status === 'ACTIVE');
        if (activeResources.length === 0) {
          setError('No active resources available. Please contact admin.');
          setResources([]);
        } else {
          setResources(activeResources);
        }
      } else {
        console.log('⚠️ No resources found in database, using fallback');
        setError('No resources found. Using demo data.');
        setResources([
          { id: 1, name: 'Main Lecture Hall', type: 'Lecture Hall', capacity: 100, status: 'ACTIVE' },
          { id: 2, name: 'Computer Lab A', type: 'Laboratory', capacity: 40, status: 'ACTIVE' },
          { id: 3, name: 'Meeting Room 1', type: 'Meeting Room', capacity: 10, status: 'ACTIVE' },
          { id: 4, name: 'Physics Lab', type: 'Laboratory', capacity: 30, status: 'ACTIVE' },
          { id: 5, name: 'Seminar Hall', type: 'Lecture Hall', capacity: 80, status: 'ACTIVE' }
        ]);
      }
    } catch (err) {
      console.error('❌ Error loading resources:', err);
      if (err.response?.status === 401) {
        setError('Session expired. Please login again.');
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setError(err.response?.data?.message || 'Failed to load resources.');
      }
      setResources([
        { id: 1, name: 'Main Lecture Hall', type: 'Lecture Hall', capacity: 100, status: 'ACTIVE' },
        { id: 2, name: 'Computer Lab A', type: 'Laboratory', capacity: 40, status: 'ACTIVE' },
        { id: 3, name: 'Meeting Room 1', type: 'Meeting Room', capacity: 10, status: 'ACTIVE' }
      ]);
    } finally {
      setLoadingResources(false);
    }
  };

  // Conflict detection & suggestion
  const checkConflictAndSuggest = async () => {
    const { resourceId, bookingDate, startTime, endTime } = formData;
    if (!resourceId || !bookingDate || !startTime || !endTime) return;

    setCheckingConflict(true);
    try {
      const allBookingsRes = await getAllBookings();
      const existingBookings = allBookingsRes.data.filter(b =>
        b.resourceId === parseInt(resourceId) &&
        b.bookingDate === bookingDate &&
        (b.status === 'APPROVED' || b.status === 'PENDING')
      );
      existingBookings.sort((a, b) => a.startTime.localeCompare(b.startTime));

      const requestedStart = startTime;
      const requestedEnd = endTime;
      const conflict = existingBookings.some(b =>
        (requestedStart < b.endTime && requestedEnd > b.startTime)
      );

      if (!conflict) {
        setSuggestedTime(null);
        return;
      }

      // Find next free slot in 30‑minute increments
      const stepMinutes = 30;
      let candidate = new Date(`1970-01-01T${requestedStart}`);
      const dayEnd = new Date(`1970-01-01T23:59`);
      let found = false;

      while (candidate < dayEnd && !found) {
        const candidateEnd = new Date(candidate.getTime() + stepMinutes * 60000);
        const candidateStartStr = candidate.toTimeString().slice(0,5);
        const candidateEndStr = candidateEnd.toTimeString().slice(0,5);

        const isFree = !existingBookings.some(b =>
          (candidateStartStr < b.endTime && candidateEndStr > b.startTime)
        );

        if (isFree) {
          setSuggestedTime({ start: candidateStartStr, end: candidateEndStr });
          found = true;
          break;
        }
        candidate = new Date(candidate.getTime() + stepMinutes * 60000);
      }
      if (!found) setSuggestedTime(null);
    } catch (err) {
      console.error('Error checking conflicts', err);
    } finally {
      setCheckingConflict(false);
    }
  };

  const applySuggestedTime = () => {
    if (suggestedTime) {
      setFormData(prev => ({
        ...prev,
        startTime: suggestedTime.start,
        endTime: suggestedTime.end
      }));
      setSuggestedTime(null);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'attendees' ? (parseInt(value) || 1) : value
    }));
    setError('');
    if (name === 'startTime' || name === 'endTime' || name === 'resourceId' || name === 'bookingDate') {
      setSuggestedTime(null);
    }
  };

  const goBackToDashboard = () => {
    const role = localStorage.getItem('role');
    if (role === 'ADMIN') navigate('/admin');
    else if (role === 'STUDENT') navigate('/student');
    else if (role === 'LECTURER') navigate('/lecturer');
    else if (role === 'TECHNICIAN') navigate('/technician');
    else navigate('/my-bookings');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.resourceId) { setError('Please select a resource'); return; }
    if (!formData.bookingDate) { setError('Please select a date'); return; }
    if (!formData.startTime) { setError('Please select start time'); return; }
    if (!formData.endTime) { setError('Please select end time'); return; }
    if (formData.startTime >= formData.endTime) { setError('End time must be after start time'); return; }
    if (!formData.purpose.trim()) { setError('Please enter a purpose'); return; }

    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('You are not logged in. Please login again.');
        setTimeout(() => navigate('/login'), 2000);
        setLoading(false);
        return;
      }
      await createBooking(formData);
      alert('✅ Booking request submitted successfully!');
      const role = localStorage.getItem('role');
      if (role === 'ADMIN') navigate('/admin');
      else if (role === 'STUDENT') navigate('/student');
      else if (role === 'LECTURER') navigate('/lecturer');
      else if (role === 'TECHNICIAN') navigate('/technician');
      else navigate('/my-bookings');
    } catch (err) {
      console.error('Full error object:', err);
      console.error('Error response:', err.response);
      
      // Robust error message extraction
      let errorMsg = 'Failed to create booking.';
      if (err.response) {
        if (typeof err.response.data === 'string') {
          errorMsg = err.response.data;
        } else if (err.response.data?.message) {
          errorMsg = err.response.data.message;
        } else if (err.response.data?.error) {
          errorMsg = err.response.data.error;
        } else if (err.response.statusText) {
          errorMsg = err.response.statusText;
        }
      } else if (err.message) {
        errorMsg = err.message;
      }
      
      setError(`⚠️ ${errorMsg}`);
      
      if (err.response?.status === 401) {
        setError('Session expired. Please login again.');
        localStorage.clear();
        setTimeout(() => navigate('/login'), 2000);
      } else if (err.response?.status === 403) {
        setError('You don\'t have permission to create bookings.');
      }
    } finally {
      setLoading(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];

  if (loadingResources) {
    return (
      <div className="booking-form-container">
        <div className="booking-form-header">
          <div>
            <h1 className="booking-form-title">📅 Book a Resource</h1>
            <p className="booking-form-subtitle">Loading available resources...</p>
          </div>
        </div>
        <div className="loading-spinner" style={{ textAlign: 'center', padding: '60px' }}>
          <div>⏳ Loading resources...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="booking-form-container">
      <div className="booking-form-header">
        <div>
          <h1 className="booking-form-title">📅 Book a Resource</h1>
          <p className="booking-form-subtitle">Submit a new booking request</p>
        </div>
        <button onClick={goBackToDashboard} className="back-btn">← Back to Dashboard</button>
      </div>

      <form onSubmit={handleSubmit} className="booking-form-card">
        <div className="form-group">
          <label>Resource *</label>
          <select name="resourceId" value={formData.resourceId} onChange={handleChange} required>
            <option value="">-- Select a resource --</option>
            {resources.map(res => (
              <option key={res.id} value={res.id}>🏢 {res.name} - {res.type} (Capacity: {res.capacity})</option>
            ))}
          </select>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Date *</label>
            <input type="date" name="bookingDate" value={formData.bookingDate} onChange={handleChange} min={today} required />
          </div>
          <div className="form-group">
            <label>Start Time *</label>
            <input type="time" name="startTime" value={formData.startTime} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>End Time *</label>
            <input type="time" name="endTime" value={formData.endTime} onChange={handleChange} required />
          </div>
        </div>

        <div className="form-group">
          <label>Attendees 👥</label>
          <input type="number" name="attendees" value={formData.attendees} onChange={handleChange} min="1" max="500" />
        </div>

        <div className="form-group">
          <label>Purpose *</label>
          <textarea name="purpose" value={formData.purpose} onChange={handleChange} rows="3" placeholder="Enter the purpose of booking (e.g., Group study, Lecture, Meeting, etc.)" required />
        </div>

        {suggestedTime && (
          <div className="suggestion-box">
            <span>⏰ <strong>Time slot not available.</strong> Suggested free slot: {suggestedTime.start} – {suggestedTime.end}</span>
            <button type="button" onClick={applySuggestedTime} className="suggest-btn">Use this time</button>
          </div>
        )}
        {checkingConflict && <div className="info-text">Checking availability...</div>}

        {error && <div className="error-message">⚠️ {error}</div>}

        <button type="submit" className="submit-btn" disabled={loading || resources.length === 0}>
          {loading ? '⏳ Submitting...' : '📝 Submit Booking Request'}
        </button>
      </form>
    </div>
  );
}