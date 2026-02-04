import React, { useEffect, useState } from "react";
import { getStudents, deleteStudent } from "../firebase";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "../context/ToastContext";
import "./Students.css";

export default function Students() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { showToast } = useToast();

  useEffect(() => {
    async function load() {
      try {
        const data = await getStudents();
        setStudents(data);
      } catch (error) {
        console.error("Error loading students:", error);
        showToast("Failed to load students", "error");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [showToast]);

  async function handleDelete(e, id, name) {
    e.preventDefault();
    e.stopPropagation();
    
    if (!window.confirm(`Are you sure you want to delete ${name || "this student"}?`)) {
      return;
    }

    try {
      await deleteStudent(id);
      setStudents(prev => prev.filter(s => s.id !== id));
      showToast("Student deleted successfully", "success");
    } catch (error) {
      console.error("Error deleting student:", error);
      showToast("Failed to delete student", "error");
    }
  }

  if (loading) return <p>Loading students...</p>;

  return (
    <div className="students-page">
      <Link to="/">
        <button type="button" style={{ marginBottom: "20px" }}>Back to Dashboard</button>
      </Link>

      <h1>Students</h1>
      <Link to="/students/add">
        <button>+ Add Student</button>
      </Link>

      {students.length === 0 && <p>No students found.</p>}

      <div className="students-list">
        {students.map((s) => (
          <div key={s.id} className="student-card">
            <Link to={`/students/${s.id}`} style={{ textDecoration: "none", color: "inherit", flex: 1 }}>
              <h3>{s.name || "Unnamed Student"}</h3>
              <p>{s.phone || "No phone"}</p>
              <p>{s.transmission || "N/A"} transmission</p>
            </Link>
            <button 
              onClick={(e) => handleDelete(e, s.id, s.name)}
              style={{ marginTop: "10px", background: "#ef4444" }}
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
