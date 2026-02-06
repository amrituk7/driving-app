import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { saveSecondBeforeAttempt } from "../firebase";

const SCENARIOS = [
  {
    id: "parked-car-door",
    title: "Parked Car Door Opening",
    description: "You're driving along a residential street. A parked car ahead has someone sitting in the driver's seat about to open their door.",
    hazardTime: 3000,
    targetTime: 2000,
    bgGradient: "linear-gradient(180deg, #bae6fd 0%, #86efac 55%, #64748b 55%, #475569 100%)"
  },
  {
    id: "pedestrian-stepping-out",
    title: "Pedestrian Stepping Out",
    description: "A pedestrian on the pavement is looking at their phone and drifting toward the kerb edge near a crossing.",
    hazardTime: 3500,
    targetTime: 2500,
    bgGradient: "linear-gradient(180deg, #e0e7ff 0%, #c7d2fe 55%, #64748b 55%, #475569 100%)"
  },
  {
    id: "cyclist-overtaking",
    title: "Cyclist Overtaking",
    description: "You're approaching a junction and a cyclist on your left is about to cut across to turn right.",
    hazardTime: 2500,
    targetTime: 1500,
    bgGradient: "linear-gradient(180deg, #fef3c7 0%, #fde68a 55%, #64748b 55%, #475569 100%)"
  }
];

const getRating = (accuracy) => {
  if (accuracy <= 150) return { label: "Perfect Timing", color: "#16a34a", icon: "star" };
  if (accuracy <= 350) return { label: "Excellent", color: "#22c55e", icon: "check" };
  if (accuracy <= 600) return { label: "Good", color: "#eab308", icon: "check" };
  if (accuracy <= 900) return { label: "Fair", color: "#f97316", icon: "minus" };
  return { label: "Needs Practice", color: "#ef4444", icon: "x" };
};

const getFeedback = (tapTime, targetTime, hazardTime) => {
  const diff = tapTime - targetTime;
  if (Math.abs(diff) <= 150) return "Perfect! Right on the mark.";
  if (diff < -300) return "Too early! Wait a bit longer before reacting.";
  if (diff < 0) return "Slightly early, but good anticipation.";
  if (diff > 300) return "Too late! The hazard was already appearing.";
  return "A little late, try to anticipate sooner.";
};

