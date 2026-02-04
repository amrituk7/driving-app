import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { getCommunityPosts, createCommunityPost, deleteCommunityPost } from "../firebase";
import { useSubscription } from "../context/SubscriptionContext";
import { useToast } from "../context/ToastContext";
import Paywall from "../components/Paywall";

export default function InstructorCommunity() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPaywall, setShowPaywall] = useState(false);
  const { hasRoadMasterPro } = useSubscription();
  const { showToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!hasRoadMasterPro) {
      setShowPaywall(true);
      return;
    }

    loadPosts();
  }, [hasRoadMasterPro]);

  const loadPosts = async () => {
    try {
      const data = await getCommunityPosts("instructor");
      setPosts(data.sort((a, b) => b.timestamp - a.timestamp));
    } catch (error) {
      showToast("Error loading posts", "error");
    } finally {
      setLoading(false);
    }
  };

  if (showPaywall && !hasRoadMasterPro) {
    return (
      <Paywall
        feature="Instructor Community & Marketplace"
        tier="instructor"
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
          Instructor Community & Marketplace
        </h1>
        <p style={{ fontSize: "16px", color: "#666", marginBottom: "20px" }}>
          Post availability, job offers, car hire options, and connect with other instructors
        </p>
        <button
          onClick={() => navigate("/instructor-community/new-post")}
          style={{
            background: "#8b5cf6",
            color: "white",
            border: "none",
            borderRadius: "8px",
            padding: "10px 20px",
            fontSize: "14px",
            fontWeight: "600",
            cursor: "pointer"
          }}
        >
          Create Listing
        </button>
      </motion.div>

      {loading ? (
        <p>Loading listings...</p>
      ) : posts.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px", color: "#999" }}>
          <p style={{ fontSize: "16px" }}>No listings yet. Post your first offer!</p>
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
                <div>
                  <h3 style={{ fontSize: "16px", fontWeight: "600" }}>{post.title}</h3>
                  <p style={{ fontSize: "13px", color: "#999", marginTop: "4px" }}>
                    Posted by {post.author || "Anonymous"}
                  </p>
                </div>
                <span style={{ fontSize: "12px", color: "#999" }}>
                  {new Date(post.timestamp).toLocaleDateString()}
                </span>
              </div>
              <p style={{ fontSize: "14px", color: "#374151", lineHeight: "1.6", marginBottom: "12px" }}>
                {post.content}
              </p>
              {post.location && (
                <p style={{ fontSize: "13px", color: "#666", marginBottom: "12px" }}>
                  📍 {post.location}
                </p>
              )}
              {post.contact && (
                <p style={{ fontSize: "13px", color: "#0ea5e9", marginBottom: "12px" }}>
                  📧 {post.contact}
                </p>
              )}
              <div style={{ display: "flex", gap: "10px", fontSize: "12px", color: "#666" }}>
                <span>⭐ {post.likes || 0} saved</span>
                <span>💬 {post.comments || 0} inquiries</span>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
