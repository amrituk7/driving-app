import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import PrivateRoute from "./components/PrivateRoute";
import Sidebar from "./components/Sidebar";

// Auth Pages
import Login from "./pages/Login";
import Register from "./pages/Register";

// Instructor Pages
import Dashboard from "./pages/Dashboard";
import Students from "./pages/Students";
import AddStudent from "./pages/AddStudent";
import EditStudent from "./pages/EditStudent";
import StudentProfile from "./pages/StudentProfile";
import FilteredStudents from "./pages/FilteredStudents";

// Lesson Pages
import Lessons from "./pages/Lessons";
import LessonDetails from "./pages/LessonDetails";
import BookLesson from "./pages/BookLesson";
import BookLessons from "./pages/BookLessons";

// Student Pages
import StudentDashboard from "./pages/StudentDashboard";
import InstructorProfile from "./pages/InstructorProfile";

// Resource Pages
import Resources from "./pages/Resources";
import Tips from "./pages/Tips";
import ImportantNotes from "./pages/ImportantNotes";
import RoadNotes from "./pages/RoadNotes";

// Detail Pages
import CarDetails from "./pages/CarDetails";
import CarFeatures from "./pages/CarFeatures";
import PaymentDetails from "./pages/PaymentDetails";
import TestDetails from "./pages/TestDetails";

// Notifications
import NotificationCenter from "./pages/NotificationCenter";

import "./App.css";

function AppLayout() {
  const location = useLocation();
  const authPages = ["/login", "/register"];
  const isAuthPage = authPages.includes(location.pathname);

  return (
    <>
      {!isAuthPage && <Sidebar />}
      <div className={isAuthPage ? "main-content-full" : "main-content"}>
        <Routes>
          {/* Public Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected - Instructor Dashboard */}
          <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />

          {/* Protected - Students */}
          <Route path="/students" element={<PrivateRoute><Students /></PrivateRoute>} />
          <Route path="/students/add" element={<PrivateRoute><AddStudent /></PrivateRoute>} />
          <Route path="/students/edit/:id" element={<PrivateRoute><EditStudent /></PrivateRoute>} />
          <Route path="/students/:id" element={<PrivateRoute><StudentProfile /></PrivateRoute>} />
          <Route path="/students/filter/:filter" element={<PrivateRoute><FilteredStudents /></PrivateRoute>} />

          {/* Protected - Lessons */}
          <Route path="/lessons" element={<PrivateRoute><Lessons /></PrivateRoute>} />
          <Route path="/lessons/:id" element={<PrivateRoute><LessonDetails /></PrivateRoute>} />
          <Route path="/book-lesson" element={<PrivateRoute><BookLesson /></PrivateRoute>} />
          <Route path="/book-lessons" element={<PrivateRoute><BookLessons /></PrivateRoute>} />

          {/* Protected - Student View */}
          <Route path="/student-dashboard" element={<PrivateRoute><StudentDashboard /></PrivateRoute>} />
          <Route path="/instructor-profile" element={<PrivateRoute><InstructorProfile /></PrivateRoute>} />

          {/* Protected - Resources */}
          <Route path="/resources" element={<PrivateRoute><Resources /></PrivateRoute>} />
          <Route path="/tips" element={<PrivateRoute><Tips /></PrivateRoute>} />
          <Route path="/important-notes" element={<PrivateRoute><ImportantNotes /></PrivateRoute>} />
          <Route path="/road-notes" element={<PrivateRoute><RoadNotes /></PrivateRoute>} />

          {/* Protected - Details */}
          <Route path="/car-details" element={<PrivateRoute><CarDetails /></PrivateRoute>} />
          <Route path="/car-features/:id" element={<PrivateRoute><CarFeatures /></PrivateRoute>} />
          <Route path="/payment-details" element={<PrivateRoute><PaymentDetails /></PrivateRoute>} />
          <Route path="/test-details" element={<PrivateRoute><TestDetails /></PrivateRoute>} />

          {/* Protected - Notifications */}
          <Route path="/notifications" element={<PrivateRoute><NotificationCenter /></PrivateRoute>} />
        </Routes>
      </div>
    </>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <ToastProvider>
          <AppLayout />
        </ToastProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
