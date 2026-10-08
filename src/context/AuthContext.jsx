import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
} from "react";
import { getFirebaseAuth } from "../firebase/config";
import {
  validateAdminCredentials,
  verifyAdminOTPAsync,
  ADMIN_CREDENTIALS,
} from "../services/otpService";

/* Accounts allowed into the admin panel.
   firestore.rules also enforces kishorkanthasylwest@gmail.com. */
export const ADMIN_EMAILS = [ADMIN_CREDENTIALS.email];

const ADMIN_STORAGE_KEY = "_kk_admin_auth_user";

const isAdminEmail = (email) =>
  typeof email === "string" &&
  ADMIN_EMAILS.includes(email.trim().toLowerCase());

const describeAuthError = (err) => {
  switch (err?.code) {
    case "auth/popup-closed-by-user":
    case "auth/cancelled-popup-request":
      return "";
    case "auth/network-request-failed":
      return "ইন্টারনেট সংযোগ পাওয়া যাচ্ছে না। সংযোগ যাচাই করে আবার চেষ্টা করুন।";
    case "auth/unauthorized-domain":
      return "এই ডোমেইনটি Firebase Authentication-এ অনুমোদিত নয়।";
    case "auth/operation-not-allowed":
      return "সাইনিং মেথড চালু করা নেই।";
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return "ইমেইল বা পাসওয়ার্ড সঠিক নয়।";
    default:
      return err?.message || "লগইন করতে সমস্যা হয়েছে।";
  }
};

