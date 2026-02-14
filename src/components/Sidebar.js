import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";
import "./Sidebar.css";

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, userProfile, logout, isStudent } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const instructorLinks = [
    { to: "/", label: "Dashboard", icon: "H" },
    { to: "/students", label: "Students", icon: "S" },
    { to: "/lessons", label: "Lessons", icon: "L" },
    { to: "/book-lesson", label: "Book Lesson", icon: "+" },
    { to: "/important-notes", label: "Important Notes", icon: "N" },
    { to: "/tips", label: "Ravi's Tips", icon: "T" },
    { to: "/resources", label: "DVLA Resources", icon: "R" },
    { to: "/notifications", label: "Notifications", icon: "B" },
  ];

  const studentLinks = [
    { to: "/student-dashboard", label: "My Dashboard", icon: "H" },
    { to: "/lessons", label: "My Lessons", icon: "L" },
    { to: "/tips", label: "Ravi's Tips", icon: "T" },
    { to: "/resources", label: "DVLA Resources", icon: "R" },
    { to: "/road-notes", label: "Road Notes", icon: "N" },
    { to: "/notifications", label: "Notifications", icon: "B" },
  ];

  const links = isStudent ? studentLinks : instructorLinks;

  async function handleLogout() {
    await logout();
    navigate("/login");
  }

  return (
    <>
      {/* Mobile hamburger */}
      <button
        className="mobile-menu-btn"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label="Toggle menu"
      >
        {mobileOpen ? "X" : "="}
      </button>

      {/* Overlay for mobile */}
      {mobileOpen && (
        <div className="sidebar-overlay" onClick={() => setMobileOpen(false)} />
      )}

      <div className={`sidebar ${mobileOpen ? "sidebar-open" : ""}`}>
        <h2 className="logo">RoadMaster</h2>

        {/* User info */}
        {user && (
          <div className="sidebar-user">
            <div className="user-avatar">
              {user.email?.charAt(0).toUpperCase() || "U"}
            </div>
            <div className="user-info">
              <span className="user-role">{userProfile?.role || "User"}</span>
              <span className="user-email">{user.email}</span>
            </div>
          </div>
        )}

        <nav>
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={location.pathname === link.to ? "active" : ""}
              onClick={() => setMobileOpen(false)}
            >
              <span className="nav-icon">{link.icon}</span>
              {link.label}
            </Link>
          ))}
        </nav>

        <button className="logout-btn" onClick={handleLogout}>
          Sign Out
        </button>
      </div>
    </>
  );
}
