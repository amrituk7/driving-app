import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { getCommunityPosts, createCommunityPost, deleteCommunityPost } from "../firebase";
import { useSubscription } from "../context/SubscriptionContext";
import { useToast } from "../context/ToastContext";
import Paywall from "../components/Paywall";

export default function StudentCommunity() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPaywall, setShowPaywall] = useState(false);
  const { hasRoadMasterPlus } = useSubscription();
  const { showToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!hasRoadMasterPlus) {
      setShowPaywall(true);
      return;
    }

    loadPosts();
  }, [hasRoadMasterPlus]);

  const loadPosts = async () => {
    try {
      const data = await getCommunityPosts("student");
      setPosts(data.sort((a, b) => b.timestamp - a.timestamp));
    } catch (error) {
      showToast("Error loading posts", "error");
    } finally {
      setLoading(false);
    }
  };

  if (showPaywall && !hasRoadMasterPlus) {
    return (
      <Paywall
        feature="Student Community"
        tier="student"
        onSubscribe={() => navigate("/subscribe")}
      />
    );
  }

  return (
    <div style={{ maxWidth: "800px" }}>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: "30px" }}
      >
        <h1 style={{ fontSize: "32px", fontWeight: "700", marginBottom: "8px" }}>
          Student Community
        </h1>
        <p style={{ fontSize: "16px", color: "#666", marginBottom: "20px" }}>
          Connect with other learners, share tips, and ask questions
        </p>
        <button
          onClick={() => navigate("/student-community/new-post")}
          style={{
            background: "#3b82f6",
            color: "white",
            border: "none",
            borderRadius: "8px",
            padding: "10px 20px",
            fontSize: "14px",
            fontWeight: "600",
            cursor: "pointer"
          }}
        >
          Create Post
        </button>
      </motion.div>

      {loading ? (
        <p>Loading posts...</p>
      ) : posts.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px", color: "#999" }}>
          <p style={{ fontSize: "16px" }}>No posts yet. Be the first to share!</p>
        </div>
      ) : (
        <div style={{ display: "grid", gap: "15px" }}>
          {posts.map((post, idx) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              style={{
                background: "white",
                borderRadius: "12px",
                padding: "20px",
                border: "1px solid #e5e7eb",
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
              }}
              onMouseEnter={(e) => e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)"}
              onMouseLeave={(e) => e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.1)"}
            >
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
                <h3 style={{ fontSize: "16px", fontWeight: "600" }}>{post.title}</h3>
                <span style={{ fontSize: "12px", color: "#999" }}>
                  {new Date(post.timestamp).toLocaleDateString()}
                </span>
              </div>
              <p style={{ fontSize: "14px", color: "#374151", lineHeight: "1.6", marginBottom: "12px" }}>
                {post.content}
              </p>
              <div style={{ display: "flex", gap: "10px", fontSize: "12px", color: "#666" }}>
                <span>❤️ {post.likes || 0} likes</span>
                <span>💬 {post.comments || 0} comments</span>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
