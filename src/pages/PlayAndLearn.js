import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { savePlayAndLearnScore } from "../firebase";

// ─── GAME DATA ───────────────────────────────────────────────

const ROAD_SIGNS = [
  { id: 1, sign: "Red circle with white horizontal bar", answer: "No entry", options: ["No entry", "No waiting", "No stopping"] },
  { id: 2, sign: "Blue circle with white arrow pointing up", answer: "Ahead only", options: ["One way", "Ahead only", "No overtaking"] },
  { id: 3, sign: "Red triangle with exclamation mark", answer: "Other danger", options: ["Other danger", "Road works", "Slippery road"] },
  { id: 4, sign: "Blue rectangle with white letter P", answer: "Parking", options: ["Parking", "Police station", "Petrol station"] },
  { id: 5, sign: "Red circle with number 30", answer: "30 mph speed limit", options: ["30 mph speed limit", "Minimum speed 30", "End of 30 zone"] },
  { id: 6, sign: "Red triangle with pedestrian crossing symbol", answer: "Pedestrian crossing ahead", options: ["School ahead", "Pedestrian crossing ahead", "Footpath only"] },
  { id: 7, sign: "Red circle with two cars side by side", answer: "No overtaking", options: ["No overtaking", "Dual carriageway", "Two-way traffic"] },
  { id: 8, sign: "Blue circle with bicycle symbol", answer: "Route for cyclists only", options: ["Route for cyclists only", "No cycling", "Cycle lane ahead"] },
];

const HAZARD_SCENARIOS = [
  {
    id: 1,
    scene: "Residential street with parked cars on both sides",
    hazards: [
      { id: "h1", name: "Child behind parked car", x: 22, y: 55, found: false },
      { id: "h2", name: "Open car door", x: 72, y: 48, found: false },
      { id: "h3", name: "Cyclist in blind spot", x: 85, y: 35, found: false },
    ]
  },
  {
    id: 2,
    scene: "Approaching a roundabout in light traffic",
    hazards: [
      { id: "h4", name: "Car cutting across lanes", x: 55, y: 30, found: false },
      { id: "h5", name: "Pedestrian on island", x: 40, y: 60, found: false },
      { id: "h6", name: "Motorcycle in blind spot", x: 15, y: 42, found: false },
    ]
  },
  {
    id: 3,
    scene: "Country road with bends and hedgerows",
    hazards: [
      { id: "h7", name: "Tractor emerging from lane", x: 65, y: 38, found: false },
      { id: "h8", name: "Horse rider ahead", x: 35, y: 25, found: false },
      { id: "h9", name: "Flooded dip in road", x: 50, y: 72, found: false },
    ]
  }
];

const MIRROR_SCENARIOS = [
  {
    id: 1,
    situation: "You are about to turn left at a junction",
    correctMirror: "Left mirror",
    options: ["Interior mirror", "Left mirror", "Right mirror"],
    explanation: "Check your left mirror for cyclists or pedestrians before turning left."
  },
  {
    id: 2,
    situation: "You are changing lanes to the right on a dual carriageway",
    correctMirror: "Right mirror",
    options: ["Interior mirror", "Left mirror", "Right mirror"],
    explanation: "Check your right mirror and blind spot before changing lanes to the right."
  },
  {
    id: 3,
    situation: "A vehicle behind is flashing its headlights",
    correctMirror: "Interior mirror",
    options: ["Interior mirror", "Left mirror", "Right mirror"],
    explanation: "Use your interior mirror to assess the situation behind you."
  },
  {
    id: 4,
    situation: "You are pulling over to the left to park",
    correctMirror: "Left mirror",
    options: ["Interior mirror", "Left mirror", "Right mirror"],
    explanation: "Check your left mirror to ensure it's safe and judge the distance to the kerb."
  },
  {
    id: 5,
    situation: "You are about to overtake a slow-moving vehicle",
    correctMirror: "Interior mirror",
    options: ["Interior mirror", "Left mirror", "Right mirror"],
    explanation: "First check your interior mirror to see what's behind, then right mirror before pulling out."
  },
  {
    id: 6,
    situation: "An ambulance siren is getting louder behind you",
    correctMirror: "Interior mirror",
    options: ["Interior mirror", "Left mirror", "Right mirror"],
    explanation: "Check your interior mirror to locate the emergency vehicle and plan how to give way."
  },
];

