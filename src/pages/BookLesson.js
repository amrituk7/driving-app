import React, { useEffect, useState } from "react";
import { getStudents, addLesson, sendNotification } from "../firebase";
import { useNavigate } from "react-router-dom";

export default function BookLesson() {
  const [students, setStudents] = useState([]);
  const [studentId, setStudentId] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [instructor, setInstructor] = useState("");
  const [notes, setNotes] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    async function load() {
      const data = await getStudents();
      setStudents(data);
    }
    load();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();

    const student = students.find(s => s.id === studentId);

    await addLesson({
      studentId,
      studentName: student.name,
      date,
      time,
      instructor,
      notes
    });

    await sendNotification({
      title: "Lesson Booked",
      message: `Lesson booked for ${student.name} on ${date}`
    });

    navigate("/lessons");
  }

  return (
    <form onSubmit={handleSubmit}>
      <h1>Book Lesson</h1>

      <select value={studentId} onChange={e => setStudentId(e.target.value)}>
        <option value="">Select student</option>
        {students.map(s => (
          <option key={s.id} value={s.id}>{s.name}</option>
        ))}
      </select>

      <input type="date" value={date} onChange={e => setDate(e.target.value)} />
      <input type="time" value={time} onChange={e => setTime(e.target.value)} />
      <input placeholder="Instructor" value={instructor} onChange={e => setInstructor(e.target.value)} />
      <textarea placeholder="Notes" value={notes} onChange={e => setNotes(e.target.value)} />

      <button type="submit">Book Lesson</button>
    </form>
  );
}