import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { getCommunityPosts, createCommunityPost, deleteCommunityPost, getConversations } from "../firebase";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

export default function StudentCommunity() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("feed"); // feed, local, dms, share
  const [newPost, setNewPost] = useState("");
  const [postType, setPostType] = useState("text"); // text, progress, poll
  const [conversations, setConversations] = useState([]);
  const { user } = useAuth() || {};
  const { showToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    loadContent();
  }, [activeTab]);

  const loadContent = async () => {
    try {
      if (activeTab === "feed") {
        const data = await getCommunityPosts("student");
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
        community: "student",
        author: user?.email || "Anonymous",
        authorId: user?.uid,
        title: postType === "progress" ? "Progress Update" : "Discussion",
        content: newPost,
        type: postType,
        timestamp: Date.now(),
        likes: 0,
        comments: 0
      });
      setNewPost("");
      showToast("Post created successfully", "success");
      await loadContent();
    } catch (error) {
      showToast("Error creating post", "error");
    }
  };

  return (
    <div style={{ maxWidth: "900px" }}>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: "30px" }}
      >
        <h1 style={{ fontSize: "32px", fontWeight: "700", marginBottom: "8px" }}>
          Student Community
        </h1>
        <p style={{ fontSize: "16px", color: "#666", marginBottom: "20px" }}>
          Connect with learners, share progress, and ask questions
        </p>

        {/* Tabs */}
        <div style={{ display: "flex", gap: "10px", borderBottom: "2px solid #e5e7eb", marginBottom: "20px" }}>
          {["feed", "local", "dms", "share"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: "10px 15px",
                border: "none",
                background: "transparent",
                fontSize: "14px",
                fontWeight: activeTab === tab ? "600" : "400",
                color: activeTab === tab ? "#0ea5e9" : "#666",
                cursor: "pointer",
                borderBottom: activeTab === tab ? "2px solid #0ea5e9" : "none",
                marginBottom: "-2px"
              }}
            >
              {tab === "feed" && "Feed"}
              {tab === "local" && "Local Students"}
              {tab === "dms" && "Messages"}
              {tab === "share" && "Share Progress"}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Feed Tab */}
      {activeTab === "feed" && (
        <div>
          <div style={{ background: "#f9fafb", borderRadius: "12px", padding: "20px", marginBottom: "20px" }}>
            <h3 style={{ marginBottom: "10px", fontSize: "14px", fontWeight: "600" }}>Create a Post</h3>
            <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
              {["text", "progress", "poll"].map((type) => (
                <button
                  key={type}
                  onClick={() => setPostType(type)}
                  style={{
                    padding: "6px 12px",
                    borderRadius: "6px",
                    border: "1px solid " + (postType === type ? "#0ea5e9" : "#e5e7eb"),
                    background: postType === type ? "#e0f2fe" : "white",
                    color: postType === type ? "#0ea5e9" : "#666",
                    fontSize: "12px",
                    cursor: "pointer",
                    fontWeight: postType === type ? "600" : "400"
                  }}
                >
                  {type === "text" && "Text"}
                  {type === "progress" && "Progress"}
                  {type === "poll" && "Poll"}
                </button>
              ))}
            </div>
            <textarea
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              placeholder="Share your thoughts, ask questions, or post your progress..."
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
            <button
              onClick={handleCreatePost}
              style={{
                background: "#0ea5e9",
                color: "white",
                border: "none",
                borderRadius: "8px",
                padding: "10px 20px",
                fontSize: "14px",
                fontWeight: "600",
                cursor: "pointer"
              }}
            >
              Post
            </button>
          </div>

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
                    <div style={{ display: "inline-block", background: "#e0f2fe", color: "#0284c7", padding: "4px 8px", borderRadius: "4px", fontSize: "11px", fontWeight: "600", marginBottom: "12px" }}>
                      {post.type.charAt(0).toUpperCase() + post.type.slice(1)}
                    </div>
                  )}
                  <p style={{ fontSize: "14px", color: "#374151", lineHeight: "1.6", marginBottom: "12px" }}>
                    {post.content}
                  </p>
                  <div style={{ display: "flex", gap: "15px", fontSize: "12px", color: "#666" }}>
                    <button style={{ background: "none", border: "none", cursor: "pointer", color: "#666" }}>
                      ❤️ {post.likes || 0} likes
                    </button>
                    <button style={{ background: "none", border: "none", cursor: "pointer", color: "#666" }}>
                      💬 {post.comments || 0} comments
                    </button>
                    <button style={{ background: "none", border: "none", cursor: "pointer", color: "#0ea5e9" }}>
                      📤 Share
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Local Students Tab */}
      {activeTab === "local" && (
        <div style={{ textAlign: "center", padding: "40px", color: "#999" }}>
          <p style={{ fontSize: "16px", marginBottom: "10px" }}>Discover learners near you</p>
          <p style={{ fontSize: "13px" }}>Coming soon - Find and connect with local students</p>
        </div>
      )}

      {/* DMs Tab */}
      {activeTab === "dms" && (
        <div>
          <p style={{ fontSize: "14px", color: "#666", marginBottom: "20px" }}>Direct messages with other students</p>
          {conversations.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px", color: "#999" }}>
              <p>No conversations yet. Start chatting!</p>
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

      {/* Share Progress Tab */}
      {activeTab === "share" && (
        <div style={{ textAlign: "center", padding: "40px", color: "#999" }}>
          <p style={{ fontSize: "16px", marginBottom: "10px" }}>Share your progress on X (Twitter)</p>
          <button
            onClick={() => window.open("https://x.com/intent/tweet?text=I'm%20learning%20to%20drive%20with%20RoadMaster!%20%23RoadMaster%20%23DrivingLessons", "_blank")}
            style={{
              background: "#000",
              color: "white",
              border: "none",
              borderRadius: "8px",
              padding: "12px 24px",
              fontSize: "14px",
              fontWeight: "600",
              cursor: "pointer",
              marginTop: "10px"
            }}
          >
            Share on X
          </button>
        </div>
      )}
    </div>
  );
}
