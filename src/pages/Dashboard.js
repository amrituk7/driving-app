import React, { useEffect, useState } from "react";
import { getStudents } from "../firebase";
import "./Dashboard.css";

export default function Dashboard() {
  const [students, setStudents] = useState([]);
  const [total, setTotal] = useState(0);
  const [manual, setManual] = useState(0);
  const [auto, setAuto] = useState(0);
  const [perfect, setPerfect] = useState(0);
  const [parking, setParking] = useState(0);

  useEffect(() => {
    async function load() {
      const data = await getStudents();
      setStudents(data);

      setTotal(data.length);
      setManual(data.filter(s => s.transmission?.toLowerCase() === "manual").length);
      setAuto(data.filter(s => s.transmission?.toLowerCase() === "auto").length);
      setPerfect(data.filter(s => s.perfectDriver === true).length);
      setParking(data.filter(s => s.parkingPractice === true).length);
    }
    load();
  }, []);

  return (
    <div className="dashboard-container">
      <h1>Dashboard</h1>

      <div className="stats-grid">
        <div className="stat-box"><h3>Total Students</h3><p>{total}</p></div>
        <div className="stat-box"><h3>Manual Car Students</h3><p>{manual}</p></div>
        <div className="stat-box"><h3>Auto Learners</h3><p>{auto}</p></div>
        <div className="stat-box"><h3>Perfect Drivers</h3><p>{perfect}</p></div>
        <div className="stat-box"><h3>Parking Practice</h3><p>{parking}</p></div>
      </div>

      <h2>Recent Students</h2>
      <div className="recent-list">
        {students.slice(-5).reverse().map(s => (
          <div key={s.id} className="recent-card">
            <h4>{s.name}</h4>
            <p>{s.transmission || "N/A"} transmission</p>
          </div>
        ))}
      </div>
    </div>
  );
}