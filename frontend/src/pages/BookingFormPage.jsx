import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { createBooking, checkAvailability } from '../services/bookingService'
import { getAllResources } from '../services/resourceService'
import '../styles/BookingFormPage.css'

export default function BookingFormPage() {
    const navigate = useNavigate()
    const [resources, setResources] = useState([])
    const [loading, setLoading] = useState(false)
    const [checkingAvailability, setCheckingAvailability] = useState(false)
    const [isAvailable, setIsAvailable] = useState(null)
    
    // Get current user from localStorage
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}')
    
    const [formData, setFormData] = useState({
        userId: currentUser.id || 1,
        userName: currentUser.name || 'Student User',
        resourceId: '',
        date: '',
        startTime: '',
        endTime: '',
        purpose: '',
        attendees: 1
    })
    
    useEffect(() => {
        loadResources()
    }, [])
    
    const loadResources = async () => {
        try {
            const response = await getAllResources()
            setResources(response.data)
            console.log("Resources loaded:", response.data)
        } catch (error) {
            console.error('Error loading resources:', error)
            alert('Failed to load resources. Make sure backend is running on port 8081')
        }
    }
    
    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: name === 'attendees' ? parseInt(value) : value
        }))
        // Reset availability when any field changes
        setIsAvailable(null)
    }
    
    const handleCheckAvailability = async () => {
        console.log("Checking availability...")
        console.log("Form data:", formData)
        
        if (!formData.resourceId) {
            alert('Please select a resource')
            return
        }
        if (!formData.date) {
            alert('Please select a date')
            return
        }
        if (!formData.startTime) {
            alert('Please select start time')
            return
        }
        if (!formData.endTime) {
            alert('Please select end time')
            return
        }
        
        setCheckingAvailability(true)
        try {
            const response = await checkAvailability(
                formData.resourceId,
                formData.date,
                formData.startTime,
                formData.endTime
            )
            console.log("Availability response:", response.data)
            setIsAvailable(response.data.available)
            
            if (response.data.available) {
                alert('✅ Time slot is available! You can now submit your booking.')
            } else {
                alert('❌ This time slot is already booked. Please choose another time.')
            }
        } catch (error) {
            console.error('Error checking availability:', error)
            alert('Failed to check availability. Please try again.')
        } finally {
            setCheckingAvailability(false)
        }
    }
    
    const handleSubmit = async (e) => {
        e.preventDefault()
        
        console.log("Submit button clicked!")
        console.log("Form data:", formData)
        
        if (isAvailable !== true) {
            alert('Please check availability first! Click "Check Availability" button.')
            return
        }
        
        if (!formData.resourceId) {
            alert('Please select a resource')
            return
        }
        if (!formData.purpose) {
            alert('Please enter purpose')
            return
        }
        
        setLoading(true)
        try {
            const response = await createBooking(formData)
            console.log("Booking successful:", response.data)
            alert('✅ Booking request submitted successfully!')
            navigate('/my-bookings')
        } catch (error) {
            console.error('Error creating booking:', error)
            if (error.response) {
                alert(`❌ Failed: ${error.response.data.error || error.response.data.message || 'Unknown error'}`)
            } else if (error.request) {
                alert('❌ Backend server not running! Please start Spring Boot application on port 8081')
            } else {
                alert(`❌ Error: ${error.message}`)
            }
        } finally {
            setLoading(false)
        }
    }
    
    // Check if form has minimum required fields
    const canCheckAvailability = () => {
        return formData.resourceId && formData.date && formData.startTime && formData.endTime
    }
    
    return (
        <div className="booking-form-container">
            <div className="booking-form-header">
                <h1>📅 Book a Resource</h1>
                <p>Request to book a room, lab, or equipment</p>
            </div>
            
            <form onSubmit={handleSubmit} className="booking-form-card">
                <div className="form-group">
                    <label>Resource *</label>
                    <select 
                        name="resourceId" 
                        value={formData.resourceId} 
                        onChange={handleChange} 
                        required
                    >
                        <option value="">Select a resource</option>
                        {resources.map(resource => (
                            <option key={resource.id} value={resource.id}>
                                {resource.name} ({resource.type}) - Capacity: {resource.capacity}
                            </option>
                        ))}
                    </select>
                </div>
                
                <div className="form-group">
                    <label>Date *</label>
                    <input 
                        type="date" 
                        name="date" 
                        value={formData.date} 
                        onChange={handleChange} 
                        min={new Date().toISOString().split('T')[0]}
                        required 
                    />
                </div>
                
                <div className="time-row">
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
                
                <button 
                    type="button" 
                    onClick={handleCheckAvailability} 
                    className="check-btn"
                    disabled={checkingAvailability || !canCheckAvailability()}
                >
                    {checkingAvailability ? '⏳ Checking...' : '✓ Check Availability'}
                </button>
                
                {isAvailable === true && (
                    <div className="availability-msg available">
                        ✅ This time slot is available! You can submit your booking.
                    </div>
                )}
                
                {isAvailable === false && (
                    <div className="availability-msg not-available">
                        ❌ This time slot is already booked. Please choose another time.
                    </div>
                )}
                
                {isAvailable === null && canCheckAvailability() && (
                    <div className="availability-msg warning">
                        ⚠️ Please click "Check Availability" before submitting.
                    </div>
                )}
                
                <div className="form-group">
                    <label>Purpose *</label>
                    <textarea 
                        name="purpose" 
                        value={formData.purpose} 
                        onChange={handleChange} 
                        rows="3"
                        placeholder="What is this booking for?"
                        required 
                    />
                </div>
                
                <div className="form-group">
                    <label>Number of Attendees *</label>
                    <input 
                        type="number" 
                        name="attendees" 
                        value={formData.attendees} 
                        onChange={handleChange} 
                        min="1" 
                        max="500"
                        required 
                    />
                </div>
                
                <button 
                    type="submit" 
                    className="submit-btn" 
                    disabled={loading || isAvailable !== true}
                >
                    {loading ? 'Submitting...' : 'Submit Booking Request'}
                </button>
            </form>
        </div>
    )
}