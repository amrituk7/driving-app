import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Levels configuration
const LEVELS = [
  { name: "Learner", minXP: 0, maxXP: 100, color: "#dbeafe" },
  { name: "Intermediate", minXP: 100, maxXP: 300, color: "#bfdbfe" },
  { name: "Advanced", minXP: 300, maxXP: 600, color: "#7dd3fc" },
  { name: "Expert", minXP: 600, maxXP: 1000, color: "#38bdf8" },
  { name: "Master", minXP: 1000, maxXP: 9999, color: "#0284c7" },
];

// Daily challenges data
const DAILY_QUESTIONS = [
  { question: "What does MSM stand for?", answer: "Mirror, Signal, Manoeuvre", options: ["Mirror, Signal, Manoeuvre", "Move, Stop, Move", "Mirror, Speed, Move"] },
  { question: "When should you check your mirrors?", answer: "Before any change in speed or direction", options: ["Only when turning", "Before any change in speed or direction", "Every 5 minutes"] },
  { question: "What is the speed limit in a built-up area?", answer: "30 mph", options: ["20 mph", "30 mph", "40 mph"] },
];

const DAILY_TIPS = [
  "Always check your blind spot before changing lanes!",
  "The two-second rule helps maintain safe following distance.",
  "FLOWER check: Fuel, Lights, Oil, Water, Electrics, Rubber.",
];

const MICRO_CHALLENGES = [
  { task: "Practice the MSM routine 5 times mentally", xp: 10 },
  { task: "Name all 6 FLOWER checks out loud", xp: 15 },
  { task: "Identify 3 hazards in a photo", xp: 20 },
];

// Mini-games data
const MSM_SEQUENCE = ["Mirror", "Signal", "Manoeuvre"];
const HAZARDS = [
  { id: 1, name: "Pedestrian crossing", x: 20, y: 30 },
  { id: 2, name: "Cyclist ahead", x: 60, y: 40 },
  { id: 3, name: "Parked car door", x: 80, y: 60 },
];

const PARKING_REFERENCES = [
  { id: 1, scenario: "Parallel parking - when to stop", correct: "When mirror aligns with rear car bumper" },
  { id: 2, scenario: "Bay parking - turning point", correct: "When line appears in side mirror" },
  { id: 3, scenario: "Reverse parking - full lock", correct: "When at 45-degree angle" },
];

