import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { createSubscription } from "../firebase";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

const plans = [
  {
    tier: "student",
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
    color: "#3b82f6"
  },
  {
    tier: "instructor",
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
    color: "#8b5cf6"
  }
];

export default function Subscribe() {
  const navigate = useNavigate();
  const auth = useAuth() || {};
  const { user } = auth;
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async (tier) => {
    if (!user?.uid) {
      showToast("Please log in to subscribe", "error");
      navigate("/login");
      return;
    }

    setLoading(true);
    try {
      await createSubscription(user.uid, tier);
      showToast("Successfully subscribed!", "success");
      navigate("/");
    } catch (error) {
      showToast("Error subscribing. Please try again.", "error");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "1200px" }}>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ textAlign: "center", marginBottom: "50px" }}
      >
        <h1 style={{ fontSize: "36px", fontWeight: "700", marginBottom: "10px" }}>
          Choose Your Plan
        </h1>
        <p style={{ fontSize: "16px", color: "#666" }}>
          Unlock premium features and take your driving skills to the next level
        </p>
      </motion.div>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))",
        gap: "30px",
        marginBottom: "50px"
      }}>
        {plans.map((plan, idx) => (
          <motion.div
            key={plan.tier}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            style={{
              background: "white",
              borderRadius: "16px",
              border: "2px solid " + plan.color,
              padding: "40px 30px",
              display: "flex",
              flexDirection: "column",
              boxShadow: "0 10px 30px rgba(0,0,0,0.1)"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-5px)";
              e.currentTarget.style.boxShadow = "0 20px 40px rgba(0,0,0,0.15)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 10px 30px rgba(0,0,0,0.1)";
            }}
          >
            <h2 style={{ fontSize: "24px", fontWeight: "700", marginBottom: "8px", color: plan.color }}>
              {plan.name}
            </h2>
            <p style={{ fontSize: "14px", color: "#666", marginBottom: "20px" }}>
              {plan.description}
            </p>

            <div style={{ marginBottom: "30px" }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: "4px", marginBottom: "4px" }}>
                <span style={{ fontSize: "32px", fontWeight: "700", color: plan.color }}>
                  {plan.price}
                </span>
                <span style={{ fontSize: "14px", color: "#999" }}>{plan.period}</span>
              </div>
            </div>

            <ul style={{ listStyle: "none", padding: 0, display: "grid", gap: "12px", marginBottom: "30px", flex: 1 }}>
              {plan.benefits.map((benefit, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + i * 0.05 }}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "10px",
                    fontSize: "13px",
                    color: "#374151"
                  }}
                >
                  <span style={{ color: plan.color, fontWeight: "700", marginTop: "2px" }}>✓</span>
                  <span>{benefit}</span>
                </motion.li>
              ))}
            </ul>

            <button
              onClick={() => handleSubscribe(plan.tier)}
              disabled={loading}
              style={{
                background: plan.color,
                color: "white",
                border: "none",
                borderRadius: "10px",
                padding: "14px 20px",
                fontSize: "14px",
                fontWeight: "600",
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.6 : 1,
                transition: "all 0.3s"
              }}
              onMouseEnter={(e) => !loading && (e.target.style.opacity = "0.9")}
              onMouseLeave={(e) => !loading && (e.target.style.opacity = "1")}
            >
              {loading ? "Processing..." : "Subscribe Now"}
            </button>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        style={{
          background: "#f9fafb",
          borderRadius: "12px",
          padding: "30px",
          textAlign: "center"
        }}
      >
        <h3 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "10px" }}>
          Not sure which plan is right for you?
        </h3>
        <p style={{ fontSize: "14px", color: "#666" }}>
          Both plans offer amazing features. Choose based on whether you're a student learning to drive or an instructor managing students.
        </p>
      </motion.div>
    </div>
  );
}
