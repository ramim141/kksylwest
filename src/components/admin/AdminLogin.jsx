import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  HiShieldCheck,
  HiExclamationCircle,
  HiArrowLeft,
  HiLockClosed,
} from "react-icons/hi2";
import { Button } from "./ui";

/* Google's four-colour SVG mark */
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

  useEffect(() => {
    ensureAuth();
  }, [ensureAuth]);

  useEffect(() => {
    if (currentUser) navigate(from, { replace: true });
  }, [currentUser, from, navigate]);

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
      await loginWithGoogle();
    } catch (err) {
      console.error(err);
      setError(err.message || "লগইন করতে সমস্যা হয়েছে।");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface px-4 py-12 relative overflow-hidden selection:bg-primary/25 selection:text-ink-strong">
      {/* Dynamic ambient gradient background lighting */}
      <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-primary/[0.06] rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-[600px] h-[600px] bg-tertiary/[0.05] rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/[0.02] rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-[440px] relative z-10 animate-fade-in-up">
        <div className="bg-surface-card/90 backdrop-blur-2xl border border-line-soft/80 rounded-2xl p-7 sm:p-10 shadow-2xl shadow-black/50 relative overflow-hidden">
          {/* Subtle top luminous line */}
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-80" />

          {/* Identity Header */}
          <div className="flex flex-col items-center text-center mb-8">
            <div className="relative mb-5">
              <span className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary via-primary-container to-emerald-700 text-primary-on flex items-center justify-center text-3xl shadow-lg shadow-primary/25">
                <HiShieldCheck />
              </span>
              <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-surface-card border-2 border-primary/40 flex items-center justify-center text-[10px] text-primary">
                <HiLockClosed />
              </span>
            </div>

            <h1 className="text-2xl font-bold text-ink-strong tracking-tight">অ্যাডমিন প্রবেশদ্বার</h1>
            <p className="text-[13.5px] text-ink-muted mt-1.5 leading-relaxed font-normal">
              কিশোরকণ্ঠ মেধাবৃত্তি পরীক্ষা কন্ট্রোল প্যানেল
            </p>
          </div>

          {/* Error Message */}
          <div aria-live="polite">
            {error && (
              <div className="mb-6 flex items-start gap-3 rounded-xl border border-error/40 bg-error/12 px-4 py-3.5 animate-fade-in-down shadow-sm">
                <HiExclamationCircle className="text-xl text-error shrink-0 mt-px" />
                <p className="text-[13px] text-ink-body leading-relaxed">{error}</p>
              </div>
            )}
          </div>

          {/* Login Action Button */}
          <Button
            type="button"
            tone="neutral"
            size="lg"
            block
            loading={loading}
            onClick={handleGoogleLogin}
            className="border-line-strong/50 hover:border-primary/50 shadow-md transition-all duration-200"
          >
            <span className="inline-flex items-center justify-center gap-3">
              {!loading && <GoogleMark className="w-5 h-5" />}
              <span className="font-bold tracking-wide">
                {loading ? "Google-এ নিয়ে যাওয়া হচ্ছে..." : "Google দিয়ে লগইন করুন"}
              </span>
            </span>
          </Button>

          {/* Authorized Admin Notice */}
          <div className="mt-7 pt-6 border-t border-line-soft/80 text-center">
            <p className="text-[12px] text-ink-muted leading-relaxed mb-2 font-medium">
              শুধুমাত্র অনুমোদিত অ্যাডমিন অ্যাকাউন্ট দিয়ে প্রবেশ করা যাবে
            </p>
            <div className="inline-block max-w-full">
              <span className="inline-block font-mono text-[11px] text-primary/90 bg-primary/10 border border-primary/25 rounded-full px-3 py-1 break-all">
                {adminEmails.join(", ")}
              </span>
            </div>
          </div>
        </div>

        {/* Back Link */}
        <div className="mt-6 text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-[13.5px] font-semibold text-ink-muted hover:text-primary transition-all duration-200 hover:-translate-x-0.5"
          >
            <HiArrowLeft className="text-base" />
            মূল ওয়েবসাইটে ফিরে যান
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
