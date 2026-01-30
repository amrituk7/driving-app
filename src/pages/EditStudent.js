import React, { useEffect, useState } from "react";
import { getStudents, updateStudent, sendNotification } from "../firebase";
import { useParams, useNavigate } from "react-router-dom";

export default function EditStudent() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [student, setStudent] = useState(null);

  useEffect(() => {
    async function load() {
      const all = await getStudents();
      const found = all.find(s => s.id === id);
      setStudent(found);
    }
    load();
  }, [id]);

  async function handleSubmit(e) {
    e.preventDefault();

    await updateStudent(id, student);

    await sendNotification({
      title: "Student Updated",
      message: `${student.name}'s profile was updated`
    });

    navigate("/students");
  }

  if (!student) return <p>Loading...</p>;

  return (
    <form onSubmit={handleSubmit}>
      <h1>Edit Student</h1>

      <input
        value={student.name}
        onChange={e => setStudent({ ...student, name: e.target.value })}
      />

      <input
        value={student.phone}
        onChange={e => setStudent({ ...student, phone: e.target.value })}
      />

      <select
        value={student.transmission}
        onChange={e => setStudent({ ...student, transmission: e.target.value })}
      >
        <option value="manual">Manual</option>
        <option value="auto">Auto</option>
      </select>

      <button type="submit">Save</button>
    </form>
  );
}