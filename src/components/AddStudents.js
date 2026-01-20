import { useState } from "react"
import { collection, addDoc } from "firebase/firestore"
import { db } from "../firebase"

function AddStudents() {
    console.log("AddStudents loaded")
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [notes, setNotes] = useState("")

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!name || !phone || !notes) {
      alert("Please fill all fields")
      return
    }

    try {
      await addDoc(collection(db, "roadmaster"), {
        name,
        phone,
        notes
      })

      setName("")
      setPhone("")
      setNotes("")
      alert("Student added successfully")
    } catch (error) {
      console.error("Error adding student:", error)
    }
  }

  return (
    <div style={{ padding: "20px" }}>
      <h2>Add Student</h2>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "10px", maxWidth: "300px" }}>
        <input
          type="text"
          placeholder="Student name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          type="text"
          placeholder="Phone number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />

        <textarea
          placeholder="Notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />

        <button type="submit">Add Student</button>
      </form>
    </div>
  )
}

export default AddStudents