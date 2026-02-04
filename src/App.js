import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import { ToastProvider } from "./context/ToastContext";
import { AuthProvider } from "./context/AuthContext";

// Auth Pages
import Login from "./pages/Login";
import Register from "./pages/Register";

// Instructor Pages
import Dashboard from "./pages/Dashboard";
import Students from "./pages/Students";
import AddStudent from "./pages/AddStudent";
import EditStudent from "./pages/EditStudent";
import StudentProfile from "./pages/StudentProfile";

import Lessons from "./pages/Lessons";
import LessonDetails from "./pages/LessonDetails";
import BookLesson from "./pages/BookLesson";

import NotificationCenter from "./pages/NotificationCenter";
import Resources from "./pages/Resources";
import Tips from "./pages/Tips";

// Student Pages
import StudentDashboard from "./pages/StudentDashboard";

import "./App.css";

function App() {
  return (
    <Router>
      <AuthProvider>
        <ToastProvider>
          <Sidebar />

          <div style={{ marginLeft: "240px", padding: "20px" }}>
              <Routes>

                {/* Auth Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Instructor Dashboard */}
                <Route path="/" element={<Dashboard />} />

                {/* Students */}
                <Route path="/students" element={<Students />} />
                <Route path="/students/add" element={<AddStudent />} />
                <Route path="/students/edit/:id" element={<EditStudent />} />
                <Route path="/students/:id" element={<StudentProfile />} />

                {/* Lessons */}
                <Route path="/lessons" element={<Lessons />} />
                <Route path="/lessons/:id" element={<LessonDetails />} />
                <Route path="/book-lesson" element={<BookLesson />} />

                {/* Resources & Tips */}
                <Route path="/resources" element={<Resources />} />
                <Route path="/tips" element={<Tips />} />

                {/* Notifications */}
                <Route path="/notifications" element={<NotificationCenter />} />

                {/* Student Dashboard */}
                <Route path="/student-dashboard" element={<StudentDashboard />} />

              </Routes>
          </div>
        </ToastProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
