import axios from "axios";

const API = "http://localhost:8081/api/tickets";
const ADMIN_API = "http://localhost:8081/api/admin/tickets";

const authHeaders = () => {
  const token = localStorage.getItem("token");

  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

const multipartAuthHeaders = () => {
  const token = localStorage.getItem("token");

  return {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data",
    },
  };
};

// STUDENT APIs
export const createTicket = (data) =>
  axios.post(API, data, authHeaders());

export const createTicketWithImages = (formData) =>
  axios.post(`${API}/with-images`, formData, multipartAuthHeaders());

export const getTickets = () =>
  axios.get(API, authHeaders());

export const getStudentTickets = (studentId) =>
  axios.get(`${API}/student/${studentId}`, authHeaders());

export const updateTicket = (id, data) =>
  axios.put(`${API}/${id}`, data, authHeaders());

export const deleteTicket = (id) =>
  axios.delete(`${API}/${id}`, authHeaders());

// ADMIN APIs
export const getAllAdminTickets = () =>
  axios.get(ADMIN_API, authHeaders());

export const assignTech = (id, techId, techName) =>
  axios.put(
    `${ADMIN_API}/${id}/assign?techId=${techId}&techName=${techName}`,
    {},
    authHeaders()
  );

export const updateStatus = (id, status) =>
  axios.put(
    `${ADMIN_API}/${id}/status?status=${status}`,
    {},
    authHeaders()
  );

export const resolveTicket = (id, note) =>
  axios.put(
    `${ADMIN_API}/${id}/resolve?note=${encodeURIComponent(note)}`,
    {},
    authHeaders()
  );

export const rejectTicket = (id, reason) =>
  axios.put(
    `${ADMIN_API}/${id}/reject?reason=${encodeURIComponent(reason)}`,
    {},
    authHeaders()
  );

  export const getTechnicians = () =>
  axios.get(`${ADMIN_API}/technicians`, authHeaders());