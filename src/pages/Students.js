import React, { useEffect, useState } from "react";
import { getStudents } from "../firebase";
import { Link } from "react-router-dom";
import "./Students.css";

export default function Students() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await getStudents();
        setStudents(data);
      } catch (error) {
        console.error("Error loading students:", error);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <p>Loading students...</p>;

  return (
    <div className="students-page">
      <h1>Students</h1>
      <Link to="/students/add">
        <button>+ Add Student</button>
      </Link>

      {students.length === 0 && <p>No students found.</p>}

      <div className="students-list">
        {students.map((s) => (
          <Link key={s.id} to={`/students/${s.id}`} className="student-card">
            <h3>{s.name}</h3>
            <p>{s.phone}</p>
            <p>{s.transmission || "N/A"} transmission</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
