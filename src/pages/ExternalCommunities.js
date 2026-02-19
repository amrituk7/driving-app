import React from "react";
import { motion } from "framer-motion";

const externalCommunities = [
  {
    name: "r/Learner Drivers",
    description: "UK subreddit for learner drivers to share advice and tips",
    url: "https://www.reddit.com/r/Learnersdriver/",
    icon: "🔗",
    color: "#FF4500"
  },
  {
    name: "r/Driving",
    description: "General driving community with helpful discussions",
    url: "https://www.reddit.com/r/driving/",
    icon: "🔗",
    color: "#FF4500"
  },
  {
    name: "r/Instructors",
    description: "Community for driving instructors to share teaching strategies",
    url: "https://www.reddit.com/r/InstructorLife/",
    icon: "🔗",
    color: "#FF4500"
  },
  {
    name: "Driving Tips on X",
    description: "Follow experts sharing daily driving safety tips",
    url: "https://x.com/search?q=driving%20lessons&f=top",
    icon: "𝕏",
    color: "#000"
  },
  {
    name: "Instructor Network on X",
    description: "Connect with other driving instructors worldwide",
    url: "https://x.com/search?q=driving%20instructors&f=top",
    icon: "𝕏",
    color: "#000"
  }
];

export default function ExternalCommunities() {
  return (
    <div style={{ maxWidth: "900px" }}>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: "30px" }}
      >
        <h1 style={{ fontSize: "32px", fontWeight: "700", marginBottom: "8px" }}>
          External Communities
        </h1>
        <p style={{ fontSize: "16px", color: "#666", marginBottom: "20px" }}>
          Connect with driving communities on Reddit and X
        </p>
      </motion.div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "20px" }}>
        {externalCommunities.map((community, idx) => (
          <motion.a
            key={community.name}
            href={community.url}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            whileHover={{ scale: 1.05 }}
            style={{
              background: "white",
              borderRadius: "12px",
              padding: "24px",
              border: "1px solid #e5e7eb",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
              cursor: "pointer",
              textDecoration: "none",
              color: "inherit",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between"
            }}
          >
            <div>
              <div style={{ fontSize: "28px", marginBottom: "12px" }}>
                {community.icon}
              </div>
              <h3 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "8px" }}>
                {community.name}
              </h3>
              <p style={{ fontSize: "14px", color: "#666", lineHeight: "1.5", marginBottom: "16px" }}>
                {community.description}
              </p>
            </div>
            <div
              style={{
                background: community.color,
                color: "white",
                padding: "10px",
                borderRadius: "8px",
                textAlign: "center",
                fontSize: "14px",
                fontWeight: "600"
              }}
            >
              Visit Community
            </div>
          </motion.a>
        ))}
      </div>

      {/* Share Progress Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        style={{
          background: "linear-gradient(135deg, #000 0%, #1a1a1a 100%)",
          borderRadius: "16px",
          padding: "40px",
          marginTop: "40px",
          color: "white",
          textAlign: "center"
        }}
      >
        <h2 style={{ fontSize: "24px", fontWeight: "700", marginBottom: "12px" }}>
          Share Your RoadMaster Journey
        </h2>
        <p style={{ fontSize: "16px", color: "#ccc", marginBottom: "24px" }}>
          Post your progress and connect with the driving community
        </p>
        <button
          onClick={() => window.open("https://x.com/intent/tweet?text=I'm%20learning%20to%20drive%20with%20RoadMaster!%20Check%20out%20this%20amazing%20platform.%20%23RoadMaster%20%23DrivingLessons%20%23LearnerDriver", "_blank")}
          style={{
            background: "white",
            color: "#000",
            border: "none",
            borderRadius: "8px",
            padding: "12px 32px",
            fontSize: "16px",
            fontWeight: "600",
            cursor: "pointer"
          }}
        >
          Share on X
        </button>
      </motion.div>
    </div>
  );
}