export default function SecondBefore() {
  const navigate = useNavigate();
  const auth = useAuth() || {};
  const userId = auth.user?.uid;

  const [gameState, setGameState] = useState("menu");
  const [currentScenario, setCurrentScenario] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [userTapTime, setUserTapTime] = useState(null);
  const [accuracy, setAccuracy] = useState(null);
  const [hazardVisible, setHazardVisible] = useState(false);
  const [countdownNum, setCountdownNum] = useState(3);
  const [results, setResults] = useState([]);
  const [tapped, setTapped] = useState(false);
  const [ripplePos, setRipplePos] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef(null);
  const elapsedRef = useRef(null);
  const countdownRef = useRef(null);

  const scenario = SCENARIOS[currentScenario];

  // Cleanup
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (elapsedRef.current) clearInterval(elapsedRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, []);

  const startCountdown = () => {
    setGameState("countdown");
    setCountdownNum(3);
    setHazardVisible(false);
    setTapped(false);
    setUserTapTime(null);
    setAccuracy(null);
    setRipplePos(null);
    setElapsed(0);

    let count = 3;
    countdownRef.current = setInterval(() => {
      count--;
      setCountdownNum(count);
      if (count === 0) {
        clearInterval(countdownRef.current);
        startScenario();
      }
    }, 1000);
  };

  const startScenario = () => {
    setGameState("playing");
    const now = Date.now();
    setStartTime(now);

    // Elapsed timer for UI
    elapsedRef.current = setInterval(() => {
      setElapsed(Date.now() - now);
    }, 50);

    timerRef.current = setTimeout(() => {
      setHazardVisible(true);
      // Auto-fail if not tapped after hazard
      setTimeout(() => {
        setTapped((wasTapped) => {
          if (!wasTapped) {
            clearInterval(elapsedRef.current);
            const tapTime = Date.now() - now;
            const acc = Math.abs(SCENARIOS[currentScenario].targetTime - tapTime);
            setUserTapTime(tapTime);
            setAccuracy(acc);
            setGameState("result");
            setResults((prev) => [...prev, {
              scenarioId: SCENARIOS[currentScenario].id,
              title: SCENARIOS[currentScenario].title,
              tapTime,
              targetTime: SCENARIOS[currentScenario].targetTime,
              hazardTime: SCENARIOS[currentScenario].hazardTime,
              accuracy: acc,
              rating: getRating(acc),
              missed: true
            }]);
          }
          return wasTapped;
        });
      }, 2000);
    }, scenario.hazardTime);
  };

  const handleTap = useCallback((e) => {
    if (gameState !== "playing" || tapped) return;
    setTapped(true);

    // Ripple effect position
    const rect = e.currentTarget.getBoundingClientRect();
    setRipplePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });

    if (timerRef.current) clearTimeout(timerRef.current);
    if (elapsedRef.current) clearInterval(elapsedRef.current);

    const tapTime = Date.now() - startTime;
    const acc = Math.abs(scenario.targetTime - tapTime);

    setUserTapTime(tapTime);
    setAccuracy(acc);
    setHazardVisible(true);

    setTimeout(() => {
      setGameState("result");
    }, 600);

    const newResult = {
      scenarioId: scenario.id,
      title: scenario.title,
      tapTime,
      targetTime: scenario.targetTime,
      hazardTime: scenario.hazardTime,
      accuracy: acc,
      rating: getRating(acc),
      missed: false
    };
    setResults((prev) => [...prev, newResult]);

    if (userId) {
      saveSecondBeforeAttempt(userId, scenario.id, scenario.targetTime, tapTime, acc).catch(console.error);
    }
  }, [gameState, tapped, startTime, scenario, userId]);

  const nextScenario = () => {
    if (currentScenario < SCENARIOS.length - 1) {
      setCurrentScenario((prev) => prev + 1);
      startCountdown();
    } else {
      setGameState("stats");
    }
  };

  const resetGame = () => {
    setCurrentScenario(0);
    setResults([]);
    setGameState("menu");
    setElapsed(0);
  };

  const avgAccuracy = results.length > 0
    ? Math.round(results.reduce((sum, r) => sum + r.accuracy, 0) / results.length)
    : 0;
  const overallRating = getRating(avgAccuracy);

  const s = {
    page: { maxWidth: "800px", margin: "0 auto", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" },
    h1: { fontSize: "28px", fontWeight: "700", color: "#111827", marginBottom: "6px" },
    sub: { fontSize: "15px", color: "#6b7280", lineHeight: "1.6", marginBottom: "30px" },
    card: { background: "white", borderRadius: "14px", padding: "28px", border: "1px solid #e5e7eb" },
    btn: { padding: "13px 24px", borderRadius: "10px", border: "none", fontSize: "15px", fontWeight: "600", cursor: "pointer", transition: "all 0.2s" },
    btnPrimary: { background: "#2563eb", color: "white" },
    btnGhost: { background: "#f3f4f6", color: "#374151" },
    gameArea: {
      position: "relative", width: "100%", height: "380px", borderRadius: "14px",
      overflow: "hidden", cursor: gameState === "playing" ? "crosshair" : "default",
      userSelect: "none", border: "1px solid #e5e7eb"
    },
    statCard: { background: "#f9fafb", borderRadius: "10px", padding: "16px", textAlign: "center" }
  };

  return (
    <div style={s.page}>
      <motion.div initial={{ opacity: 0, y: -15 }} animate={{ opacity: 1, y: 0 }}>
        <h1 style={s.h1}>Second Before</h1>
        <p style={s.sub}>Tap exactly one second before the hazard appears. Train your hazard anticipation skills for safer driving.</p>
      </motion.div>

      {/* ─── MENU ─── */}
      {gameState === "menu" && (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
          <div style={s.card}>
            <h2 style={{ fontSize: "20px", fontWeight: "600", marginBottom: "8px", color: "#111827" }}>How It Works</h2>
            <p style={{ fontSize: "14px", color: "#6b7280", marginBottom: "24px", lineHeight: "1.6" }}>
              Each scenario presents a driving situation. A hazard will appear at a specific moment. Your goal is to tap exactly <strong>one second before</strong> the hazard appears. The closer your timing, the higher your score.
            </p>

            <div style={{ display: "grid", gap: "10px", marginBottom: "28px" }}>
              {[
                { step: "1", text: "A driving scenario loads on screen" },
                { step: "2", text: "A hazard will appear at a set time" },
                { step: "3", text: "Tap one second BEFORE the hazard" },
                { step: "4", text: "Get rated on your timing accuracy" }
              ].map((item) => (
                <div key={item.step} style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                  <div style={{
                    width: "32px", height: "32px", borderRadius: "50%", background: "#2563eb", color: "white",
                    display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "700", fontSize: "13px", flexShrink: 0
                  }}>
                    {item.step}
                  </div>
                  <p style={{ fontSize: "14px", color: "#374151" }}>{item.text}</p>
                </div>
              ))}
            </div>

            <h3 style={{ fontSize: "14px", fontWeight: "600", color: "#6b7280", marginBottom: "12px" }}>
              {SCENARIOS.length} Scenarios
            </h3>
            <div style={{ display: "grid", gap: "8px", marginBottom: "28px" }}>
              {SCENARIOS.map((sc, i) => (
                <motion.div
                  key={sc.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06 }}
                  style={{ display: "flex", alignItems: "center", gap: "14px", padding: "14px", background: "#f9fafb", borderRadius: "10px" }}
                >
                  <div style={{
                    width: "36px", height: "36px", borderRadius: "8px", background: "#e0e7ff",
                    display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "700", fontSize: "14px", color: "#4338ca", flexShrink: 0
                  }}>
                    {i + 1}
                  </div>
                  <div>
                    <p style={{ fontWeight: "600", fontSize: "14px", color: "#111827" }}>{sc.title}</p>
                    <p style={{ fontSize: "12px", color: "#6b7280" }}>{sc.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <button onClick={startCountdown} style={{ ...s.btn, ...s.btnPrimary, width: "100%" }}>
              Start Training
            </button>
          </div>
        </motion.div>
      )}

      {/* ─── COUNTDOWN ─── */}
      {gameState === "countdown" && (
        <div style={{ ...s.card, textAlign: "center", padding: "60px 28px" }}>
          <p style={{ fontSize: "14px", color: "#6b7280", marginBottom: "8px" }}>
            Scenario {currentScenario + 1} of {SCENARIOS.length}
          </p>
          <h2 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "32px", color: "#111827" }}>
            {scenario.title}
          </h2>
          <AnimatePresence mode="wait">
            <motion.div
              key={countdownNum}
              initial={{ scale: 2, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ duration: 0.4 }}
              style={{ fontSize: "72px", fontWeight: "800", color: "#2563eb", marginBottom: "16px" }}
            >
              {countdownNum}
            </motion.div>
          </AnimatePresence>
          <p style={{ fontSize: "14px", color: "#9ca3af" }}>Get ready to tap...</p>
        </div>
      )}

      {/* ─── PLAYING ─── */}
      {gameState === "playing" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
            <div>
              <p style={{ fontSize: "13px", color: "#6b7280" }}>Scenario {currentScenario + 1} / {SCENARIOS.length}</p>
              <h2 style={{ fontSize: "18px", fontWeight: "600", color: "#111827" }}>{scenario.title}</h2>
            </div>
            <div style={{ display: "flex", gap: "6px" }}>
              {SCENARIOS.map((_, i) => (
                <div key={i} style={{ width: "10px", height: "10px", borderRadius: "50%", background: i <= currentScenario ? "#2563eb" : "#e5e7eb" }} />
              ))}
            </div>
          </div>

          <div onClick={handleTap} style={{ ...s.gameArea, background: scenario.bgGradient }}>
            {/* Road dashes */}
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "45%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "12px" }}>
              {[1, 2, 3].map((d) => <div key={d} style={{ width: "50px", height: "4px", background: "white", borderRadius: "2px", opacity: 0.5 }} />)}
            </div>

            {/* Elapsed timer */}
            <div style={{ position: "absolute", top: "12px", right: "12px", background: "rgba(255,255,255,0.9)", padding: "6px 12px", borderRadius: "6px", fontSize: "13px", fontWeight: "600", color: "#374151" }}>
              {(elapsed / 1000).toFixed(1)}s
            </div>

            {/* Scenario description */}
            <div style={{ position: "absolute", top: "12px", left: "12px", background: "rgba(255,255,255,0.92)", padding: "10px 14px", borderRadius: "8px", fontSize: "12px", color: "#374151", maxWidth: "260px", lineHeight: "1.4" }}>
              {scenario.description}
            </div>

            {/* Ripple effect */}
            <AnimatePresence>
              {ripplePos && (
                <motion.div
                  initial={{ scale: 0, opacity: 0.6 }}
                  animate={{ scale: 4, opacity: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.6 }}
                  style={{
                    position: "absolute",
                    left: ripplePos.x - 30,
                    top: ripplePos.y - 30,
                    width: "60px",
                    height: "60px",
                    borderRadius: "50%",
                    background: "rgba(37, 99, 235, 0.3)",
                    pointerEvents: "none"
                  }}
                />
              )}
            </AnimatePresence>

            {/* Hazard */}
            <AnimatePresence>
              {hazardVisible && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  style={{
                    position: "absolute", top: "28%", left: "50%", transform: "translateX(-50%)",
                    background: "#ef4444", color: "white", padding: "14px 28px", borderRadius: "12px",
                    fontWeight: "700", fontSize: "18px", boxShadow: "0 8px 25px rgba(239,68,68,0.4)"
                  }}
                >
                  HAZARD!
                </motion.div>
              )}
            </AnimatePresence>

            {/* Tap instruction */}
            {!tapped && (
              <motion.p
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                style={{
                  position: "absolute", bottom: "48%", left: "50%", transform: "translateX(-50%)",
                  fontSize: "16px", fontWeight: "600", color: "#1e293b", textAlign: "center",
                  background: "rgba(255,255,255,0.8)", padding: "8px 16px", borderRadius: "8px"
                }}
              >
                TAP NOW - one second before the hazard
              </motion.p>
            )}
          </div>
        </motion.div>
      )}

      {/* ─── RESULT ─── */}
      {gameState === "result" && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
          <div style={{ ...s.card, textAlign: "center" }}>
            <h2 style={{ fontSize: "20px", fontWeight: "600", marginBottom: "4px", color: "#111827" }}>
              {scenario.title}
            </h2>
            <p style={{ fontSize: "13px", color: "#6b7280", marginBottom: "28px" }}>
              Scenario {currentScenario + 1} of {SCENARIOS.length}
            </p>

            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 15 }}
              style={{
                width: "110px", height: "110px", borderRadius: "50%",
                background: getRating(accuracy).color, color: "white",
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                margin: "0 auto 24px", boxShadow: `0 8px 25px ${getRating(accuracy).color}40`
              }}
            >
              <p style={{ fontSize: "26px", fontWeight: "800" }}>{accuracy}ms</p>
              <p style={{ fontSize: "11px", fontWeight: "500" }}>off target</p>
            </motion.div>

            <p style={{ fontSize: "20px", fontWeight: "700", color: getRating(accuracy).color, marginBottom: "8px" }}>
              {getRating(accuracy).label}
            </p>
            <p style={{ fontSize: "14px", color: "#6b7280", marginBottom: "24px", lineHeight: "1.5" }}>
              {getFeedback(userTapTime, scenario.targetTime, scenario.hazardTime)}
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px", marginBottom: "24px" }}>
              <div style={s.statCard}>
                <p style={{ fontSize: "11px", color: "#6b7280", marginBottom: "4px" }}>Your Tap</p>
                <p style={{ fontSize: "18px", fontWeight: "700", color: "#111827" }}>{userTapTime}ms</p>
              </div>
              <div style={s.statCard}>
                <p style={{ fontSize: "11px", color: "#6b7280", marginBottom: "4px" }}>Target</p>
                <p style={{ fontSize: "18px", fontWeight: "700", color: "#111827" }}>{scenario.targetTime}ms</p>
              </div>
              <div style={s.statCard}>
                <p style={{ fontSize: "11px", color: "#6b7280", marginBottom: "4px" }}>Hazard At</p>
                <p style={{ fontSize: "18px", fontWeight: "700", color: "#111827" }}>{scenario.hazardTime}ms</p>
              </div>
            </div>

            <button onClick={nextScenario} style={{ ...s.btn, ...s.btnPrimary, width: "100%" }}>
              {currentScenario < SCENARIOS.length - 1 ? "Next Scenario" : "View Results"}
            </button>
          </div>
        </motion.div>
      )}

      {/* ─── STATS ─── */}
      {gameState === "stats" && (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
          <div style={{ ...s.card, textAlign: "center" }}>
            <h2 style={{ fontSize: "22px", fontWeight: "700", marginBottom: "6px", color: "#111827" }}>
              Training Complete
            </h2>
            <p style={{ fontSize: "14px", color: "#6b7280", marginBottom: "28px" }}>
              Your performance across all {SCENARIOS.length} scenarios
            </p>

            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 15 }}
              style={{
                width: "130px", height: "130px", borderRadius: "50%",
                background: overallRating.color, color: "white",
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                margin: "0 auto 28px", boxShadow: `0 8px 25px ${overallRating.color}40`
              }}
            >
              <p style={{ fontSize: "30px", fontWeight: "800" }}>{avgAccuracy}ms</p>
              <p style={{ fontSize: "12px", fontWeight: "500" }}>avg accuracy</p>
            </motion.div>

            <p style={{ fontSize: "20px", fontWeight: "700", color: overallRating.color, marginBottom: "28px" }}>
              {overallRating.label}
            </p>

            <div style={{ display: "grid", gap: "8px", marginBottom: "28px", textAlign: "left" }}>
              {results.map((r, i) => (
                <motion.div
                  key={r.scenarioId}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06 }}
                  style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px", background: "#f9fafb", borderRadius: "10px" }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div style={{
                      width: "32px", height: "32px", borderRadius: "8px",
                      background: r.rating.color, color: "white",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontWeight: "700", fontSize: "13px"
                    }}>
                      {i + 1}
                    </div>
                    <div>
                      <p style={{ fontWeight: "600", fontSize: "13px", color: "#111827" }}>{r.title}</p>
                      <p style={{ fontSize: "12px", color: "#6b7280" }}>
                        Tapped at {r.tapTime}ms / Target {r.targetTime}ms
                      </p>
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <p style={{ fontWeight: "700", color: r.rating.color, fontSize: "13px" }}>{r.accuracy}ms off</p>
                    <p style={{ fontSize: "12px", color: "#6b7280" }}>{r.rating.label}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <div style={{ display: "flex", gap: "12px" }}>
              <button onClick={resetGame} style={{ ...s.btn, ...s.btnPrimary, flex: 1 }}>
                Play Again
              </button>
              <button onClick={() => navigate("/premium/play-and-learn")} style={{ ...s.btn, ...s.btnGhost, flex: 1 }}>
                Back to Play & Learn
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
