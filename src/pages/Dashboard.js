import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { getStudents, getLessons } from "../firebase";
import { FadeIn, StaggerContainer, StaggerItem, AnimatedCard } from "../components/Animations";
import "./Dashboard.css";

export default function Dashboard() {
  const [students, setStudents] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    manual: 0,
    auto: 0,
    perfect: 0,
    parking: 0,
    todayLessons: 0
  });

  useEffect(() => {
    async function load() {
      try {
        const [studentsData, lessonsData] = await Promise.all([
          getStudents(),
          getLessons()
        ]);
        
        setStudents(studentsData);
        setLessons(lessonsData);

        const today = new Date().toISOString().split("T")[0];
        
        setStats({
          total: studentsData.length,
          manual: studentsData.filter(s => s.transmission?.toLowerCase() === "manual").length,
          auto: studentsData.filter(s => s.transmission?.toLowerCase() === "auto").length,
          perfect: studentsData.filter(s => s.perfectDriver === true).length,
          parking: studentsData.filter(s => s.parkingPractice === true).length,
          todayLessons: lessonsData.filter(l => l.date === today).length
        });
      } catch (error) {
        console.error("Error loading dashboard:", error);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="dashboard-container">
        <p>Loading dashboard...</p>
      </div>
    );
  }

  const upcomingLessons = lessons
    .filter(l => new Date(l.date) >= new Date())
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 5);

  return (
    <div className="dashboard-container">
      <FadeIn>
        <div className="dashboard-header">
          <h1>Instructor Dashboard</h1>
          <p>Welcome back! Here's an overview of your driving school.</p>
        </div>
      </FadeIn>

      <StaggerContainer className="stats-grid">
        <StaggerItem>
          <AnimatedCard className="stat-box total">
            <div className="stat-icon">S</div>
            <div className="stat-content">
              <motion.h3
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                {stats.total}
              </motion.h3>
              <p>Total Students</p>
            </div>
          </AnimatedCard>
        </StaggerItem>

        <StaggerItem>
          <AnimatedCard className="stat-box lessons">
            <div className="stat-icon">L</div>
            <div className="stat-content">
              <h3>{stats.todayLessons}</h3>
              <p>Lessons Today</p>
            </div>
          </AnimatedCard>
        </StaggerItem>

        <StaggerItem>
          <AnimatedCard className="stat-box manual">
            <div className="stat-icon">M</div>
            <div className="stat-content">
              <h3>{stats.manual}</h3>
              <p>Manual Learners</p>
            </div>
          </AnimatedCard>
        </StaggerItem>

        <StaggerItem>
          <AnimatedCard className="stat-box auto">
            <div className="stat-icon">A</div>
            <div className="stat-content">
              <h3>{stats.auto}</h3>
              <p>Auto Learners</p>
            </div>
          </AnimatedCard>
        </StaggerItem>

        <StaggerItem>
          <AnimatedCard className="stat-box perfect">
            <div className="stat-icon">P</div>
            <div className="stat-content">
              <h3>{stats.perfect}</h3>
              <p>Perfect Drivers</p>
            </div>
          </AnimatedCard>
        </StaggerItem>

        <StaggerItem>
          <AnimatedCard className="stat-box parking">
            <div className="stat-icon">K</div>
            <div className="stat-content">
              <h3>{stats.parking}</h3>
              <p>Parking Practice</p>
            </div>
          </AnimatedCard>
        </StaggerItem>
      </StaggerContainer>

      <div className="dashboard-sections">
        <FadeIn delay={0.3}>
          <div className="section-card">
            <div className="section-header">
              <h2>Recent Students</h2>
              <Link to="/students">View all</Link>
            </div>
            {students.length === 0 ? (
              <p className="empty-text">No students yet</p>
            ) : (
              <div className="recent-list">
                {students.slice(-5).reverse().map(s => (
                  <Link key={s.id} to={`/students/${s.id}`} className="recent-card">
                    <div className="student-avatar">
                      {(s.name || "?").charAt(0).toUpperCase()}
                    </div>
                    <div className="student-info">
                      <h4>{s.name || "Unnamed"}</h4>
                      <span>{s.transmission || "N/A"} transmission</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </FadeIn>

        <FadeIn delay={0.4}>
          <div className="section-card">
            <div className="section-header">
              <h2>Upcoming Lessons</h2>
              <Link to="/lessons">View all</Link>
            </div>
            {upcomingLessons.length === 0 ? (
              <p className="empty-text">No upcoming lessons</p>
            ) : (
              <div className="lessons-list">
                {upcomingLessons.map(l => (
                  <Link key={l.id} to={`/lessons/${l.id}`} className="lesson-item">
                    <div className="lesson-date-box">
                      <span className="day">{new Date(l.date).getDate()}</span>
                      <span className="month">{new Date(l.date).toLocaleString("default", { month: "short" })}</span>
                    </div>
                    <div className="lesson-info">
                      <h4>{l.studentName || "Student"}</h4>
                      <span>{l.time || "TBD"}</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </FadeIn>
      </div>

      <FadeIn delay={0.5}>
        <div className="quick-actions">
          <h2>Quick Actions</h2>
          <div className="actions-grid">
            <Link to="/students/add">
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                + Add Student
              </motion.button>
            </Link>
            <Link to="/book-lesson">
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} style={{ background: "#10b981" }}>
                + Book Lesson
              </motion.button>
            </Link>
            <Link to="/tips">
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} style={{ background: "#f59e0b" }}>
                + Add Tip
              </motion.button>
            </Link>
          </div>
        </div>
      </FadeIn>
    </div>
  );
}
