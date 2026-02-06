import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useSubscription } from "../context/SubscriptionContext";
import Paywall from "./Paywall";

export default function PremiumGuard({ children, feature = "Premium Feature" }) {
  const navigate = useNavigate();
  const auth = useAuth() || {};
  const { user, userProfile, loading: authLoading } = auth;
  const sub = useSubscription() || {};
  const { hasRoadMasterPlus, loading: subLoading } = sub;

  // Wait for both auth and subscription to finish loading
  if (authLoading || subLoading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "400px" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{
            width: "40px", height: "40px", border: "3px solid #e5e7eb",
            borderTopColor: "#3b82f6", borderRadius: "50%",
            animation: "spin 0.8s linear infinite", margin: "0 auto 16px"
          }} />
          <p style={{ color: "#6b7280", fontSize: "14px" }}>Loading...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  // Not logged in -- send to login
  if (!user) {
    return (
      <Paywall
        feature={feature}
        tier="student"
        onSubscribe={() => navigate("/login")}
      />
    );
  }

  const role = userProfile?.role;
  const isAdminOrInstructor = role === "admin" || role === "instructor";

  console.log("[v0] PremiumGuard check:", {
    feature, role,
    subscription: userProfile?.subscription,
    isAdminOrInstructor, hasRoadMasterPlus,
    uid: user?.uid
  });

  if (isAdminOrInstructor || hasRoadMasterPlus) {
    return children;
  }

  return (
    <Paywall
      feature={feature}
      tier="student"
      onSubscribe={() => navigate("/subscribe")}
    />
  );
}
