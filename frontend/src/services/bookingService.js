import axios from 'axios'

const API_URL = 'http://localhost:8081/api/bookings'

// Create new booking
export const createBooking = (bookingData) => axios.post(API_URL, bookingData)

// Get all bookings (admin)
export const getAllBookings = () => axios.get(API_URL)

// Get user's bookings
export const getUserBookings = (userId) => axios.get(`${API_URL}/user/${userId}`)

// Get single booking
export const getBookingById = (id) => axios.get(`${API_URL}/${id}`)

// Update booking (edit)
export const updateBooking = (id, bookingData) => axios.put(`${API_URL}/${id}`, bookingData)

// Approve booking
export const approveBooking = (id) => axios.put(`${API_URL}/${id}/approve`)

// Reject booking
export const rejectBooking = (id, reason) => axios.put(`${API_URL}/${id}/reject`, { reason })

// Cancel booking
export const cancelBooking = (id) => axios.put(`${API_URL}/${id}/cancel`)

// Filter bookings
export const filterBookings = (status, date, resourceId) => {
    let url = `${API_URL}/filter?`
    if (status) url += `status=${status}&`
    if (date) url += `date=${date}&`
    if (resourceId) url += `resourceId=${resourceId}&`
    return axios.get(url)
}

// Check availability
export const checkAvailability = (resourceId, date, startTime, endTime) => 
    axios.get(`${API_URL}/check-availability`, {
        params: { resourceId, date, startTime, endTime }
    })