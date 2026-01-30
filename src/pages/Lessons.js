import React, { useEffect, useState } from "react";
import { getLessons, deleteLesson } from "../firebase";
import { useNavigate, Link } from "react-router-dom";
import "./Lessons.css";

export default function Lessons() {
  const [lessons, setLessons] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    async function load() {
      const data = await getLessons();
      setLessons(data.sort((a, b) => b.timestamp - a.timestamp));
    }
    load();
  }, []);

  async function handleDelete(id) {
    await deleteLesson(id);
    setLessons(prev => prev.filter(l => l.id !== id));
  }

  return (
    <div className="lessons-container">
      <h1>Lessons</h1>
      <button onClick={() => navigate("/lessons/book")}>➕ Book Lesson</button>

      <div className="lessons-list">
        {lessons.map(lesson => (
          <div key={lesson.id} className="lesson-card">
            <h3>{lesson.studentName}</h3>
            <p>Date: {lesson.date}</p>
            <p>Time: {lesson.time}</p>
            <p>Instructor: {lesson.instructor}</p>

            <div className="actions">
              <Link to={`/lessons/${lesson.id}`}>View Details →</Link>
              <button onClick={() => handleDelete(lesson.id)}>🗑️ Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}