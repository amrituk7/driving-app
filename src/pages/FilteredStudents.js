import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import { Link, useParams } from "react-router-dom";

function FilteredStudents() {
  const { filter } = useParams();
  const [students, setStudents] = useState([]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "roadmaster"), (snap) => {
      const arr = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

      let filtered = arr;

      if (filter === "active") {
        filtered = arr.filter((s) => s.status === "Active");
      } else if (filter === "booked") {
        filtered = arr.filter((s) => s.status === "Test Booked");
      } else if (filter === "passed") {
        filtered = arr.filter((s) => s.status === "Passed");
      }

      setStudents(filtered);
    });

    return () => unsub();
  }, [filter]);

  return (
    <div style={{ padding: "20px" }}>
      <h2>
        {filter === "active" && "Active Students"}
        {filter === "booked" && "Test Booked Students"}
        {filter === "passed" && "Passed Students"}
        {filter === "all" && "All Students"}
      </h2>

      <ul>
        {students.map((s) => (
          <li key={s.id}>
            <Link to={`/student/${s.id}`}>{s.name}</Link> — {s.status}
          </li>
        ))}
      </ul>

      <Link to="/dashboard">
        <button style={{ marginTop: "20px" }}>Back to Dashboard</button>
      </Link>
    </div>
  );
}

export default FilteredStudents;