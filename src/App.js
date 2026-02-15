import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import PrivateRoute from "./components/PrivateRoute";
import Sidebar from "./components/Sidebar";

// Public pages
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";

// Instructor pages
import Dashboard from "./pages/Dashboard";
import Students from "./pages/Students";
import AddStudent from "./pages/AddStudent";
import EditStudent from "./pages/EditStudent";
import StudentProfile from "./pages/StudentProfile";
import FilteredStudents from "./pages/FilteredStudents";

// Lesson pages
import Lessons from "./pages/Lessons";
import LessonDetails from "./pages/LessonDetails";
import BookLesson from "./pages/BookLesson";
import BookLessons from "./pages/BookLessons";

// Student pages
import StudentDashboard from "./pages/StudentDashboard";
import InstructorProfile from "./pages/InstructorProfile";

// Resource pages
import Resources from "./pages/Resources";
import Tips from "./pages/Tips";
import ImportantNotes from "./pages/ImportantNotes";
import RoadNotes from "./pages/RoadNotes";

// Detail pages
import CarDetails from "./pages/CarDetails";
import CarFeatures from "./pages/CarFeatures";
import PaymentDetails from "./pages/PaymentDetails";
import TestDetails from "./pages/TestDetails";

// Notifications
import NotificationCenter from "./pages/NotificationCenter";

function AppLayout() {
  const location = useLocation();
  const publicPaths = ["/", "/auth"];
  const isPublicPage = publicPaths.includes(location.pathname);

  if (isPublicPage) {
    return (
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/auth" element={<Auth />} />
      </Routes>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 lg:ml-64">
        <div className="p-4 pt-16 lg:pt-4 lg:p-6">
          <Routes>
            <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />

            <Route path="/students" element={<PrivateRoute><Students /></PrivateRoute>} />
            <Route path="/students/add" element={<PrivateRoute><AddStudent /></PrivateRoute>} />
            <Route path="/students/edit/:id" element={<PrivateRoute><EditStudent /></PrivateRoute>} />
            <Route path="/students/:id" element={<PrivateRoute><StudentProfile /></PrivateRoute>} />
            <Route path="/students/filter/:filter" element={<PrivateRoute><FilteredStudents /></PrivateRoute>} />

            <Route path="/lessons" element={<PrivateRoute><Lessons /></PrivateRoute>} />
            <Route path="/lessons/:id" element={<PrivateRoute><LessonDetails /></PrivateRoute>} />
            <Route path="/book-lesson" element={<PrivateRoute><BookLesson /></PrivateRoute>} />
            <Route path="/book-lessons" element={<PrivateRoute><BookLessons /></PrivateRoute>} />

            <Route path="/student-dashboard" element={<PrivateRoute><StudentDashboard /></PrivateRoute>} />
            <Route path="/instructor-profile" element={<PrivateRoute><InstructorProfile /></PrivateRoute>} />

            <Route path="/resources" element={<PrivateRoute><Resources /></PrivateRoute>} />
            <Route path="/tips" element={<PrivateRoute><Tips /></PrivateRoute>} />
            <Route path="/important-notes" element={<PrivateRoute><ImportantNotes /></PrivateRoute>} />
            <Route path="/road-notes" element={<PrivateRoute><RoadNotes /></PrivateRoute>} />

            <Route path="/car-details" element={<PrivateRoute><CarDetails /></PrivateRoute>} />
            <Route path="/car-features/:id" element={<PrivateRoute><CarFeatures /></PrivateRoute>} />
            <Route path="/payment-details" element={<PrivateRoute><PaymentDetails /></PrivateRoute>} />
            <Route path="/test-details" element={<PrivateRoute><TestDetails /></PrivateRoute>} />

            <Route path="/notifications" element={<PrivateRoute><NotificationCenter /></PrivateRoute>} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

export default function App() {
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
