import { Link } from "react-router-dom";


export default function NavBar() {
  return (
    <nav className="nav">
      <Link to="/">Dashboard</Link>
      <Link to="/students">Students</Link>
      <Link to="/lessons">Lessons</Link>
      <Link to="/notifications">Notifications</Link>
      <Link to="/book-lesson">Book Lesson</Link>
    </nav>
  );
}
