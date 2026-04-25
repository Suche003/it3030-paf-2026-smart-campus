// frontend/src/services/bookingService.js
import API from './api';

export const getAllBookings = () => {
    console.log('📋 Calling getAllBookings API');
    return API.get('/bookings');
};

export const getMyBookings = () => {
    console.log('👤 Calling getMyBookings API');
    return API.get('/bookings/my');
};

export const getBookingById = (id) => {
    console.log(`🔍 Calling getBookingById API for ID: ${id}`);
    return API.get(`/bookings/${id}`);
};

export const createBooking = (bookingData) => {
    console.log('📝 Creating booking with data:', bookingData);
    return API.post('/bookings', bookingData);
};

export const updateBooking = (id, bookingData) => {
    console.log(`✏️ Updating booking ID: ${id}`, bookingData);
    return API.put(`/bookings/${id}`, bookingData);
};

export const approveBooking = (id, reason = null) => {
    const body = reason ? { reason } : {};
    console.log(`✅ Approving booking ID: ${id}`, body);
    return API.put(`/bookings/${id}/approve`, body);
};

export const rejectBooking = (id, reason) => {
    console.log(`❌ Rejecting booking ID: ${id}, Reason: ${reason}`);
    return API.put(`/bookings/${id}/reject`, { reason });
};

export const cancelBooking = (id) => {
    console.log(`🚫 Cancelling booking ID: ${id}`);
    return API.delete(`/bookings/${id}`);
};

export const getBookingsByStatus = (status) => {
    console.log(`🔍 Getting bookings by status: ${status}`);
    return API.get(`/bookings/status/${status}`);
};