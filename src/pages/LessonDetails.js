import React, { useEffect, useState } from "react";
import { getLessons } from "../firebase";
import { useParams } from "react-router-dom";
import "./LessonDetails.css";

export default function LessonDetails() {
  const { id } = useParams();
  const [lesson, setLesson] = useState(null);

  useEffect(() => {
    async function load() {
      const all = await getLessons();
      const found = all.find(l => l.id === id);
      setLesson(found);
    }
    load();
  }, [id]);

  if (!lesson) return <p>Loading...</p>;

  return (
    <div className="lesson-details">
      <h1>Lesson Details</h1>

      <p><strong>Student:</strong> {lesson.studentName}</p>
      <p><strong>Date:</strong> {lesson.date}</p>
      <p><strong>Time:</strong> {lesson.time}</p>
      <p><strong>Instructor:</strong> {lesson.instructor}</p>
      <p><strong>Notes:</strong> {lesson.notes || "None"}</p>
    </div>
  );
}