const notAllowedMessage = (email) =>
  `${email} — এই অ্যাকাউন্টটি অ্যাডমিন হিসেবে অনুমোদিত নয়।`;

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(() => {
    // Attempt to restore active admin session for this browser session only
    if (typeof window !== "undefined") {
      try {
        // Clean up any legacy localStorage key to ensure browser-close logout works reliably
        localStorage.removeItem(ADMIN_STORAGE_KEY);

        const saved = sessionStorage.getItem(ADMIN_STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed?.email && isAdminEmail(parsed.email)) {
            return parsed;
          }
        }
      } catch {
        // ignore parse error
      }
    }
    return null;
  });

  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState("");
  const startedRef = useRef(false);

  const ensureAuth = useCallback(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    (async () => {
      try {
        // Check active session in sessionStorage
        const saved = sessionStorage.getItem(ADMIN_STORAGE_KEY);
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            if (parsed?.email && isAdminEmail(parsed.email)) {
              setCurrentUser(parsed);
              setLoading(false);
            }
          } catch {
            // ignore
          }
        }

        const auth = await getFirebaseAuth();
        const {
          onAuthStateChanged,
          getRedirectResult,
          signOut,
          setPersistence,
          browserSessionPersistence,
        } = await import("firebase/auth");

        // Enforce browserSessionPersistence so Firebase Auth clears on browser close as well
        try {
          await setPersistence(auth, browserSessionPersistence);
        } catch {
          // ignore if persistence fails
        }

        try {
          await getRedirectResult(auth);
        } catch (err) {
          setAuthError(describeAuthError(err));
        }

        onAuthStateChanged(auth, async (user) => {
          if (user) {
            if (!isAdminEmail(user.email)) {
              await signOut(auth).catch(() => {});
              sessionStorage.removeItem(ADMIN_STORAGE_KEY);
              setCurrentUser(null);
              setAuthError(notAllowedMessage(user.email));
            } else {
              const adminUser = {
                uid: user.uid,
                email: user.email,
                displayName: user.displayName || "Admin",
                photoURL: user.photoURL || null,
                emailVerified: true,
              };
              sessionStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(adminUser));
              setCurrentUser(adminUser);
            }
          } else {
            // Check if we still have local session in sessionStorage
            const sessionSaved = sessionStorage.getItem(ADMIN_STORAGE_KEY);
            if (!sessionSaved) {
              setCurrentUser(null);
            }
          }
          setLoading(false);
        });
      } catch (err) {
        console.warn("Firebase Auth unavailable:", err);
        const sessionSaved = sessionStorage.getItem(ADMIN_STORAGE_KEY);
        if (!sessionSaved) {
          setCurrentUser(null);
          setAuthError(describeAuthError(err));
        }
        setLoading(false);
      }
    })();
  }, []);

  /**
   * Admin Login with Custom Email, Password, and 6-digit OTP
   * Supports concurrent multi-device logins and per-session isolation
   */
  const loginWithCredentials = useCallback(
    async (email, password, otp) => {
      setAuthError("");

      // 1. Verify email & password
      if (!validateAdminCredentials(email, password)) {
        throw new Error("ভুল ইমেইল বা পাসওয়ার্ড প্রদান করা হয়েছে।");
      }

      // 2. Verify OTP code (supports both local session and cross-device Firestore sync)
      const otpCheck = await verifyAdminOTPAsync(otp);
      if (!otpCheck.valid) {
        throw new Error(otpCheck.error || "ভুল ওটিপি কোড!");
      }

      // 3. Create Admin Session Object
      const adminUser = {
        uid: "admin_kishorkanthasylwest",
        email: ADMIN_CREDENTIALS.email,
        displayName: "অ্যাডমিনিস্ট্রেটর",
        role: "super_admin",
        emailVerified: true,
        authenticatedAt: Date.now(),
      };

      // Try Firebase Auth email sign in with session persistence if available
      try {
        const auth = await getFirebaseAuth();
        const {
          signInWithEmailAndPassword,
          createUserWithEmailAndPassword,
          setPersistence,
          browserSessionPersistence,
        } = await import("firebase/auth");

        try {
          await setPersistence(auth, browserSessionPersistence);
        } catch {}

        try {
          const res = await signInWithEmailAndPassword(auth, email.trim(), password.trim());
          if (res?.user) {
            adminUser.uid = res.user.uid;
          }
        } catch (firebaseErr) {
          // If user not found in Firebase Auth, attempt creating it with the credentials
          if (firebaseErr?.code === "auth/user-not-found" || firebaseErr?.code === "auth/invalid-credential") {
            try {
              const res = await createUserWithEmailAndPassword(auth, email.trim(), password.trim());
              if (res?.user) {
                adminUser.uid = res.user.uid;
              }
            } catch {
              // Ignore creation error and proceed with verified admin session
            }
          }
        }
      } catch (e) {
        console.info("Firebase Auth background link note:", e?.message);
      }

      // 4. Persist admin session in sessionStorage (auto-logout on browser close)
      sessionStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(adminUser));
      localStorage.removeItem(ADMIN_STORAGE_KEY);
      setCurrentUser(adminUser);
      return adminUser;
    },
    []
  );

  /**
   * Secondary Google Sign In fallback
   */
  const loginWithGoogle = useCallback(async () => {
    setAuthError("");
    ensureAuth();

    const auth = await getFirebaseAuth();
    const {
      GoogleAuthProvider,
      signInWithPopup,
      signInWithRedirect,
      signOut,
      setPersistence,
      browserSessionPersistence,
    } = await import("firebase/auth");

    try {
      await setPersistence(auth, browserSessionPersistence);
    } catch {}

    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });

    let result;
    try {
      result = await signInWithPopup(auth, provider);
    } catch (err) {
      if (err.code === "auth/popup-blocked" || err.code === "auth/operation-not-supported-in-environment") {
        await signInWithRedirect(auth, provider);
        return null;
      }
      throw err;
    }

    if (!isAdminEmail(result.user.email)) {
      await signOut(auth).catch(() => {});
      sessionStorage.removeItem(ADMIN_STORAGE_KEY);
      throw new Error(notAllowedMessage(result.user.email));
    }

    const adminUser = {
      uid: result.user.uid,
      email: result.user.email,
      displayName: result.user.displayName || "অ্যাডমিনিস্ট্রেটর",
      photoURL: result.user.photoURL || null,
      emailVerified: true,
      authenticatedAt: Date.now(),
    };

    sessionStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(adminUser));
    localStorage.removeItem(ADMIN_STORAGE_KEY);
    setCurrentUser(adminUser);
    return adminUser;
  }, [ensureAuth]);

  /**
   * Complete Logout
   */
  const logout = useCallback(async () => {
    try {
      const auth = await getFirebaseAuth();
      const { signOut } = await import("firebase/auth");
      await signOut(auth).catch(() => {});
    } catch {
      // ignore
    }
    localStorage.removeItem(ADMIN_STORAGE_KEY);
    sessionStorage.removeItem(ADMIN_STORAGE_KEY);
    sessionStorage.removeItem("_kk_admin_otp_session");
    setCurrentUser(null);
    setAuthError("");
  }, []);

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        loading,
        authError,
        setAuthError,
        loginWithCredentials,
        loginWithGoogle,
        logout,
        ensureAuth,
        adminEmails: ADMIN_EMAILS,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
