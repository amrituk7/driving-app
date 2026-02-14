import { useParams, Link } from "react-router-dom";

function CarFeatures() {
  const { id } = useParams();

  const features = [
    { title: "Cockpit Drill", status: "Needs Practice" },
    { title: "Mirrors & Blind Spots", status: "Completed" },
    { title: "Steering Control", status: "Needs Practice" },
    { title: "Clutch Control", status: "Not Started" },
    { title: "Gears (1-5 + Reverse)", status: "Not Started" },
    { title: "Handbrake & Footbrake", status: "Completed" },
    { title: "Indicators & Signals", status: "Completed" },
    { title: "Reference Points", status: "Needs Practice" },
    { title: "Dashboard Warning Lights", status: "Not Started" },
    { title: "Tyres, Brakes, Fluids", status: "Not Started" },
    { title: "Show Me / Tell Me Questions", status: "Needs Practice" },
  ];

  const statusColor = (status) => {
    if (status === "Completed") return "#16a34a";
    if (status === "Needs Practice") return "#ca8a04";
    return "#6b7280";
  };

  return (
    <div style={{ padding: "24px", maxWidth: "900px", margin: "0 auto" }}>

      <Link to={`/students/${id}`} style={{ color: "#2563eb", textDecoration: "none" }}>
        &larr; Back to Profile
      </Link>

      <h1 style={{ fontSize: "28px", fontWeight: "600", marginTop: "16px" }}>Car & Features</h1>

      <p style={{ color: "#6b7280", marginBottom: "24px" }}>
        Everything the student needs to know about the car before and during driving.
      </p>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
        gap: "16px",
      }}>
        {features.map((item, index) => (
          <div key={index} style={{
            padding: "16px",
            border: "1px solid #e5e7eb",
            borderRadius: "12px",
            background: "white",
            cursor: "pointer",
            transition: "box-shadow 0.2s",
          }}>
            <h3 style={{ fontSize: "16px", fontWeight: "600", margin: "0 0 8px 0" }}>{item.title}</h3>
            <p style={{ color: statusColor(item.status), fontWeight: "500", margin: 0 }}>{item.status}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CarFeatures;
