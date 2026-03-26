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
  const [currentBookingResourceId, setCurrentBookingResourceId] = useState(null);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    setPageLoading(true);
    setError('');
    try {
      // First load booking to get resourceId
      await loadBooking();
      // Then load resources (including current resource)
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
      
      let allResources = [];
      if (response.data && response.data.length > 0) {
        allResources = [...response.data];
      } else {
        // Fallback data
        allResources = [
          { id: 1, name: 'Main Lecture Hall', type: 'Lecture Hall', capacity: 100, status: 'ACTIVE' },
          { id: 2, name: 'Computer Lab A', type: 'Laboratory', capacity: 40, status: 'ACTIVE' },
          { id: 3, name: 'Meeting Room 1', type: 'Meeting Room', capacity: 10, status: 'ACTIVE' },
          { id: 4, name: 'Physics Lab', type: 'Laboratory', capacity: 30, status: 'ACTIVE' },
          { id: 5, name: 'Seminar Hall', type: 'Hall', capacity: 80, status: 'ACTIVE' }
        ];
      }
      
      // 🔥 CRITICAL FIX: If current booking's resource is not in the list (e.g., OUT_OF_SERVICE),
      // add it manually so it appears in dropdown and is pre-selected
      if (currentBookingResourceId) {
        const hasCurrent = allResources.some(r => r.id === parseInt(currentBookingResourceId));
        if (!hasCurrent) {
          // Fetch the current booking's resource details from the booking object
          // We already have the resourceId, but we need name/type. 
          // Since we don't have those from the booking, we create a placeholder.
          // Better: we can try to get from an API call but for simplicity, add placeholder.
          // Actually we can get resourceName from the booking if we stored it? 
          // In convertToResponse, we have resourceName. But in loadBooking we have the full booking object.
          // Let's modify loadBooking to store the resourceName too.
          // However, we don't have the full resource object. So we'll just add a placeholder.
          // The user can still select it, but the name might be unknown.
          // To be safe, we'll make an additional API call to get that resource by ID.
          try {
            const { getResourceById } = await import('../services/resourceService');
            const res = await getResourceById(currentBookingResourceId);
            if (res.data) {
              allResources.push(res.data);
            } else {
              allResources.push({
                id: currentBookingResourceId,
                name: `Resource ${currentBookingResourceId}`,
                type: 'Unknown',
                capacity: 0,
                status: 'UNKNOWN'
              });
            }
          } catch (err) {
            console.warn('Could not fetch current resource details', err);
            allResources.push({
              id: currentBookingResourceId,
              name: `Resource ${currentBookingResourceId}`,
              type: 'Unknown',
              capacity: 0,
              status: 'UNKNOWN'
            });
          }
        }
      }
      
      setResources(allResources);
      
      // After resources are loaded, ensure formData.resourceId is set properly
      if (formData.resourceId) {
        // Force re-render to select the correct option
        setFormData(prev => ({ ...prev, resourceId: prev.resourceId }));
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
      
      // Store the resourceId for later use
      setCurrentBookingResourceId(booking.resourceId);
      
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
      [name]: name === 'attendees' ? (parseInt(value) || 1) : 
              name === 'resourceId' ? parseInt(value) : value
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
    return 'Loading...';
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
        {/* Resource Dropdown - with auto-select fix */}
        <div className="form-group">
          <label>Resource *</label>
          <select 
            name="resourceId" 
            value={formData.resourceId || ''} 
            onChange={handleChange} 
            required
            className="resource-select"
          >
            <option value="" disabled>-- Select a resource --</option>
            {resources.map(res => (
              <option key={res.id} value={res.id}>
                {res.name} - {res.type} (Capacity: {res.capacity}) {res.status !== 'ACTIVE' ? '⚠️' : ''}
              </option>
            ))}
          </select>
          {formData.resourceId && (
            <small className="info-text">
              ✅ Currently selected: {getCurrentResourceName()}
            </small>
          )}
          {!formData.resourceId && resources.length > 0 && (
            <small className="error-message" style={{ display: 'inline-block', marginTop: '5px' }}>
              ⚠️ Please select a resource from the list
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