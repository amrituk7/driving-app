import React, { useEffect, useState } from "react";
import { getStudents, deleteStudent } from "../firebase";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "../context/ToastContext";
import { motion, AnimatePresence } from "framer-motion";

// Helper to get initials
function getInitials(name) {
  if (!name) return "?";
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

// Avatar colors based on name
function getAvatarColor(name) {
  const colors = [
    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
    "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
    "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
    "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)",
  ];
  const index = name ? name.charCodeAt(0) % colors.length : 0;
  return colors[index];
}

// Styles
const styles = {
  container: {
    minHeight: "100vh",
    background: "linear-gradient(180deg, #fafafa 0%, #f5f5f7 100%)",
    padding: "40px 24px",
  },
  inner: {
    maxWidth: "1200px",
    margin: "0 auto",
  },
  header: {
    marginBottom: "40px",
  },
  backButton: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    padding: "10px 20px",
    background: "white",
    border: "1px solid #e5e5e5",
    borderRadius: "12px",
    fontSize: "14px",
    fontWeight: "500",
    color: "#374151",
    cursor: "pointer",
    marginBottom: "24px",
    transition: "all 0.2s ease",
    textDecoration: "none",
  },
  titleRow: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "20px",
  },
  titleSection: {
    flex: 1,
  },
  title: {
    fontSize: "32px",
    fontWeight: "700",
    color: "#1d1d1f",
    margin: "0 0 8px 0",
    letterSpacing: "-0.5px",
  },
  subtitle: {
    fontSize: "16px",
    color: "#86868b",
    margin: 0,
  },
  addButton: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    padding: "14px 24px",
    background: "linear-gradient(135deg, #0071e3 0%, #42a1ec 100%)",
    border: "none",
    borderRadius: "14px",
    fontSize: "15px",
    fontWeight: "600",
    color: "white",
    cursor: "pointer",
    boxShadow: "0 4px 14px rgba(0, 113, 227, 0.4)",
    transition: "all 0.3s ease",
    textDecoration: "none",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
    gap: "20px",
  },
  card: {
    background: "white",
    borderRadius: "20px",
    padding: "24px",
    boxShadow: "0 2px 20px rgba(0, 0, 0, 0.06)",
    border: "1px solid rgba(0, 0, 0, 0.04)",
    display: "flex",
    alignItems: "center",
    gap: "20px",
    cursor: "pointer",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    position: "relative",
    overflow: "hidden",
  },
  avatarContainer: {
    position: "relative",
    flexShrink: 0,
  },
  avatar: {
    width: "64px",
    height: "64px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "22px",
    fontWeight: "600",
    color: "white",
    objectFit: "cover",
  },
  bananaHint: {
    position: "absolute",
    bottom: "-4px",
    right: "-4px",
    width: "24px",
    height: "24px",
    background: "white",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "14px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  },
  info: {
    flex: 1,
    minWidth: 0,
  },
  name: {
    fontSize: "18px",
    fontWeight: "600",
    color: "#1d1d1f",
    margin: "0 0 6px 0",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  phone: {
    fontSize: "14px",
    color: "#424245",
    margin: "0 0 4px 0",
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },
  transmission: {
    fontSize: "13px",
    color: "#86868b",
    margin: 0,
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },
  actions: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  actionBtn: {
    padding: "10px 16px",
    borderRadius: "10px",
    border: "none",
    fontSize: "13px",
    fontWeight: "500",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "6px",
    transition: "all 0.2s ease",
    whiteSpace: "nowrap",
  },
  viewBtn: {
    background: "#f5f5f7",
    color: "#1d1d1f",
  },
  lessonBtn: {
    background: "linear-gradient(135deg, #34d399 0%, #10b981 100%)",
    color: "white",
  },
  deleteBtn: {
    background: "#fef2f2",
    color: "#ef4444",
  },
  emptyState: {
    textAlign: "center",
    padding: "80px 40px",
    background: "white",
    borderRadius: "24px",
    boxShadow: "0 2px 20px rgba(0, 0, 0, 0.06)",
  },
  emptyIcon: {
    fontSize: "64px",
    marginBottom: "20px",
  },
  emptyTitle: {
    fontSize: "24px",
    fontWeight: "600",
    color: "#1d1d1f",
    marginBottom: "12px",
  },
  emptyText: {
    fontSize: "16px",
    color: "#86868b",
    marginBottom: "24px",
  },
  loadingContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "400px",
    gap: "20px",
  },
  spinner: {
    width: "48px",
    height: "48px",
    border: "4px solid #f3f3f3",
    borderTop: "4px solid #0071e3",
    borderRadius: "50%",
  },
};

