// frontend/src/pages/CreateBookingPage.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createBooking } from '../services/bookingService';
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

  // Load resources on component mount
  useEffect(() => {
    loadResources();
  }, []);

  const loadResources = async () => {
    setLoadingResources(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      console.log('🔑 Token exists?', !!token);
      
      const response = await API.get('/resources');
      console.log('📦 API Response:', response.status, response.data);
      
      if (response.data && Array.isArray(response.data) && response.data.length > 0) {
        // Filter only ACTIVE resources
        const activeResources = response.data.filter(r => r.status === 'ACTIVE');
        console.log('✅ Active resources found:', activeResources.length);
        
        if (activeResources.length === 0) {
          setError('No active resources available. Please contact admin.');
          setResources([]);
        } else {
          setResources(activeResources);
        }
      } else {
        console.log('⚠️ No resources found in database');
        setError('No resources found. Please contact admin to add resources.');
        
        // Fallback demo data for testing
        console.log('📦 Using fallback resources for testing');
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
      console.error('Error details:', err.response?.data || err.message);
      
      if (err.response?.status === 401) {
        setError('Session expired. Please login again.');
        setTimeout(() => navigate('/login'), 2000);
      } else if (err.response?.status === 403) {
        setError('You don\'t have permission to view resources.');
      } else {
        setError(err.response?.data?.message || 'Failed to load resources. Please try again.');
      }
      
      // Fallback data on error
      console.log('📦 Using fallback resources due to error');
      setResources([
        { id: 1, name: 'Main Lecture Hall', type: 'Lecture Hall', capacity: 100, status: 'ACTIVE' },
        { id: 2, name: 'Computer Lab A', type: 'Laboratory', capacity: 40, status: 'ACTIVE' },
        { id: 3, name: 'Meeting Room 1', type: 'Meeting Room', capacity: 10, status: 'ACTIVE' }
      ]);
    } finally {
      setLoadingResources(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'attendees' ? (parseInt(value) || 1) : value
    }));
    setError('');
  };

  const goBackToDashboard = () => {
    const role = localStorage.getItem('role');
    console.log('🔙 Going back to dashboard, role:', role);
    
    if (role === 'ADMIN') {
      navigate('/admin');
    } else if (role === 'STUDENT') {
      navigate('/student');
    } else if (role === 'LECTURER') {
      navigate('/lecturer');
    } else if (role === 'TECHNICIAN') {
      navigate('/technician');
    } else {
      navigate('/my-bookings');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.resourceId) {
      setError('Please select a resource');
      return;
    }
    if (!formData.bookingDate) {
      setError('Please select a date');
      return;
    }
    if (!formData.startTime) {
      setError('Please select start time');
      return;
    }
    if (!formData.endTime) {
      setError('Please select end time');
      return;
    }
    if (formData.startTime >= formData.endTime) {
      setError('End time must be after start time');
      return;
    }
    if (!formData.purpose.trim()) {
      setError('Please enter a purpose');
      return;
    }
    
    setLoading(true);
    setError('');

    try {
      // Check token before submitting
      const token = localStorage.getItem('token');
      console.log('🔑 Token before submit:', token ? 'YES' : 'NO');
      
      if (!token) {
        setError('You are not logged in. Please login again.');
        setTimeout(() => navigate('/login'), 2000);
        setLoading(false);
        return;
      }
      
      console.log('📤 Submitting booking request:', formData);
      const response = await createBooking(formData);
      console.log('✅ Booking created successfully:', response.data);
      
      alert('✅ Booking request submitted successfully!');
      
      // Redirect based on role
      const role = localStorage.getItem('role');
      if (role === 'ADMIN') {
        navigate('/admin');
      } else if (role === 'STUDENT') {
        navigate('/student');
      } else if (role === 'LECTURER') {
        navigate('/lecturer');
      } else if (role === 'TECHNICIAN') {
        navigate('/technician');
      } else {
        navigate('/my-bookings');
      }
      
    } catch (err) {
      console.error('❌ Submit error:', err);
      console.error('Error response:', err.response?.data);
      console.error('Error status:', err.response?.status);
      
      if (err.response?.status === 401) {
        setError('Session expired. Please login again.');
        localStorage.clear();
        setTimeout(() => navigate('/login'), 2000);
      } else if (err.response?.status === 403) {
        setError('You don\'t have permission to create bookings.');
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Failed to create booking. Please try again.');
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
          <small style={{ color: '#888', marginTop: '10px', display: 'block' }}>
            Please wait while we fetch available resources
          </small>
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
        <button onClick={goBackToDashboard} className="back-btn">
          ← Back to Dashboard
        </button>
      </div>

      <form onSubmit={handleSubmit} className="booking-form-card">
        {/* Resource Selection */}
        <div className="form-group">
          <label>Resource *</label>
          <select 
            name="resourceId" 
            value={formData.resourceId} 
            onChange={handleChange} 
            required
            className={!resources.length ? 'select-disabled' : ''}
          >
            <option value="">{resources.length === 0 ? '⚠️ No resources available' : '-- Select a resource --'}</option>
            {resources.map(res => (
              <option key={res.id} value={res.id}>
                🏢 {res.name} - {res.type} (Capacity: {res.capacity})
              </option>
            ))}
          </select>
          {resources.length === 0 && (
            <small style={{ color: '#ff9800', display: 'block', marginTop: '8px' }}>
              💡 No resources found. Please contact administrator to add resources.
            </small>
          )}
          <small style={{ color: '#888', display: 'block', marginTop: '5px' }}>
            Available resources: {resources.length}
          </small>
        </div>

        {/* Date and Time Row */}
        <div className="form-row">
          <div className="form-group">
            <label>Date *</label>
            <input 
              type="date" 
              name="bookingDate" 
              value={formData.bookingDate} 
              onChange={handleChange} 
              min={today}
              required 
            />
          </div>

          <div className="form-group">
            <label>Start Time *</label>
            <input 
              type="time" 
              name="startTime" 
              value={formData.startTime} 
              onChange={handleChange} 
              required 
            />
          </div>

          <div className="form-group">
            <label>End Time *</label>
            <input 
              type="time" 
              name="endTime" 
              value={formData.endTime} 
              onChange={handleChange} 
              required 
            />
          </div>
        </div>

        {/* Attendees */}
        <div className="form-group">
          <label>Attendees 👥</label>
          <input 
            type="number" 
            name="attendees" 
            value={formData.attendees} 
            onChange={handleChange} 
            min="1" 
            max="500"
          />
        </div>

        {/* Purpose */}
        <div className="form-group">
          <label>Purpose *</label>
          <textarea 
            name="purpose" 
            value={formData.purpose} 
            onChange={handleChange} 
            rows="3" 
            placeholder="Enter the purpose of booking (e.g., Group study, Lecture, Meeting, etc.)"
            required
          ></textarea>
        </div>

        {/* Error Message */}
        {error && (
          <div className="error-message">
            ⚠️ {error}
          </div>
        )}

        {/* Submit Button */}
        <button 
          type="submit" 
          className="submit-btn" 
          disabled={loading || resources.length === 0}
        >
          {loading ? '⏳ Submitting...' : '📝 Submit Booking Request'}
        </button>
      </form>
    </div>
  );
}