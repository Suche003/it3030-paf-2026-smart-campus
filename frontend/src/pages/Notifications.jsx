import { useEffect, useState } from "react";
import {
  getNotifications,
  markAsRead,
  deleteNotification
} from "../services/notificationService";
import "./Notification.css";

function Notifications() {

  const [notifications, setNotifications] = useState([]);


  useEffect(() => {
    loadNotifications();
  }, []);

 
  // LOAD NOTIFICATIONS

  const loadNotifications = async () => {
    try {
      const res = await getNotifications();
      setNotifications(res.data);
    } catch (err) {
      console.log("Error loading notifications", err);
    }
  };


  // MARK AS READ
  
  const handleRead = async (id) => {
    try {
      await markAsRead(id);
      loadNotifications();
    } catch (err) {
      console.log(err);
    }
  };

 
  // DELETE
  
  const handleDelete = async (id) => {
    try {
      await deleteNotification(id);
      loadNotifications();
    } catch (err) {
      console.log(err);
    }
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

          <small className="notification-date">
            {n.createdAt}
          </small>

          {/* MARK AS READ */}
          {!n.readStatus && (
            <button
              className="read-btn"
              onClick={() => handleRead(n.id)}
            >
              Mark as read
            </button>
          )}

          {/* DELETE */}
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