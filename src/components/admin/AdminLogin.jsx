import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  HiShieldCheck,
  HiExclamationCircle,
  HiArrowLeft,
} from "react-icons/hi2";
import { Button } from "./ui";

/* Google's mark has to be the four-colour original — their branding terms do
   not allow recolouring it, so it stays inline rather than joining the icon
   set, which is monochrome and theme-tinted. */
const GoogleMark = ({ className = "" }) => (
  <svg className={className} viewBox="0 0 48 48" aria-hidden="true">
    <path
      fill="#4285F4"
      d="M45.12 24.5c0-1.56-.14-3.06-.4-4.5H24v8.51h11.84c-.51 2.75-2.06 5.08-4.39 6.64v5.52h7.11c4.16-3.83 6.56-9.47 6.56-16.17z"
    />
    <path
      fill="#34A853"
      d="M24 46c5.94 0 10.92-1.97 14.56-5.33l-7.11-5.52c-1.97 1.32-4.49 2.1-7.45 2.1-5.73 0-10.58-3.87-12.31-9.07H4.34v5.7C7.96 41.07 15.4 46 24 46z"
    />
    <path
      fill="#FBBC05"
      d="M11.69 28.18C11.25 26.86 11 25.45 11 24s.25-2.86.69-4.18v-5.7H4.34C2.85 17.09 2 20.45 2 24c0 3.55.85 6.91 2.34 9.88l7.35-5.7z"
    />
    <path
      fill="#EA4335"
      d="M24 10.75c3.23 0 6.13 1.11 8.41 3.29l6.31-6.31C34.91 4.18 29.93 2 24 2 15.4 2 7.96 6.93 4.34 14.12l7.35 5.7c1.73-5.2 6.58-9.07 12.31-9.07z"
    />
  </svg>
);

const AdminLogin = () => {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { loginWithGoogle, currentUser, authError, ensureAuth, adminEmails } =
    useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || "/admin";

  /* Warms up Firebase Auth while the visitor is still looking at the page,
     so the first click does not also wait on a 40KB download. It also picks
     up a session that is already valid, which is what redirects back below. */
  useEffect(() => {
    ensureAuth();
  }, [ensureAuth]);

  /* Covers both routes into a signed-in state: the popup resolving, and a
     redirect sign-in completing after the page reloaded. */
  useEffect(() => {
    if (currentUser) navigate(from, { replace: true });
  }, [currentUser, from, navigate]);

  /* A rejected account is reported by the provider, not by the click below —
     the redirect flow has no click left to report to. */
  useEffect(() => {
    if (authError) {
      setError(authError);
      setLoading(false);
    }
  }, [authError]);

  const handleGoogleLogin = async () => {
    try {
      setError("");
      setLoading(true);
      const user = await loginWithGoogle();
      if (user) {
        navigate(from, { replace: true });
        return;
      }
      /* null means no popup could be opened and the redirect fallback took
         over: the page is being replaced, so `loading` stays on rather than
         flashing the idle button on the way out. */
    } catch (err) {
      console.error(err);
      setError(err.message || "লগইন করতে সমস্যা হয়েছে।");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface px-4 py-12">
      <div className="w-full max-w-[420px]">
        <div className="bg-surface-card border border-line-soft rounded-lg p-7 sm:p-9">
          {/* Identity */}
          <div className="flex flex-col items-center text-center mb-8">
            <span className="w-14 h-14 rounded-lg bg-primary-container text-primary-on flex items-center justify-center text-3xl mb-4">
              <HiShieldCheck />
            </span>
            <h1 className="text-xl font-semibold text-ink-strong">অ্যাডমিন লগইন</h1>
            <p className="text-[13px] text-ink-muted mt-1.5 leading-relaxed">
              কিশোরকণ্ঠ মেধাবৃত্তি কন্ট্রোল প্যানেল
            </p>
          </div>

          {/* aria-live so a screen reader announces the failure without a re-focus */}
          <div aria-live="polite">
            {error && (
              <div className="mb-6 flex items-start gap-3 rounded border border-error/40 bg-error/12 px-4 py-3.5 animate-fade-in-down">
                <HiExclamationCircle className="text-xl text-error shrink-0 mt-px" />
                <p className="text-[13px] text-ink-body leading-relaxed">{error}</p>
              </div>
            )}
          </div>

          <Button
            type="button"
            tone="neutral"
            size="lg"
            block
            loading={loading}
            onClick={handleGoogleLogin}
          >
            <span className="inline-flex items-center justify-center gap-2.5">
              {!loading && <GoogleMark className="w-5 h-5" />}
              {loading ? "যাচাই করা হচ্ছে..." : "Google দিয়ে লগইন করুন"}
            </span>
          </Button>

          <p className="mt-6 text-[12px] text-ink-muted text-center leading-relaxed">
            শুধুমাত্র অনুমোদিত অ্যাডমিন অ্যাকাউন্ট দিয়ে প্রবেশ করা যাবে
            <br />
            <span className="font-mono text-[11px] break-all">
              {adminEmails.join(", ")}
            </span>
          </p>
        </div>

        <div className="mt-5 text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-[13px] text-ink-muted hover:text-primary transition-colors"
          >
            <HiArrowLeft className="text-sm" />
            মূল ওয়েবসাইটে ফিরে যান
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
