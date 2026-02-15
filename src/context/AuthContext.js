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
    let unsubscribe = () => {};
    let settled = false;

    const settle = () => {
      if (!settled) {
        settled = true;
        setLoading(false);
      }
    };

    try {
      unsubscribe = onAuthChange(async (firebaseUser) => {
        setUser(firebaseUser);
        if (firebaseUser) {
          try {
            const profile = await getUserProfile(firebaseUser.uid);
            setUserProfile(profile);
          } catch {
            setUserProfile(null);
          }
        } else {
          setUserProfile(null);
        }
        settle();
      });
    } catch {
      settle();
    }

    const timeout = setTimeout(settle, 3000);
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
    } catch {
      // silent
    }
  };

  const isInstructor = userProfile?.role === "instructor";
  const isStudent = userProfile?.role === "student";

  return (
    <AuthContext.Provider
      value={{ user, userProfile, loading, logout, isInstructor, isStudent, isAuthenticated: !!user }}
    >
      {children}
    </AuthContext.Provider>
  );
}
