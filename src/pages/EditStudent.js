import React, { useEffect, useState } from "react";
import { getStudent, updateStudent, sendNotification } from "../firebase";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useToast } from "../context/ToastContext";

export default function EditStudent() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const found = await getStudent(id);
        if (!found) {
          showToast("Student not found", "error");
          navigate("/students");
          return;
        }
        setStudent(found);
      } catch (error) {
        console.error("Error loading student:", error);
        showToast("Failed to load student", "error");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id, showToast, navigate]);

  async function handleSubmit(e) {
    e.preventDefault();

    if (!student.name?.trim()) {
      showToast("Please enter a name", "error");
      return;
    }
    if (!student.phone?.trim()) {
      showToast("Please enter a phone number", "error");
      return;
    }

    setSaving(true);

    try {
      await updateStudent(id, {
        name: student.name.trim(),
        phone: student.phone.trim(),
        transmission: student.transmission || "manual",
        perfectDriver: student.perfectDriver || false,
        parkingPractice: student.parkingPractice || false
      });

      await sendNotification({
        title: "Student Updated",
        message: `${student.name}'s profile was updated`
      });

      showToast("Student updated successfully", "success");
      navigate(`/students/${id}`);
    } catch (error) {
      console.error("Error updating student:", error);
      showToast("Failed to update student", "error");
      setSaving(false);
    }
  }

  if (loading) return <p>Loading...</p>;
  if (!student) return <p>Student not found</p>;

  return (
    <div>
      <Link to={`/students/${id}`}>
        <button type="button" style={{ marginBottom: "20px" }}>Back to Profile</button>
      </Link>

      <form onSubmit={handleSubmit}>
        <h1>Edit Student</h1>

        <input
          placeholder="Name"
          value={student.name || ""}
          onChange={e => setStudent({ ...student, name: e.target.value })}
        />

        <input
          placeholder="Phone"
          value={student.phone || ""}
          onChange={e => setStudent({ ...student, phone: e.target.value })}
        />

        <select
          value={student.transmission || "manual"}
          onChange={e => setStudent({ ...student, transmission: e.target.value })}
        >
          <option value="manual">Manual</option>
          <option value="auto">Auto</option>
        </select>

        <label style={{ display: "block", margin: "10px 0" }}>
          <input
            type="checkbox"
            checked={student.perfectDriver || false}
            onChange={e => setStudent({ ...student, perfectDriver: e.target.checked })}
          />
          {" "}Perfect Driver
        </label>

        <label style={{ display: "block", margin: "10px 0" }}>
          <input
            type="checkbox"
            checked={student.parkingPractice || false}
            onChange={e => setStudent({ ...student, parkingPractice: e.target.checked })}
          />
          {" "}Parking Practice
        </label>

        <button type="submit" disabled={saving}>
          {saving ? "Saving..." : "Save"}
        </button>
      </form>
    </div>
  );
}
