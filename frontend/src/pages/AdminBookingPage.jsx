import { useState, useEffect } from 'react'
import { getAllBookings, approveBooking, rejectBooking, filterBookings } from '../services/bookingService'
import { getAllResources } from '../services/resourceService'
import '../styles/AdminBookingPage.css'

export default function AdminBookingPage() {
    const [bookings, setBookings] = useState([])
    const [resources, setResources] = useState([])
    const [loading, setLoading] = useState(true)
    const [filterStatus, setFilterStatus] = useState('')
    const [filterDate, setFilterDate] = useState('')
    const [filterResource, setFilterResource] = useState('')
    const [showRejectModal, setShowRejectModal] = useState(false)
    const [selectedBooking, setSelectedBooking] = useState(null)
    const [rejectReason, setRejectReason] = useState('')
    
    useEffect(() => {
        loadData()
    }, [])
    
    const loadData = async () => {
        setLoading(true)
        try {
            const [bookingsRes, resourcesRes] = await Promise.all([
                getAllBookings(),
                getAllResources()
            ])
            setBookings(bookingsRes.data)
            setResources(resourcesRes.data)
        } catch (error) {
            console.error('Error loading data:', error)
        } finally {
            setLoading(false)
        }
    }
    
    const applyFilters = async () => {
        setLoading(true)
        try {
            const response = await filterBookings(filterStatus || null, filterDate || null, filterResource || null)
            setBookings(response.data)
        } catch (error) {
            console.error('Error filtering bookings:', error)
        } finally {
            setLoading(false)
        }
    }
    
    const resetFilters = async () => {
        setFilterStatus('')
        setFilterDate('')
        setFilterResource('')
        await loadData()
    }
    
    const handleApprove = async (id) => {
        const confirmed = window.confirm('Approve this booking?')
        if (!confirmed) return
        
        try {
            await approveBooking(id)
            alert('Booking approved successfully')
            loadData()
        } catch (error) {
            console.error('Error approving booking:', error)
            alert(error.response?.data?.error || 'Failed to approve booking')
        }
    }
    
    const openRejectModal = (booking) => {
        setSelectedBooking(booking)
        setRejectReason('')
        setShowRejectModal(true)
    }
    
    const handleReject = async () => {
        if (!rejectReason.trim()) {
            alert('Please provide a reason for rejection')
            return
        }
        
        try {
            await rejectBooking(selectedBooking.id, rejectReason)
            alert('Booking rejected successfully')
            setShowRejectModal(false)
            loadData()
        } catch (error) {
            console.error('Error rejecting booking:', error)
            alert(error.response?.data?.error || 'Failed to reject booking')
        }
    }
    
    const getStatusBadgeClass = (status) => {
        switch(status) {
            case 'PENDING': return 'admin-status-pending'
            case 'APPROVED': return 'admin-status-approved'
            case 'REJECTED': return 'admin-status-rejected'
            case 'CANCELLED': return 'admin-status-cancelled'
            default: return ''
        }
    }
    
    if (loading) {
        return <div className="admin-booking-container"><p>Loading...</p></div>
    }
    
    return (
        <div className="admin-booking-container">
            <div className="admin-booking-header">
                <h1>Booking Management</h1>
                <p>Approve or reject booking requests</p>
            </div>
            
            <div className="filter-bar">
                <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                    <option value="">All Status</option>
                    <option value="PENDING">Pending</option>
                    <option value="APPROVED">Approved</option>
                    <option value="REJECTED">Rejected</option>
                    <option value="CANCELLED">Cancelled</option>
                </select>
                
                <input type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} />
                
                <select value={filterResource} onChange={(e) => setFilterResource(e.target.value)}>
                    <option value="">All Resources</option>
                    {resources.map(resource => (
                        <option key={resource.id} value={resource.id}>{resource.name}</option>
                    ))}
                </select>
                
                <button onClick={applyFilters} className="filter-btn">Apply Filters</button>
                <button onClick={resetFilters} className="reset-filter-btn">Reset</button>
            </div>
            
            <div className="admin-bookings-table-wrapper">
                <table className="admin-bookings-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>User</th>
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
                        {bookings.map(booking => (
                            <tr key={booking.id}>
                                <td>{booking.id}</td>
                                <td>{booking.userName}</td>
                                <td>{booking.resourceName}</td>
                                <td>{booking.date}</td>
                                <td>{booking.startTime} - {booking.endTime}</td>
                                <td className="purpose-cell">{booking.purpose}</td>
                                <td>{booking.attendees}</td>
                                <td>
                                    <span className={`admin-status-badge ${getStatusBadgeClass(booking.status)}`}>
                                        {booking.status}
                                    </span>
                                </td>
                                <td className="action-buttons">
                                    {booking.status === 'PENDING' && (
                                        <>
                                            <button onClick={() => handleApprove(booking.id)} className="admin-approve-btn">
                                                Approve
                                            </button>
                                            <button onClick={() => openRejectModal(booking)} className="admin-reject-btn">
                                                Reject
                                            </button>
                                        </>
                                    )}
                                    {booking.rejectReason && (
                                        <div className="reject-tooltip" title={booking.rejectReason}>
                                            ⓘ
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            
            {/* Reject Modal */}
            {showRejectModal && (
                <div className="modal-overlay" onClick={() => setShowRejectModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h3>Reject Booking</h3>
                        <p>Booking: <strong>{selectedBooking?.resourceName}</strong> by <strong>{selectedBooking?.userName}</strong></p>
                        <textarea 
                            placeholder="Reason for rejection..."
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            rows="4"
                        />
                        <div className="modal-buttons">
                            <button onClick={() => setShowRejectModal(false)} className="modal-cancel-btn">Cancel</button>
                            <button onClick={handleReject} className="modal-submit-btn">Confirm Reject</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}