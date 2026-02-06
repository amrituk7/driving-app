import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSubscription } from "../context/SubscriptionContext";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { saveSecondBeforeAttempt, getSecondBeforeAttempts } from "../firebase";
import Paywall from "../components/Paywall";

const SCENARIOS = [
  {
    id: "pedestrian-crossing",
    title: "Pedestrian Crossing",
    description: "A pedestrian is about to step onto a crossing ahead.",
    hazardTime: 3000,
    targetTime: 2000,
    bgColor: "#e0f2fe",
    roadColor: "#94a3b8"
  },
  {
    id: "cyclist-junction",
    title: "Cyclist at Junction",
    description: "A cyclist is approaching from a side road on your left.",
    hazardTime: 3500,
    targetTime: 2500,
    bgColor: "#fef3c7",
    roadColor: "#a3a3a3"
  },
  {
    id: "child-behind-car",
    title: "Child Behind Parked Car",
    description: "A ball rolls out from behind a parked car. A child may follow.",
    hazardTime: 2500,
    targetTime: 1500,
    bgColor: "#fce7f3",
    roadColor: "#9ca3af"
  },
  {
    id: "car-reversing",
    title: "Car Reversing Out",
    description: "A car is reversing out of a driveway ahead on the left.",
    hazardTime: 4000,
    targetTime: 3000,
    bgColor: "#e0e7ff",
    roadColor: "#a1a1aa"
  },
  {
    id: "roundabout-merge",
    title: "Roundabout Merge",
    description: "A vehicle is approaching the roundabout from the right at speed.",
    hazardTime: 3000,
    targetTime: 2000,
    bgColor: "#dcfce7",
    roadColor: "#9ca3af"
  }
];

const getRating = (accuracy) => {
  if (accuracy <= 200) return { label: "Perfect", color: "#16a34a", stars: 5 };
  if (accuracy <= 400) return { label: "Excellent", color: "#22c55e", stars: 4 };
  if (accuracy <= 700) return { label: "Good", color: "#eab308", stars: 3 };
  if (accuracy <= 1000) return { label: "Fair", color: "#f97316", stars: 2 };
  return { label: "Needs Practice", color: "#ef4444", stars: 1 };
};

