import { useState, useEffect } from 'react'
import { getUserBookings, cancelBooking, updateBooking } from '../services/bookingService'
import { useNavigate } from 'react-router-dom'
import '../styles/MyBookingsPage.css'

export default function MyBookingsPage() {
    const navigate = useNavigate()
    const [bookings, setBookings] = useState([])
    const [loading, setLoading] = useState(true)
    const [editingBooking, setEditingBooking] = useState(null)
    const [editForm, setEditForm] = useState({
        date: '',
        startTime: '',
        endTime: '',
        purpose: '',
        attendees: 1
    })
    
    // Current user (hardcoded - replace with auth later)
    const currentUserId = 1
    
    useEffect(() => {
        loadBookings()
    }, [])
    
    const loadBookings = async () => {
        setLoading(true)
        try {
            const response = await getUserBookings(currentUserId)
            setBookings(response.data)
            console.log("Bookings loaded:", response.data)
        } catch (error) {
            console.error('Error loading bookings:', error)
            alert('Failed to load bookings')
        } finally {
            setLoading(false)
        }
    }
    
    const handleCancel = async (id) => {
        const confirmed = window.confirm('Are you sure you want to cancel this booking?')
        if (!confirmed) return
        
        try {
            await cancelBooking(id)
            alert('Booking cancelled successfully')
            loadBookings()
        } catch (error) {
            console.error('Error cancelling booking:', error)
            alert(error.response?.data?.error || 'Failed to cancel booking')
        }
    }
    
    const handleEdit = (booking) => {
        setEditingBooking(booking)
        setEditForm({
            date: booking.date,
            startTime: booking.startTime,
            endTime: booking.endTime,
            purpose: booking.purpose,
            attendees: booking.attendees
        })
    }
    
    const handleUpdate = async (e) => {
        e.preventDefault()
        
        // Validate time
        if (editForm.startTime >= editForm.endTime) {
            alert('Start time must be before end time')
            return
        }
        
        try {
            await updateBooking(editingBooking.id, {
                ...editForm,
                userId: currentUserId,
                userName: "Demo User",
                resourceId: editingBooking.resourceId,
                resourceName: editingBooking.resourceName
            })
            alert('Booking updated successfully!')
            setEditingBooking(null)
            loadBookings()
        } catch (error) {
            console.error('Error updating booking:', error)
            alert(error.response?.data?.error || 'Failed to update booking')
        }
    }
    
    const getStatusBadgeClass = (status) => {
        switch(status) {
            case 'PENDING': return 'status-pending'
            case 'APPROVED': return 'status-approved'
            case 'REJECTED': return 'status-rejected'
            case 'CANCELLED': return 'status-cancelled'
            default: return ''
        }
    }
    
    const canEdit = (booking) => {
        return booking.status === 'PENDING'
    }
    
    const canCancel = (booking) => {
        return booking.status === 'PENDING' || (booking.status === 'APPROVED' && booking.date >= new Date().toISOString().split('T')[0])
    }
    
    if (loading) {
        return (
            <div className="my-bookings-container">
                <div className="loading-spinner">Loading your bookings...</div>
            </div>
        )
    }
    
    return (
        <div className="my-bookings-container">
            <div className="my-bookings-header">
                <h1>📋 My Bookings</h1>
                <p>View, edit, or cancel your booking requests</p>
            </div>
            
            {bookings.length === 0 ? (
                <div className="no-bookings">
                    <p>You haven't made any bookings yet.</p>
                    <button onClick={() => navigate('/bookings')} className="book-now-btn">
                        📅 Book Now
                    </button>
                </div>
            ) : (
                <div className="bookings-list">
                    {bookings.map(booking => (
                        <div key={booking.id} className="booking-card">
                            <div className="booking-header">
                                <h3>{booking.resourceName}</h3>
                                <span className={`status-badge ${getStatusBadgeClass(booking.status)}`}>
                                    {booking.status}
                                </span>
                            </div>
                            
                            <div className="booking-details">
                                <div className="detail-row">
                                    <span className="detail-label">📅 Date:</span>
                                    <span>{booking.date}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">⏰ Time:</span>
                                    <span>{booking.startTime} - {booking.endTime}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">📝 Purpose:</span>
                                    <span>{booking.purpose}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">👥 Attendees:</span>
                                    <span>{booking.attendees}</span>
                                </div>
                                {booking.rejectReason && (
                                    <div className="detail-row reject-reason">
                                        <span className="detail-label">❌ Rejected Reason:</span>
                                        <span>{booking.rejectReason}</span>
                                    </div>
                                )}
                            </div>
                            
                            <div className="booking-actions">
                                {canEdit(booking) && (
                                    <button onClick={() => handleEdit(booking)} className="edit-btn">
                                        ✏️ Edit
                                    </button>
                                )}
                                {canCancel(booking) && (
                                    <button onClick={() => handleCancel(booking.id)} className="cancel-btn">
                                        ❌ Cancel
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
            
            {/* Edit Modal */}
            {editingBooking && (
                <div className="modal-overlay" onClick={() => setEditingBooking(null)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h2>✏️ Edit Booking</h2>
                        <form onSubmit={handleUpdate}>
                            <div className="form-group">
                                <label>Resource</label>
                                <input type="text" value={editingBooking.resourceName} disabled className="disabled-input" />
                            </div>
                            
                            <div className="form-group">
                                <label>Date *</label>
                                <input 
                                    type="date" 
                                    value={editForm.date} 
                                    onChange={(e) => setEditForm({...editForm, date: e.target.value})}
                                    min={new Date().toISOString().split('T')[0]}
                                    required
                                />
                            </div>
                            
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Start Time *</label>
                                    <input 
                                        type="time" 
                                        value={editForm.startTime} 
                                        onChange={(e) => setEditForm({...editForm, startTime: e.target.value})}
                                        required
                                    />
                                </div>
                                
                                <div className="form-group">
                                    <label>End Time *</label>
                                    <input 
                                        type="time" 
                                        value={editForm.endTime} 
                                        onChange={(e) => setEditForm({...editForm, endTime: e.target.value})}
                                        required
                                    />
                                </div>
                            </div>
                            
                            <div className="form-group">
                                <label>Purpose *</label>
                                <textarea 
                                    value={editForm.purpose} 
                                    onChange={(e) => setEditForm({...editForm, purpose: e.target.value})}
                                    rows="3"
                                    required
                                />
                            </div>
                            
                            <div className="form-group">
                                <label>Attendees *</label>
                                <input 
                                    type="number" 
                                    value={editForm.attendees} 
                                    onChange={(e) => setEditForm({...editForm, attendees: parseInt(e.target.value)})}
                                    min="1"
                                    required
                                />
                            </div>
                            
                            <div className="modal-buttons">
                                <button type="button" onClick={() => setEditingBooking(null)} className="cancel-modal-btn">
                                    Cancel
                                </button>
                                <button type="submit" className="save-modal-btn">
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}