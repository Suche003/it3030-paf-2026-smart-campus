import { useEffect, useState } from "react";
import { getNotifications, markAsRead, deleteNotification } from "../services/notificationService";
import "./Notification.css";

function Notifications() {

  const [notifications, setNotifications] = useState([]);

  const email = localStorage.getItem("email");

  useEffect(() => {
    if (email) {
      loadNotifications();
    }
  }, [email]);

  const loadNotifications = async () => {
    try {
      const res = await getNotifications(email);
      setNotifications(res.data);
    } catch (err) {
      console.log("Error loading notifications", err);
    }
  };

  const handleRead = async (id) => {
    await markAsRead(id);
    loadNotifications();
  };

  const handleDelete = async (id) => {
    await deleteNotification(id);
    loadNotifications();
  };

  return (
    <div className="notifications-container">

      <h2 className="notifications-title">🔔 Notifications</h2>

      {notifications.length === 0 && (
        <p className="no-data">No notifications</p>
      )}

      {notifications.map((n) => (
        <div
          key={n.id}
          className={`notification-card ${n.readStatus ? "read" : ""}`}
        >

          <p className="notification-message">{n.message}</p>

          <small className="notification-date">{n.createdAt}</small>

          {/* MARK AS READ */}
          {!n.readStatus && (
            <button
              className="read-btn"
              onClick={() => handleRead(n.id)}
            >
              Mark as read
            </button>
          )}

          {/* DELETE BUTTON (ONLY AFTER READ) */}
          {n.readStatus && (
            <button
              className="delete-btn"
              onClick={() => handleDelete(n.id)}
            >
              Delete
            </button>
          )}

        </div>
      ))}

    </div>
  );
}

export default Notifications;