import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useSubscription } from "../context/SubscriptionContext";
import "./Sidebar.css";

export default function Sidebar() {
  const location = useLocation();
  const auth = useAuth() || {};
  const { user } = auth;
  const { hasRoadMasterPlus } = useSubscription();

  const links = [
    { to: "/", label: "Dashboard", icon: "H" },
    { to: "/students", label: "Students", icon: "S" },
    { to: "/lessons", label: "Lessons", icon: "L" },
    { to: "/calendar", label: "Calendar", icon: "C" },
    { to: "/book-lesson", label: "Book Lesson", icon: "+" },
    { to: "/important-notes", label: "Important Notes", icon: "N" },
    { to: "/tips", label: "Ravi's Tips", icon: "T" },
    { to: "/resources", label: "DVLA Resources", icon: "R" },
    { to: "/notifications", label: "Notifications", icon: "B" },
  ];

  const premiumLinks = [
    { to: "/premium/play-and-learn", label: "Play & Learn", icon: "G" },
    { to: "/premium/second-before", label: "Second Before", icon: "S" },
  ];

  const communityLinks = user ? [
    ...(user?.role === "student" ? [
      { to: "/student-community", label: "Student Community", icon: "👥" }
    ] : []),
    ...(user?.role === "instructor" ? [
      { to: "/instructor-community", label: "Instructor Community", icon: "🏢" }
    ] : []),
    { to: "/external-communities", label: "External Communities", icon: "🌍" }
  ] : [];

  return (
    <div className="sidebar">
      <h2 className="logo">RoadMaster</h2>

      <nav>
        {links.map((link) => (
          <Link 
            key={link.to}
            to={link.to} 
            className={location.pathname === link.to ? "active" : ""}
          >
            <span className="nav-icon">{link.icon}</span>
            {link.label}
          </Link>
        ))}

        {/* RoadMaster+ Premium Section */}
        <hr style={{ margin: "15px 0", border: "none", borderTop: "1px solid #e5e7eb" }} />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 15px", marginBottom: "4px" }}>
          <span style={{ fontSize: "11px", fontWeight: "700", color: "#f59e0b", textTransform: "uppercase", letterSpacing: "0.5px" }}>
            RoadMaster+
          </span>
          {!hasRoadMasterPlus && (
            <span style={{
              fontSize: "9px",
              fontWeight: "600",
              background: "linear-gradient(135deg, #f59e0b, #f97316)",
              color: "white",
              padding: "2px 6px",
              borderRadius: "4px",
              textTransform: "uppercase"
            }}>
              PRO
            </span>
          )}
        </div>
        {premiumLinks.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className={location.pathname === link.to ? "active" : ""}
            style={{ paddingLeft: "25px" }}
          >
            <span className="nav-icon">{link.icon}</span>
            {link.label}
          </Link>
        ))}

        {communityLinks.length > 0 && (
          <>
            <hr style={{ margin: "15px 0", border: "none", borderTop: "1px solid #e5e7eb" }} />
            <div style={{ padding: "10px 0", fontSize: "11px", fontWeight: "600", color: "#999", textTransform: "uppercase", paddingLeft: "15px", marginBottom: "10px" }}>
              Community
            </div>
            {communityLinks.map((link) => (
              <Link 
                key={link.to}
                to={link.to} 
                className={location.pathname === link.to ? "active" : ""}
              >
                <span className="nav-icon">{link.icon}</span>
                {link.label}
              </Link>
            ))}
          </>
        )}
      </nav>
    </div>
  );
}
