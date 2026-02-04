import React, { useEffect, useState } from "react";
import { getStudent, sendMessage, getMessagesForStudent, deleteStudent } from "../firebase";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useToast } from "../context/ToastContext";

export default function StudentProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  
  const [student, setStudent] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const s = await getStudent(id);
        if (!s) {
          showToast("Student not found", "error");
          navigate("/students");
          return;
        }
        setStudent(s);

        const msgs = await getMessagesForStudent(id);
        setMessages(msgs.sort((a, b) => b.timestamp - a.timestamp));
      } catch (error) {
        console.error("Error loading student:", error);
        showToast("Failed to load student", "error");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id, showToast, navigate]);

  async function handleSend() {
    if (!text.trim()) return;

    setSending(true);
    try {
      await sendMessage({
        sender: "instructor",
        receiver: id,
        text: text.trim()
      });

      setText("");
      showToast("Message sent", "success");

      const msgs = await getMessagesForStudent(id);
      setMessages(msgs.sort((a, b) => b.timestamp - a.timestamp));
    } catch (error) {
      console.error("Error sending message:", error);
      showToast("Failed to send message", "error");
    } finally {
      setSending(false);
    }
  }

  async function handleDelete() {
    if (!window.confirm(`Are you sure you want to delete ${student?.name || "this student"}?`)) {
      return;
    }

    try {
      await deleteStudent(id);
      showToast("Student deleted successfully", "success");
      navigate("/students");
    } catch (error) {
      console.error("Error deleting student:", error);
      showToast("Failed to delete student", "error");
    }
  }

  if (loading) return <p>Loading...</p>;
  if (!student) return <p>Student not found</p>;

  return (
    <div className="profile-container">
      <Link to="/students">
        <button type="button" style={{ marginBottom: "20px" }}>Back to Students</button>
      </Link>

      <h1>{student.name || "Unnamed Student"}</h1>

      <p><strong>Phone:</strong> {student.phone || "N/A"}</p>
      <p><strong>Transmission:</strong> {student.transmission || "N/A"}</p>
      <p><strong>Perfect Driver:</strong> {student.perfectDriver ? "Yes" : "No"}</p>
      <p><strong>Parking Practice:</strong> {student.parkingPractice ? "Yes" : "No"}</p>

      <div style={{ display: "flex", gap: "10px", marginTop: "15px", marginBottom: "20px" }}>
        <Link to={`/students/edit/${student.id}`}>
          <button>Edit Student</button>
        </Link>
        <Link to={`/lessons?studentId=${student.id}`}>
          <button>View Lessons</button>
        </Link>
        <button onClick={handleDelete} style={{ background: "#ef4444" }}>
          Delete Student
        </button>
      </div>

      <h2>Messages</h2>

      <div className="messages-box" style={{ maxHeight: "300px", overflowY: "auto", marginBottom: "15px" }}>
        {messages.length === 0 && <p>No messages yet.</p>}
        {messages.map(m => (
          <div key={m.id} className="message" style={{ padding: "10px", borderBottom: "1px solid #eee" }}>
            <p>{m.text || ""}</p>
            <small>{m.timestamp ? new Date(m.timestamp).toLocaleString() : "Unknown time"}</small>
          </div>
        ))}
      </div>

      <textarea
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="Send a message..."
        style={{ width: "100%", minHeight: "80px" }}
      ></textarea>

      <button onClick={handleSend} disabled={sending || !text.trim()}>
        {sending ? "Sending..." : "Send"}
      </button>
    </div>
  );
}
