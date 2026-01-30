import React, { useEffect, useState } from "react";
import { getStudents } from "../firebase";
import { Link } from "react-router-dom";
import "./Students.css";

export default function Students() {
  const [students, setStudents] = useState([]);

  useEffect(() => {
    async function load() {
      const data = await getStudents();
      setStudents(data);
    }
    load();
  }, []);

  return (
    <div className="students-page">
      <h1>Students</h1>

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