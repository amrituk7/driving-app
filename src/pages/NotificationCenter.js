import React, { useEffect, useState } from "react";
import { getNotifications, markNotificationRead } from "../firebase";
import "./NotificationCenter.css";

export default function NotificationCenter() {
  const [list, setList] = useState([]);

  useEffect(() => {
    async function load() {
      const data = await getNotifications();
      setList(data.sort((a, b) => b.timestamp - a.timestamp));
    }
    load();
  }, []);

  async function handleRead(id) {
    await markNotificationRead(id);
    setList(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
  }

  return (
    <div className="notification-container">
      <h1>Notifications</h1>

      {list.map(n => (
        <div key={n.id} className={`note ${n.read ? "read" : "unread"}`}>
          <h3>{n.title}</h3>
          <p>{n.message}</p>
          <small>{new Date(n.timestamp).toLocaleString()}</small>

          {!n.read && (
            <button onClick={() => handleRead(n.id)}>Mark as read</button>
          )}
        </div>
      ))}
    </div>
  );
}