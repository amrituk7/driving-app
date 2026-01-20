import { useEffect, useState } from "react"
import { collection, onSnapshot } from "firebase/firestore"
import { db } from "../firebase"

function Students() {
  const [students, setStudents] = useState([])

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "roadmaster"),
      (snapshot) => {
        const list = snapshot.docs.map((doc) => {
          const data = doc.data()
          console.log("Student:", data) // Debug each student
          return {
            id: doc.id,
            ...data
          }
        })
        setStudents(list)
      },
      (error) => {
        console.error("Firestore error:", error)
      }
    )

    return () => unsubscribe()
  }, [])

  return (
    <div style={{ padding: "20px" }}>
      <h2>Student List</h2>

      {students.length === 0 ? (
        <p>No students found.</p>
      ) : (
        <ul>
          {students.map((student) => (
            <li key={student.id}>
              {student.name ? student.name : "Unnamed"} — {student.phone} — {student.notes}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default Students
