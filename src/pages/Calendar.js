import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { getLessons, getStudents } from "../firebase";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year, month) {
  return new Date(year, month, 1).getDay();
}

export default function Calendar() {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [lessons, setLessons] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(null);
  const [view, setView] = useState("calendar"); // calendar or list

  useEffect(() => {
    async function loadData() {
      try {
        const [lessonsData, studentsData] = await Promise.all([
          getLessons(),
          getStudents()
        ]);
        setLessons(lessonsData);
        setStudents(studentsData);
      } catch (error) {
        console.error("Error loading calendar data:", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
    setSelectedDate(null);
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
    setSelectedDate(null);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(null);
  };

  // Get lessons for a specific date
  const getLessonsForDate = (day) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return lessons.filter(lesson => lesson.date === dateStr);
  };

  // Get student name by ID
  const getStudentName = (studentId) => {
    const student = students.find(s => s.id === studentId);
    return student?.name || "Unknown Student";
  };

  // Categorize lessons
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcomingLessons = lessons.filter(lesson => {
    const lessonDate = new Date(lesson.date);
    return lessonDate >= today;
  }).sort((a, b) => new Date(a.date) - new Date(b.date));

  const pastLessons = lessons.filter(lesson => {
    const lessonDate = new Date(lesson.date);
    return lessonDate < today;
  }).sort((a, b) => new Date(b.date) - new Date(a.date));

  const completedLessons = lessons.filter(l => l.status === "completed");
  const testsCompleted = lessons.filter(l => l.isTest && l.status === "completed");

  // Stats per student
  const studentStats = students.map(student => {
    const studentLessons = lessons.filter(l => l.studentId === student.id);
    return {
      ...student,
      totalLessons: studentLessons.length,
      completedLessons: studentLessons.filter(l => l.status === "completed").length,
      upcomingLessons: studentLessons.filter(l => new Date(l.date) >= today).length,
      tests: studentLessons.filter(l => l.isTest).length
    };
  });

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "400px" }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          style={{ width: "40px", height: "40px", border: "4px solid #e2e8f0", borderTopColor: "#667eea", borderRadius: "50%" }}
        />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "20px" }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: "30px" }}
      >
        <button 
          onClick={() => navigate(-1)}
          style={{ background: "none", border: "none", color: "#667eea", cursor: "pointer", fontSize: "16px", marginBottom: "20px" }}
        >
          ← Back
        </button>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "20px" }}>
          <h1 style={{ fontSize: "32px", fontWeight: "700", background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Calendar
          </h1>

          <div style={{ display: "flex", gap: "10px" }}>
            <button
              onClick={() => setView("calendar")}
              style={{
                padding: "10px 20px",
                background: view === "calendar" ? "#667eea" : "#e2e8f0",
                color: view === "calendar" ? "white" : "#475569",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: "500"
              }}
            >
              Calendar View
            </button>
            <button
              onClick={() => setView("list")}
              style={{
                padding: "10px 20px",
                background: view === "list" ? "#667eea" : "#e2e8f0",
                color: view === "list" ? "white" : "#475569",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: "500"
              }}
            >
              List View
            </button>
          </div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px", marginBottom: "30px" }}
      >
        {[
          { label: "Total Lessons", value: lessons.length, color: "#667eea" },
          { label: "Completed", value: completedLessons.length, color: "#22c55e" },
          { label: "Upcoming", value: upcomingLessons.length, color: "#f97316" },
          { label: "Tests Completed", value: testsCompleted.length, color: "#a855f7" }
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.05 }}
            style={{
              background: "white",
              borderRadius: "16px",
              padding: "24px",
              boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
              borderLeft: `4px solid ${stat.color}`
            }}
          >
            <p style={{ color: "#64748b", fontSize: "14px", marginBottom: "5px" }}>{stat.label}</p>
            <p style={{ fontSize: "32px", fontWeight: "700", color: stat.color }}>{stat.value}</p>
          </motion.div>
        ))}
      </motion.div>

      {view === "calendar" ? (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 350px", gap: "30px" }}>
          {/* Calendar */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            style={{ background: "white", borderRadius: "16px", padding: "24px", boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}
          >
            {/* Month Navigation */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <button
                onClick={prevMonth}
                style={{ background: "#f1f5f9", border: "none", borderRadius: "8px", padding: "10px 15px", cursor: "pointer", fontWeight: "600" }}
              >
                ← Prev
              </button>
              <div style={{ textAlign: "center" }}>
                <h2 style={{ fontSize: "20px", fontWeight: "600", color: "#1e293b" }}>
                  {MONTHS[month]} {year}
                </h2>
                <button onClick={goToToday} style={{ background: "none", border: "none", color: "#667eea", cursor: "pointer", fontSize: "14px" }}>
                  Go to Today
                </button>
              </div>
              <button
                onClick={nextMonth}
                style={{ background: "#f1f5f9", border: "none", borderRadius: "8px", padding: "10px 15px", cursor: "pointer", fontWeight: "600" }}
              >
                Next →
              </button>
            </div>

            {/* Day Headers */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "5px", marginBottom: "10px" }}>
              {DAYS.map(day => (
                <div key={day} style={{ textAlign: "center", padding: "10px", fontWeight: "600", color: "#64748b", fontSize: "14px" }}>
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "5px" }}>
              {/* Empty cells for days before first day of month */}
              {Array.from({ length: firstDay }).map((_, i) => (
                <div key={`empty-${i}`} style={{ padding: "10px" }} />
              ))}

              {/* Days of month */}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const dayLessons = getLessonsForDate(day);
                const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
                const isSelected = selectedDate === day;

                return (
                  <motion.div
                    key={day}
                    whileHover={{ scale: 1.05 }}
                    onClick={() => setSelectedDate(day)}
                    style={{
                      padding: "10px",
                      textAlign: "center",
                      borderRadius: "10px",
                      cursor: "pointer",
                      background: isSelected ? "#667eea" : isToday ? "#dbeafe" : dayLessons.length > 0 ? "#f0fdf4" : "transparent",
                      color: isSelected ? "white" : "#1e293b",
                      border: isToday && !isSelected ? "2px solid #667eea" : "2px solid transparent",
                      position: "relative",
                      minHeight: "50px"
                    }}
                  >
                    <span style={{ fontWeight: isToday ? "700" : "500" }}>{day}</span>
                    {dayLessons.length > 0 && (
                      <div style={{ display: "flex", justifyContent: "center", gap: "3px", marginTop: "5px" }}>
                        {dayLessons.slice(0, 3).map((_, idx) => (
                          <div
                            key={idx}
                            style={{
                              width: "6px",
                              height: "6px",
                              borderRadius: "50%",
                              background: isSelected ? "white" : "#22c55e"
                            }}
                          />
                        ))}
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Selected Day Details */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            style={{ background: "white", borderRadius: "16px", padding: "24px", boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}
          >
            <h3 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "20px", color: "#1e293b" }}>
              {selectedDate 
                ? `${MONTHS[month]} ${selectedDate}, ${year}`
                : "Select a date"
              }
            </h3>

            <AnimatePresence mode="wait">
              {selectedDate && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  {getLessonsForDate(selectedDate).length > 0 ? (
                    getLessonsForDate(selectedDate).map((lesson, idx) => (
                      <motion.div
                        key={lesson.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        onClick={() => navigate(`/lessons/${lesson.id}`)}
                        style={{
                          padding: "15px",
                          background: "#f8fafc",
                          borderRadius: "12px",
                          marginBottom: "10px",
                          cursor: "pointer",
                          borderLeft: "4px solid #667eea"
                        }}
                      >
                        <p style={{ fontWeight: "600", color: "#1e293b", marginBottom: "5px" }}>
                          {getStudentName(lesson.studentId)}
                        </p>
                        <p style={{ color: "#64748b", fontSize: "14px" }}>
                          {lesson.time || "Time not set"} {lesson.isTest && "- TEST"}
                        </p>
                        <p style={{ color: "#64748b", fontSize: "13px", marginTop: "5px" }}>
                          {lesson.instructor || "Instructor not assigned"}
                        </p>
                      </motion.div>
                    ))
                  ) : (
                    <p style={{ color: "#94a3b8", textAlign: "center", padding: "40px 0" }}>
                      No lessons scheduled
                    </p>
                  )}

                  <button
                    onClick={() => navigate("/book-lesson")}
                    style={{
                      width: "100%",
                      padding: "12px",
                      background: "#667eea",
                      color: "white",
                      border: "none",
                      borderRadius: "10px",
                      cursor: "pointer",
                      fontWeight: "600",
                      marginTop: "10px"
                    }}
                  >
                    + Book Lesson
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {!selectedDate && (
              <p style={{ color: "#94a3b8", textAlign: "center", padding: "40px 0" }}>
                Click on a date to see lessons
              </p>
            )}
          </motion.div>
        </div>
      ) : (
        /* List View */
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "30px" }}>
          {/* Upcoming Lessons */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            style={{ background: "white", borderRadius: "16px", padding: "24px", boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}
          >
            <h3 style={{ fontSize: "20px", fontWeight: "600", marginBottom: "20px", color: "#22c55e" }}>
              Upcoming Lessons
            </h3>
            {upcomingLessons.length > 0 ? (
              upcomingLessons.slice(0, 10).map((lesson, idx) => (
                <motion.div
                  key={lesson.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: idx * 0.05 }}
                  onClick={() => navigate(`/lessons/${lesson.id}`)}
                  style={{
                    padding: "15px",
                    background: "#f8fafc",
                    borderRadius: "12px",
                    marginBottom: "10px",
                    cursor: "pointer",
                    borderLeft: "4px solid #22c55e"
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <p style={{ fontWeight: "600", color: "#1e293b" }}>{getStudentName(lesson.studentId)}</p>
                    <span style={{ color: "#22c55e", fontSize: "14px", fontWeight: "500" }}>{lesson.date}</span>
                  </div>
                  <p style={{ color: "#64748b", fontSize: "14px" }}>{lesson.time || "Time TBD"}</p>
                </motion.div>
              ))
            ) : (
              <p style={{ color: "#94a3b8", textAlign: "center", padding: "40px 0" }}>No upcoming lessons</p>
            )}
          </motion.div>

          {/* Past Lessons */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            style={{ background: "white", borderRadius: "16px", padding: "24px", boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}
          >
            <h3 style={{ fontSize: "20px", fontWeight: "600", marginBottom: "20px", color: "#64748b" }}>
              Past Lessons
            </h3>
            {pastLessons.length > 0 ? (
              pastLessons.slice(0, 10).map((lesson, idx) => (
                <motion.div
                  key={lesson.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: idx * 0.05 }}
                  onClick={() => navigate(`/lessons/${lesson.id}`)}
                  style={{
                    padding: "15px",
                    background: "#f8fafc",
                    borderRadius: "12px",
                    marginBottom: "10px",
                    cursor: "pointer",
                    borderLeft: "4px solid #94a3b8"
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <p style={{ fontWeight: "600", color: "#1e293b" }}>{getStudentName(lesson.studentId)}</p>
                    <span style={{ color: "#64748b", fontSize: "14px" }}>{lesson.date}</span>
                  </div>
                  <p style={{ color: "#64748b", fontSize: "14px" }}>{lesson.time || "Time not recorded"}</p>
                </motion.div>
              ))
            ) : (
              <p style={{ color: "#94a3b8", textAlign: "center", padding: "40px 0" }}>No past lessons</p>
            )}
          </motion.div>
        </div>
      )}

      {/* Student Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        style={{ marginTop: "30px", background: "white", borderRadius: "16px", padding: "24px", boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}
      >
        <h3 style={{ fontSize: "20px", fontWeight: "600", marginBottom: "20px", color: "#1e293b" }}>
          Lessons by Student
        </h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "15px" }}>
          {studentStats.map((student, idx) => (
            <motion.div
              key={student.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.05 }}
              whileHover={{ scale: 1.02 }}
              onClick={() => navigate(`/students/${student.id}`)}
              style={{
                padding: "20px",
                background: "#f8fafc",
                borderRadius: "12px",
                cursor: "pointer"
              }}
            >
              <p style={{ fontWeight: "600", color: "#1e293b", marginBottom: "10px" }}>{student.name || "Unknown"}</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", fontSize: "14px" }}>
                <span style={{ color: "#64748b" }}>Total: <strong>{student.totalLessons}</strong></span>
                <span style={{ color: "#22c55e" }}>Completed: <strong>{student.completedLessons}</strong></span>
                <span style={{ color: "#f97316" }}>Upcoming: <strong>{student.upcomingLessons}</strong></span>
                <span style={{ color: "#a855f7" }}>Tests: <strong>{student.tests}</strong></span>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