export default function PlayAndLearn() {
  // XP and Level state
  const [xp, setXP] = useState(() => {
    const saved = localStorage.getItem("roadmasterXP");
    return saved ? parseInt(saved, 10) : 0;
  });
  const [showXPGain, setShowXPGain] = useState(false);
  const [xpGained, setXPGained] = useState(0);
  
  // Game states
  const [activeGame, setActiveGame] = useState(null);
  const [gameScore, setGameScore] = useState(0);
  
  // MSM Game state
  const [msmIndex, setMsmIndex] = useState(0);
  const [msmComplete, setMsmComplete] = useState(false);
  
  // Hazard Game state
  const [foundHazards, setFoundHazards] = useState([]);
  
  // Parking Game state
  const [parkingIndex, setParkingIndex] = useState(0);
  const [parkingScore, setParkingScore] = useState(0);
  
  // Daily Challenge state
  const [dailyComplete, setDailyComplete] = useState(() => {
    const today = new Date().toDateString();
    const saved = localStorage.getItem("dailyChallengeDate");
    return saved === today;
  });
  const [dailyStep, setDailyStep] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);

  // Calculate current level
  const getCurrentLevel = () => {
    for (let i = LEVELS.length - 1; i >= 0; i--) {
      if (xp >= LEVELS[i].minXP) return LEVELS[i];
    }
    return LEVELS[0];
  };

  const currentLevel = getCurrentLevel();
  const nextLevel = LEVELS[LEVELS.indexOf(currentLevel) + 1] || currentLevel;
  const progressToNext = ((xp - currentLevel.minXP) / (nextLevel.maxXP - currentLevel.minXP)) * 100;

  // Save XP to localStorage
  useEffect(() => {
    localStorage.setItem("roadmasterXP", xp.toString());
  }, [xp]);

  // Add XP with animation
  const addXP = (amount) => {
    setXP((prev) => prev + amount);
    setXPGained(amount);
    setShowXPGain(true);
    setTimeout(() => setShowXPGain(false), 1500);
  };

  // MSM Game handlers
  const handleMSMTap = (step) => {
    if (step === MSM_SEQUENCE[msmIndex]) {
      if (msmIndex === MSM_SEQUENCE.length - 1) {
        setMsmComplete(true);
        setGameScore((prev) => prev + 1);
        addXP(10);
        setTimeout(() => {
          setMsmIndex(0);
          setMsmComplete(false);
        }, 1000);
      } else {
        setMsmIndex((prev) => prev + 1);
      }
    } else {
      setMsmIndex(0);
    }
  };

  // Hazard Game handlers
  const handleHazardTap = (hazard) => {
    if (!foundHazards.includes(hazard.id)) {
      setFoundHazards((prev) => [...prev, hazard.id]);
      addXP(15);
      if (foundHazards.length + 1 === HAZARDS.length) {
        setTimeout(() => {
          setFoundHazards([]);
          setActiveGame(null);
        }, 1500);
      }
    }
  };

  // Parking Game handlers
  const handleParkingAnswer = (answer) => {
    if (answer === PARKING_REFERENCES[parkingIndex].correct) {
      setParkingScore((prev) => prev + 1);
      addXP(20);
    }
    if (parkingIndex < PARKING_REFERENCES.length - 1) {
      setParkingIndex((prev) => prev + 1);
    } else {
      setTimeout(() => {
        setParkingIndex(0);
        setParkingScore(0);
        setActiveGame(null);
      }, 1500);
    }
  };

  // Daily Challenge handlers
  const handleDailyAnswer = (answer) => {
    setSelectedAnswer(answer);
    if (answer === DAILY_QUESTIONS[0].answer) {
      addXP(25);
    }
    setTimeout(() => {
      setDailyStep(1);
      setSelectedAnswer(null);
    }, 1000);
  };

  const handleDailyTip = () => {
    addXP(5);
    setDailyStep(2);
  };

  const handleMicroChallenge = () => {
    addXP(MICRO_CHALLENGES[0].xp);
    setDailyComplete(true);
    localStorage.setItem("dailyChallengeDate", new Date().toDateString());
  };

  // Styles
  const styles = {
    container: {
      minHeight: "100vh",
      background: "linear-gradient(135deg, #fef9c3 0%, #fef3c7 50%, #fde68a 100%)",
      padding: "30px",
      fontFamily: "'Inter', sans-serif",
    },
    header: {
      textAlign: "center",
      marginBottom: "30px",
    },
    title: {
      fontSize: "36px",
      fontWeight: "800",
      color: "#92400e",
      marginBottom: "10px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "12px",
    },
    subtitle: {
      fontSize: "16px",
      color: "#a16207",
    },
    xpBar: {
      background: "white",
      borderRadius: "20px",
      padding: "20px",
      marginBottom: "30px",
      boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
    },
    levelInfo: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "12px",
    },
    levelBadge: {
      background: currentLevel.color,
      padding: "8px 16px",
      borderRadius: "20px",
      fontWeight: "600",
      color: "#92400e",
      fontSize: "14px",
    },
    xpText: {
      fontSize: "14px",
      color: "#78716c",
    },
    progressBar: {
      background: "#e5e5e5",
      borderRadius: "10px",
      height: "16px",
      overflow: "hidden",
    },
    progressFill: {
      background: "linear-gradient(90deg, #fbbf24, #f59e0b)",
      height: "100%",
      borderRadius: "10px",
      transition: "width 0.5s ease",
    },
    gamesGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
      gap: "20px",
      marginBottom: "30px",
    },
    gameCard: {
      background: "white",
      borderRadius: "16px",
      padding: "24px",
      boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
      cursor: "pointer",
      transition: "transform 0.2s, box-shadow 0.2s",
    },
    gameIcon: {
      fontSize: "40px",
      marginBottom: "12px",
    },
    gameTitle: {
      fontSize: "18px",
      fontWeight: "700",
      color: "#1f2937",
      marginBottom: "8px",
    },
    gameDesc: {
      fontSize: "14px",
      color: "#6b7280",
      lineHeight: "1.5",
    },
    gameXP: {
      marginTop: "12px",
      fontSize: "13px",
      color: "#f59e0b",
      fontWeight: "600",
    },
    modal: {
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: "rgba(0,0,0,0.7)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1000,
      padding: "20px",
    },
    modalContent: {
      background: "white",
      borderRadius: "24px",
      padding: "30px",
      maxWidth: "500px",
      width: "100%",
      maxHeight: "80vh",
      overflow: "auto",
    },
    closeBtn: {
      position: "absolute",
      top: "15px",
      right: "15px",
      background: "none",
      border: "none",
      fontSize: "24px",
      cursor: "pointer",
      color: "#6b7280",
    },
    msmButton: {
      padding: "20px 40px",
      fontSize: "18px",
      fontWeight: "600",
      borderRadius: "12px",
      border: "none",
      cursor: "pointer",
      margin: "8px",
      transition: "transform 0.1s",
    },
    hazardArea: {
      position: "relative",
      background: "linear-gradient(180deg, #87ceeb 0%, #90ee90 100%)",
      borderRadius: "16px",
      height: "300px",
      marginBottom: "20px",
      overflow: "hidden",
    },
    hazardSpot: {
      position: "absolute",
      width: "60px",
      height: "60px",
      borderRadius: "50%",
      border: "3px dashed #ef4444",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "24px",
      transition: "all 0.3s",
    },
    optionBtn: {
      width: "100%",
      padding: "15px",
      margin: "8px 0",
      borderRadius: "12px",
      border: "2px solid #e5e7eb",
      background: "white",
      fontSize: "14px",
      cursor: "pointer",
      textAlign: "left",
      transition: "all 0.2s",
    },
    dailyCard: {
      background: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)",
      borderRadius: "20px",
      padding: "30px",
      color: "white",
      marginBottom: "30px",
    },
    xpPopup: {
      position: "fixed",
      top: "100px",
      right: "30px",
      background: "#fbbf24",
      color: "#92400e",
      padding: "15px 25px",
      borderRadius: "12px",
      fontWeight: "700",
      fontSize: "18px",
      boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
      zIndex: 2000,
    },
    bananaFloat: {
      position: "fixed",
      bottom: "30px",
      right: "30px",
      fontSize: "60px",
      zIndex: 100,
    },
  };

  return (
    <div style={styles.container}>
      {/* XP Gain Popup */}
      <AnimatePresence>
        {showXPGain && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20 }}
            style={styles.xpPopup}
          >
            +{xpGained} XP
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Banana Animation */}
      <motion.div
        style={styles.bananaFloat}
        animate={{ 
          y: [0, -15, 0],
          rotate: [0, 10, -10, 0],
        }}
        transition={{ 
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        {currentLevel.emoji}
      </motion.div>

      {/* Header */}
      <motion.div 
        style={styles.header}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 style={styles.title}>
          Play & Learn
        </h1>
        <p style={styles.subtitle}>Earn XP, level up, and become a driving master!</p>
      </motion.div>

      {/* XP Progress Bar */}
      <motion.div 
        style={styles.xpBar}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div style={styles.levelInfo}>
          <span style={styles.levelBadge}>{currentLevel.emoji} {currentLevel.name}</span>
          <span style={styles.xpText}>{xp} / {nextLevel.maxXP} XP</span>
        </div>
        <div style={styles.progressBar}>
          <motion.div 
            style={{ ...styles.progressFill, width: `${Math.min(progressToNext, 100)}%` }}
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(progressToNext, 100)}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </div>
        <p style={{ ...styles.xpText, marginTop: "8px", textAlign: "center" }}>
          {nextLevel !== currentLevel ? `${nextLevel.maxXP - xp} XP to ${nextLevel.name}` : "Max Level Reached!"}
        </p>
      </motion.div>

      {/* Daily Challenge */}
      {!dailyComplete && (
        <motion.div 
          style={styles.dailyCard}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h2 style={{ fontSize: "24px", fontWeight: "700", marginBottom: "20px" }}>
            Daily Banana Challenge
          </h2>
          
          {dailyStep === 0 && (
            <div>
              <p style={{ fontSize: "18px", marginBottom: "20px" }}>{DAILY_QUESTIONS[0].question}</p>
              {DAILY_QUESTIONS[0].options.map((option, index) => (
                <motion.button
                  key={index}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleDailyAnswer(option)}
                  style={{
                    ...styles.optionBtn,
                    background: selectedAnswer === option 
                      ? (option === DAILY_QUESTIONS[0].answer ? "#22c55e" : "#ef4444")
                      : "white",
                    color: selectedAnswer === option ? "white" : "#1f2937",
                    borderColor: selectedAnswer === option ? "transparent" : "#e5e7eb",
                  }}
                >
                  {option}
                </motion.button>
              ))}
            </div>
          )}
          
          {dailyStep === 1 && (
            <div>
              <p style={{ fontSize: "16px", marginBottom: "15px" }}>Today's Tip:</p>
              <p style={{ fontSize: "18px", fontWeight: "500", marginBottom: "20px", lineHeight: "1.6" }}>
                {DAILY_TIPS[0]}
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleDailyTip}
                style={{
                  background: "white",
                  color: "#f59e0b",
                  border: "none",
                  padding: "12px 30px",
                  borderRadius: "10px",
                  fontWeight: "600",
                  cursor: "pointer",
                }}
              >
                Got it! (+5 XP)
              </motion.button>
            </div>
          )}
          
          {dailyStep === 2 && (
            <div>
              <p style={{ fontSize: "16px", marginBottom: "15px" }}>Micro-Challenge:</p>
              <p style={{ fontSize: "18px", fontWeight: "500", marginBottom: "20px" }}>
                {MICRO_CHALLENGES[0].task}
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleMicroChallenge}
                style={{
                  background: "white",
                  color: "#f59e0b",
                  border: "none",
                  padding: "12px 30px",
                  borderRadius: "10px",
                  fontWeight: "600",
                  cursor: "pointer",
                }}
              >
                Challenge Complete! (+{MICRO_CHALLENGES[0].xp} XP)
              </motion.button>
            </div>
          )}
        </motion.div>
      )}

      {dailyComplete && (
        <motion.div 
          style={{ ...styles.dailyCard, background: "#22c55e", textAlign: "center" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <p style={{ fontSize: "20px", fontWeight: "600" }}>Daily Challenge Complete! Come back tomorrow!</p>
        </motion.div>
      )}

      {/* Mini-Games Grid */}
      <h2 style={{ fontSize: "24px", fontWeight: "700", color: "#92400e", marginBottom: "20px" }}>
        Mini-Games
      </h2>
      <div style={styles.gamesGrid}>
        {/* MSM Game */}
        <motion.div
          style={styles.gameCard}
          whileHover={{ scale: 1.03, boxShadow: "0 8px 30px rgba(0,0,0,0.12)" }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setActiveGame("msm")}
        >
          <div style={styles.gameIcon}>🪞</div>
          <h3 style={styles.gameTitle}>Mirror-Signal-Manoeuvre</h3>
          <p style={styles.gameDesc}>Tap the correct sequence as fast as you can!</p>
          <p style={styles.gameXP}>+10 XP per round</p>
        </motion.div>

        {/* Hazard Spotting */}
        <motion.div
          style={styles.gameCard}
          whileHover={{ scale: 1.03, boxShadow: "0 8px 30px rgba(0,0,0,0.12)" }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setActiveGame("hazard")}
        >
          <div style={styles.gameIcon}>Warning</div>
          <h3 style={styles.gameTitle}>Hazard Spotting</h3>
          <p style={styles.gameDesc}>Find all the hazards before time runs out!</p>
          <p style={styles.gameXP}>+15 XP per hazard</p>
        </motion.div>

        {/* Parking References */}
        <motion.div
          style={styles.gameCard}
          whileHover={{ scale: 1.03, boxShadow: "0 8px 30px rgba(0,0,0,0.12)" }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setActiveGame("parking")}
        >
          <div style={styles.gameIcon}>P</div>
          <h3 style={styles.gameTitle}>Parking References</h3>
          <p style={styles.gameDesc}>Match the scenario with the correct reference point.</p>
          <p style={styles.gameXP}>+20 XP per correct answer</p>
        </motion.div>

        {/* Road Positioning - Coming Soon */}
        <motion.div
          style={{ ...styles.gameCard, opacity: 0.6 }}
          whileHover={{ scale: 1.02 }}
        >
          <div style={styles.gameIcon}>Road</div>
          <h3 style={styles.gameTitle}>Road Positioning</h3>
          <p style={styles.gameDesc}>Drag the car to the correct lane position.</p>
          <p style={{ ...styles.gameXP, color: "#9ca3af" }}>Coming Soon!</p>
        </motion.div>
      </div>

      {/* Game Modals */}
      <AnimatePresence>
        {activeGame === "msm" && (
          <motion.div
            style={styles.modal}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActiveGame(null)}
          >
            <motion.div
              style={{ ...styles.modalContent, position: "relative", textAlign: "center" }}
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button style={styles.closeBtn} onClick={() => setActiveGame(null)}>x</button>
              <h2 style={{ fontSize: "24px", fontWeight: "700", marginBottom: "20px" }}>
                Mirror-Signal-Manoeuvre
              </h2>
              <p style={{ marginBottom: "20px", color: "#6b7280" }}>
                Tap in the correct order: {MSM_SEQUENCE.join(" → ")}
              </p>
              
              {msmComplete ? (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  style={{ fontSize: "60px" }}
                >
                  Correct!
                </motion.div>
              ) : (
                <div>
                  <p style={{ marginBottom: "15px", fontWeight: "600" }}>
                    Current step: {MSM_SEQUENCE[msmIndex]}
                  </p>
                  <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center" }}>
                    {MSM_SEQUENCE.map((step, index) => (
                      <motion.button
                        key={step}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleMSMTap(step)}
                        style={{
                          ...styles.msmButton,
                          background: index < msmIndex ? "#22c55e" : "#fbbf24",
                          color: "white",
                        }}
                      >
                        {step}
                      </motion.button>
                    ))}
                  </div>
                  <p style={{ marginTop: "20px", color: "#9ca3af" }}>Score: {gameScore}</p>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}

        {activeGame === "hazard" && (
          <motion.div
            style={styles.modal}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActiveGame(null)}
          >
            <motion.div
              style={{ ...styles.modalContent, position: "relative" }}
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button style={styles.closeBtn} onClick={() => setActiveGame(null)}>x</button>
              <h2 style={{ fontSize: "24px", fontWeight: "700", marginBottom: "20px", textAlign: "center" }}>
                Hazard Spotting
              </h2>
              <p style={{ marginBottom: "15px", color: "#6b7280", textAlign: "center" }}>
                Tap on all the hazards! ({foundHazards.length}/{HAZARDS.length} found)
              </p>
              
              <div style={styles.hazardArea}>
                {/* Road */}
                <div style={{ 
                  position: "absolute", 
                  bottom: 0, 
                  left: 0, 
                  right: 0, 
                  height: "40%", 
                  background: "#4a5568",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}>
                  <div style={{ 
                    width: "100%", 
                    height: "4px", 
                    background: "white", 
                    opacity: 0.5 
                  }} />
                </div>
                
                {HAZARDS.map((hazard) => (
                  <motion.div
                    key={hazard.id}
                    style={{
                      ...styles.hazardSpot,
                      left: `${hazard.x}%`,
                      top: `${hazard.y}%`,
                      transform: "translate(-50%, -50%)",
                      background: foundHazards.includes(hazard.id) ? "#22c55e" : "rgba(255,255,255,0.3)",
                      borderColor: foundHazards.includes(hazard.id) ? "#22c55e" : "#ef4444",
                    }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleHazardTap(hazard)}
                  >
                    {foundHazards.includes(hazard.id) ? "Yes" : "?"}
                  </motion.div>
                ))}
              </div>
              
              {foundHazards.length === HAZARDS.length && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  style={{ textAlign: "center", fontSize: "20px", fontWeight: "600", color: "#22c55e" }}
                >
                  All hazards found!
                </motion.p>
              )}
            </motion.div>
          </motion.div>
        )}

        {activeGame === "parking" && (
          <motion.div
            style={styles.modal}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActiveGame(null)}
          >
            <motion.div
              style={{ ...styles.modalContent, position: "relative" }}
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button style={styles.closeBtn} onClick={() => setActiveGame(null)}>x</button>
              <h2 style={{ fontSize: "24px", fontWeight: "700", marginBottom: "20px", textAlign: "center" }}>
                Parking References
              </h2>
              <p style={{ marginBottom: "15px", color: "#6b7280", textAlign: "center" }}>
                Question {parkingIndex + 1}/{PARKING_REFERENCES.length}
              </p>
              
              <div style={{ 
                background: "#f3f4f6", 
                padding: "20px", 
                borderRadius: "12px", 
                marginBottom: "20px",
                textAlign: "center",
              }}>
                <p style={{ fontSize: "18px", fontWeight: "600" }}>
                  {PARKING_REFERENCES[parkingIndex].scenario}
                </p>
              </div>
              
              {["When mirror aligns with rear car bumper", "When line appears in side mirror", "When at 45-degree angle"].map((option) => (
                <motion.button
                  key={option}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleParkingAnswer(option)}
                  style={{
                    ...styles.optionBtn,
                  }}
                >
                  {option}
                </motion.button>
              ))}
              
              <p style={{ marginTop: "15px", textAlign: "center", color: "#9ca3af" }}>
                Score: {parkingScore}/{parkingIndex}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
