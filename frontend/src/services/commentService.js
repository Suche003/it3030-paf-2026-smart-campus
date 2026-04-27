import axios from "axios";

const API = "http://localhost:8081/api/comments";

export const addComment = (ticketId, data) =>
  axios.post(`${API}/ticket/${ticketId}`, {
    text: data.text,
    userId: data.userId
  });

export const getCommentsByTicket = (ticketId) =>
  axios.get(`${API}/ticket/${ticketId}`);

export const updateComment = (id, data) =>
  axios.put(`${API}/${id}`, data);

export const deleteComment = (id) =>
  axios.delete(`${API}/${id}`);