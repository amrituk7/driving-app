import { useEffect, useState } from "react";
import { getLesson, updateLesson, deleteLesson, sendNotification } from "../firebase";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useToast } from "../context/ToastContext";
import { motion, AnimatePresence } from "framer-motion";

export default function LessonDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  // Lesson notes form
  const [notes, setNotes] = useState({
    whatWasDone: "",
    needsImprovement: "",
    practiceNext: "",
    nextLessonDate: "",
    nextLessonTime: "",
    status: "scheduled"
  });

  useEffect(() => {
    async function load() {
      try {
        const found = await getLesson(id);
        if (!found) {
          showToast("Lesson not found", "error");
          navigate("/lessons");
          return;
        }
        setLesson(found);
        setNotes({
          whatWasDone: found.whatWasDone || "",
          needsImprovement: found.needsImprovement || "",
          practiceNext: found.practiceNext || "",
          nextLessonDate: found.nextLessonDate || "",
          nextLessonTime: found.nextLessonTime || "",
          status: found.status || "scheduled"
        });
      } catch (error) {
        console.error("Error loading lesson:", error);
        showToast("Failed to load lesson", "error");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id, showToast, navigate]);

  async function handleSaveNotes() {
    setSaving(true);
    try {
      await updateLesson(id, {
        ...notes,
        updatedAt: Date.now()
      });

      // Send notification to student
      if (lesson.studentId) {
        await sendNotification({
          title: "Lesson Notes Updated",
          message: `Your lesson notes for ${lesson.date} have been updated by your instructor.`,
          studentId: lesson.studentId,
          type: "lesson_update"
        });
      }

      setLesson(prev => ({ ...prev, ...notes }));
      setEditing(false);
      showToast("Lesson notes saved successfully", "success");
    } catch (error) {
      console.error("Error saving notes:", error);
      showToast("Failed to save notes", "error");
    } finally {
      setSaving(false);
    }
  }

  async function handleMarkComplete() {
    try {
      await updateLesson(id, { status: "completed" });
      setLesson(prev => ({ ...prev, status: "completed" }));
      setNotes(prev => ({ ...prev, status: "completed" }));

      if (lesson.studentId) {
        await sendNotification({
          title: "Lesson Completed",
          message: `Your lesson on ${lesson.date} has been marked as completed.`,
          studentId: lesson.studentId,
          type: "lesson_complete"
        });
      }

      showToast("Lesson marked as completed", "success");
    } catch (error) {
      showToast("Failed to update status", "error");
    }
  }

  async function handleDelete() {
    if (!window.confirm("Are you sure you want to delete this lesson?")) {
      return;
    }

    try {
      await deleteLesson(id);
      showToast("Lesson deleted successfully", "success");
      navigate("/lessons");
    } catch (error) {
      console.error("Error deleting lesson:", error);
      showToast("Failed to delete lesson", "error");
    }
  }

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

  if (!lesson) return <p>Lesson not found</p>;

  const statusColors = {
    scheduled: { bg: "#dbeafe", text: "#1d4ed8" },
    completed: { bg: "#dcfce7", text: "#16a34a" },
    cancelled: { bg: "#fee2e2", text: "#dc2626" }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ maxWidth: "900px", margin: "0 auto", padding: "20px" }}
    >
      {/* Header */}
      <button
        onClick={() => navigate(-1)}
        style={{ background: "none", border: "none", color: "#667eea", cursor: "pointer", fontSize: "16px", marginBottom: "20px" }}
      >
        ← Back
      </button>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "20px", marginBottom: "30px" }}>
        <div>
          <h1 style={{ fontSize: "28px", fontWeight: "700", color: "#1e293b", marginBottom: "10px" }}>
            Lesson Details
          </h1>
          <span style={{
            display: "inline-block",
            padding: "6px 16px",
            borderRadius: "20px",
            fontSize: "14px",
            fontWeight: "600",
            background: statusColors[lesson.status]?.bg || "#f1f5f9",
            color: statusColors[lesson.status]?.text || "#475569"
          }}>
            {(lesson.status || "scheduled").charAt(0).toUpperCase() + (lesson.status || "scheduled").slice(1)}
          </span>
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          {lesson.status !== "completed" && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleMarkComplete}
              style={{
                padding: "10px 20px",
                background: "#22c55e",
                color: "white",
                border: "none",
                borderRadius: "10px",
                cursor: "pointer",
                fontWeight: "600"
              }}
            >
              Mark Complete
            </motion.button>
          )}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleDelete}
            style={{
              padding: "10px 20px",
              background: "#ef4444",
              color: "white",
              border: "none",
              borderRadius: "10px",
              cursor: "pointer",
              fontWeight: "600"
            }}
          >
            Delete
          </motion.button>
        </div>
      </div>

      {/* Lesson Info Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        style={{
          background: "white",
          borderRadius: "16px",
          padding: "24px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
          marginBottom: "20px"
        }}
      >
        <h2 style={{ fontSize: "18px", fontWeight: "600", color: "#1e293b", marginBottom: "20px" }}>
          Lesson Information
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px" }}>
          <div>
            <p style={{ color: "#64748b", fontSize: "14px", marginBottom: "5px" }}>Student</p>
            <Link to={lesson.studentId ? `/students/${lesson.studentId}` : "#"} style={{ color: "#667eea", fontWeight: "600", fontSize: "16px", textDecoration: "none" }}>
              {lesson.studentName || "Unknown"}
            </Link>
          </div>
          <div>
            <p style={{ color: "#64748b", fontSize: "14px", marginBottom: "5px" }}>Date</p>
            <p style={{ fontWeight: "600", fontSize: "16px", color: "#1e293b" }}>{lesson.date || "N/A"}</p>
          </div>
          <div>
            <p style={{ color: "#64748b", fontSize: "14px", marginBottom: "5px" }}>Time</p>
            <p style={{ fontWeight: "600", fontSize: "16px", color: "#1e293b" }}>{lesson.time || "N/A"}</p>
          </div>
          <div>
            <p style={{ color: "#64748b", fontSize: "14px", marginBottom: "5px" }}>Instructor</p>
            <p style={{ fontWeight: "600", fontSize: "16px", color: "#1e293b" }}>{lesson.instructor || "Ravi"}</p>
          </div>
        </div>
        {lesson.notes && (
          <div style={{ marginTop: "20px", padding: "15px", background: "#f8fafc", borderRadius: "10px" }}>
            <p style={{ color: "#64748b", fontSize: "14px", marginBottom: "5px" }}>General Notes</p>
            <p style={{ color: "#1e293b" }}>{lesson.notes}</p>
          </div>
        )}
      </motion.div>

      {/* Lesson Notes Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        style={{
          background: "white",
          borderRadius: "16px",
          padding: "24px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
          marginBottom: "20px"
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <h2 style={{ fontSize: "18px", fontWeight: "600", color: "#1e293b" }}>
            Instructor Notes
          </h2>
          {!editing ? (
            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={() => setEditing(true)}
              style={{
                padding: "8px 16px",
                background: "#667eea",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: "500"
              }}
            >
              Edit Notes
            </motion.button>
          ) : (
            <div style={{ display: "flex", gap: "10px" }}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={handleSaveNotes}
                disabled={saving}
                style={{
                  padding: "8px 16px",
                  background: "#22c55e",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: "500",
                  opacity: saving ? 0.7 : 1
                }}
              >
                {saving ? "Saving..." : "Save"}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={() => setEditing(false)}
                style={{
                  padding: "8px 16px",
                  background: "#e2e8f0",
                  color: "#475569",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: "500"
                }}
              >
                Cancel
              </motion.button>
            </div>
          )}
        </div>

        <AnimatePresence mode="wait">
          {editing ? (
            <motion.div
              key="edit"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{ display: "flex", flexDirection: "column", gap: "20px" }}
            >
              <div>
                <label style={{ display: "block", fontWeight: "500", color: "#374151", marginBottom: "8px" }}>
                  What was done in this lesson?
                </label>
                <textarea
                  value={notes.whatWasDone}
                  onChange={(e) => setNotes(prev => ({ ...prev, whatWasDone: e.target.value }))}
                  placeholder="Describe what the student learned and practiced..."
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "2px solid #e2e8f0",
                    borderRadius: "10px",
                    minHeight: "100px",
                    fontSize: "15px",
                    resize: "vertical"
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontWeight: "500", color: "#374151", marginBottom: "8px" }}>
                  What needs improvement?
                </label>
                <textarea
                  value={notes.needsImprovement}
                  onChange={(e) => setNotes(prev => ({ ...prev, needsImprovement: e.target.value }))}
                  placeholder="Areas that need more practice..."
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "2px solid #e2e8f0",
                    borderRadius: "10px",
                    minHeight: "100px",
                    fontSize: "15px",
                    resize: "vertical"
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontWeight: "500", color: "#374151", marginBottom: "8px" }}>
                  What to practice next?
                </label>
                <textarea
                  value={notes.practiceNext}
                  onChange={(e) => setNotes(prev => ({ ...prev, practiceNext: e.target.value }))}
                  placeholder="Recommendations for the next lesson..."
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "2px solid #e2e8f0",
                    borderRadius: "10px",
                    minHeight: "100px",
                    fontSize: "15px",
                    resize: "vertical"
                  }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                <div>
                  <label style={{ display: "block", fontWeight: "500", color: "#374151", marginBottom: "8px" }}>
                    Next Lesson Date
                  </label>
                  <input
                    type="date"
                    value={notes.nextLessonDate}
                    onChange={(e) => setNotes(prev => ({ ...prev, nextLessonDate: e.target.value }))}
                    style={{
                      width: "100%",
                      padding: "12px",
                      border: "2px solid #e2e8f0",
                      borderRadius: "10px",
                      fontSize: "15px"
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontWeight: "500", color: "#374151", marginBottom: "8px" }}>
                    Next Lesson Time
                  </label>
                  <input
                    type="time"
                    value={notes.nextLessonTime}
                    onChange={(e) => setNotes(prev => ({ ...prev, nextLessonTime: e.target.value }))}
                    style={{
                      width: "100%",
                      padding: "12px",
                      border: "2px solid #e2e8f0",
                      borderRadius: "10px",
                      fontSize: "15px"
                    }}
                  />
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{ display: "flex", flexDirection: "column", gap: "20px" }}
            >
              {[
                { label: "What was done", value: lesson.whatWasDone, color: "#22c55e" },
                { label: "Needs improvement", value: lesson.needsImprovement, color: "#f97316" },
                { label: "Practice next", value: lesson.practiceNext, color: "#667eea" }
              ].map((item, idx) => (
                <div key={idx} style={{ padding: "15px", background: "#f8fafc", borderRadius: "10px", borderLeft: `4px solid ${item.color}` }}>
                  <p style={{ color: "#64748b", fontSize: "14px", marginBottom: "8px", fontWeight: "500" }}>{item.label}</p>
                  <p style={{ color: "#1e293b", lineHeight: "1.6" }}>{item.value || "Not recorded yet"}</p>
                </div>
              ))}

              {(lesson.nextLessonDate || lesson.nextLessonTime) && (
                <div style={{ padding: "15px", background: "#dbeafe", borderRadius: "10px" }}>
                  <p style={{ color: "#1d4ed8", fontWeight: "600" }}>
                    Next Lesson: {lesson.nextLessonDate || "Date TBD"} {lesson.nextLessonTime && `at ${lesson.nextLessonTime}`}
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        style={{ display: "flex", gap: "15px", flexWrap: "wrap" }}
      >
        {lesson.studentId && (
          <Link to={`/students/${lesson.studentId}`} style={{ textDecoration: "none" }}>
            <motion.button
              whileHover={{ scale: 1.05 }}
              style={{
                padding: "12px 24px",
                background: "#667eea",
                color: "white",
                border: "none",
                borderRadius: "10px",
                cursor: "pointer",
                fontWeight: "600"
              }}
            >
              View Student Profile
            </motion.button>
          </Link>
        )}
        <Link to="/calendar" style={{ textDecoration: "none" }}>
          <motion.button
            whileHover={{ scale: 1.05 }}
            style={{
              padding: "12px 24px",
              background: "#f1f5f9",
              color: "#475569",
              border: "none",
              borderRadius: "10px",
              cursor: "pointer",
              fontWeight: "600"
            }}
          >
            View Calendar
          </motion.button>
        </Link>
        <Link to="/book-lesson" style={{ textDecoration: "none" }}>
          <motion.button
            whileHover={{ scale: 1.05 }}
            style={{
              padding: "12px 24px",
              background: "#f1f5f9",
              color: "#475569",
              border: "none",
              borderRadius: "10px",
              cursor: "pointer",
              fontWeight: "600"
            }}
          >
            Book Another Lesson
          </motion.button>
        </Link>
      </motion.div>
    </motion.div>
  );
}
