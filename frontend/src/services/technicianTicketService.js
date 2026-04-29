import axios from "axios";

const API = "http://localhost:8081/api/admin/tickets";

const authHeaders = () => {
  const token = localStorage.getItem("token");

  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

export const getMyTechTickets = (techId) =>
  axios.get(`${API}/tech/${techId}`, authHeaders());

export const updateTechStatus = (id, status) =>
  axios.put(`${API}/${id}/status?status=${status}`, {}, authHeaders());

export const addResolution = (id, note) =>
  axios.put(
    `${API}/${id}/resolve?note=${encodeURIComponent(note)}`,
    {},
    authHeaders()
  );

export const startWork = (id) =>
  axios.put(`${API}/${id}/status?status=IN_PROGRESS`, {}, authHeaders());