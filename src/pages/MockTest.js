import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuiz } from "../context/QuizContext";
import { useNavigate } from "react-router-dom";
import { CATEGORIES } from "../data/questionBank";

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function MockTest() {
  const navigate = useNavigate();
  const {
    questions, currentIndex, selectedAnswer, answers,
    flagged, isFinished, results, timeRemaining,
    selectAnswer, nextQuestion, prevQuestion, goToQuestion,
    toggleFlag, finishMockTest, exitQuiz,
    MOCK_TEST_PASS_MARK,
  } = useQuiz();

  const [showNav, setShowNav] = useState(false);
  const [confirmFinish, setConfirmFinish] = useState(false);

  const question = questions[currentIndex];
  const isLowTime = timeRemaining <= 300; // 5 minutes

  const handleExit = () => {
    exitQuiz();
    navigate("/premium/study-hub");
  };

  // ─── Results Screen ──────────────────────────────────────
  if (isFinished && results) {
    const categoryMap = {};
    CATEGORIES.forEach(c => { categoryMap[c.id] = c.title; });
    const weakCategories = Object.entries(results.breakdown)
      .filter(([, v]) => v.total > 0 && (v.correct / v.total) < 0.7)
      .sort((a, b) => (a[1].correct / a[1].total) - (b[1].correct / b[1].total));

    return (
      <div style={s.page}>
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} style={s.card}>
          {/* Pass/Fail Header */}
          <div style={{
            width: "100px", height: "100px", borderRadius: "50%", margin: "0 auto 20px",
            display: "flex", alignItems: "center", justifyContent: "center",
            background: results.passed ? "#f0fdf4" : "#fef2f2",
            color: results.passed ? "#22c55e" : "#ef4444",
            boxShadow: `0 8px 30px ${results.passed ? "#22c55e" : "#ef4444"}25`,
          }}>
            {results.passed ? (
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            ) : (
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            )}
          </div>

          <h2 style={{ fontSize: "26px", fontWeight: "700", color: "#111827", textAlign: "center", marginBottom: "4px" }}>
            {results.passed ? "You Passed" : "Not Quite"}
          </h2>
          <p style={{ textAlign: "center", color: "#6b7280", marginBottom: "24px" }}>
            {results.passed ? "Congratulations! You are ready for the real test." : "Keep practising and try again."}
          </p>

          {/* Score */}
          <div style={{
            display: "flex", justifyContent: "center", gap: "32px", marginBottom: "28px",
            flexWrap: "wrap",
          }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "32px", fontWeight: "700", color: results.passed ? "#22c55e" : "#ef4444" }}>
                {results.score}/{results.total}
              </div>
              <div style={{ fontSize: "12px", color: "#6b7280" }}>Score (Pass: {MOCK_TEST_PASS_MARK})</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "32px", fontWeight: "700", color: "#111827" }}>
                {Math.round((results.score / results.total) * 100)}%
              </div>
              <div style={{ fontSize: "12px", color: "#6b7280" }}>Accuracy</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "32px", fontWeight: "700", color: "#111827" }}>
                {formatTime(results.timeUsed)}
              </div>
              <div style={{ fontSize: "12px", color: "#6b7280" }}>Time Used</div>
            </div>
          </div>

          {/* Category Breakdown */}
          <div style={{ marginBottom: "24px" }}>
            <h3 style={{ fontSize: "14px", fontWeight: "600", color: "#111827", marginBottom: "12px" }}>
              Category Breakdown
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {Object.entries(results.breakdown).map(([catId, data]) => {
                const pct = data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0;
                const barColor = pct >= 80 ? "#22c55e" : pct >= 60 ? "#f59e0b" : "#ef4444";
                return (
                  <div key={catId}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "4px" }}>
                      <span style={{ color: "#374151", fontWeight: "500" }}>{categoryMap[catId] || catId}</span>
                      <span style={{ color: barColor, fontWeight: "600" }}>{data.correct}/{data.total}</span>
                    </div>
                    <div style={{ height: "6px", background: "#f3f4f6", borderRadius: "3px", overflow: "hidden" }}>
                      <div style={{
                        height: "100%", width: `${pct}%`, background: barColor,
                        borderRadius: "3px", transition: "width 0.5s ease",
                      }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Weak Areas */}
          {weakCategories.length > 0 && (
            <div style={{
              background: "#fffbeb", border: "1px solid #fde68a",
              borderRadius: "10px", padding: "14px 16px", marginBottom: "24px",
            }}>
              <div style={{ fontSize: "13px", fontWeight: "600", color: "#92400e", marginBottom: "6px" }}>
                Recommended Review
              </div>
              <div style={{ fontSize: "12px", color: "#a16207", lineHeight: "1.5" }}>
                {weakCategories.map(([catId]) => categoryMap[catId] || catId).join(", ")}
              </div>
            </div>
          )}

          <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
            <button onClick={handleExit} style={{ ...s.btn, ...s.btnGhost }}>Back to Study Hub</button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (!question) {
    return (
      <div style={s.page}>
        <div style={s.card}>
          <h2 style={{ fontSize: "20px", fontWeight: "600", color: "#111827", marginBottom: "12px" }}>Loading...</h2>
          <button onClick={handleExit} style={{ ...s.btn, ...s.btnPrimary }}>Back to Study Hub</button>
        </div>
      </div>
    );
  }

  const answeredCount = Object.keys(answers).length + (selectedAnswer !== null && !answers[question.id] && answers[question.id] !== 0 ? 1 : 0);

  return (
    <div style={s.page}>
      {/* Header */}
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        marginBottom: "20px", flexWrap: "wrap", gap: "12px",
      }}>
        <div>
          <div style={{ fontSize: "12px", color: "#6b7280", fontWeight: "500", marginBottom: "2px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
            Mock Theory Test
          </div>
          <div style={{ fontSize: "18px", fontWeight: "700", color: "#111827" }}>
            Question {currentIndex + 1} of {questions.length}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {/* Timer */}
          <div style={{
            background: isLowTime ? "#fef2f2" : "#f0f9ff",
            color: isLowTime ? "#ef4444" : "#1d4ed8",
            padding: "8px 16px", borderRadius: "10px",
            fontWeight: "700", fontSize: "18px", fontVariantNumeric: "tabular-nums",
            border: `1px solid ${isLowTime ? "#fecaca" : "#bfdbfe"}`,
          }}>
            {formatTime(timeRemaining)}
          </div>
          {/* Question Navigator Toggle */}
          <button
            onClick={() => setShowNav(!showNav)}
            style={{
              background: "#f3f4f6", border: "none", borderRadius: "8px",
              padding: "8px 12px", cursor: "pointer", fontSize: "12px", fontWeight: "600", color: "#374151",
            }}
          >
            {showNav ? "Hide" : "Grid"}
          </button>
        </div>
      </div>

      {/* Question Navigator Panel */}
      <AnimatePresence>
        {showNav && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            style={{ marginBottom: "20px", overflow: "hidden" }}
          >
            <div style={{
              display: "flex", flexWrap: "wrap", gap: "6px", padding: "16px",
              background: "#f9fafb", borderRadius: "12px", border: "1px solid #e5e7eb",
            }}>
              {questions.map((q, i) => {
                const isAnswered = answers[q.id] !== undefined;
                const isFlagged = flagged.has(q.id);
                const isCurrent = i === currentIndex;
                return (
                  <button
                    key={i}
                    onClick={() => { goToQuestion(i); setShowNav(false); }}
                    style={{
                      width: "36px", height: "36px", borderRadius: "8px",
                      border: isCurrent ? "2px solid #2563eb" : "1px solid #e5e7eb",
                      background: isFlagged ? "#fef3c7" : isAnswered ? "#dbeafe" : "white",
                      fontSize: "12px", fontWeight: "600",
                      color: isCurrent ? "#2563eb" : isAnswered ? "#1d4ed8" : "#6b7280",
                      cursor: "pointer",
                    }}
                  >
                    {i + 1}
                  </button>
                );
              })}
            </div>
            <div style={{ display: "flex", gap: "16px", marginTop: "8px", fontSize: "11px", color: "#6b7280", paddingLeft: "4px" }}>
              <span><span style={{ display: "inline-block", width: "10px", height: "10px", borderRadius: "3px", background: "#dbeafe", marginRight: "4px" }} />Answered</span>
              <span><span style={{ display: "inline-block", width: "10px", height: "10px", borderRadius: "3px", background: "#fef3c7", marginRight: "4px" }} />Flagged</span>
              <span><span style={{ display: "inline-block", width: "10px", height: "10px", borderRadius: "3px", background: "white", border: "1px solid #e5e7eb", marginRight: "4px" }} />Unanswered</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Question Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={question.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
          style={s.card}
        >
          <p style={{ fontSize: "16px", fontWeight: "600", color: "#111827", lineHeight: "1.6", marginBottom: "24px" }}>
            {question.text}
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "24px" }}>
            {question.options.map((option, i) => {
              const isSelected = (answers[question.id] !== undefined ? answers[question.id] : selectedAnswer) === i;
              return (
                <button
                  key={i}
                  onClick={() => selectAnswer(i)}
                  style={{
                    width: "100%", padding: "14px 18px", borderRadius: "10px",
                    border: `2px solid ${isSelected ? "#2563eb" : "#e5e7eb"}`,
                    background: isSelected ? "#eff6ff" : "white",
                    fontSize: "14px", fontWeight: "500",
                    cursor: "pointer", textAlign: "left",
                    transition: "all 0.2s", color: "#1f2937",
                    display: "flex", alignItems: "center", gap: "12px",
                  }}
                >
                  <span style={{
                    width: "26px", height: "26px", borderRadius: "50%",
                    border: `2px solid ${isSelected ? "#2563eb" : "#d1d5db"}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "12px", fontWeight: "600", flexShrink: 0,
                    background: isSelected ? "#2563eb" : "transparent",
                    color: isSelected ? "white" : "#9ca3af",
                  }}>
                    {String.fromCharCode(65 + i)}
                  </span>
                  {option}
                </button>
              );
            })}
          </div>

          {/* Navigation */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <button
              onClick={prevQuestion}
              disabled={currentIndex === 0}
              style={{
                ...s.btn, ...s.btnGhost,
                opacity: currentIndex === 0 ? 0.4 : 1,
                cursor: currentIndex === 0 ? "default" : "pointer",
                display: "flex", alignItems: "center", gap: "6px",
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
              Previous
            </button>

            <button
              onClick={toggleFlag}
              style={{
                background: flagged.has(question.id) ? "#fef3c7" : "#f3f4f6",
                border: flagged.has(question.id) ? "1px solid #fde68a" : "1px solid #e5e7eb",
                borderRadius: "8px", padding: "8px 14px", cursor: "pointer",
                fontSize: "12px", fontWeight: "600",
                color: flagged.has(question.id) ? "#92400e" : "#6b7280",
              }}
            >
              {flagged.has(question.id) ? "Flagged" : "Flag"}
            </button>

            {currentIndex < questions.length - 1 ? (
              <button onClick={nextQuestion} style={{ ...s.btn, ...s.btnPrimary, display: "flex", alignItems: "center", gap: "6px" }}>
                Next
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
              </button>
            ) : (
              <button
                onClick={() => setConfirmFinish(true)}
                style={{ ...s.btn, background: "#dc2626", color: "white" }}
              >
                Finish Test
              </button>
            )}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Status Bar */}
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        marginTop: "16px", fontSize: "12px", color: "#6b7280",
      }}>
        <span>{Object.keys(answers).length} of {questions.length} answered</span>
        {flagged.size > 0 && <span>{flagged.size} flagged</span>}
      </div>

      {/* Confirm Finish Modal */}
      <AnimatePresence>
        {confirmFinish && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
              background: "rgba(0,0,0,0.5)", display: "flex",
              alignItems: "center", justifyContent: "center", zIndex: 1000,
            }}
            onClick={() => setConfirmFinish(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                background: "white", borderRadius: "16px", padding: "32px",
                maxWidth: "400px", width: "90%", textAlign: "center",
              }}
            >
              <h3 style={{ fontSize: "18px", fontWeight: "700", color: "#111827", marginBottom: "8px" }}>
                Finish Mock Test?
              </h3>
              <p style={{ fontSize: "14px", color: "#6b7280", marginBottom: "8px" }}>
                You have answered {Object.keys(answers).length} of {questions.length} questions.
              </p>
              {Object.keys(answers).length < questions.length && (
                <p style={{ fontSize: "13px", color: "#f59e0b", marginBottom: "16px" }}>
                  {questions.length - Object.keys(answers).length} questions are unanswered and will be marked incorrect.
                </p>
              )}
              <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
                <button onClick={() => setConfirmFinish(false)} style={{ ...s.btn, ...s.btnGhost }}>
                  Continue Test
                </button>
                <button onClick={() => { setConfirmFinish(false); finishMockTest(); }} style={{ ...s.btn, background: "#dc2626", color: "white" }}>
                  Submit Answers
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const s = {
  page: { maxWidth: "720px", margin: "0 auto", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" },
  card: { background: "white", borderRadius: "16px", padding: "32px", border: "1px solid #e5e7eb" },
  btn: { padding: "10px 20px", borderRadius: "10px", border: "none", fontSize: "14px", fontWeight: "600", cursor: "pointer", transition: "all 0.2s" },
  btnPrimary: { background: "#2563eb", color: "white" },
  btnGhost: { background: "#f3f4f6", color: "#374151" },
};