// ─── SOUND HELPER ────────────────────────────────────────────

function playClick() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 800;
    gain.gain.value = 0.1;
    osc.start();
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
    osc.stop(ctx.currentTime + 0.1);
  } catch (e) { /* silent fail */ }
}

function playSuccess() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    [523, 659, 784].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = freq;
      gain.gain.value = 0.08;
      osc.start(ctx.currentTime + i * 0.12);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.12 + 0.2);
      osc.stop(ctx.currentTime + i * 0.12 + 0.2);
    });
  } catch (e) { /* silent fail */ }
}

function playError() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = "sawtooth";
    osc.frequency.value = 200;
    gain.gain.value = 0.08;
    osc.start();
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    osc.stop(ctx.currentTime + 0.3);
  } catch (e) { /* silent fail */ }
}

// ─── COMPONENT ───────────────────────────────────────────────

export default function PlayAndLearn() {
  const auth = useAuth() || {};
  const userId = auth.user?.uid;

  const [activeGame, setActiveGame] = useState(null); // null | "hazard" | "signs" | "mirror"
  const [gamePhase, setGamePhase] = useState("menu"); // menu | playing | summary

  // Hazard game state
  const [hazardScenario, setHazardScenario] = useState(0);
  const [foundHazards, setFoundHazards] = useState([]);
  const [hazardTimer, setHazardTimer] = useState(30);
  const [hazardResults, setHazardResults] = useState([]);
  const hazardIntervalRef = useRef(null);

  // Signs game state
  const [signIndex, setSignIndex] = useState(0);
  const [signScore, setSignScore] = useState(0);
  const [signSelected, setSignSelected] = useState(null);
  const [signResults, setSignResults] = useState([]);
  const [shuffledSigns, setShuffledSigns] = useState([]);

  // Mirror game state
  const [mirrorIndex, setMirrorIndex] = useState(0);
  const [mirrorScore, setMirrorScore] = useState(0);
  const [mirrorSelected, setMirrorSelected] = useState(null);
  const [mirrorResults, setMirrorResults] = useState([]);

  // Combined summary
  const [totalScore, setTotalScore] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);

  // Cleanup timers
  useEffect(() => {
    return () => {
      if (hazardIntervalRef.current) clearInterval(hazardIntervalRef.current);
    };
  }, []);

  // ─── HAZARD GAME ────────────────────────────────────────

  const startHazardGame = () => {
    setActiveGame("hazard");
    setGamePhase("playing");
    setHazardScenario(0);
    setFoundHazards([]);
    setHazardTimer(30);
    setHazardResults([]);
    startHazardTimer();
  };

  const startHazardTimer = () => {
    if (hazardIntervalRef.current) clearInterval(hazardIntervalRef.current);
    setHazardTimer(30);
    hazardIntervalRef.current = setInterval(() => {
      setHazardTimer((prev) => {
        if (prev <= 1) {
          clearInterval(hazardIntervalRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleHazardTap = (hazard) => {
    if (foundHazards.includes(hazard.id)) return;
    playClick();
    const newFound = [...foundHazards, hazard.id];
    setFoundHazards(newFound);

    const currentHazards = HAZARD_SCENARIOS[hazardScenario].hazards;
    if (newFound.length === currentHazards.length) {
      playSuccess();
      clearInterval(hazardIntervalRef.current);
      const result = { scene: HAZARD_SCENARIOS[hazardScenario].scene, found: newFound.length, total: currentHazards.length, timeLeft: hazardTimer };
      setHazardResults((prev) => [...prev, result]);

      setTimeout(() => {
        if (hazardScenario < HAZARD_SCENARIOS.length - 1) {
          setHazardScenario((prev) => prev + 1);
          setFoundHazards([]);
          startHazardTimer();
        } else {
          finishHazardGame([...hazardResults, result]);
        }
      }, 1200);
    }
  };

  // Auto-advance when timer runs out
  useEffect(() => {
    if (activeGame === "hazard" && gamePhase === "playing" && hazardTimer === 0) {
      const currentHazards = HAZARD_SCENARIOS[hazardScenario].hazards;
      const result = { scene: HAZARD_SCENARIOS[hazardScenario].scene, found: foundHazards.length, total: currentHazards.length, timeLeft: 0 };
      const newResults = [...hazardResults, result];
      setHazardResults(newResults);

      if (hazardScenario < HAZARD_SCENARIOS.length - 1) {
        setHazardScenario((prev) => prev + 1);
        setFoundHazards([]);
        startHazardTimer();
      } else {
        finishHazardGame(newResults);
      }
    }
  }, [hazardTimer]);

  const finishHazardGame = (results) => {
    clearInterval(hazardIntervalRef.current);
    setGamePhase("summary");
    const score = results.reduce((s, r) => s + r.found, 0);
    const total = results.reduce((s, r) => s + r.total, 0);
    setTotalScore(score);
    setTotalQuestions(total);
    if (userId) {
      savePlayAndLearnScore(userId, "hazard", { score, total, scenarios: results.length }).catch(console.error);
    }
  };

  // ─── ROAD SIGN GAME ─────────────────────────────────────

  const startSignGame = () => {
    setActiveGame("signs");
    setGamePhase("playing");
    setSignIndex(0);
    setSignScore(0);
    setSignSelected(null);
    setSignResults([]);
    const shuffled = [...ROAD_SIGNS].sort(() => Math.random() - 0.5).slice(0, 5);
    setShuffledSigns(shuffled);
  };

  const handleSignAnswer = (answer) => {
    if (signSelected !== null) return;
    playClick();
    const correct = answer === shuffledSigns[signIndex].answer;
    if (correct) {
      playSuccess();
      setSignScore((prev) => prev + 1);
    } else {
      playError();
    }
    setSignSelected(answer);
    setSignResults((prev) => [...prev, { sign: shuffledSigns[signIndex].sign, answer, correct, correctAnswer: shuffledSigns[signIndex].answer }]);

    setTimeout(() => {
      if (signIndex < shuffledSigns.length - 1) {
        setSignIndex((prev) => prev + 1);
        setSignSelected(null);
      } else {
        setGamePhase("summary");
        const finalScore = correct ? signScore + 1 : signScore;
        setTotalScore(finalScore);
        setTotalQuestions(shuffledSigns.length);
        if (userId) {
          savePlayAndLearnScore(userId, "signs", { score: finalScore, total: shuffledSigns.length }).catch(console.error);
        }
      }
    }, 1200);
  };

  // ─── MIRROR GAME ────────────────────────────────────────

  const startMirrorGame = () => {
    setActiveGame("mirror");
    setGamePhase("playing");
    setMirrorIndex(0);
    setMirrorScore(0);
    setMirrorSelected(null);
    setMirrorResults([]);
  };

  const handleMirrorAnswer = (answer) => {
    if (mirrorSelected !== null) return;
    playClick();
    const correct = answer === MIRROR_SCENARIOS[mirrorIndex].correctMirror;
    if (correct) {
      playSuccess();
      setMirrorScore((prev) => prev + 1);
    } else {
      playError();
    }
    setMirrorSelected(answer);
    setMirrorResults((prev) => [...prev, {
      situation: MIRROR_SCENARIOS[mirrorIndex].situation,
      answer,
      correct,
      correctAnswer: MIRROR_SCENARIOS[mirrorIndex].correctMirror,
      explanation: MIRROR_SCENARIOS[mirrorIndex].explanation
    }]);

    setTimeout(() => {
      if (mirrorIndex < MIRROR_SCENARIOS.length - 1) {
        setMirrorIndex((prev) => prev + 1);
        setMirrorSelected(null);
      } else {
        setGamePhase("summary");
        const finalScore = correct ? mirrorScore + 1 : mirrorScore;
        setTotalScore(finalScore);
        setTotalQuestions(MIRROR_SCENARIOS.length);
        if (userId) {
          savePlayAndLearnScore(userId, "mirror", { score: finalScore, total: MIRROR_SCENARIOS.length }).catch(console.error);
        }
      }
    }, 1500);
  };

  // ─── BACK TO MENU ───────────────────────────────────────

  const backToMenu = () => {
    setActiveGame(null);
    setGamePhase("menu");
    if (hazardIntervalRef.current) clearInterval(hazardIntervalRef.current);
  };

  const accuracy = totalQuestions > 0 ? Math.round((totalScore / totalQuestions) * 100) : 0;

  // ─── STYLES ─────────────────────────────────────────────

  const s = {
    page: { maxWidth: "900px", margin: "0 auto", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" },
    h1: { fontSize: "28px", fontWeight: "700", color: "#111827", marginBottom: "6px" },
    sub: { fontSize: "15px", color: "#6b7280", marginBottom: "30px", lineHeight: "1.5" },
    grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "20px", marginBottom: "30px" },
    card: { background: "white", borderRadius: "14px", padding: "28px", border: "1px solid #e5e7eb", cursor: "pointer", transition: "all 0.2s" },
    tag: (c) => ({ display: "inline-block", background: c + "15", color: c, fontSize: "11px", fontWeight: "600", padding: "4px 10px", borderRadius: "6px", marginBottom: "14px" }),
    cardTitle: { fontSize: "18px", fontWeight: "600", color: "#111827", marginBottom: "6px" },
    cardDesc: { fontSize: "13px", color: "#6b7280", lineHeight: "1.5" },
    btn: { padding: "12px 24px", borderRadius: "10px", border: "none", fontSize: "15px", fontWeight: "600", cursor: "pointer", transition: "all 0.2s" },
    btnPrimary: { background: "#2563eb", color: "white" },
    btnGhost: { background: "#f3f4f6", color: "#374151" },
    optBtn: (selected, correct, isCorrect) => ({
      width: "100%",
      padding: "16px 20px",
      margin: "6px 0",
      borderRadius: "10px",
      border: "2px solid",
      borderColor: selected === null ? "#e5e7eb" : (correct ? "#22c55e" : (isCorrect ? "#e5e7eb" : "#ef4444")),
      background: selected === null ? "white" : (correct ? "#f0fdf4" : (isCorrect ? "white" : "#fef2f2")),
      fontSize: "14px",
      fontWeight: "500",
      cursor: selected === null ? "pointer" : "default",
      textAlign: "left",
      transition: "all 0.2s",
      color: "#1f2937"
    }),
    statCircle: (c) => ({
      width: "120px", height: "120px", borderRadius: "50%", background: c, color: "white",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      margin: "0 auto 24px", boxShadow: `0 8px 25px ${c}40`
    }),
    whiteCard: { background: "white", borderRadius: "14px", padding: "28px", border: "1px solid #e5e7eb" }
  };

  // ─── RENDER ─────────────────────────────────────────────

  return (
    <div style={s.page}>
      <motion.div initial={{ opacity: 0, y: -15 }} animate={{ opacity: 1, y: 0 }}>
        <h1 style={s.h1}>Play & Learn</h1>
        <p style={s.sub}>Sharpen your driving knowledge with interactive games. Choose a game below to get started.</p>
      </motion.div>

      {/* ─── GAME SELECTION ─── */}
      {gamePhase === "menu" && (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} style={s.grid}>
          {/* Spot the Hazard */}
          <motion.div style={s.card} whileHover={{ y: -4, boxShadow: "0 8px 25px rgba(0,0,0,0.1)" }} onClick={startHazardGame}>
            <div style={s.tag("#ef4444")}>Hard</div>
            <div style={{ fontSize: "32px", marginBottom: "12px" }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            </div>
            <h3 style={s.cardTitle}>Spot the Hazard</h3>
            <p style={s.cardDesc}>Find all hazards in driving scenarios before time runs out. 3 scenes, 30s each.</p>
          </motion.div>

          {/* Road Sign Match */}
          <motion.div style={s.card} whileHover={{ y: -4, boxShadow: "0 8px 25px rgba(0,0,0,0.1)" }} onClick={startSignGame}>
            <div style={s.tag("#2563eb")}>Medium</div>
            <div style={{ fontSize: "32px", marginBottom: "12px" }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            </div>
            <h3 style={s.cardTitle}>Road Sign Match</h3>
            <p style={s.cardDesc}>Identify road signs correctly from descriptions. 5 random signs each round.</p>
          </motion.div>

          {/* Mirror Check Trainer */}
          <motion.div style={s.card} whileHover={{ y: -4, boxShadow: "0 8px 25px rgba(0,0,0,0.1)" }} onClick={startMirrorGame}>
            <div style={s.tag("#16a34a")}>Easy</div>
            <div style={{ fontSize: "32px", marginBottom: "12px" }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            </div>
            <h3 style={s.cardTitle}>Mirror Check Trainer</h3>
            <p style={s.cardDesc}>Select the correct mirror to check for each driving scenario. 6 situations.</p>
          </motion.div>
        </motion.div>
      )}

      {/* ─── SPOT THE HAZARD ─── */}
      {activeGame === "hazard" && gamePhase === "playing" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <div>
              <p style={{ fontSize: "13px", color: "#6b7280" }}>Scene {hazardScenario + 1} / {HAZARD_SCENARIOS.length}</p>
              <h2 style={{ fontSize: "18px", fontWeight: "600", color: "#111827" }}>
                {HAZARD_SCENARIOS[hazardScenario].scene}
              </h2>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <span style={{ fontSize: "13px", color: "#6b7280" }}>
                {foundHazards.length}/{HAZARD_SCENARIOS[hazardScenario].hazards.length} found
              </span>
              <div style={{
                background: hazardTimer <= 10 ? "#fef2f2" : "#f0fdf4",
                color: hazardTimer <= 10 ? "#ef4444" : "#16a34a",
                padding: "6px 14px", borderRadius: "8px", fontWeight: "700", fontSize: "16px"
              }}>
                {hazardTimer}s
              </div>
            </div>
          </div>

          <div style={{
            position: "relative",
            width: "100%",
            height: "380px",
            borderRadius: "14px",
            overflow: "hidden",
            background: "linear-gradient(180deg, #bae6fd 0%, #86efac 60%, #4b5563 60%, #374151 100%)",
            border: "1px solid #e5e7eb",
            cursor: "crosshair",
            marginBottom: "16px"
          }}>
            {/* Road markings */}
            <div style={{ position: "absolute", bottom: "0", left: "0", right: "0", height: "40%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "12px" }}>
              {[1, 2, 3].map((d) => <div key={d} style={{ width: "50px", height: "4px", background: "white", borderRadius: "2px", opacity: 0.6 }} />)}
            </div>

            {/* Hazard spots */}
            {HAZARD_SCENARIOS[hazardScenario].hazards.map((hazard) => {
              const isFound = foundHazards.includes(hazard.id);
              return (
                <motion.div
                  key={hazard.id}
                  onClick={() => handleHazardTap(hazard)}
                  style={{
                    position: "absolute",
                    left: `${hazard.x}%`,
                    top: `${hazard.y}%`,
                    transform: "translate(-50%, -50%)",
                    width: isFound ? "64px" : "56px",
                    height: isFound ? "64px" : "56px",
                    borderRadius: "50%",
                    border: isFound ? "3px solid #22c55e" : "3px dashed rgba(239, 68, 68, 0.5)",
                    background: isFound ? "rgba(34, 197, 94, 0.2)" : "rgba(255, 255, 255, 0.15)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    transition: "all 0.3s"
                  }}
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.9 }}
                >
                  {isFound ? (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    </motion.div>
                  ) : (
                    <span style={{ color: "rgba(239,68,68,0.7)", fontSize: "18px", fontWeight: "700" }}>?</span>
                  )}
                </motion.div>
              );
            })}

            {/* Hazard name tooltip on find */}
            <AnimatePresence>
              {foundHazards.length > 0 && (
                <motion.div
                  key={foundHazards[foundHazards.length - 1]}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  style={{ position: "absolute", bottom: "48%", left: "50%", transform: "translateX(-50%)", background: "#22c55e", color: "white", padding: "8px 16px", borderRadius: "8px", fontWeight: "600", fontSize: "13px", whiteSpace: "nowrap" }}
                >
                  {HAZARD_SCENARIOS[hazardScenario].hazards.find(h => h.id === foundHazards[foundHazards.length - 1])?.name}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button onClick={backToMenu} style={{ ...s.btn, ...s.btnGhost }}>
            Quit Game
          </button>
        </motion.div>
      )}

      {/* ─── ROAD SIGN MATCH ─── */}
      {activeGame === "signs" && gamePhase === "playing" && shuffledSigns.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={s.whiteCard}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
              <p style={{ fontSize: "13px", color: "#6b7280" }}>Question {signIndex + 1} / {shuffledSigns.length}</p>
              <p style={{ fontSize: "13px", fontWeight: "600", color: "#2563eb" }}>Score: {signScore}</p>
            </div>

            {/* Progress bar */}
            <div style={{ background: "#e5e7eb", borderRadius: "6px", height: "6px", marginBottom: "28px", overflow: "hidden" }}>
              <motion.div
                style={{ background: "#2563eb", height: "100%", borderRadius: "6px" }}
                animate={{ width: `${((signIndex + 1) / shuffledSigns.length) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>

            <div style={{ background: "#f9fafb", borderRadius: "12px", padding: "24px", marginBottom: "24px", textAlign: "center" }}>
              <p style={{ fontSize: "13px", color: "#6b7280", marginBottom: "8px" }}>Identify this road sign:</p>
              <p style={{ fontSize: "18px", fontWeight: "600", color: "#111827" }}>{shuffledSigns[signIndex].sign}</p>
            </div>

            {shuffledSigns[signIndex].options.map((option) => {
              const isSelected = signSelected === option;
              const isCorrect = option === shuffledSigns[signIndex].answer;
              return (
                <motion.button
                  key={option}
                  whileHover={signSelected === null ? { scale: 1.01 } : {}}
                  whileTap={signSelected === null ? { scale: 0.99 } : {}}
                  onClick={() => handleSignAnswer(option)}
                  style={s.optBtn(signSelected, isSelected && isCorrect, signSelected && isCorrect)}
                >
                  <span style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    {signSelected !== null && isCorrect && (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                    )}
                    {signSelected !== null && isSelected && !isCorrect && (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    )}
                    {option}
                  </span>
                </motion.button>
              );
            })}
          </div>

          <button onClick={backToMenu} style={{ ...s.btn, ...s.btnGhost, marginTop: "16px" }}>
            Quit Game
          </button>
        </motion.div>
      )}

      {/* ─── MIRROR CHECK TRAINER ─── */}
      {activeGame === "mirror" && gamePhase === "playing" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={s.whiteCard}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
              <p style={{ fontSize: "13px", color: "#6b7280" }}>Scenario {mirrorIndex + 1} / {MIRROR_SCENARIOS.length}</p>
              <p style={{ fontSize: "13px", fontWeight: "600", color: "#16a34a" }}>Score: {mirrorScore}</p>
            </div>

            {/* Progress bar */}
            <div style={{ background: "#e5e7eb", borderRadius: "6px", height: "6px", marginBottom: "28px", overflow: "hidden" }}>
              <motion.div
                style={{ background: "#16a34a", height: "100%", borderRadius: "6px" }}
                animate={{ width: `${((mirrorIndex + 1) / MIRROR_SCENARIOS.length) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>

            <div style={{ background: "#f9fafb", borderRadius: "12px", padding: "24px", marginBottom: "24px", textAlign: "center" }}>
              <p style={{ fontSize: "13px", color: "#6b7280", marginBottom: "8px" }}>Which mirror should you check first?</p>
              <p style={{ fontSize: "18px", fontWeight: "600", color: "#111827" }}>{MIRROR_SCENARIOS[mirrorIndex].situation}</p>
            </div>

            {/* Mirror options as visual cards */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px", marginBottom: "16px" }}>
              {MIRROR_SCENARIOS[mirrorIndex].options.map((option) => {
                const isSelected = mirrorSelected === option;
                const isCorrect = option === MIRROR_SCENARIOS[mirrorIndex].correctMirror;
                const showResult = mirrorSelected !== null;
                return (
                  <motion.button
                    key={option}
                    whileHover={!showResult ? { scale: 1.03 } : {}}
                    whileTap={!showResult ? { scale: 0.97 } : {}}
                    onClick={() => handleMirrorAnswer(option)}
                    style={{
                      padding: "20px 12px",
                      borderRadius: "12px",
                      border: "2px solid",
                      borderColor: !showResult ? "#e5e7eb" : (isSelected && isCorrect ? "#22c55e" : (isSelected && !isCorrect ? "#ef4444" : (isCorrect ? "#22c55e" : "#e5e7eb"))),
                      background: !showResult ? "white" : (isCorrect ? "#f0fdf4" : (isSelected && !isCorrect ? "#fef2f2" : "white")),
                      cursor: !showResult ? "pointer" : "default",
                      textAlign: "center",
                      fontSize: "13px",
                      fontWeight: "600",
                      color: "#1f2937",
                      transition: "all 0.2s"
                    }}
                  >
                    <div style={{ marginBottom: "8px" }}>
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={!showResult ? "#6b7280" : (isCorrect ? "#22c55e" : (isSelected && !isCorrect ? "#ef4444" : "#6b7280"))} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    </div>
                    {option}
                  </motion.button>
                );
              })}
            </div>

            {/* Explanation */}
            <AnimatePresence>
              {mirrorSelected !== null && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  style={{ background: "#f0f9ff", borderRadius: "10px", padding: "16px", marginTop: "8px" }}
                >
                  <p style={{ fontSize: "13px", color: "#0369a1", lineHeight: "1.5" }}>
                    {MIRROR_SCENARIOS[mirrorIndex].explanation}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button onClick={backToMenu} style={{ ...s.btn, ...s.btnGhost, marginTop: "16px" }}>
            Quit Game
          </button>
        </motion.div>
      )}

      {/* ─── END-OF-GAME SUMMARY ─── */}
      {gamePhase === "summary" && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
          <div style={{ ...s.whiteCard, textAlign: "center" }}>
            <h2 style={{ fontSize: "22px", fontWeight: "700", marginBottom: "6px", color: "#111827" }}>
              {activeGame === "hazard" ? "Hazard Spotting" : activeGame === "signs" ? "Road Sign Match" : "Mirror Check"} Complete
            </h2>
            <p style={{ fontSize: "14px", color: "#6b7280", marginBottom: "28px" }}>
              Here is how you did
            </p>

            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 15 }}
              style={s.statCircle(accuracy >= 80 ? "#16a34a" : accuracy >= 50 ? "#eab308" : "#ef4444")}
            >
              <p style={{ fontSize: "28px", fontWeight: "800" }}>{accuracy}%</p>
              <p style={{ fontSize: "12px", fontWeight: "500" }}>accuracy</p>
            </motion.div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "28px" }}>
              <div style={{ background: "#f9fafb", borderRadius: "10px", padding: "16px" }}>
                <p style={{ fontSize: "12px", color: "#6b7280", marginBottom: "4px" }}>Score</p>
                <p style={{ fontSize: "22px", fontWeight: "700", color: "#111827" }}>{totalScore}/{totalQuestions}</p>
              </div>
              <div style={{ background: "#f9fafb", borderRadius: "10px", padding: "16px" }}>
                <p style={{ fontSize: "12px", color: "#6b7280", marginBottom: "4px" }}>Rating</p>
                <p style={{ fontSize: "22px", fontWeight: "700", color: accuracy >= 80 ? "#16a34a" : accuracy >= 50 ? "#eab308" : "#ef4444" }}>
                  {accuracy >= 80 ? "Excellent" : accuracy >= 50 ? "Good" : "Keep Practicing"}
                </p>
              </div>
            </div>

            {/* Detailed results */}
            {activeGame === "signs" && signResults.length > 0 && (
              <div style={{ textAlign: "left", marginBottom: "24px" }}>
                <p style={{ fontSize: "13px", fontWeight: "600", color: "#6b7280", marginBottom: "10px" }}>Detailed Results</p>
                {signResults.map((r, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px", background: r.correct ? "#f0fdf4" : "#fef2f2", borderRadius: "8px", marginBottom: "6px", fontSize: "13px" }}>
                    {r.correct ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    )}
                    <span style={{ color: "#374151" }}>{r.sign}</span>
                    {!r.correct && <span style={{ color: "#6b7280", marginLeft: "auto" }}>{r.correctAnswer}</span>}
                  </div>
                ))}
              </div>
            )}

            {activeGame === "mirror" && mirrorResults.length > 0 && (
              <div style={{ textAlign: "left", marginBottom: "24px" }}>
                <p style={{ fontSize: "13px", fontWeight: "600", color: "#6b7280", marginBottom: "10px" }}>Detailed Results</p>
                {mirrorResults.map((r, i) => (
                  <div key={i} style={{ padding: "12px", background: r.correct ? "#f0fdf4" : "#fef2f2", borderRadius: "8px", marginBottom: "6px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", marginBottom: "4px" }}>
                      {r.correct ? (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                      ) : (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                      )}
                      <span style={{ color: "#374151", fontWeight: "500" }}>{r.situation}</span>
                    </div>
                    <p style={{ fontSize: "12px", color: "#6b7280", paddingLeft: "24px" }}>{r.explanation}</p>
                  </div>
                ))}
              </div>
            )}

            <div style={{ display: "flex", gap: "12px" }}>
              <button
                onClick={() => {
                  if (activeGame === "hazard") startHazardGame();
                  else if (activeGame === "signs") startSignGame();
                  else startMirrorGame();
                }}
                style={{ ...s.btn, ...s.btnPrimary, flex: 1 }}
              >
                Play Again
              </button>
              <button onClick={backToMenu} style={{ ...s.btn, ...s.btnGhost, flex: 1 }}>
                Back to Menu
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
