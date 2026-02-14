import React, { createContext, useContext, useState, useEffect } from "react";
import { onAuthChange, getUserProfile, logoutUser } from "../firebase";

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("[v0] AuthProvider useEffect running");
    let unsubscribe = () => {};
    let settled = false;
    
    const settle = () => {
      if (!settled) {
        settled = true;
        setLoading(false);
        console.log("[v0] Auth loading set to false");
      }
    };
    
    try {
      unsubscribe = onAuthChange(async (firebaseUser) => {
        console.log("[v0] onAuthChange callback, user:", firebaseUser?.email || null);
        setUser(firebaseUser);
        
        if (firebaseUser) {
          try {
            const profile = await getUserProfile(firebaseUser.uid);
            setUserProfile(profile);
          } catch (error) {
            console.error("Error fetching user profile:", error);
            setUserProfile(null);
          }
        } else {
          setUserProfile(null);
        }
        
        settle();
      });
    } catch (error) {
      console.error("Error setting up auth listener:", error);
      settle();
    }

    // Safety timeout - if auth never responds in 3 seconds, stop loading
    const timeout = setTimeout(() => {
      console.log("[v0] Auth timeout reached, forcing settle");
      settle();
    }, 3000);

    return () => {
      unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  const logout = async () => {
    try {
      await logoutUser();
      setUser(null);
      setUserProfile(null);
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const isInstructor = userProfile?.role === "instructor";
  const isStudent = userProfile?.role === "student";

  const value = {
    user,
    userProfile,
    loading,
    logout,
    isInstructor,
    isStudent,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
