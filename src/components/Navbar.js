import React from "react";
import { Link } from "react-router-dom";


export default function Navbar() {
  return (
    <nav className="nav-links">
      <Link to="/students">Students</Link>
      <Link to="/add-student">Add Student</Link>
      <Link to="/dashboard">Dashboard</Link>
      <Link to="/book-lesson">Book Lesson</Link>
      <Link to="/road-notes">Ravi’s Road Notes</Link>
    </nav>
  );
}
