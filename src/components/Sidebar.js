import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Sidebar.css";

export default function Sidebar() {
  const { user, userProfile, logout, isInstructor, isStudent } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const closeMobile = () => setMobileOpen(false);

  const initial = user?.email ? user.email.charAt(0).toUpperCase() : "?";

  return (
    <>
      <button
        className="mobile-menu-btn"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label="Toggle menu"
      >
        {mobileOpen ? "\u2715" : "\u2630"}
      </button>

      {mobileOpen && (
        <div className="sidebar-overlay" onClick={closeMobile} />
      )}

      <aside className={`sidebar ${mobileOpen ? "sidebar-open" : ""}`}>
        <div className="logo">RoadMaster</div>

        <div className="sidebar-user">
          <div className="user-avatar">{initial}</div>
          <div className="user-info">
            <span className="user-role">
              {userProfile?.role || "User"}
            </span>
            <span className="user-email">{user?.email}</span>
          </div>
        </div>

        <nav>
          {/* Instructor Links */}
          {(!userProfile || isInstructor) && (
            <>
              <NavLink to="/" onClick={closeMobile} end>
                <span className="nav-icon">&#x1f3e0;</span> Dashboard
              </NavLink>
              <NavLink to="/students" onClick={closeMobile}>
                <span className="nav-icon">&#x1f465;</span> Students
              </NavLink>
              <NavLink to="/lessons" onClick={closeMobile}>
                <span className="nav-icon">&#x1f4d6;</span> Lessons
              </NavLink>
              <NavLink to="/book-lesson" onClick={closeMobile}>
                <span className="nav-icon">&#x1f4c5;</span> Book Lesson
              </NavLink>
            </>
          )}

          {/* Student Links */}
          {isStudent && (
            <>
              <NavLink to="/student-dashboard" onClick={closeMobile}>
                <span className="nav-icon">&#x1f3e0;</span> My Dashboard
              </NavLink>
              <NavLink to="/book-lessons" onClick={closeMobile}>
                <span className="nav-icon">&#x1f4c5;</span> Book Lessons
              </NavLink>
              <NavLink to="/instructor-profile" onClick={closeMobile}>
                <span className="nav-icon">&#x1f464;</span> My Instructor
              </NavLink>
            </>
          )}

          {/* Common Links */}
          <NavLink to="/resources" onClick={closeMobile}>
            <span className="nav-icon">&#x1f4da;</span> Resources
          </NavLink>
          <NavLink to="/tips" onClick={closeMobile}>
            <span className="nav-icon">&#x1f4a1;</span> Tips
          </NavLink>
          <NavLink to="/notifications" onClick={closeMobile}>
            <span className="nav-icon">&#x1f514;</span> Notifications
          </NavLink>
        </nav>

        <button className="logout-btn" onClick={handleLogout}>
          Sign Out
        </button>
      </aside>
    </>
  );
}
