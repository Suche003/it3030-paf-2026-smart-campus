import API from "./api";

const TEST_BOOKING_URL = "/test/bookings";

export const createBooking = (resourceId, userId, data) =>
  API.post(`${TEST_BOOKING_URL}?resourceId=${resourceId}&userId=${userId}`, data);

export const getMyBookings = (userId) =>
  API.get(`${TEST_BOOKING_URL}/my?userId=${userId}`);

export const getPendingBookings = () =>
  API.get(`${TEST_BOOKING_URL}/pending`);

export const approveBooking = (id, reviewNote = "Approved") =>
  API.put(`${TEST_BOOKING_URL}/${id}/approve?reviewNote=${encodeURIComponent(reviewNote)}`);

export const rejectBooking = (id, reviewNote = "Rejected") =>
  API.put(`${TEST_BOOKING_URL}/${id}/reject?reviewNote=${encodeURIComponent(reviewNote)}`);

export const getUnavailableResourceIds = (bookingDate, startTime, endTime) =>
  API.get(
    `${TEST_BOOKING_URL}/unavailable-resources?bookingDate=${bookingDate}&startTime=${startTime}&endTime=${endTime}`
  );