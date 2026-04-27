import axios from "axios";

const API = "http://localhost:8081/api/tickets";
const ADMIN_API = "http://localhost:8081/api/admin/tickets";

// STUDENT APIs

export const createTicket = (data) => axios.post(API, data);

export const getTickets = () => axios.get(API);

export const getStudentTickets = (studentId) =>
  axios.get(`${API}/student/${studentId}`);

export const updateTicket = (id, data) =>
  axios.put(`${API}/${id}`, data);

export const deleteTicket = (id) =>
  axios.delete(`${API}/${id}`);


// ADMIN APIs

export const getAllAdminTickets = () =>
  axios.get(ADMIN_API);

export const assignTech = (id, techId, techName) =>
  axios.put(
    `${ADMIN_API}/${id}/assign?techId=${techId}&techName=${techName}`
  );

export const updateStatus = (id, status) =>
  axios.put(
    `${ADMIN_API}/${id}/status?status=${status}`
  );

export const resolveTicket = (id, note) =>
  axios.put(
    `${ADMIN_API}/${id}/resolve?note=${note}`
  );

export const rejectTicket = (id, reason) =>
  axios.put(
    `${ADMIN_API}/${id}/reject?reason=${reason}`
  );