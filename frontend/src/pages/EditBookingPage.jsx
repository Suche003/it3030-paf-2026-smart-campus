import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getBookingById, updateBooking } from '../services/bookingService';
import { getAllResources } from '../services/resourceService';
import '../styles/BookingForm.css';

export default function EditBookingPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [formData, setFormData] = useState({
    resourceId: '',
    bookingDate: '',
    startTime: '',
    endTime: '',
    purpose: '',
    attendees: 1
  });

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    setPageLoading(true);
    setError('');
    try {
      // First load booking to get resourceId
      await loadBooking();
      // Then load resources
      await loadResources();
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to load data');
    } finally {
      setPageLoading(false);
    }
  };

  const loadResources = async () => {
    try {
      const response = await getAllResources();
      console.log('Resources loaded:', response.data);
      let activeResources = [];
      
      if (response.data && response.data.length > 0) {
        activeResources = response.data.filter(r => r.status === 'ACTIVE');
        setResources(activeResources);
      } else {
        // Fallback data
        const fallbackResources = [
          { id: 1, name: 'Main Lecture Hall', type: 'Lecture Hall', capacity: 100, status: 'ACTIVE' },
          { id: 2, name: 'Computer Lab A', type: 'Laboratory', capacity: 40, status: 'ACTIVE' },
          { id: 3, name: 'Meeting Room 1', type: 'Meeting Room', capacity: 10, status: 'ACTIVE' },
          { id: 4, name: 'Physics Lab', type: 'Laboratory', capacity: 30, status: 'ACTIVE' },
          { id: 5, name: 'Seminar Hall', type: 'Hall', capacity: 80, status: 'ACTIVE' }
        ];
        setResources(fallbackResources);
        activeResources = fallbackResources;
      }
      
      // After resources are loaded, make sure formData.resourceId exists in resources
      if (formData.resourceId && !activeResources.find(r => r.id === parseInt(formData.resourceId))) {
        console.log('Current resource not in active list, but keeping it');
      }
      
    } catch (err) {
      console.error('Error loading resources:', err);
      const fallbackResources = [
        { id: 1, name: 'Main Lecture Hall', type: 'Lecture Hall', capacity: 100, status: 'ACTIVE' },
        { id: 2, name: 'Computer Lab A', type: 'Laboratory', capacity: 40, status: 'ACTIVE' },
        { id: 3, name: 'Meeting Room 1', type: 'Meeting Room', capacity: 10, status: 'ACTIVE' }
      ];
      setResources(fallbackResources);
    }
  };

  const loadBooking = async () => {
    try {
      const response = await getBookingById(id);
      const booking = response.data;
      console.log('Booking loaded:', booking);
      
      // Set form data with the booking values
      setFormData({
        resourceId: booking.resourceId,
        bookingDate: booking.bookingDate,
        startTime: booking.startTime,
        endTime: booking.endTime,
        purpose: booking.purpose || '',
        attendees: booking.attendees || 1
      });
      
    } catch (err) {
      console.error('Error loading booking:', err);
      setError('Failed to load booking details');
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
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
      await updateBooking(id, formData);
      setSuccessMessage('✅ Booking updated successfully!');
      setTimeout(() => {
        navigate('/my-bookings');
      }, 1500);
    } catch (err) {
      console.error('Error updating booking:', err);
      setError(err.response?.data?.message || 'Failed to update booking');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (window.confirm('Are you sure you want to cancel editing? Your changes will be lost.')) {
      navigate('/my-bookings');
    }
  };

  // Get current resource name
  const getCurrentResourceName = () => {
    const current = resources.find(r => r.id === parseInt(formData.resourceId));
    if (current) {
      return `${current.name} (${current.type})`;
    }
    return 'Unknown resource';
  };

  if (pageLoading) {
    return (
      <div className="booking-form-container">
        <div className="booking-form-header">
          <h1 className="booking-form-title">Edit Booking</h1>
          <p className="booking-form-subtitle">Loading your booking details...</p>
        </div>
        <div className="loading-spinner">⏳</div>
      </div>
    );
  }

  return (
    <div className="booking-form-container">
      {successMessage && (
        <div className="success-toast">{successMessage}</div>
      )}

      <div className="booking-form-header">
        <h1 className="booking-form-title">✏️ Edit Booking</h1>
        <p className="booking-form-subtitle">Update your pending booking request</p>
      </div>

      <form onSubmit={handleSubmit} className="booking-form-card">
        {/* Resource Dropdown - with auto-select */}
        <div className="form-group">
          <label>Resource *</label>
          <select 
            name="resourceId" 
            value={formData.resourceId} 
            onChange={handleChange} 
            required
            className="resource-select"
          >
            <option value="">-- Select a resource --</option>
            {resources.map(res => (
              <option key={res.id} value={res.id}>
                {res.name} - {res.type} (Capacity: {res.capacity})
              </option>
            ))}
          </select>
          {formData.resourceId && (
            <small className="info-text">
              ✅ Currently selected: {getCurrentResourceName()}
            </small>
          )}
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Date *</label>
            <input 
              type="date" 
              name="bookingDate" 
              value={formData.bookingDate} 
              onChange={handleChange} 
              required 
              min={new Date().toISOString().split('T')[0]}
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

        <div className="form-group">
          <label>Attendees</label>
          <input 
            type="number" 
            name="attendees" 
            value={formData.attendees} 
            onChange={handleChange} 
            min="1" 
            max="500"
          />
        </div>

        <div className="form-group">
          <label>Purpose *</label>
          <textarea 
            name="purpose" 
            value={formData.purpose} 
            onChange={handleChange} 
            rows="3" 
            placeholder="Describe the purpose of your booking..."
            required
          />
        </div>

        {error && <div className="error-message">⚠️ {error}</div>}

        <div className="form-buttons">
          <button 
            type="submit" 
            className="submit-btn update-btn" 
            disabled={loading}
          >
            {loading ? '⏳ Updating...' : '💾 Update Booking'}
          </button>
          <button 
            type="button" 
            onClick={handleCancel} 
            className="cancel-form-btn"
          >
            ❌ Cancel
          </button>
        </div>
      </form>
    </div>
  );
}