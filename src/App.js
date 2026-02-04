import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import { ToastProvider } from "./context/ToastContext";
import { AuthProvider } from "./context/AuthContext";
import { SubscriptionProvider } from "./context/SubscriptionContext";

// Pages
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
import ImportantNotes from "./pages/ImportantNotes";
import Calendar from "./pages/Calendar";
import Login from "./pages/Login";
import Register from "./pages/Register";
import StudentDashboard from "./pages/StudentDashboard";
import PlayAndLearn from "./pages/PlayAndLearn";
import StudentCommunity from "./pages/StudentCommunity";
import InstructorCommunity from "./pages/InstructorCommunity";
import ExternalCommunities from "./pages/ExternalCommunities";
import Subscribe from "./pages/Subscribe";

import "./App.css";

function App() {
  return (
    <Router>
      <AuthProvider>
        <SubscriptionProvider>
          <ToastProvider>
            <Sidebar />

        <div style={{ marginLeft: "240px", padding: "20px" }}>
          <Routes>
            {/* Dashboard */}
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
            <Route path="/important-notes" element={<ImportantNotes />} />

            {/* Notifications */}
            <Route path="/notifications" element={<NotificationCenter />} />

            {/* Calendar */}
            <Route path="/calendar" element={<Calendar />} />

            {/* Auth */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/student-dashboard" element={<StudentDashboard />} />

            {/* Play & Learn */}
            <Route path="/play-and-learn" element={<PlayAndLearn />} />

            {/* Community */}
            <Route path="/student-community" element={<StudentCommunity />} />
            <Route path="/instructor-community" element={<InstructorCommunity />} />
            <Route path="/external-communities" element={<ExternalCommunities />} />

            {/* Subscription */}
            <Route path="/subscribe" element={<Subscribe />} />
          </Routes>
          </div>
        </ToastProvider>
        </SubscriptionProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
