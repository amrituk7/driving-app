import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useSubscription } from "../context/SubscriptionContext";
import Paywall from "./Paywall";

export default function PremiumGuard({ children, feature = "Premium Feature" }) {
  const navigate = useNavigate();
  const auth = useAuth() || {};
  const { userProfile } = auth;
  const { hasRoadMasterPlus } = useSubscription();

  const role = userProfile?.role;
  const isAdminOrInstructor = role === "admin" || role === "instructor";

  console.log("[v0] PremiumGuard check:", { feature, role, subscription: userProfile?.subscription, isAdminOrInstructor, hasRoadMasterPlus, uid: auth?.user?.uid });

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