export default function Students() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoveredId, setHoveredId] = useState(null);
  const navigate = useNavigate();
  const { showToast } = useToast();

  useEffect(() => {
    async function load() {
      try {
        const data = await getStudents();
        setStudents(data);
      } catch (error) {
        console.error("Error loading students:", error);
        showToast("Failed to load students", "error");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [showToast]);

  async function handleDelete(e, id, name) {
    e.preventDefault();
    e.stopPropagation();
    
    if (!window.confirm(`Are you sure you want to delete ${name || "this student"}?`)) {
      return;
    }

    try {
      await deleteStudent(id);
      setStudents(prev => prev.filter(s => s.id !== id));
      showToast("Student deleted successfully", "success");
    } catch (error) {
      console.error("Error deleting student:", error);
      showToast("Failed to delete student", "error");
    }
  }

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingContainer}>
          <motion.div
            style={styles.spinner}
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <p style={{ color: "#86868b", fontSize: "16px" }}>Loading students...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.inner}>
        {/* Header */}
        <motion.div
          style={styles.header}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Link to="/" style={styles.backButton}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Dashboard
          </Link>

          <div style={styles.titleRow}>
            <div style={styles.titleSection}>
              <h1 style={styles.title}>Students</h1>
              <p style={styles.subtitle}>
                {students.length} {students.length === 1 ? "student" : "students"} enrolled
              </p>
            </div>
            <Link to="/students/add" style={{ textDecoration: "none" }}>
              <motion.button
                style={styles.addButton}
                whileHover={{ scale: 1.05, boxShadow: "0 6px 20px rgba(0, 113, 227, 0.5)" }}
                whileTap={{ scale: 0.98 }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M12 5v14M5 12h14" />
                </svg>
                Add Student
              </motion.button>
            </Link>
          </div>
        </motion.div>

        {/* Empty State */}
        {students.length === 0 ? (
          <motion.div
            style={styles.emptyState}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
          >
            <div style={styles.emptyIcon}>
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#d1d1d6" strokeWidth="1.5">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <h2 style={styles.emptyTitle}>No Students Yet</h2>
            <p style={styles.emptyText}>Add your first student to get started!</p>
            <Link to="/students/add" style={{ textDecoration: "none" }}>
              <motion.button
                style={styles.addButton}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M12 5v14M5 12h14" />
                </svg>
                Add Your First Student
              </motion.button>
            </Link>
          </motion.div>
        ) : (
          /* Students Grid */
          <div style={styles.grid}>
            <AnimatePresence>
              {students.map((student, index) => (
                <motion.div
                  key={student.id}
                  style={styles.card}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  whileHover={{ 
                    scale: 1.02, 
                    boxShadow: "0 8px 30px rgba(0, 0, 0, 0.12)",
                    y: -4
                  }}
                  onHoverStart={() => setHoveredId(student.id)}
                  onHoverEnd={() => setHoveredId(null)}
                  onClick={() => navigate(`/students/${student.id}`)}
                >
                  {/* Avatar */}
                  <div style={styles.avatarContainer}>
                    {student.profilePicture ? (
                      <img
                        src={student.profilePicture}
                        alt={student.name}
                        style={{ ...styles.avatar, background: "#f5f5f7" }}
                      />
                    ) : (
                      <div style={{ ...styles.avatar, background: getAvatarColor(student.name) }}>
                        {getInitials(student.name)}
                      </div>
                    )}
                    {/* Banana micro-animation placeholder */}
                    <AnimatePresence>
                      {hoveredId === student.id && (
                        <motion.div
                          style={styles.bananaHint}
                          initial={{ scale: 0, rotate: -45 }}
                          animate={{ scale: 1, rotate: 0 }}
                          exit={{ scale: 0, rotate: 45 }}
                          transition={{ type: "spring", stiffness: 500, damping: 20 }}
                        >
                          <span role="img" aria-label="banana">&#127820;</span>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Info */}
                  <div style={styles.info}>
                    <h3 style={styles.name}>{student.name || "Unnamed Student"}</h3>
                    <p style={styles.phone}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                      </svg>
                      {student.phone || "No phone"}
                    </p>
                    <p style={styles.transmission}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <path d="M12 6v6l4 2" />
                      </svg>
                      {student.transmission || "Manual"} transmission
                    </p>
                  </div>

                  {/* Actions */}
                  <div style={styles.actions} onClick={(e) => e.stopPropagation()}>
                    <motion.button
                      style={{ ...styles.actionBtn, ...styles.viewBtn }}
                      whileHover={{ background: "#e5e5e7" }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => navigate(`/students/${student.id}`)}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                      View
                    </motion.button>
                    <motion.button
                      style={{ ...styles.actionBtn, ...styles.lessonBtn }}
                      whileHover={{ filter: "brightness(1.1)" }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => navigate(`/book-lesson?studentId=${student.id}`)}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                        <line x1="16" y1="2" x2="16" y2="6" />
                        <line x1="8" y1="2" x2="8" y2="6" />
                        <line x1="3" y1="10" x2="21" y2="10" />
                      </svg>
                      Lesson
                    </motion.button>
                    <motion.button
                      style={{ ...styles.actionBtn, ...styles.deleteBtn }}
                      whileHover={{ background: "#fee2e2" }}
                      whileTap={{ scale: 0.95 }}
                      onClick={(e) => handleDelete(e, student.id, student.name)}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                      Delete
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
