import axios from "axios";

const API = "http://localhost:8081/api/admin/tickets";

// Get tickets assigned to technician
export const getMyTechTickets = (techId) =>
  axios.get(`${API}/tech/${techId}`);

// Update status
export const updateTechStatus = (id, status) =>
  axios.put(`${API}/${id}/status?status=${status}`);

// Add resolution note
export const addResolution = (id, note) =>
  axios.put(`${API}/${id}/resolve?note=${note}`);

// Start work (shortcut)
export const startWork = (id) =>
  axios.put(`${API}/${id}/status?status=IN_PROGRESS`);