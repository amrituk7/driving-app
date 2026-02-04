import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import "./Sidebar.css";

export default function Sidebar() {
  const location = useLocation();
  const auth = useAuth() || {};
  const { user = null, userProfile = null, logout = () => {}, isInstructor = false, isStudent = false } = auth;

  const instructorLinks = [
    { to: "/", label: "Dashboard", icon: "home" },
    { to: "/students", label: "Students", icon: "users" },
    { to: "/lessons", label: "Lessons", icon: "calendar" },
    { to: "/book-lesson", label: "Book Lesson", icon: "plus" },
    { to: "/tips", label: "Ravi's Tips", icon: "lightbulb" },
    { to: "/resources", label: "DVLA Resources", icon: "link" },
    { to: "/notifications", label: "Notifications", icon: "bell" },
  ];

  const studentLinks = [
    { to: "/student-dashboard", label: "My Dashboard", icon: "home" },
    { to: "/tips", label: "Ravi's Tips", icon: "lightbulb" },
    { to: "/resources", label: "DVLA Resources", icon: "link" },
  ];

  const publicLinks = [
    { to: "/login", label: "Login", icon: "login" },
    { to: "/register", label: "Register", icon: "user-plus" },
  ];

  console.log("[v0] Sidebar rendering - user:", !!user, "isInstructor:", isInstructor);
  
  const links = user 
    ? (isInstructor ? instructorLinks : studentLinks)
    : publicLinks;

  return (
    <motion.div 
      className="sidebar"
      initial={{ x: -240 }}
      animate={{ x: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
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
        {links.map((link, index) => (
          <motion.div
            key={link.to}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Link 
              to={link.to} 
              className={location.pathname === link.to ? "active" : ""}
            >
              <NavIcon type={link.icon} />
              {link.label}
            </Link>
          </motion.div>
        ))}
      </nav>

      {user && (
        <motion.button 
          className="logout-btn"
          onClick={logout}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Sign Out
        </motion.button>
      )}
    </motion.div>
  );
}

function NavIcon({ type }) {
  const icons = {
    home: <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />,
    users: <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></>,
    calendar: <><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></>,
    plus: <><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></>,
    lightbulb: <><path d="M9 18h6" /><path d="M10 22h4" /><path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14" /></>,
    link: <><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></>,
    bell: <><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></>,
    login: <><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" /><polyline points="10 17 15 12 10 7" /><line x1="15" y1="12" x2="3" y2="12" /></>,
    "user-plus": <><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="8.5" cy="7" r="4" /><line x1="20" y1="8" x2="20" y2="14" /><line x1="23" y1="11" x2="17" y2="11" /></>
  };

  return (
    <svg 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="nav-icon"
    >
      {icons[type]}
    </svg>
  );
}
