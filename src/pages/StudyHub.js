import React from "react";
import { motion } from "framer-motion";
import { useQuiz } from "../context/QuizContext";
import { useNavigate } from "react-router-dom";

// Icon map for categories
const ICONS = {
  eye: (c) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
  heart: (c) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>,
  shield: (c) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  ruler: (c) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 3h5v5"/><path d="M8 3H3v5"/><path d="M12 22v-8.3a4 4 0 0 0-1.172-2.872L3 3"/><path d="m15 9 6-6"/></svg>,
  alert: (c) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
  users: (c) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  truck: (c) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>,
  settings: (c) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
  road: (c) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3L4 21"/><path d="M16 3l4 18"/><path d="M12 6v2"/><path d="M12 12v2"/><path d="M12 18v2"/></svg>,
  book: (c) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>,
  sign: (c) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="3" x2="12" y2="21"/><path d="M4 6h16l-2 3 2 3H4"/></svg>,
  file: (c) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>,
  plus: (c) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>,
  box: (c) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>,
};

function ProgressRing({ percentage, color, size = 52 }) {
  const radius = (size - 6) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#e5e7eb" strokeWidth="4" />
      <circle
        cx={size / 2} cy={size / 2} r={radius} fill="none"
        stroke={color} strokeWidth="4"
        strokeDasharray={circumference} strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: "stroke-dashoffset 0.6s ease" }}
      />
    </svg>
  );
}

export default function StudyHub() {
  const navigate = useNavigate();
  const { CATEGORIES: categories, getCategoryProgress, getReadinessScore, startPractice, startMockTest } = useQuiz();

  const readiness = getReadinessScore();

  const handleStartPractice = (categoryId) => {
    startPractice(categoryId);
    navigate("/premium/practice");
  };

  const handleStartMock = () => {
    startMockTest();
    navigate("/premium/mock-test");
  };

  const s = {
    page: { maxWidth: "960px", margin: "0 auto", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" },
    h1: { fontSize: "28px", fontWeight: "700", color: "#111827", marginBottom: "6px" },
    sub: { fontSize: "15px", color: "#6b7280", marginBottom: "28px", lineHeight: "1.5" },
  };

  return (
    <div style={s.page}>
      <motion.div initial={{ opacity: 0, y: -15 }} animate={{ opacity: 1, y: 0 }}>
        <h1 style={s.h1}>Study Hub</h1>
        <p style={s.sub}>Master all 14 Highway Code categories to prepare for your theory test.</p>
      </motion.div>

      {/* Readiness + Mock Test CTA */}
      <motion.div
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        style={{
          display: "flex", gap: "20px", marginBottom: "32px", flexWrap: "wrap",
        }}
      >
        {/* Readiness Card */}
        <div style={{
          flex: "1 1 260px", background: "linear-gradient(135deg, #1e3a5f, #2563eb)",
          borderRadius: "16px", padding: "28px", color: "white", minWidth: "260px",
        }}>
          <div style={{ fontSize: "13px", fontWeight: "500", opacity: 0.8, marginBottom: "8px" }}>Your Readiness</div>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div style={{
              width: "72px", height: "72px", borderRadius: "50%",
              border: "3px solid rgba(255,255,255,0.3)", display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "24px", fontWeight: "700",
            }}>
              {readiness}%
            </div>
            <div>
              <div style={{ fontSize: "16px", fontWeight: "600", marginBottom: "4px" }}>
                {readiness >= 86 ? "Test Ready" : readiness >= 50 ? "Getting There" : "Keep Studying"}
              </div>
              <div style={{ fontSize: "12px", opacity: 0.75 }}>
                Pass mark is 43/50 (86%)
              </div>
            </div>
          </div>
        </div>

        {/* Mock Test CTA */}
        <div style={{
          flex: "1 1 260px", background: "white", borderRadius: "16px",
          padding: "28px", border: "2px solid #e5e7eb", minWidth: "260px",
          display: "flex", flexDirection: "column", justifyContent: "space-between",
        }}>
          <div>
            <div style={{ fontSize: "13px", fontWeight: "600", color: "#dc2626", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              Mock Test
            </div>
            <div style={{ fontSize: "16px", fontWeight: "600", color: "#111827", marginBottom: "4px" }}>
              50 Questions in 57 Minutes
            </div>
            <div style={{ fontSize: "13px", color: "#6b7280" }}>
              Simulates real DVSA test conditions with weighted categories.
            </div>
          </div>
          <button
            onClick={handleStartMock}
            style={{
              marginTop: "16px", padding: "10px 20px", borderRadius: "10px",
              border: "none", background: "#dc2626", color: "white",
              fontSize: "14px", fontWeight: "600", cursor: "pointer",
              transition: "background 0.2s",
            }}
            onMouseOver={(e) => e.target.style.background = "#b91c1c"}
            onMouseOut={(e) => e.target.style.background = "#dc2626"}
          >
            Start Mock Test
          </button>
        </div>
      </motion.div>

      {/* Category Grid */}
      <div style={{ fontSize: "13px", fontWeight: "600", color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "14px" }}>
        14 Categories
      </div>
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
        gap: "16px",
        marginBottom: "40px",
      }}>
        {categories.map((cat, i) => {
          const progress = getCategoryProgress(cat.id);
          const IconComponent = ICONS[cat.icon];
          const statusColor = progress.status === "completed" ? "#22c55e"
            : progress.status === "in_progress" ? cat.color_theme : "#9ca3af";

          return (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * i }}
              onClick={() => handleStartPractice(cat.id)}
              style={{
                background: "white",
                borderRadius: "14px",
                padding: "20px",
                border: "1px solid #e5e7eb",
                cursor: "pointer",
                transition: "all 0.2s",
                display: "flex",
                gap: "16px",
                alignItems: "flex-start",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.boxShadow = "0 6px 20px rgba(0,0,0,0.08)";
                e.currentTarget.style.transform = "translateY(-2px)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.boxShadow = "none";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              {/* Progress Ring + Icon */}
              <div style={{ position: "relative", flexShrink: 0 }}>
                <ProgressRing percentage={progress.percentage} color={statusColor} size={52} />
                <div style={{
                  position: "absolute", top: "50%", left: "50%",
                  transform: "translate(-50%, -50%)",
                }}>
                  {IconComponent ? IconComponent(statusColor) : null}
                </div>
              </div>

              {/* Text */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: "15px", fontWeight: "600", color: "#111827", marginBottom: "3px" }}>
                  {cat.title}
                </div>
                <div style={{ fontSize: "12px", color: "#6b7280", lineHeight: "1.4", marginBottom: "8px" }}>
                  {cat.description}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "11px" }}>
                  <span style={{ color: statusColor, fontWeight: "600" }}>
                    {progress.correct}/{progress.totalQuestions} correct
                  </span>
                  <span style={{ color: "#d1d5db" }}>|</span>
                  <span style={{ color: "#9ca3af" }}>
                    {progress.percentage}%
                  </span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Attribution */}
      <div style={{
        padding: "16px 20px", background: "#f9fafb", borderRadius: "10px",
        border: "1px solid #e5e7eb", fontSize: "11px", color: "#9ca3af",
        lineHeight: "1.5", marginBottom: "20px",
      }}>
        Contains public sector information licensed under the Open Government Licence v3.0.
        Traffic sign images are Crown Copyright. Sourced from the Department for Transport.
        This application is not affiliated with the DVSA.
      </div>
    </div>
  );
}
