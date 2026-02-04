import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { getCommunityPosts, createCommunityPost, deleteCommunityPost, getConversations } from "../firebase";
import { useSubscription } from "../context/SubscriptionContext";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import Paywall from "../components/Paywall";

export default function InstructorCommunity() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("marketplace"); // marketplace, networking, dms
  const [showPaywall, setShowPaywall] = useState(false);
  const [newPost, setNewPost] = useState("");
  const [postType, setPostType] = useState("availability"); // availability, offer, car-hire, networking
  const [postLocation, setPostLocation] = useState("");
  const [postContact, setPostContact] = useState("");
  const [conversations, setConversations] = useState([]);
  const { hasRoadMasterPro } = useSubscription();
  const { user } = useAuth() || {};
  const { showToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!hasRoadMasterPro) {
      setShowPaywall(true);
      return;
    }

    loadContent();
  }, [hasRoadMasterPro, activeTab]);

  const loadContent = async () => {
    try {
      if (activeTab === "marketplace" || activeTab === "networking") {
        const data = await getCommunityPosts("instructor");
        setPosts(data.sort((a, b) => b.timestamp - a.timestamp));
      } else if (activeTab === "dms" && user?.uid) {
        const convs = await getConversations(user.uid);
        setConversations(convs);
      }
    } catch (error) {
      showToast("Error loading content", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async () => {
    if (!newPost.trim()) {
      showToast("Post cannot be empty", "error");
      return;
    }

    try {
      await createCommunityPost({
        community: "instructor",
        author: user?.email || "Anonymous",
        authorId: user?.uid,
        title: postType === "availability" ? "Available for Lessons" :
               postType === "offer" ? "Job Offer" :
               postType === "car-hire" ? "Car Hire Available" : "Networking Post",
        content: newPost,
        type: postType,
        location: postLocation,
        contact: postContact,
        timestamp: Date.now(),
        likes: 0,
        comments: 0
      });
      setNewPost("");
      setPostLocation("");
      setPostContact("");
      showToast("Listing posted successfully", "success");
      await loadContent();
    } catch (error) {
      showToast("Error creating post", "error");
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
    <div style={{ maxWidth: "900px" }}>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: "30px" }}
      >
        <h1 style={{ fontSize: "32px", fontWeight: "700", marginBottom: "8px" }}>
          Instructor Community & Marketplace
        </h1>
        <p style={{ fontSize: "16px", color: "#666", marginBottom: "20px" }}>
          Post availability, job offers, car hire, and connect with other instructors
        </p>

        {/* Tabs */}
        <div style={{ display: "flex", gap: "10px", borderBottom: "2px solid #e5e7eb", marginBottom: "20px" }}>
          {["marketplace", "networking", "dms"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: "10px 15px",
                border: "none",
                background: "transparent",
                fontSize: "14px",
                fontWeight: activeTab === tab ? "600" : "400",
                color: activeTab === tab ? "#8b5cf6" : "#666",
                cursor: "pointer",
                borderBottom: activeTab === tab ? "2px solid #8b5cf6" : "none",
                marginBottom: "-2px"
              }}
            >
              {tab === "marketplace" && "Marketplace"}
              {tab === "networking" && "Networking"}
              {tab === "dms" && "Messages"}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Marketplace & Networking Tabs */}
      {(activeTab === "marketplace" || activeTab === "networking") && (
        <div>
          <div style={{ background: "#f9fafb", borderRadius: "12px", padding: "20px", marginBottom: "20px" }}>
            <h3 style={{ marginBottom: "10px", fontSize: "14px", fontWeight: "600" }}>Create Listing</h3>
            <div style={{ display: "flex", gap: "10px", marginBottom: "10px", flexWrap: "wrap" }}>
              {["availability", "offer", "car-hire", "networking"].map((type) => (
                <button
                  key={type}
                  onClick={() => setPostType(type)}
                  style={{
                    padding: "6px 12px",
                    borderRadius: "6px",
                    border: "1px solid " + (postType === type ? "#8b5cf6" : "#e5e7eb"),
                    background: postType === type ? "#f3e8ff" : "white",
                    color: postType === type ? "#8b5cf6" : "#666",
                    fontSize: "12px",
                    cursor: "pointer",
                    fontWeight: postType === type ? "600" : "400"
                  }}
                >
                  {type === "availability" && "Available"}
                  {type === "offer" && "Job Offer"}
                  {type === "car-hire" && "Car Hire"}
                  {type === "networking" && "Network"}
                </button>
              ))}
            </div>
            <textarea
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              placeholder="Describe your offering or message..."
              style={{
                width: "100%",
                minHeight: "100px",
                padding: "12px",
                borderRadius: "8px",
                border: "1px solid #e5e7eb",
                fontSize: "14px",
                fontFamily: "inherit",
                marginBottom: "10px"
              }}
            />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "10px" }}>
              <input
                type="text"
                value={postLocation}
                onChange={(e) => setPostLocation(e.target.value)}
                placeholder="Location (e.g., London, Manchester)"
                style={{
                  padding: "10px",
                  borderRadius: "8px",
                  border: "1px solid #e5e7eb",
                  fontSize: "14px"
                }}
              />
              <input
                type="text"
                value={postContact}
                onChange={(e) => setPostContact(e.target.value)}
                placeholder="Contact (email or phone)"
                style={{
                  padding: "10px",
                  borderRadius: "8px",
                  border: "1px solid #e5e7eb",
                  fontSize: "14px"
                }}
              />
            </div>
            <button
              onClick={handleCreatePost}
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
              Post Listing
            </button>
          </div>

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
                  whileHover={{ boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
                    <div>
                      <p style={{ fontSize: "12px", color: "#666", marginBottom: "4px" }}>
                        {post.author || "Anonymous"}
                      </p>
                      <h3 style={{ fontSize: "16px", fontWeight: "600" }}>{post.title}</h3>
                    </div>
                    <span style={{ fontSize: "12px", color: "#999" }}>
                      {new Date(post.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                  {post.type && (
                    <div style={{ display: "inline-block", background: "#f3e8ff", color: "#7c3aed", padding: "4px 8px", borderRadius: "4px", fontSize: "11px", fontWeight: "600", marginBottom: "12px" }}>
                      {post.type.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")}
                    </div>
                  )}
                  <p style={{ fontSize: "14px", color: "#374151", lineHeight: "1.6", marginBottom: "12px" }}>
                    {post.content}
                  </p>
                  {post.location && (
                    <p style={{ fontSize: "13px", color: "#666", marginBottom: "8px" }}>
                      📍 {post.location}
                    </p>
                  )}
                  {post.contact && (
                    <p style={{ fontSize: "13px", color: "#8b5cf6", marginBottom: "12px" }}>
                      📧 {post.contact}
                    </p>
                  )}
                  <div style={{ display: "flex", gap: "15px", fontSize: "12px", color: "#666" }}>
                    <button style={{ background: "none", border: "none", cursor: "pointer", color: "#666" }}>
                      ⭐ {post.likes || 0} saved
                    </button>
                    <button style={{ background: "none", border: "none", cursor: "pointer", color: "#666" }}>
                      💬 {post.comments || 0} inquiries
                    </button>
                    <button style={{ background: "none", border: "none", cursor: "pointer", color: "#8b5cf6" }}>
                      💬 Message
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* DMs Tab */}
      {activeTab === "dms" && (
        <div>
          <p style={{ fontSize: "14px", color: "#666", marginBottom: "20px" }}>Direct messages with other instructors</p>
          {conversations.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px", color: "#999" }}>
              <p>No conversations yet. Start networking!</p>
            </div>
          ) : (
            <div style={{ display: "grid", gap: "10px" }}>
              {conversations.map((conv) => (
                <motion.div
                  key={conv.userId}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  style={{
                    background: "white",
                    borderRadius: "12px",
                    padding: "15px",
                    border: "1px solid #e5e7eb",
                    cursor: "pointer"
                  }}
                  whileHover={{ background: "#f9fafb" }}
                >
                  <p style={{ fontSize: "14px", fontWeight: "600", marginBottom: "4px" }}>{conv.userId}</p>
                  <p style={{ fontSize: "13px", color: "#666" }}>{conv.lastMessage}</p>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
