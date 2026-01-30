import { Link } from "react-router-dom";
import "./Sidebar.css";

export default function Sidebar() {
  return (
    <div className="sidebar">
      <h2 className="logo">RoadMaster</h2>

      <nav>
        <Link to="/">Dashboard</Link>
        <Link to="/students">Students</Link>
        <Link to="/lessons">Lessons</Link>
        <Link to="/book-lesson">Book Lesson</Link>
        <Link to="/notifications">Notifications</Link>
      </nav>
    </div>
  );
}