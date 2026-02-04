import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Sidebar.css";

export default function Sidebar() {
  const location = useLocation();
  const auth = useAuth() || {};
  const { user = null, userProfile = null, logout = () => {}, isInstructor = false } = auth;

  const instructorLinks = [
    { to: "/", label: "Dashboard", icon: "H" },
    { to: "/students", label: "Students", icon: "S" },
    { to: "/lessons", label: "Lessons", icon: "L" },
    { to: "/book-lesson", label: "Book Lesson", icon: "+" },
    { to: "/tips", label: "Ravi's Tips", icon: "T" },
    { to: "/resources", label: "DVLA Resources", icon: "R" },
    { to: "/notifications", label: "Notifications", icon: "N" },
  ];

  const studentLinks = [
    { to: "/student-dashboard", label: "My Dashboard", icon: "H" },
    { to: "/tips", label: "Ravi's Tips", icon: "T" },
    { to: "/resources", label: "DVLA Resources", icon: "R" },
  ];

  const publicLinks = [
    { to: "/login", label: "Login", icon: "L" },
    { to: "/register", label: "Register", icon: "R" },
  ];

  const links = user 
    ? (isInstructor ? instructorLinks : studentLinks)
    : publicLinks;

  return (
    <div className="sidebar">
      <h2 className="logo">RoadMaster</h2>

      {user && userProfile && (
        <div className="sidebar-user">
          <div className="user-avatar">
            {userProfile.email?.charAt(0).toUpperCase() || "U"}
          </div>
          <div className="user-info">
            <span className="user-role">{userProfile.role || "User"}</span>
            <span className="user-email">{userProfile.email || ""}</span>
          </div>
        </div>
      )}

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
      </nav>

      {user && (
        <button className="logout-btn" onClick={logout}>
          Sign Out
        </button>
      )}
    </div>
  );
}
