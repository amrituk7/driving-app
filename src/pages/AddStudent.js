import React, { useState } from "react";
import { addStudent, sendNotification, getStudents } from "../firebase";
import { useNavigate } from "react-router-dom";

export default function AddStudent() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [transmission, setTransmission] = useState("");
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();

    const all = await getStudents();
    const exists = all.find(s => s.phone === phone);

    if (exists) {
      alert("A student with this phone number already exists.");
      return;
    }

    await addStudent({
      name,
      phone,
      transmission,
      perfectDriver: false,
      parkingPractice: false
    });

    await sendNotification({
      title: "New Student Added",
      message: `${name} has been added`
    });

    navigate("/students");
  }

  return (
    <form onSubmit={handleSubmit}>
      <h1>Add Student</h1>

      <input
        placeholder="Name"
        value={name}
        onChange={e => setName(e.target.value)}
      />

      <input
        placeholder="Phone"
        value={phone}
        onChange={e => setPhone(e.target.value)}
      />

      <select
        value={transmission}
        onChange={e => setTransmission(e.target.value)}
      >
        <option value="">Select transmission</option>
        <option value="manual">Manual</option>
        <option value="auto">Auto</option>
      </select>

      <button type="submit">Save</button>
    </form>
  );
}