import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuiz } from "../context/QuizContext";
import { useNavigate } from "react-router-dom";
import { CATEGORIES } from "../data/questionBank";

export default function PracticeMode() {
  const navigate = useNavigate();
  const {
    questions, currentIndex, selectedAnswer, showFeedback,
    isFinished, currentCategory, selectAnswer, nextQuestion, exitQuiz,
    getCategoryProgress,
  } = useQuiz();

  const category = CATEGORIES.find(c => c.id === currentCategory);
  const question = questions[currentIndex];
  const progress = currentCategory ? getCategoryProgress(currentCategory) : null;

  const handleExit = () => {
    exitQuiz();
    navigate("/premium/study-hub");
  };

  if (!question) {
    return (
      <div style={s.page}>
        <div style={s.card}>
          <h2 style={{ fontSize: "20px", fontWeight: "600", color: "#111827", marginBottom: "12px" }}>No Questions Available</h2>
          <p style={{ color: "#6b7280", marginBottom: "20px" }}>This category doesn't have any questions yet.</p>
          <button onClick={handleExit} style={{ ...s.btn, ...s.btnPrimary }}>Back to Study Hub</button>
        </div>
      </div>
    );
  }

  // Practice complete
  if (isFinished) {
    return (
      <div style={s.page}>
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={s.card}>
          <div style={{
            width: "80px", height: "80px", borderRadius: "50%", margin: "0 auto 20px",
            display: "flex", alignItems: "center", justifyContent: "center",
            background: "#f0fdf4", color: "#22c55e", fontSize: "36px",
          }}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <h2 style={{ fontSize: "22px", fontWeight: "700", color: "#111827", textAlign: "center", marginBottom: "8px" }}>
            Practice Complete
          </h2>
          <p style={{ textAlign: "center", color: "#6b7280", marginBottom: "8px" }}>
            {category?.title || "Category"}
          </p>
          {progress && (
            <p style={{ textAlign: "center", color: "#111827", fontWeight: "600", fontSize: "18px", marginBottom: "24px" }}>
              {progress.correct} / {progress.totalQuestions} mastered ({progress.percentage}%)
            </p>
          )}
          <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
            <button onClick={handleExit} style={{ ...s.btn, ...s.btnGhost }}>Back to Study Hub</button>
            <button
              onClick={() => {
                exitQuiz();
                navigate("/premium/study-hub");
              }}
              style={{ ...s.btn, ...s.btnPrimary }}
            >
              Continue Studying
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  const isCorrect = selectedAnswer === question.correct_index;

  return (
    <div style={s.page}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <div>
          <button onClick={handleExit} style={{
            background: "none", border: "none", cursor: "pointer",
            display: "flex", alignItems: "center", gap: "6px",
            color: "#6b7280", fontSize: "13px", padding: 0, marginBottom: "4px",
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
            Back to Study Hub
          </button>
          <h1 style={{ fontSize: "20px", fontWeight: "700", color: "#111827" }}>
            {category?.title || "Practice"}
          </h1>
        </div>
        <div style={{
          background: category?.color_theme + "15",
          color: category?.color_theme,
          padding: "6px 14px", borderRadius: "8px",
          fontSize: "13px", fontWeight: "600",
        }}>
          {currentIndex + 1} / {questions.length}
        </div>
      </div>

      {/* Progress Bar */}
      <div style={{ height: "4px", background: "#e5e7eb", borderRadius: "2px", marginBottom: "28px", overflow: "hidden" }}>
        <motion.div
          style={{ height: "100%", background: category?.color_theme || "#2563eb", borderRadius: "2px" }}
          animate={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Question Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={question.id}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.25 }}
          style={s.card}
        >
          {/* Question Text */}
          <p style={{ fontSize: "17px", fontWeight: "600", color: "#111827", lineHeight: "1.6", marginBottom: "24px" }}>
            {question.text}
          </p>

          {/* Options */}
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "20px" }}>
            {question.options.map((option, i) => {
              const isSelected = selectedAnswer === i;
              const isCorrectOption = i === question.correct_index;
              let borderColor = "#e5e7eb";
              let bg = "white";
              let textColor = "#1f2937";

              if (showFeedback) {
                if (isCorrectOption) {
                  borderColor = "#22c55e";
                  bg = "#f0fdf4";
                }
                if (isSelected && !isCorrectOption) {
                  borderColor = "#ef4444";
                  bg = "#fef2f2";
                }
              } else if (isSelected) {
                borderColor = category?.color_theme || "#2563eb";
                bg = (category?.color_theme || "#2563eb") + "10";
              }

              return (
                <motion.button
                  key={i}
                  whileTap={!showFeedback ? { scale: 0.98 } : {}}
                  onClick={() => selectAnswer(i)}
                  disabled={showFeedback}
                  style={{
                    width: "100%", padding: "14px 18px", borderRadius: "10px",
                    border: `2px solid ${borderColor}`, background: bg,
                    fontSize: "14px", fontWeight: "500", cursor: showFeedback ? "default" : "pointer",
                    textAlign: "left", transition: "all 0.2s", color: textColor,
                    display: "flex", alignItems: "center", gap: "12px",
                  }}
                >
                  <span style={{
                    width: "26px", height: "26px", borderRadius: "50%",
                    border: `2px solid ${showFeedback && isCorrectOption ? "#22c55e" : showFeedback && isSelected ? "#ef4444" : "#d1d5db"}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "12px", fontWeight: "600", flexShrink: 0,
                    background: showFeedback && isCorrectOption ? "#22c55e" : showFeedback && isSelected && !isCorrectOption ? "#ef4444" : "transparent",
                    color: showFeedback && (isCorrectOption || isSelected) ? "white" : "#9ca3af",
                  }}>
                    {String.fromCharCode(65 + i)}
                  </span>
                  {option}
                </motion.button>
              );
            })}
          </div>

          {/* Feedback */}
          <AnimatePresence>
            {showFeedback && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                style={{
                  background: isCorrect ? "#f0fdf4" : "#fef2f2",
                  border: `1px solid ${isCorrect ? "#bbf7d0" : "#fecaca"}`,
                  borderRadius: "10px", padding: "16px", marginBottom: "20px",
                }}
              >
                <div style={{
                  fontSize: "14px", fontWeight: "600",
                  color: isCorrect ? "#166534" : "#991b1b",
                  marginBottom: "6px",
                }}>
                  {isCorrect ? "Correct" : "Incorrect"}
                </div>
                <div style={{ fontSize: "13px", color: isCorrect ? "#15803d" : "#b91c1c", lineHeight: "1.5" }}>
                  {question.explanation}
                </div>
                {question.highway_code_ref && (
                  <div style={{
                    marginTop: "8px", fontSize: "11px", fontWeight: "600",
                    color: isCorrect ? "#15803d" : "#b91c1c", opacity: 0.7,
                  }}>
                    Reference: {question.highway_code_ref}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Next Button */}
          {showFeedback && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{ display: "flex", justifyContent: "flex-end" }}
            >
              <button
                onClick={nextQuestion}
                style={{ ...s.btn, ...s.btnPrimary, display: "flex", alignItems: "center", gap: "6px" }}
              >
                {currentIndex < questions.length - 1 ? "Next Question" : "Finish"}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
              </button>
            </motion.div>
          )}
        </motion.div>
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
