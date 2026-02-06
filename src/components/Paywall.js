import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const plans = {
  student: {
    name: "RoadMaster+",
    price: "£3.59",
    period: "/month",
    description: "Premium features for learning drivers",
    benefits: [
      "Play & Learn Pro - 3 interactive games",
      "Second Before hazard anticipation trainer",
      "Spot the Hazard reaction game",
      "Road Sign Match knowledge quiz",
      "Mirror Check Trainer",
      "Track your progress over time"
    ],
    color: "#3b82f6",
    tier: "student"
  },
  instructor: {
    name: "RoadMaster Pro",
    price: "£10",
    period: "/month",
    description: "Advanced tools for driving instructors",
    benefits: [
      "Instructor-Only Community Access",
      "Marketplace Posting (Availability, Offers)",
      "Car Hire & Resource Sharing",
      "Networking & Collaboration Tools",
      "Priority Listing in Student Community",
      "Analytics Dashboard for Student Progress"
    ],
    color: "#8b5cf6",
    tier: "instructor"
  }
};

export default function Paywall({ feature, tier = "student", onSubscribe }) {
  const navigate = useNavigate();
  const plan = plans[tier];

  if (!plan) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      style={{
        position: "fixed",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,0.5)",
        zIndex: 1000
      }}
    >
      <motion.div
        initial={{ y: 20 }}
        animate={{ y: 0 }}
        style={{
          background: "white",
          borderRadius: "20px",
          padding: "40px",
          maxWidth: "500px",
          width: "90%",
          boxShadow: "0 20px 60px rgba(0,0,0,0.2)"
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "30px" }}>
          <h2 style={{ fontSize: "28px", fontWeight: "700", marginBottom: "8px" }}>
            {plan.name}
          </h2>
          <p style={{ fontSize: "14px", color: "#666", marginBottom: "20px" }}>
            {plan.description}
          </p>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "center", gap: "4px" }}>
            <span style={{ fontSize: "32px", fontWeight: "700", color: plan.color }}>
              {plan.price}
            </span>
            <span style={{ fontSize: "14px", color: "#999" }}>{plan.period}</span>
          </div>
        </div>

        <div style={{ marginBottom: "30px", paddingBottom: "30px", borderBottom: "1px solid #e5e7eb" }}>
          <p style={{ fontSize: "12px", fontWeight: "600", textTransform: "uppercase", color: "#999", marginBottom: "15px" }}>
            {feature}
          </p>
          <p style={{ fontSize: "14px", color: "#1f2937", fontWeight: "500" }}>
            This feature requires {plan.name}
          </p>
        </div>

        <div style={{ marginBottom: "30px" }}>
          <p style={{ fontSize: "12px", fontWeight: "600", textTransform: "uppercase", color: "#999", marginBottom: "12px" }}>
            Includes
          </p>
          <ul style={{ listStyle: "none", padding: 0, display: "grid", gap: "10px" }}>
            {plan.benefits.map((benefit, idx) => (
              <motion.li
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  fontSize: "14px",
                  color: "#374151"
                }}
              >
                <span style={{ color: plan.color, fontWeight: "700" }}>✓</span>
                {benefit}
              </motion.li>
            ))}
          </ul>
        </div>

        <div style={{ display: "grid", gap: "10px" }}>
          <button
            onClick={() => onSubscribe?.(plan.tier)}
            style={{
              background: plan.color,
              color: "white",
              border: "none",
              borderRadius: "10px",
              padding: "12px 20px",
              fontSize: "14px",
              fontWeight: "600",
              cursor: "pointer",
              transition: "all 0.3s"
            }}
            onMouseEnter={(e) => e.target.style.opacity = "0.9"}
            onMouseLeave={(e) => e.target.style.opacity = "1"}
          >
            Subscribe to {plan.name}
          </button>
          <button
            onClick={() => navigate(-1)}
            style={{
              background: "#f3f4f6",
              color: "#1f2937",
              border: "none",
              borderRadius: "10px",
              padding: "12px 20px",
              fontSize: "14px",
              fontWeight: "600",
              cursor: "pointer",
              transition: "all 0.3s"
            }}
            onMouseEnter={(e) => e.target.style.background = "#e5e7eb"}
            onMouseLeave={(e) => e.target.style.background = "#f3f4f6"}
          >
            Back
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
