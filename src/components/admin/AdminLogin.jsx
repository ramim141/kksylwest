import React, { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  HiLockClosed,
  HiEnvelope,
  HiShieldCheck,
  HiExclamationCircle,
  HiEye,
  HiEyeSlash,
  HiArrowLeft,
} from "react-icons/hi2";
import { Button, Field } from "./ui";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || "/admin";

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError("দয়া করে ইমেইল ও পাসওয়ার্ড দুটোই পূরণ করুন।");
      return;
    }

    try {
      setError("");
      setLoading(true);
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      console.error(err);
      if (
        err.code === "auth/invalid-credential" ||
        err.code === "auth/wrong-password" ||
        err.code === "auth/user-not-found"
      ) {
        setError("ইমেইল বা পাসওয়ার্ড মেলেনি। আবার চেষ্টা করুন।");
      } else if (err.code === "auth/too-many-requests") {
        setError("অনেকবার ভুল চেষ্টা হয়েছে। কিছুক্ষণ পর আবার চেষ্টা করুন।");
      } else if (err.code === "auth/network-request-failed") {
        setError("ইন্টারনেট সংযোগ পাওয়া যাচ্ছে না। সংযোগ যাচাই করে আবার চেষ্টা করুন।");
      } else {
        setError(err.message || "লগইন করতে সমস্যা হয়েছে।");
      }
    } finally {
      setLoading(false);
    }
  };

  const controlCls = `w-full bg-surface border border-line-soft rounded min-h-[48px]
    text-ink-strong text-sm placeholder:text-ink-muted/70
    focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/25
    transition-colors duration-150`;

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

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <Field label="অ্যাডমিন ইমেইল" htmlFor="admin-email" required>
              <div className="relative">
                <HiEnvelope
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-lg text-ink-muted pointer-events-none"
                  aria-hidden="true"
                />
                <input
                  id="admin-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@kishorkantho.org"
                  autoComplete="username"
                  autoFocus
                  required
                  className={`${controlCls} pl-11 pr-3.5`}
                />
              </div>
            </Field>

            <Field label="পাসওয়ার্ড" htmlFor="admin-password" required>
              <div className="relative">
                <HiLockClosed
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-lg text-ink-muted pointer-events-none"
                  aria-hidden="true"
                />
                <input
                  id="admin-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                  className={`${controlCls} pl-11 pr-12`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "পাসওয়ার্ড লুকান" : "পাসওয়ার্ড দেখুন"}
                  className="absolute right-1 top-1/2 -translate-y-1/2 w-10 h-10 rounded flex items-center justify-center
                    text-ink-muted hover:text-ink-strong hover:bg-surface-overlay transition-colors cursor-pointer"
                >
                  {showPassword ? <HiEyeSlash className="text-lg" /> : <HiEye className="text-lg" />}
                </button>
              </div>
            </Field>

            <Button type="submit" tone="primary" size="lg" block loading={loading}>
              {loading ? "যাচাই করা হচ্ছে..." : "লগইন করুন"}
            </Button>
          </form>
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
