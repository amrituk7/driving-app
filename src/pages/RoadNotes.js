import { Link } from "react-router-dom";

function RoadNotes() {
  const card =
    "p-5 border border-gray-200 rounded-xl hover:shadow-md transition cursor-pointer";

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
        "Junctions (Left, Right, T‑Junctions)",
        "Roundabouts (Mini & Large)",
        "Lane Discipline",
        "Speed Control",
        "Mirrors–Signal–Position–Speed–Look",
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
    <div className="p-6 space-y-8 max-w-3xl mx-auto">

      <Link to="/dashboard" className="text-blue-600">
        ← Back to Dashboard
      </Link>

      <h1 className="text-3xl font-semibold">Ravi’s Road Notes</h1>
      <p className="text-gray-600">
        A collection of essential driving skills, parking techniques, and instructor tips.
      </p>

      {/* Sections */}
      {sections.map((section, index) => (
        <div key={index} className="space-y-4">
          <h2 className="text-2xl font-semibold">{section.title}</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {section.items.map((item, i) => (
              <div key={i} className={card}>
                <p className="font-medium">{item}</p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default RoadNotes;