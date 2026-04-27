import axios from "axios";

export const getNotifications = () => {

  const token = localStorage.getItem("token");

  return axios.get("http://localhost:8081/api/notifications", {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
};

export const markAsRead = (id) => {

  const token = localStorage.getItem("token");

  return axios.put(
    `http://localhost:8081/api/notifications/read/${id}`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`
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