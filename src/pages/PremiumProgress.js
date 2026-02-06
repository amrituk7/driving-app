import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { getPremiumProgress } from "../firebase";

export default function PremiumProgress() {
  const auth = useAuth() || {};
  const userId = auth.user?.uid;
  const [loading, setLoading] = useState(true);
  const [playScores, setPlayScores] = useState([]);
  const [secondAttempts, setSecondAttempts] = useState([]);

  useEffect(() => {
    if (!userId) { setLoading(false); return; }
    (async () => {
      try {
        const data = await getPremiumProgress(userId);
        setPlayScores(data.playScores || []);
        setSecondAttempts(data.secondAttempts || []);
      } catch (e) {
        console.error("Error loading progress:", e);
      } finally {
        setLoading(false);
      }
    })();
  }, [userId]);

  // Calculate Play & Learn stats
  const hazardGames = playScores.filter(s => s.game === "hazard");
  const signGames = playScores.filter(s => s.game === "signs");
  const mirrorGames = playScores.filter(s => s.game === "mirror");

  const totalGamesPlayed = playScores.length;
  const avgPlayAccuracy = playScores.length > 0
    ? Math.round(playScores.reduce((sum, s) => sum + ((s.score / s.total) * 100), 0) / playScores.length)
    : 0;

  // Calculate Second Before stats
  const totalAttempts = secondAttempts.length;
  const avgReactionTime = secondAttempts.length > 0
    ? Math.round(secondAttempts.reduce((sum, a) => sum + a.accuracy, 0) / secondAttempts.length)
    : 0;
  const bestAccuracy = secondAttempts.length > 0
    ? Math.min(...secondAttempts.map(a => a.accuracy))
    : 0;

  // Improvement over time (compare first half vs second half of attempts)
  const getImprovement = () => {
    if (secondAttempts.length < 4) return null;
    const sorted = [...secondAttempts].sort((a, b) => a.timestamp - b.timestamp);
    const mid = Math.floor(sorted.length / 2);
    const firstHalf = sorted.slice(0, mid);
    const secondHalf = sorted.slice(mid);
    const avgFirst = firstHalf.reduce((s, a) => s + a.accuracy, 0) / firstHalf.length;
    const avgSecond = secondHalf.reduce((s, a) => s + a.accuracy, 0) / secondHalf.length;
    const diff = Math.round(avgFirst - avgSecond);
    return diff;
  };

  const improvement = getImprovement();

  // Simple bar chart data for second before (last 10 attempts)
  const recentAttempts = [...secondAttempts]
    .sort((a, b) => a.timestamp - b.timestamp)
    .slice(-10);
  const maxAcc = recentAttempts.length > 0 ? Math.max(...recentAttempts.map(a => a.accuracy), 1000) : 1000;

  const s = {
    page: { maxWidth: "900px", margin: "0 auto", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" },
    h1: { fontSize: "28px", fontWeight: "700", color: "#111827", marginBottom: "6px" },
    sub: { fontSize: "15px", color: "#6b7280", marginBottom: "30px", lineHeight: "1.5" },
    card: { background: "white", borderRadius: "14px", padding: "28px", border: "1px solid #e5e7eb", marginBottom: "20px" },
    sectionTitle: { fontSize: "16px", fontWeight: "600", color: "#111827", marginBottom: "16px" },
    statGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "14px", marginBottom: "24px" },
    stat: { background: "#f9fafb", borderRadius: "10px", padding: "18px", textAlign: "center" },
    statLabel: { fontSize: "12px", color: "#6b7280", marginBottom: "4px" },
    statValue: { fontSize: "24px", fontWeight: "700", color: "#111827" },
    empty: { textAlign: "center", padding: "40px 20px", color: "#6b7280" }
  };

  if (loading) {
    return (
      <div style={s.page}>
        <h1 style={s.h1}>Progress</h1>
        <div style={{ ...s.card, textAlign: "center", padding: "60px" }}>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            style={{ width: "32px", height: "32px", border: "3px solid #e5e7eb", borderTopColor: "#2563eb", borderRadius: "50%", margin: "0 auto" }}
          />
          <p style={{ color: "#6b7280", marginTop: "16px", fontSize: "14px" }}>Loading your progress...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={s.page}>
      <motion.div initial={{ opacity: 0, y: -15 }} animate={{ opacity: 1, y: 0 }}>
        <h1 style={s.h1}>Progress</h1>
        <p style={s.sub}>Track your performance across all premium games and see how you are improving.</p>
      </motion.div>

      {/* Overview Stats */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} style={s.card}>
        <h3 style={s.sectionTitle}>Overview</h3>
        <div style={s.statGrid}>
          <div style={s.stat}>
            <p style={s.statLabel}>Games Played</p>
            <p style={s.statValue}>{totalGamesPlayed + Math.ceil(totalAttempts / 3)}</p>
          </div>
          <div style={s.stat}>
            <p style={s.statLabel}>Play & Learn Accuracy</p>
            <p style={{ ...s.statValue, color: avgPlayAccuracy >= 70 ? "#16a34a" : avgPlayAccuracy >= 40 ? "#eab308" : "#6b7280" }}>
              {totalGamesPlayed > 0 ? `${avgPlayAccuracy}%` : "--"}
            </p>
          </div>
          <div style={s.stat}>
            <p style={s.statLabel}>Avg Reaction (Second Before)</p>
            <p style={{ ...s.statValue, color: avgReactionTime <= 300 ? "#16a34a" : avgReactionTime <= 600 ? "#eab308" : "#ef4444" }}>
              {totalAttempts > 0 ? `${avgReactionTime}ms` : "--"}
            </p>
          </div>
          <div style={s.stat}>
            <p style={s.statLabel}>Best Accuracy</p>
            <p style={{ ...s.statValue, color: "#2563eb" }}>
              {totalAttempts > 0 ? `${bestAccuracy}ms` : "--"}
            </p>
          </div>
        </div>

        {improvement !== null && (
          <div style={{ background: improvement > 0 ? "#f0fdf4" : "#fef2f2", borderRadius: "10px", padding: "14px 18px", display: "flex", alignItems: "center", gap: "10px" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={improvement > 0 ? "#16a34a" : "#ef4444"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {improvement > 0 ? <><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></> : <><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/><polyline points="17 18 23 18 23 12"/></>}
            </svg>
            <p style={{ fontSize: "14px", color: improvement > 0 ? "#16a34a" : "#ef4444", fontWeight: "500" }}>
              {improvement > 0 ? `Improving! Your recent attempts are ${improvement}ms more accurate on average.` : `Your accuracy dipped by ${Math.abs(improvement)}ms recently. Keep practicing!`}
            </p>
          </div>
        )}
      </motion.div>

      {/* Play & Learn Breakdown */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} style={s.card}>
        <h3 style={s.sectionTitle}>Play & Learn Breakdown</h3>
        {totalGamesPlayed === 0 ? (
          <div style={s.empty}>
            <p style={{ fontSize: "14px", marginBottom: "4px" }}>No games played yet</p>
            <p style={{ fontSize: "13px" }}>Complete some games to see your stats here.</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "14px" }}>
            {[
              { name: "Spot the Hazard", count: hazardGames.length, color: "#ef4444" },
              { name: "Road Sign Match", count: signGames.length, color: "#2563eb" },
              { name: "Mirror Check", count: mirrorGames.length, color: "#16a34a" },
            ].map((g) => (
              <div key={g.name} style={{ ...s.stat, borderLeft: `3px solid ${g.color}` }}>
                <p style={{ fontSize: "13px", fontWeight: "600", color: "#111827", marginBottom: "4px" }}>{g.name}</p>
                <p style={{ fontSize: "22px", fontWeight: "700", color: g.color }}>{g.count}</p>
                <p style={{ fontSize: "11px", color: "#6b7280" }}>sessions</p>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Second Before Accuracy Chart */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} style={s.card}>
        <h3 style={s.sectionTitle}>Second Before - Recent Attempts</h3>
        {recentAttempts.length === 0 ? (
          <div style={s.empty}>
            <p style={{ fontSize: "14px", marginBottom: "4px" }}>No attempts yet</p>
            <p style={{ fontSize: "13px" }}>Play Second Before to see your accuracy chart here.</p>
          </div>
        ) : (
          <div>
            <div style={{ display: "flex", alignItems: "flex-end", gap: "6px", height: "160px", marginBottom: "12px", padding: "0 4px" }}>
              {recentAttempts.map((attempt, i) => {
                const height = Math.max(((maxAcc - attempt.accuracy) / maxAcc) * 140, 8);
                const color = attempt.accuracy <= 200 ? "#16a34a" : attempt.accuracy <= 500 ? "#eab308" : "#ef4444";
                return (
                  <motion.div
                    key={i}
                    initial={{ height: 0 }}
                    animate={{ height: `${height}px` }}
                    transition={{ delay: i * 0.05, duration: 0.4 }}
                    style={{
                      flex: 1,
                      background: color,
                      borderRadius: "4px 4px 0 0",
                      minWidth: "20px",
                      position: "relative"
                    }}
                    title={`${attempt.accuracy}ms off target`}
                  />
                );
              })}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "#9ca3af" }}>
              <span>Oldest</span>
              <span>Most Recent</span>
            </div>
            <p style={{ fontSize: "12px", color: "#6b7280", marginTop: "8px", textAlign: "center" }}>
              Taller bars = better accuracy (lower ms off target)
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
