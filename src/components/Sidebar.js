import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  Car,
  LayoutDashboard,
  Users,
  BookOpen,
  CalendarPlus,
  Lightbulb,
  Bell,
  FolderOpen,
  GraduationCap,
  UserCircle,
  LogOut,
  Menu,
  X,
} from "lucide-react";

const linkClass = ({ isActive }) =>
  `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
    isActive
      ? "bg-primary-50 text-primary-700"
      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
  }`;

export default function Sidebar() {
  const { user, userProfile, logout, isInstructor, isStudent } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/auth");
  };

  const close = () => setOpen(false);
  const initial = user?.email ? user.email.charAt(0).toUpperCase() : "?";

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed top-4 left-4 z-50 lg:hidden w-10 h-10 bg-white rounded-xl border border-slate-200 shadow-sm flex items-center justify-center text-slate-600 hover:bg-slate-50"
        aria-label="Toggle menu"
      >
        {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Overlay */}
      {open && (
        <div className="fixed inset-0 z-40 bg-black/30 lg:hidden" onClick={close} />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 h-full w-64 bg-white border-r border-slate-200 flex flex-col transition-transform duration-300 lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo */}
        <div className="h-16 px-5 flex items-center gap-2 border-b border-slate-100">
          <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
            <Car className="w-4 h-4 text-white" />
          </div>
          <span className="text-lg font-bold text-slate-900">RoadMaster</span>
        </div>

        {/* User info */}
        <div className="px-4 py-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center text-sm font-bold">
              {initial}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-900 capitalize">
                {userProfile?.role || "User"}
              </p>
              <p className="text-xs text-slate-500 truncate">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-1">
          {(!userProfile || isInstructor) && (
            <>
              <NavLink to="/dashboard" onClick={close} className={linkClass} end>
                <LayoutDashboard className="w-4 h-4" /> Dashboard
              </NavLink>
              <NavLink to="/students" onClick={close} className={linkClass}>
                <Users className="w-4 h-4" /> Students
              </NavLink>
              <NavLink to="/lessons" onClick={close} className={linkClass}>
                <BookOpen className="w-4 h-4" /> Lessons
              </NavLink>
              <NavLink to="/book-lesson" onClick={close} className={linkClass}>
                <CalendarPlus className="w-4 h-4" /> Book Lesson
              </NavLink>
            </>
          )}

          {isStudent && (
            <>
              <NavLink to="/student-dashboard" onClick={close} className={linkClass}>
                <GraduationCap className="w-4 h-4" /> My Dashboard
              </NavLink>
              <NavLink to="/book-lessons" onClick={close} className={linkClass}>
                <CalendarPlus className="w-4 h-4" /> Book Lessons
              </NavLink>
              <NavLink to="/instructor-profile" onClick={close} className={linkClass}>
                <UserCircle className="w-4 h-4" /> My Instructor
              </NavLink>
            </>
          )}

          <div className="pt-3 mt-3 border-t border-slate-100">
            <NavLink to="/resources" onClick={close} className={linkClass}>
              <FolderOpen className="w-4 h-4" /> Resources
            </NavLink>
            <NavLink to="/tips" onClick={close} className={linkClass}>
              <Lightbulb className="w-4 h-4" /> Tips
            </NavLink>
            <NavLink to="/notifications" onClick={close} className={linkClass}>
              <Bell className="w-4 h-4" /> Notifications
            </NavLink>
          </div>
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-slate-100">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}
