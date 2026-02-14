import { Link } from "react-router-dom";

function RoadNotes() {
  const cardStyle = {
    padding: "20px",
    border: "1px solid #e5e7eb",
    borderRadius: "12px",
    cursor: "pointer",
    transition: "box-shadow 0.2s",
    background: "white",
  };

  const sections = [
    {
      title: "Parking Skills",
      items: [
        "Bay Parking (Left & Right)",
        "Parallel Parking",
        "Pull Up on the Right",
        "Reverse Around a Corner",
        "Reference Points for Parking",
      ],
    },
    {
      title: "Driving Skills",
      items: [
        "Moving Off Safely",
        "Junctions (Left, Right, T-Junctions)",
        "Roundabouts (Mini & Large)",
        "Lane Discipline",
        "Speed Control",
        "Mirrors-Signal-Position-Speed-Look",
      ],
    },
    {
      title: "Instructor Tips",
      items: [
        "Look early, plan early, act early",
        "Use reference points for accuracy",
        "Stay calm and breathe before manoeuvres",
        "Always check blind spots before moving",
        "Smooth steering > fast steering",
      ],
    },
  ];

  return (
    <div style={{ padding: "24px", maxWidth: "768px", margin: "0 auto" }}>

      <Link to="/" style={{ color: "#2563eb", textDecoration: "none" }}>
        &larr; Back to Dashboard
      </Link>

      <h1 style={{ fontSize: "28px", fontWeight: "600", marginTop: "16px" }}>Ravi's Road Notes</h1>
      <p style={{ color: "#6b7280", marginBottom: "32px" }}>
        A collection of essential driving skills, parking techniques, and instructor tips.
      </p>

      {sections.map((section, index) => (
        <div key={index} style={{ marginBottom: "32px" }}>
          <h2 style={{ fontSize: "22px", fontWeight: "600", marginBottom: "16px" }}>{section.title}</h2>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
            gap: "16px",
          }}>
            {section.items.map((item, i) => (
              <div key={i} style={cardStyle}>
                <p style={{ fontWeight: "500", margin: 0 }}>{item}</p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default RoadNotes;
