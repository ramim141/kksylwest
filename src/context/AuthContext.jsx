import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

const LOCAL_STORAGE_KEY = "kkmb_admin_session";

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Read ENV configured credentials
  const envAdminEmail = (
    import.meta.env.VITE_ADMIN_EMAIL || "admin@kishorkantho.org"
  ).trim().toLowerCase();
  const envAdminPassword = (
    import.meta.env.VITE_ADMIN_PASSWORD || "admin123456"
  ).trim();

  useEffect(() => {
    // Check local storage admin session
    try {
      const savedSession = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (savedSession) {
        const parsed = JSON.parse(savedSession);
        if (parsed && parsed.email) {
          setCurrentUser(parsed);
        }
      }
    } catch (e) {
      console.warn("Failed to read admin session:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const cleanEmail = (email || "").trim().toLowerCase();
    const cleanPass = (password || "").trim();

    // Check ENV credentials match
    if (cleanEmail === envAdminEmail && cleanPass === envAdminPassword) {
      const adminUser = {
        uid: "env-super-admin",
        email: cleanEmail,
        displayName: "Super Admin",
        role: "admin",
        loginAt: new Date().toISOString(),
      };
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(adminUser));
      setCurrentUser(adminUser);
      return adminUser;
    }

    // If credentials do not match
    throw new Error(
      "ভুল ইমেইল বা পাসওয়ার্ড! দয়া করে আপনার সঠিক অ্যাডমিন ইমেইল ও পাসওয়ার্ড প্রদান করুন।"
    );
  };

  const logout = async () => {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    setCurrentUser(null);
  };

  const value = {
    currentUser,
    login,
    logout,
    loading,
    isConfigured: true,
    envAdminEmail,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
