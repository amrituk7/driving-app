import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const sections = [
  {
    title: "Play & Learn",
    description: "Interactive mini-games designed to build your driving knowledge through practice, not memorisation.",
    color: "#2563eb",
    features: [
      {
        name: "Spot the Hazard",
        detail: "Find all hazards in realistic driving scenarios before time runs out. Trains your ability to scan the road and identify potential dangers quickly."
      },
      {
        name: "Road Sign Match",
        detail: "Identify road signs from descriptions. Reinforces your road sign knowledge so you can react instantly when you see them on the road."
      },
      {
        name: "Mirror Check Trainer",
        detail: "Select the correct mirror to check in various driving situations. Builds the MSM (Mirror-Signal-Manoeuvre) habit into your muscle memory."
      }
    ]
  },
  {
    title: "Second Before",
    description: "A hazard anticipation game that trains you to react before danger appears, not after.",
    color: "#7c3aed",
    features: [
      {
        name: "Timing-Based Gameplay",
        detail: "Each scenario has a hidden hazard that appears at a set time. You must tap exactly one second before the hazard appears."
      },
      {
        name: "Real Driving Scenarios",
        detail: "Scenarios based on real-life situations: parked car doors opening, pedestrians stepping out, cyclists cutting across junctions."
      },
      {
        name: "Accuracy Feedback",
        detail: "After each tap, you see exactly how many milliseconds you were off target, with ratings from Perfect to Needs Practice."
      }
    ]
  }
];

export default function HowItWorks() {
  const navigate = useNavigate();

  const s = {
    page: { maxWidth: "800px", margin: "0 auto", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" },
    h1: { fontSize: "28px", fontWeight: "700", color: "#111827", marginBottom: "6px" },
    sub: { fontSize: "15px", color: "#6b7280", marginBottom: "36px", lineHeight: "1.6" },
    card: { background: "white", borderRadius: "14px", padding: "28px", border: "1px solid #e5e7eb", marginBottom: "20px" },
    btn: { padding: "13px 24px", borderRadius: "10px", border: "none", fontSize: "15px", fontWeight: "600", cursor: "pointer", transition: "all 0.2s" },
    btnPrimary: { background: "#2563eb", color: "white" }
  };

  return (
    <div style={s.page}>
      <motion.div initial={{ opacity: 0, y: -15 }} animate={{ opacity: 1, y: 0 }}>
        <h1 style={s.h1}>How It Works</h1>
        <p style={s.sub}>
          RoadMaster+ premium features are designed to make you a safer, more confident driver through deliberate practice and real-time feedback.
        </p>
      </motion.div>

      {/* Feature Sections */}
      {sections.map((section, sIdx) => (
        <motion.div
          key={section.title}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: sIdx * 0.1 }}
          style={{ ...s.card, borderLeft: `4px solid ${section.color}` }}
        >
          <h2 style={{ fontSize: "20px", fontWeight: "700", color: section.color, marginBottom: "6px" }}>
            {section.title}
          </h2>
          <p style={{ fontSize: "14px", color: "#6b7280", marginBottom: "24px", lineHeight: "1.5" }}>
            {section.description}
          </p>

          <div style={{ display: "grid", gap: "14px" }}>
            {section.features.map((f, fIdx) => (
              <motion.div
                key={f.name}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: sIdx * 0.1 + fIdx * 0.05 }}
                style={{ background: "#f9fafb", borderRadius: "10px", padding: "18px" }}
              >
                <h4 style={{ fontSize: "14px", fontWeight: "600", color: "#111827", marginBottom: "6px" }}>
                  {f.name}
                </h4>
                <p style={{ fontSize: "13px", color: "#6b7280", lineHeight: "1.5" }}>
                  {f.detail}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      ))}

      {/* Why Anticipation Matters */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        style={s.card}
      >
        <h2 style={{ fontSize: "20px", fontWeight: "700", color: "#111827", marginBottom: "8px" }}>
          Why Anticipation Matters
        </h2>
        <p style={{ fontSize: "14px", color: "#6b7280", lineHeight: "1.6", marginBottom: "16px" }}>
          The DVSA hazard perception test requires you to identify developing hazards before they become dangerous. Studies show that experienced drivers scan further ahead and react earlier than new drivers. Our games train exactly this skill.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "14px" }}>
          {[
            { stat: "1 second", label: "Earlier reaction can prevent most accidents" },
            { stat: "44%", label: "Of accidents involve a failure to look" },
            { stat: "3x", label: "Faster hazard detection with practice" }
          ].map((item) => (
            <div key={item.stat} style={{ textAlign: "center", background: "#f0f9ff", borderRadius: "10px", padding: "16px" }}>
              <p style={{ fontSize: "22px", fontWeight: "700", color: "#2563eb", marginBottom: "4px" }}>{item.stat}</p>
              <p style={{ fontSize: "12px", color: "#6b7280", lineHeight: "1.4" }}>{item.label}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Scoring Explained */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        style={s.card}
      >
        <h2 style={{ fontSize: "20px", fontWeight: "700", color: "#111827", marginBottom: "8px" }}>
          How Scoring Works
        </h2>
        <p style={{ fontSize: "14px", color: "#6b7280", lineHeight: "1.6", marginBottom: "16px" }}>
          Your scores are saved to your profile so you can track improvement over time.
        </p>

        <div style={{ display: "grid", gap: "8px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px", background: "#f9fafb", borderRadius: "8px" }}>
            <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#2563eb", flexShrink: 0 }} />
            <p style={{ fontSize: "13px", color: "#374151" }}>
              <strong>Play & Learn:</strong> Scored by accuracy percentage. Each correct answer counts toward your total.
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px", background: "#f9fafb", borderRadius: "8px" }}>
            <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#7c3aed", flexShrink: 0 }} />
            <p style={{ fontSize: "13px", color: "#374151" }}>
              <strong>Second Before:</strong> Measured in milliseconds off target. Lower is better. Aim for under 200ms.
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px", background: "#f9fafb", borderRadius: "8px" }}>
            <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#16a34a", flexShrink: 0 }} />
            <p style={{ fontSize: "13px", color: "#374151" }}>
              <strong>Progress page:</strong> Shows your improvement over time with charts and stats.
            </p>
          </div>
        </div>
      </motion.div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        style={{ ...s.card, textAlign: "center", background: "#f0f7ff", border: "1px solid #bfdbfe" }}
      >
        <h3 style={{ fontSize: "18px", fontWeight: "600", color: "#1e40af", marginBottom: "8px" }}>
          Ready to Start?
        </h3>
        <p style={{ fontSize: "14px", color: "#6b7280", marginBottom: "20px" }}>
          Jump into a game and start building your driving instincts.
        </p>
        <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
          <button onClick={() => navigate("/premium/play-and-learn")} style={{ ...s.btn, ...s.btnPrimary }}>
            Play & Learn
          </button>
          <button onClick={() => navigate("/premium/second-before")} style={{ ...s.btn, background: "#7c3aed", color: "white" }}>
            Second Before
          </button>
        </div>
      </motion.div>
    </div>
  );
}
