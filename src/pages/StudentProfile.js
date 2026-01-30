import React, { useEffect, useState } from "react";
import { getStudents, sendMessage, getMessagesForStudent } from "../firebase";
import { useParams, Link } from "react-router-dom";

export default function StudentProfile() {
  const { id } = useParams();
  const [student, setStudent] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");

  useEffect(() => {
    async function load() {
      const all = await getStudents();
      const s = all.find(x => x.id === id);
      setStudent(s);

      const msgs = await getMessagesForStudent(id);
      setMessages(msgs.sort((a, b) => b.timestamp - a.timestamp));
    }
    load();
  }, [id]);

  async function handleSend() {
    if (!text.trim()) return;

    await sendMessage({
      sender: "instructor",
      receiver: id,
      text
    });

    setText("");

    const msgs = await getMessagesForStudent(id);
    setMessages(msgs.sort((a, b) => b.timestamp - a.timestamp));
  }

  if (!student) return <p>Loading...</p>;

  return (
    <div className="profile-container">
      <h1>{student.name}</h1>

      <p><strong>Phone:</strong> {student.phone}</p>
      <p><strong>Transmission:</strong> {student.transmission || "N/A"}</p>
      <p><strong>Perfect Driver:</strong> {student.perfectDriver ? "Yes" : "No"}</p>
      <p><strong>Parking Practice:</strong> {student.parkingPractice ? "Yes" : "No"}</p>

      <Link to={`/students/edit/${student.id}`}>
        <button>Edit Student</button>
      </Link>

      <h2>Messages</h2>

      <div className="messages-box">
        {messages.map(m => (
          <div key={m.id} className="message">
            <p>{m.text}</p>
            <small>{new Date(m.timestamp).toLocaleString()}</small>
          </div>
        ))}
      </div>

      <textarea
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="Send a message..."
      ></textarea>

      <button onClick={handleSend}>Send</button>
    </div>
  );
}