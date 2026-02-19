import React, { useEffect, useState } from "react";
import { getLessons, getLessonsForStudent, deleteLesson } from "../firebase";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { useToast } from "../context/ToastContext";
import { motion, AnimatePresence } from "framer-motion";

export default function Lessons() {
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { showToast } = useToast();
  
  const studentId = searchParams.get("studentId");

  useEffect(() => {
    async function load() {
      try {
        let data;
        if (studentId) {
          data = await getLessonsForStudent(studentId);
        } else {
          data = await getLessons();
        }
        setLessons(data.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0)));
      } catch (error) {
        console.error("Error loading lessons:", error);
        showToast("Failed to load lessons", "error");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [studentId, showToast]);

  async function handleDelete(id) {
    if (!window.confirm("Are you sure you want to delete this lesson?")) {
      return;
    }

    try {
      await deleteLesson(id);
      setLessons(prev => prev.filter(l => l.id !== id));
      showToast("Lesson deleted successfully", "success");
    } catch (error) {
      console.error("Error deleting lesson:", error);
      showToast("Failed to delete lesson", "error");
    }
  }

  if (loading) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)"
      }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          style={{
            width: "48px",
            height: "48px",
            border: "4px solid #e2e8f0",
            borderTopColor: "#3b82f6",
            borderRadius: "50%"
          }}
        />
      </div>
    );
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
      padding: "32px"
    }}>
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: "32px" }}
      >
        {/* Back Button */}
        <Link to="/" style={{ textDecoration: "none" }}>
          <motion.button
            whileHover={{ scale: 1.02, x: -3 }}
            whileTap={{ scale: 0.98 }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 16px",
              background: "white",
              border: "1px solid #e2e8f0",
              borderRadius: "10px",
              cursor: "pointer",
              fontSize: "14px",
              color: "#64748b",
              marginBottom: "24px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.05)"
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            Back to Dashboard
          </motion.button>
        </Link>

        {/* Title and Actions */}
        <div style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: "20px"
        }}>
          <div>
            <h1 style={{
              fontSize: "32px",
              fontWeight: "700",
              color: "#1e293b",
              marginBottom: "8px"
            }}>
              {studentId ? "Student Lessons" : "All Lessons"}
            </h1>
            <p style={{ color: "#64748b", fontSize: "16px" }}>
              {lessons.length} {lessons.length === 1 ? "lesson" : "lessons"} scheduled
            </p>
          </div>

          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate("/book-lesson")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "12px 20px",
                background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
                color: "white",
                border: "none",
                borderRadius: "12px",
                cursor: "pointer",
                fontSize: "15px",
                fontWeight: "600",
                boxShadow: "0 4px 14px rgba(59, 130, 246, 0.35)"
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 5v14M5 12h14"/>
              </svg>
              Book Lesson
            </motion.button>

            {studentId && (
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate("/lessons")}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "12px 20px",
                  background: "white",
                  color: "#374151",
                  border: "1px solid #e2e8f0",
                  borderRadius: "12px",
                  cursor: "pointer",
                  fontSize: "15px",
                  fontWeight: "500",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.05)"
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 6h16M4 12h16M4 18h16"/>
                </svg>
                View All Lessons
              </motion.button>
            )}
          </div>
        </div>
      </motion.div>

      {/* Empty State */}
      {lessons.length === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{
            background: "white",
            borderRadius: "20px",
            padding: "60px 40px",
            textAlign: "center",
            boxShadow: "0 4px 20px rgba(0,0,0,0.05)"
          }}
        >
          <div style={{
            width: "80px",
            height: "80px",
            background: "linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%)",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 24px"
          }}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
          </div>
          <h3 style={{ fontSize: "20px", fontWeight: "600", color: "#1e293b", marginBottom: "8px" }}>
            No lessons scheduled
          </h3>
          <p style={{ color: "#64748b", marginBottom: "24px" }}>
            Book your first lesson to get started
          </p>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate("/book-lesson")}
            style={{
              padding: "12px 24px",
              background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
              color: "white",
              border: "none",
              borderRadius: "10px",
              cursor: "pointer",
              fontSize: "15px",
              fontWeight: "600"
            }}
          >
            Book a Lesson
          </motion.button>
        </motion.div>
      )}

      {/* Lessons Grid */}
      <AnimatePresence>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
          gap: "20px"
        }}>
          {lessons.map((lesson, index) => (
            <motion.div
              key={lesson.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ y: -4, boxShadow: "0 12px 30px rgba(0,0,0,0.1)" }}
              style={{
                background: "white",
                borderRadius: "16px",
                padding: "24px",
                boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
                border: "1px solid #f1f5f9",
                transition: "box-shadow 0.3s ease"
              }}
            >
              {/* Card Header */}
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: "16px"
              }}>
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px"
                }}>
                  <div style={{
                    width: "44px",
                    height: "44px",
                    background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
                    borderRadius: "12px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    fontWeight: "700",
                    fontSize: "16px"
                  }}>
                    {(lesson.studentName || "U")[0].toUpperCase()}
                  </div>
                  <div>
                    <h3 style={{
                      fontSize: "17px",
                      fontWeight: "600",
                      color: "#1e293b",
                      marginBottom: "2px"
                    }}>
                      {lesson.studentName || "Unknown Student"}
                    </h3>
                    <span style={{
                      fontSize: "13px",
                      color: "#94a3b8"
                    }}>
                      Driving Lesson
                    </span>
                  </div>
                </div>

                {/* Status Badge */}
                <span style={{
                  padding: "4px 10px",
                  background: new Date(lesson.date) >= new Date() ? "#dcfce7" : "#f1f5f9",
                  color: new Date(lesson.date) >= new Date() ? "#16a34a" : "#64748b",
                  borderRadius: "20px",
                  fontSize: "12px",
                  fontWeight: "500"
                }}>
                  {new Date(lesson.date) >= new Date() ? "Upcoming" : "Completed"}
                </span>
              </div>

              {/* Card Details */}
              <div style={{
                display: "flex",
                flexDirection: "column",
                gap: "12px",
                marginBottom: "20px"
              }}>
                {/* Date */}
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div style={{
                    width: "32px",
                    height: "32px",
                    background: "#f1f5f9",
                    borderRadius: "8px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                      <line x1="16" y1="2" x2="16" y2="6"/>
                      <line x1="8" y1="2" x2="8" y2="6"/>
                      <line x1="3" y1="10" x2="21" y2="10"/>
                    </svg>
                  </div>
                  <span style={{ color: "#475569", fontSize: "14px" }}>
                    {lesson.date || "No date set"}
                  </span>
                </div>

                {/* Time */}
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div style={{
                    width: "32px",
                    height: "32px",
                    background: "#f1f5f9",
                    borderRadius: "8px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"/>
                      <polyline points="12 6 12 12 16 14"/>
                    </svg>
                  </div>
                  <span style={{ color: "#475569", fontSize: "14px" }}>
                    {lesson.time || "No time set"}
                  </span>
                </div>

                {/* Instructor */}
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div style={{
                    width: "32px",
                    height: "32px",
                    background: "#f1f5f9",
                    borderRadius: "8px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                      <circle cx="12" cy="7" r="4"/>
                    </svg>
                  </div>
                  <span style={{ color: "#475569", fontSize: "14px" }}>
                    {lesson.instructor || "Not assigned"}
                  </span>
                </div>

                {/* Notes (if available) */}
                {lesson.notes && (
                  <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                    <div style={{
                      width: "32px",
                      height: "32px",
                      background: "#f1f5f9",
                      borderRadius: "8px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0
                    }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                        <polyline points="14 2 14 8 20 8"/>
                        <line x1="16" y1="13" x2="8" y2="13"/>
                        <line x1="16" y1="17" x2="8" y2="17"/>
                      </svg>
                    </div>
                    <span style={{
                      color: "#64748b",
                      fontSize: "13px",
                      lineHeight: "1.5",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical"
                    }}>
                      {lesson.notes}
                    </span>
                  </div>
                )}
              </div>

              {/* Card Actions */}
              <div style={{
                display: "flex",
                gap: "10px",
                paddingTop: "16px",
                borderTop: "1px solid #f1f5f9"
              }}>
                <Link to={`/lessons/${lesson.id}`} style={{ flex: 1, textDecoration: "none" }}>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    style={{
                      width: "100%",
                      padding: "10px 16px",
                      background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
                      color: "white",
                      border: "none",
                      borderRadius: "10px",
                      cursor: "pointer",
                      fontSize: "14px",
                      fontWeight: "500"
                    }}
                  >
                    View Details
                  </motion.button>
                </Link>

                {lesson.studentId && (
                  <Link to={`/students/${lesson.studentId}`} style={{ textDecoration: "none" }}>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      style={{
                        padding: "10px 16px",
                        background: "#f1f5f9",
                        color: "#475569",
                        border: "none",
                        borderRadius: "10px",
                        cursor: "pointer",
                        fontSize: "14px",
                        fontWeight: "500"
                      }}
                    >
                      Student
                    </motion.button>
                  </Link>
                )}

                <motion.button
                  whileHover={{ scale: 1.05, background: "#fef2f2" }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleDelete(lesson.id)}
                  style={{
                    width: "40px",
                    height: "40px",
                    background: "#fff5f5",
                    color: "#ef4444",
                    border: "none",
                    borderRadius: "10px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}
                  title="Delete Lesson"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="3 6 5 6 21 6"/>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                    <line x1="10" y1="11" x2="10" y2="17"/>
                    <line x1="14" y1="11" x2="14" y2="17"/>
                  </svg>
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>
      </AnimatePresence>
    </div>
  );
}
