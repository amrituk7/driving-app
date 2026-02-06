import React, { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import { getUserSubscription } from "../firebase";

const SubscriptionContext = createContext();

export function SubscriptionProvider({ children }) {
  const auth = useAuth() || {};
  const { user } = auth;
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) {
      setSubscription(null);
      setLoading(false);
      return;
    }

    (async () => {
      try {
        const sub = await getUserSubscription(user.uid);
        setSubscription(sub);
      } catch (error) {
        console.error("Error fetching subscription:", error);
        setSubscription(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  const isSubscribed = (tier) => {
    return subscription?.tier === tier && subscription?.status === "active";
  };

  const role = auth?.userProfile?.role;
  const profileSub = auth?.userProfile?.subscription;
  const isAdminOrInstructor = role === "admin" || role === "instructor";
  const hasRoadMasterPlus = isAdminOrInstructor || isSubscribed("student") || profileSub === "premium";
  const hasRoadMasterPro = isAdminOrInstructor || isSubscribed("instructor");

  console.log("[v0] SubscriptionContext:", { role, profileSub, isAdminOrInstructor, hasRoadMasterPlus, subTier: subscription?.tier, subStatus: subscription?.status, loading });

  const value = {
    subscription,
    loading,
    isSubscribed,
    hasRoadMasterPlus,
    hasRoadMasterPro,
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (!context) {
    console.warn("useSubscription used outside SubscriptionProvider");
    return {
      subscription: null,
      loading: false,
      isSubscribed: () => false,
      hasRoadMasterPlus: false,
      hasRoadMasterPro: false,
    };
  }
  return context;
}
