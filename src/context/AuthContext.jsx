import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
} from "react";
import { getFirebaseAuth } from "../firebase/config";

/* Accounts allowed into the admin panel.

   This list is a courtesy check, not the security boundary. The bundle is
   public, so anyone can read it and anyone can patch their own copy to walk
   past it. What actually protects the data is the identical allowlist in
   firestore.rules, which Firestore enforces on the server for every read and
   write. Change one and you must change the other. */
export const ADMIN_EMAILS = ["kishorkanthasylwest@gmail.com"];

const isAdminEmail = (email) =>
  typeof email === "string" && ADMIN_EMAILS.includes(email.trim().toLowerCase());

const describeAuthError = (err) => {
  switch (err?.code) {
    case "auth/popup-closed-by-user":
    case "auth/cancelled-popup-request":
      return "";
    case "auth/network-request-failed":
      return "ইন্টারনেট সংযোগ পাওয়া যাচ্ছে না। সংযোগ যাচাই করে আবার চেষ্টা করুন।";
    case "auth/unauthorized-domain":
      return "এই ডোমেইনটি Firebase Authentication-এ অনুমোদিত নয়। Firebase Console → Authentication → Settings → Authorized domains-এ ডোমেইনটি যোগ করুন।";
    case "auth/operation-not-allowed":
      return "Google সাইন-ইন এখনো চালু করা হয়নি। Firebase Console → Authentication → Sign-in method থেকে Google চালু করুন।";
    default:
      return err?.message || "লগইন করতে সমস্যা হয়েছে।";
  }
};

const notAllowedMessage = (email) =>
  `${email} — এই অ্যাকাউন্টটি অ্যাডমিন হিসেবে অনুমোদিত নয়।`;

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState("");
  const startedRef = useRef(false);

  /* Firebase Auth is ~40KB and every visitor to a public page would pay for
     it if this ran on mount — AuthProvider wraps the whole app. Instead the
     admin screens ask for it, so the SDK is only fetched by someone actually
     heading for /admin. `loading` stays true until then, which is correct:
     nothing outside the admin area reads it. */
  const ensureAuth = useCallback(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    (async () => {
      try {
        const auth = await getFirebaseAuth();
        const { onAuthStateChanged, getRedirectResult, signOut } = await import(
          "firebase/auth"
        );

        /* Completes a sign-in that had to fall back to redirect. Resolves to
           null on an ordinary page load, so it is safe to always await. */
        try {
          await getRedirectResult(auth);
        } catch (err) {
          setAuthError(describeAuthError(err));
        }

        onAuthStateChanged(auth, async (user) => {
          if (user && !isAdminEmail(user.email)) {
            /* Signed in to Google, but not on the list. End the session
               rather than leave a half-authenticated client sitting there —
               Firestore would reject its every request anyway. */
            await signOut(auth).catch(() => {});
            setCurrentUser(null);
            setAuthError(notAllowedMessage(user.email));
          } else {
            setCurrentUser(user);
          }
          setLoading(false);
        });
      } catch (err) {
        console.warn("Firebase Auth unavailable:", err);
        setCurrentUser(null);
        setAuthError(describeAuthError(err));
        setLoading(false);
      }
    })();
  }, []);

  /* Redirect rather than a popup.

     signInWithPopup hung after the account was chosen. The popup reports its
     result by calling postMessage on window.opener, and Google's sign-in page
     sends its own Cross-Origin-Opener-Policy, which puts the popup in a
     separate browsing context group and severs that handle. Nothing we send
     from our own origin can undo it — the severance comes from their page —
     so the promise simply never settled and the button spun forever.

     A redirect has no second window, so there is no opener to lose. It also
     behaves on mobile and inside in-app browsers, where popups were already
     unreliable. The cost is one full page load, which for a login used a few
     times a day is not a cost worth optimising. */
  const loginWithGoogle = useCallback(async () => {
    setAuthError("");
    ensureAuth();

    const auth = await getFirebaseAuth();
    const { GoogleAuthProvider, signInWithRedirect } = await import(
      "firebase/auth"
    );

    const provider = new GoogleAuthProvider();
    /* Without this Google silently reuses whichever account the browser
       signed in with last, which on a shared machine is the wrong one often
       enough to be worth the extra tap. */
    provider.setCustomParameters({ prompt: "select_account" });

    /* Navigates away. The account check happens in onAuthStateChanged when
       the browser comes back, which is the only place that can see the
       result of a redirect. */
    await signInWithRedirect(auth, provider);
    return null;
  }, [ensureAuth]);

  const logout = useCallback(async () => {
    const auth = await getFirebaseAuth();
    const { signOut } = await import("firebase/auth");
    await signOut(auth);
    setCurrentUser(null);
    setAuthError("");
  }, []);

  /* Renders children immediately. Gating them on `loading` would hold the
     entire public site behind an auth round-trip; ProtectedRoute already
     shows its own spinner for the screens that actually need the answer. */
  return (
    <AuthContext.Provider
      value={{
        currentUser,
        loading,
        authError,
        setAuthError,
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
