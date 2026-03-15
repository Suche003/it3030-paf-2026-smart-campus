import axios from "axios";

export const getNotifications = (email) => {

  const token = localStorage.getItem("token");

  return axios.get(
    `http://localhost:8081/api/notifications/${email}`,
    {
      headers: {
        Authorization: `Bearer ${token}` // 🔥 ADD THIS
      }
    }
  );
};

export const markAsRead = (id) => {

  const token = localStorage.getItem("token");

  return axios.put(
    `http://localhost:8081/api/notifications/read/${id}`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}` // 🔥 ADD THIS
      }
    }
  );
};

export const deleteNotification = (id) => {

  const token = localStorage.getItem("token");

  return axios.delete(
    `http://localhost:8081/api/notifications/${id}`,
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );
};