export default function SecondBefore() {
  const sub = useSubscription() || {};
  const hasRoadMasterPlus = sub.hasRoadMasterPlus || false;
  const auth = useAuth() || {};
  const navigate = useNavigate();

  const [gameState, setGameState] = useState("menu"); // menu, countdown, playing, result, stats
  const [currentScenario, setCurrentScenario] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [userTapTime, setUserTapTime] = useState(null);
  const [accuracy, setAccuracy] = useState(null);
  const [hazardVisible, setHazardVisible] = useState(false);
  const [countdownNum, setCountdownNum] = useState(3);
  const [results, setResults] = useState([]);
  const [bestScores, setBestScores] = useState({});
  const [tapped, setTapped] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  if (!hasRoadMasterPlus) {
    return (
      <Paywall
        feature="Second Before"
        tier="student"
        onSubscribe={() => navigate("/subscribe")}
      />
    );
  }

  const scenario = SCENARIOS[currentScenario];

  const startCountdown = () => {
    setGameState("countdown");
    setCountdownNum(3);
    setHazardVisible(false);
    setTapped(false);
    setUserTapTime(null);
    setAccuracy(null);

    let count = 3;
    const interval = setInterval(() => {
      count--;
      setCountdownNum(count);
      if (count === 0) {
        clearInterval(interval);
        startScenario();
      }
    }, 1000);
  };

  const startScenario = () => {
    setGameState("playing");
    const now = Date.now();
    setStartTime(now);

    timerRef.current = setTimeout(() => {
      setHazardVisible(true);
    }, scenario.hazardTime);
  };

  const handleTap = useCallback(() => {
    if (gameState !== "playing" || tapped) return;
    setTapped(true);

    if (timerRef.current) clearTimeout(timerRef.current);

    const tapTime = Date.now() - startTime;
    const acc = Math.abs(scenario.targetTime - tapTime);

    setUserTapTime(tapTime);
    setAccuracy(acc);
    setHazardVisible(true);
    setGameState("result");

    const newResult = {
      scenarioId: scenario.id,
      title: scenario.title,
      tapTime,
      targetTime: scenario.targetTime,
      hazardTime: scenario.hazardTime,
      accuracy: acc,
      rating: getRating(acc)
    };
    setResults((prev) => [...prev, newResult]);

    if (auth.user?.uid) {
      saveSecondBeforeAttempt(
        auth.user.uid,
        scenario.id,
        scenario.targetTime,
        tapTime,
        acc
      ).catch(console.error);
    }
  }, [gameState, tapped, startTime, scenario, auth.user]);

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
  };

  const avgAccuracy = results.length > 0
    ? Math.round(results.reduce((sum, r) => sum + r.accuracy, 0) / results.length)
    : 0;

  const overallRating = getRating(avgAccuracy);

  const styles = {
    container: {
      maxWidth: "800px",
      margin: "0 auto",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    },
    header: {
      marginBottom: "30px"
    },
    title: {
      fontSize: "32px",
      fontWeight: "700",
      color: "#111827",
      marginBottom: "8px"
    },
    subtitle: {
      fontSize: "16px",
      color: "#6b7280",
      lineHeight: "1.6"
    },
    card: {
      background: "white",
      borderRadius: "16px",
      padding: "30px",
      border: "1px solid #e5e7eb",
      boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
    },
    gameArea: {
      position: "relative",
      width: "100%",
      height: "350px",
      borderRadius: "16px",
      overflow: "hidden",
      cursor: gameState === "playing" ? "crosshair" : "default",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      userSelect: "none"
    },
    road: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      height: "120px",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center"
    },
    dashLine: {
      width: "60px",
      height: "4px",
      background: "white",
      borderRadius: "2px",
      marginBottom: "12px"
    },
    btn: {
      padding: "14px 28px",
      borderRadius: "12px",
      border: "none",
      fontSize: "16px",
      fontWeight: "600",
      cursor: "pointer",
      transition: "all 0.2s"
    },
    btnPrimary: {
      background: "#2563eb",
      color: "white"
    },
    btnSecondary: {
      background: "#f3f4f6",
      color: "#374151"
    },
    scenarioCard: {
      background: "white",
      borderRadius: "12px",
      padding: "20px",
      border: "1px solid #e5e7eb",
      cursor: "pointer",
      transition: "all 0.2s"
    },
    progressDot: (active) => ({
      width: "12px",
      height: "12px",
      borderRadius: "50%",
      background: active ? "#2563eb" : "#e5e7eb"
    }),
    statCard: {
      background: "#f9fafb",
      borderRadius: "12px",
      padding: "20px",
      textAlign: "center"
    }
  };

  return (
    <div style={styles.container}>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={styles.header}
      >
        <h1 style={styles.title}>Second Before</h1>
        <p style={styles.subtitle}>
          Tap exactly one second before the hazard appears. Train your anticipation skills.
        </p>
      </motion.div>

      {/* MENU STATE */}
      {gameState === "menu" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div style={styles.card}>
            <h2 style={{ fontSize: "22px", fontWeight: "600", marginBottom: "8px" }}>How It Works</h2>
            <div style={{ display: "grid", gap: "15px", marginBottom: "25px" }}>
              {[
                { step: "1", text: "A driving scenario loads on screen." },
                { step: "2", text: "A hazard will appear at a specific moment." },
                { step: "3", text: "Tap exactly ONE SECOND BEFORE the hazard appears." },
                { step: "4", text: "The closer your timing, the higher your score." }
              ].map((item) => (
                <div key={item.step} style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                  <div style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "50%",
                    background: "#2563eb",
                    color: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: "700",
                    fontSize: "14px",
                    flexShrink: 0
                  }}>
                    {item.step}
                  </div>
                  <p style={{ fontSize: "15px", color: "#374151" }}>{item.text}</p>
                </div>
              ))}
            </div>

            <h3 style={{ fontSize: "16px", fontWeight: "600", marginBottom: "12px", color: "#6b7280" }}>
              {SCENARIOS.length} Scenarios Available
            </h3>

            <div style={{ display: "grid", gap: "10px", marginBottom: "25px" }}>
              {SCENARIOS.map((s, i) => (
                <motion.div
                  key={s.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                  style={{ ...styles.scenarioCard, display: "flex", alignItems: "center", gap: "15px" }}
                  whileHover={{ borderColor: "#2563eb", background: "#f0f7ff" }}
                >
                  <div style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "10px",
                    background: s.bgColor,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "14px",
                    fontWeight: "700",
                    color: "#374151",
                    flexShrink: 0
                  }}>
                    {i + 1}
                  </div>
                  <div>
                    <p style={{ fontWeight: "600", fontSize: "15px", color: "#111827" }}>{s.title}</p>
                    <p style={{ fontSize: "13px", color: "#6b7280" }}>{s.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <button
              onClick={startCountdown}
              style={{ ...styles.btn, ...styles.btnPrimary, width: "100%" }}
            >
              Start Training
            </button>
          </div>
        </motion.div>
      )}

      {/* COUNTDOWN STATE */}
      {gameState === "countdown" && (
        <div style={{ ...styles.card, textAlign: "center", padding: "60px" }}>
          <p style={{ fontSize: "16px", color: "#6b7280", marginBottom: "10px" }}>
            Scenario {currentScenario + 1} of {SCENARIOS.length}
          </p>
          <h2 style={{ fontSize: "20px", fontWeight: "600", marginBottom: "30px" }}>
            {scenario.title}
          </h2>
          <motion.div
            key={countdownNum}
            initial={{ scale: 2, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            style={{ fontSize: "80px", fontWeight: "800", color: "#2563eb" }}
          >
            {countdownNum}
          </motion.div>
          <p style={{ fontSize: "14px", color: "#9ca3af", marginTop: "20px" }}>
            Get ready to tap...
          </p>
        </div>
      )}

      {/* PLAYING STATE */}
      {gameState === "playing" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
            <div>
              <p style={{ fontSize: "14px", color: "#6b7280" }}>Scenario {currentScenario + 1} / {SCENARIOS.length}</p>
              <h2 style={{ fontSize: "20px", fontWeight: "600" }}>{scenario.title}</h2>
            </div>
            <div style={{ display: "flex", gap: "6px" }}>
              {SCENARIOS.map((_, i) => (
                <div key={i} style={styles.progressDot(i <= currentScenario)} />
              ))}
            </div>
          </div>

          <div
            onClick={handleTap}
            style={{
              ...styles.gameArea,
              background: scenario.bgColor
            }}
          >
            {/* Road */}
            <div style={{ ...styles.road, background: scenario.roadColor }}>
              {[1, 2, 3].map((d) => <div key={d} style={styles.dashLine} />)}
            </div>

            {/* Hazard indicator */}
            <AnimatePresence>
              {hazardVisible && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  style={{
                    position: "absolute",
                    top: "30%",
                    left: "50%",
                    transform: "translateX(-50%)",
                    background: "#ef4444",
                    color: "white",
                    padding: "15px 25px",
                    borderRadius: "12px",
                    fontWeight: "700",
                    fontSize: "18px"
                  }}
                >
                  HAZARD!
                </motion.div>
              )}
            </AnimatePresence>

            {/* Tap instruction */}
            {!tapped && (
              <motion.p
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                style={{
                  position: "absolute",
                  bottom: "140px",
                  fontSize: "18px",
                  fontWeight: "600",
                  color: "#374151",
                  textAlign: "center"
                }}
              >
                TAP NOW - one second before the hazard
              </motion.p>
            )}

            {/* Scenario description */}
            <div style={{
              position: "absolute",
              top: "15px",
              left: "15px",
              background: "rgba(255,255,255,0.9)",
              padding: "10px 15px",
              borderRadius: "8px",
              fontSize: "13px",
              color: "#374151",
              maxWidth: "250px"
            }}>
              {scenario.description}
            </div>
          </div>
        </motion.div>
      )}

      {/* RESULT STATE */}
      {gameState === "result" && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div style={{ ...styles.card, textAlign: "center" }}>
            <h2 style={{ fontSize: "22px", fontWeight: "600", marginBottom: "8px" }}>
              {scenario.title}
            </h2>
            <p style={{ fontSize: "14px", color: "#6b7280", marginBottom: "25px" }}>
              Scenario {currentScenario + 1} of {SCENARIOS.length}
            </p>

            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 15 }}
              style={{
                width: "120px",
                height: "120px",
                borderRadius: "50%",
                background: getRating(accuracy).color,
                color: "white",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 25px",
                boxShadow: `0 8px 30px ${getRating(accuracy).color}40`
              }}
            >
              <p style={{ fontSize: "28px", fontWeight: "800" }}>{accuracy}ms</p>
              <p style={{ fontSize: "12px", fontWeight: "600" }}>off target</p>
            </motion.div>

            <p style={{ fontSize: "24px", fontWeight: "700", color: getRating(accuracy).color, marginBottom: "5px" }}>
              {getRating(accuracy).label}
            </p>
            <div style={{ display: "flex", justifyContent: "center", gap: "4px", marginBottom: "25px" }}>
              {[1, 2, 3, 4, 5].map((s) => (
                <span key={s} style={{ fontSize: "24px", opacity: s <= getRating(accuracy).stars ? 1 : 0.2 }}>
                  &#9733;
                </span>
              ))}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "15px", marginBottom: "25px" }}>
              <div style={styles.statCard}>
                <p style={{ fontSize: "12px", color: "#6b7280", marginBottom: "4px" }}>Your Tap</p>
                <p style={{ fontSize: "20px", fontWeight: "700" }}>{userTapTime}ms</p>
              </div>
              <div style={styles.statCard}>
                <p style={{ fontSize: "12px", color: "#6b7280", marginBottom: "4px" }}>Target</p>
                <p style={{ fontSize: "20px", fontWeight: "700" }}>{scenario.targetTime}ms</p>
              </div>
              <div style={styles.statCard}>
                <p style={{ fontSize: "12px", color: "#6b7280", marginBottom: "4px" }}>Hazard At</p>
                <p style={{ fontSize: "20px", fontWeight: "700" }}>{scenario.hazardTime}ms</p>
              </div>
            </div>

            <button
              onClick={nextScenario}
              style={{ ...styles.btn, ...styles.btnPrimary, width: "100%" }}
            >
              {currentScenario < SCENARIOS.length - 1 ? "Next Scenario" : "View Results"}
            </button>
          </div>
        </motion.div>
      )}

      {/* STATS STATE */}
      {gameState === "stats" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div style={{ ...styles.card, textAlign: "center" }}>
            <h2 style={{ fontSize: "24px", fontWeight: "700", marginBottom: "8px" }}>
              Training Complete
            </h2>
            <p style={{ fontSize: "15px", color: "#6b7280", marginBottom: "30px" }}>
              Here is how you performed across all {SCENARIOS.length} scenarios
            </p>

            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 15 }}
              style={{
                width: "140px",
                height: "140px",
                borderRadius: "50%",
                background: overallRating.color,
                color: "white",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 30px",
                boxShadow: `0 8px 30px ${overallRating.color}40`
              }}
            >
              <p style={{ fontSize: "32px", fontWeight: "800" }}>{avgAccuracy}ms</p>
              <p style={{ fontSize: "13px", fontWeight: "600" }}>avg accuracy</p>
            </motion.div>

            <p style={{ fontSize: "22px", fontWeight: "700", color: overallRating.color, marginBottom: "30px" }}>
              {overallRating.label}
            </p>

            <div style={{ display: "grid", gap: "10px", marginBottom: "30px", textAlign: "left" }}>
              {results.map((r, i) => (
                <motion.div
                  key={r.scenarioId}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "15px",
                    background: "#f9fafb",
                    borderRadius: "10px"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "8px",
                      background: r.rating.color,
                      color: "white",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: "700",
                      fontSize: "13px"
                    }}>
                      {i + 1}
                    </div>
                    <div>
                      <p style={{ fontWeight: "600", fontSize: "14px" }}>{r.title}</p>
                      <p style={{ fontSize: "12px", color: "#6b7280" }}>
                        Tapped at {r.tapTime}ms / Target {r.targetTime}ms
                      </p>
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <p style={{ fontWeight: "700", color: r.rating.color, fontSize: "14px" }}>
                      {r.accuracy}ms off
                    </p>
                    <p style={{ fontSize: "12px", color: "#6b7280" }}>{r.rating.label}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
              <button
                onClick={resetGame}
                style={{ ...styles.btn, ...styles.btnPrimary, flex: 1 }}
              >
                Play Again
              </button>
              <button
                onClick={() => navigate("/play-and-learn")}
                style={{ ...styles.btn, ...styles.btnSecondary, flex: 1 }}
              >
                Back to Play & Learn
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
