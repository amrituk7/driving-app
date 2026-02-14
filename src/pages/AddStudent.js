import React, { useState } from "react";
import { addStudent, sendNotification, getStudents } from "../firebase";
import { useNavigate, Link } from "react-router-dom";
import { useToast } from "../context/ToastContext";

export default function AddStudent() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [transmission, setTransmission] = useState("");
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();
  const { showToast } = useToast();

  async function handleSubmit(e) {
    e.preventDefault();

    // Validation
    if (!name.trim()) {
      showToast("Please enter a name", "error");
      return;
    }
    if (!phone.trim()) {
      showToast("Please enter a phone number", "error");
      return;
    }
    if (!transmission) {
      showToast("Please select a transmission type", "error");
      return;
    }

    setSaving(true);

    try {
      const all = await getStudents();
      const exists = all.find(s => s.phone === phone);

      if (exists) {
        showToast("A student with this phone number already exists", "error");
        setSaving(false);
        return;
      }

      await addStudent({
        name: name.trim(),
        phone: phone.trim(),
        transmission,
        perfectDriver: false,
        parkingPractice: false
      });

      await sendNotification({
        title: "New Student Added",
        message: `${name} has been added`
      });

      showToast("Student added successfully", "success");
      navigate("/students");
    } catch (error) {
      console.error("Error adding student:", error);
      showToast("Failed to add student. Please try again.", "error");
      setSaving(false);
    }
  }

  return (
    <div>
      <Link to="/students">
        <button type="button" style={{ marginBottom: "20px" }}>Back to Students</button>
      </Link>

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

        <button type="submit" disabled={saving}>
          {saving ? "Saving..." : "Save"}
        </button>
      </form>
    </div>
  );
}
