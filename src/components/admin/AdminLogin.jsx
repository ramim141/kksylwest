import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  HiShieldCheck,
  HiExclamationCircle,
  HiCheckCircle,
  HiArrowLeft,
  HiLockClosed,
  HiEnvelope,
  HiEye,
  HiEyeSlash,
  HiKey,
  HiArrowPath,
  HiArrowRight,
  HiSparkles,
} from "react-icons/hi2";
import { Button } from "./ui";
import {
  validateAdminCredentials,
  generateOTP,
  sendOTPEmail,
  normalizeToEnglishDigits,
  ADMIN_CREDENTIALS,
} from "../../services/otpService";

/* Google's four-colour SVG mark for fallback */
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

const toBengaliNumber = (num) => {
  const bnDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
  return String(num).replace(/[0-9]/g, (w) => bnDigits[+w]);
};

const AdminLogin = () => {
  // Authentication flow steps: "CREDENTIALS" | "OTP"
  const [step, setStep] = useState("CREDENTIALS");

  // Step 1 Form Data
  const [email, setEmail] = useState(ADMIN_CREDENTIALS.email);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Step 2 OTP Data (6 boxes)
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const otpInputRefs = useRef([]);

  // Timers & Feedback State
  const [error, setError] = useState("");
  const [infoMsg, setInfoMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendSeconds, setResendSeconds] = useState(0);
  const [expirySeconds, setExpirySeconds] = useState(300); // 5 mins

  const {
    loginWithCredentials,
    loginWithGoogle,
    currentUser,
    authError,
    ensureAuth,
    adminEmails,
  } = useAuth();

  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/admin";

  useEffect(() => {
    ensureAuth();
  }, [ensureAuth]);

  useEffect(() => {
    if (currentUser) {
      navigate(from, { replace: true });
    }
  }, [currentUser, from, navigate]);

  useEffect(() => {
    if (authError) {
      setError(authError);
      setLoading(false);
    }
  }, [authError]);

  // Countdown timers for OTP expiration & resend cooldown
  useEffect(() => {
    let timer;
    if (step === "OTP" && expirySeconds > 0) {
      timer = setInterval(() => {
        setExpirySeconds((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [step, expirySeconds]);

  useEffect(() => {
    let timer;
    if (resendSeconds > 0) {
      timer = setInterval(() => {
        setResendSeconds((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendSeconds]);

  // Auto-focus first input on step change
  useEffect(() => {
    if (step === "OTP") {
      setTimeout(() => {
        otpInputRefs.current[0]?.focus();
      }, 150);
    }
  }, [step]);

  // Format expiry time MM:SS in Bengali
  const formatExpiryTime = () => {
    const mins = Math.floor(expirySeconds / 60);
    const secs = expirySeconds % 60;
    return `${toBengaliNumber(String(mins).padStart(2, "0"))}:${toBengaliNumber(
      String(secs).padStart(2, "0")
    )}`;
  };

  /**
   * Handle Step 1: Validate Email & Password, then generate & send OTP
   */
  const handleCredentialsSubmit = async (e) => {
    if (e) e.preventDefault();
    setError("");
    setInfoMsg("");

    if (!email.trim()) {
      setError("অনুগ্রহ করে ইমেইল অ্যাড্রেস প্রদান করুন।");
      return;
    }
    if (!password) {
      setError("অনুগ্রহ করে পাসওয়ার্ড প্রদান করুন।");
      return;
    }

    if (!validateAdminCredentials(email, password)) {
      setError("ভুল ইমেইল বা পাসওয়ার্ড প্রদান করা হয়েছে। সঠিক তথ্য দিয়ে আবার চেষ্টা করুন।");
      return;
    }

    try {
      setLoading(true);
      const generatedOtp = generateOTP();
      await sendOTPEmail(email.trim(), generatedOtp);

      setStep("OTP");
      setOtpDigits(["", "", "", "", "", ""]);
      setExpirySeconds(300); // 5 mins
      setResendSeconds(60); // 60s cooldown
      setInfoMsg(`${email.trim()} ইমেইলে একটি ৬ সংখ্যার ওটিপি কোড পাঠানো হয়েছে।`);
    } catch (err) {
      console.error(err);
      setError("ওটিপি কোড পাঠাতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle Resend OTP
   */
  const handleResendOTP = async () => {
    if (resendSeconds > 0 || loading) return;
    setError("");
    setInfoMsg("");
    try {
      setLoading(true);
      const generatedOtp = generateOTP();
      await sendOTPEmail(email.trim(), generatedOtp);

      setOtpDigits(["", "", "", "", "", ""]);
      setExpirySeconds(300);
      setResendSeconds(60);
      setInfoMsg("নতুন ওটিপি কোড পাঠানো হয়েছে! আপনার ইনবক্স চেক করুন।");
      otpInputRefs.current[0]?.focus();
    } catch (err) {
      console.error(err);
      setError("ওটিপি পুনরায় পাঠাতে ব্যর্থ হয়েছে।");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle Step 2: Verify 6-digit OTP and complete login
   */
  const handleOTPSubmit = async (e) => {
    if (e) e.preventDefault();
    setError("");
    setInfoMsg("");

    const rawOtp = otpDigits.join("").trim();
    const fullOtp = normalizeToEnglishDigits(rawOtp).replace(/[^0-9]/g, "");

    if (fullOtp.length < 6) {
      setError("অনুগ্রহ করে সম্পূর্ণ ৬ সংখ্যার ওটিপি কোডটি লিখুন।");
      return;
    }

    if (expirySeconds <= 0) {
      setError("ওটিপি কোডের মেয়াদ শেষ হয়ে গেছে। পুনরায় নতুন কোড নিন।");
      return;
    }

    try {
      setLoading(true);
      await loginWithCredentials(email, password, fullOtp);
    } catch (err) {
      console.error(err);
      setError(err.message || "ভুল ওটিপি কোড প্রদান করা হয়েছে।");
      setLoading(false);
    }
  };

  /**
   * Handle OTP Paste Event
   */
  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasteText = e.clipboardData?.getData("text") || "";
    const cleanPasted = normalizeToEnglishDigits(pasteText).replace(/[^0-9]/g, "");
    if (cleanPasted) {
      const pastedDigits = cleanPasted.slice(0, 6).split("");
      const newDigits = ["", "", "", "", "", ""];
      pastedDigits.forEach((d, i) => {
        newDigits[i] = d;
      });
      setOtpDigits(newDigits);
      const nextFocus = Math.min(pastedDigits.length, 5);
      otpInputRefs.current[nextFocus]?.focus();
    }
  };

  /**
   * Handle OTP 6-box input changes & typing
   */
  const handleOtpChange = (index, value) => {
    const normalized = normalizeToEnglishDigits(value);
    const cleanVal = normalized.replace(/[^0-9]/g, "");
    const newDigits = [...otpDigits];

    if (cleanVal.length > 1) {
      const pastedDigits = cleanVal.slice(0, 6).split("");
      for (let i = 0; i < 6; i++) {
        newDigits[i] = pastedDigits[i] || "";
      }
      setOtpDigits(newDigits);
      const nextFocus = Math.min(pastedDigits.length, 5);
      otpInputRefs.current[nextFocus]?.focus();
      return;
    }

    newDigits[index] = cleanVal;
    setOtpDigits(newDigits);

    if (cleanVal && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
    if (e.key === "ArrowLeft" && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
    if (e.key === "ArrowRight" && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  /**
   * Fallback Google Login
   */
  const handleGoogleLogin = async () => {
    try {
      setError("");
      setInfoMsg("");
      setLoading(true);
      await loginWithGoogle();
    } catch (err) {
      console.error(err);
      setError(err.message || "Google লগইন করতে সমস্যা হয়েছে।");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#070d14] px-4 py-12 relative overflow-hidden selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Dynamic Cosmic Ambient Background Lighting */}
      <div className="absolute -top-48 -left-48 w-[650px] h-[650px] bg-emerald-600/[0.12] rounded-full blur-[140px] pointer-events-none animate-pulse" style={{ animationDuration: '8s' }} />
      <div className="absolute -bottom-48 -right-48 w-[650px] h-[650px] bg-teal-500/[0.10] rounded-full blur-[140px] pointer-events-none animate-pulse" style={{ animationDuration: '10s' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] bg-indigo-600/[0.04] rounded-full blur-[160px] pointer-events-none" />

      {/* Cyber Subtle Grid Pattern */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, #ffffff 1px, transparent 0)`,
          backgroundSize: '32px 32px'
        }}
      />

      <div className="w-full max-w-[480px] relative z-10 animate-fade-in-up">
        {/* Main Card */}
        <div className="bg-[#0e1726]/80 backdrop-blur-3xl border border-white/10 rounded-3xl p-7 sm:p-10 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85)] relative overflow-hidden transition-all duration-300">
          
          {/* Top Neon Ambient Luminous Bar */}
          <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-400 to-transparent opacity-90 shadow-[0_0_12px_#10b981]" />
          
          {/* Top Header Badge */}
          <div className="flex flex-col items-center text-center mb-8">
            <div className="relative mb-5 group">
              {/* Pulsing Outer Glow */}
              <div className="absolute -inset-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-3xl blur-md opacity-40 group-hover:opacity-75 transition duration-500 group-hover:scale-105" />
              
              <div className="relative w-18 h-18 rounded-2xl bg-gradient-to-br from-[#10b981] via-[#059669] to-[#047857] text-white flex items-center justify-center text-3xl shadow-xl shadow-emerald-950/60 border border-emerald-300/30">
                {step === "CREDENTIALS" ? (
                  <HiShieldCheck className="drop-shadow-md" />
                ) : (
                  <HiKey className="drop-shadow-md animate-bounce" style={{ animationDuration: '2s' }} />
                )}
              </div>
              
              <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#0a111a] border-2 border-emerald-400 flex items-center justify-center text-[11px] text-emerald-400 shadow-md">
                <HiLockClosed />
              </span>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold tracking-wider uppercase mb-2">
              <HiSparkles className="text-emerald-400 text-xs" />
              <span>নিরাপদ অ্যাডমিন পোর্টাল</span>
            </div>

            <h1 className="text-2xl sm:text-[26px] font-bold text-white tracking-tight">
              {step === "CREDENTIALS" ? "অ্যাডমিন প্রবেশদ্বার" : "ওটিপি (OTP) ভেরিফিকেশন"}
            </h1>
            <p className="text-[13.5px] text-slate-400 mt-1 leading-relaxed font-normal max-w-sm">
              {step === "CREDENTIALS"
                ? "কিশোরকণ্ঠ মেধাবৃত্তি পরীক্ষা কন্ট্রোল প্যানেল"
                : "আপনার ইমেইলে প্রেরিত ৬ সংখ্যার ওটিপি কোডটি দিন"}
            </p>
          </div>

          {/* Stepper Navigation Pills */}
          <div className="flex items-center justify-center gap-2 mb-7 bg-[#09101a]/70 p-1.5 rounded-full border border-white/5 max-w-[280px] mx-auto">
            <div
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-full text-xs font-semibold transition-all duration-300 ${
                step === "CREDENTIALS"
                  ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-950/40"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <span>১. পরিচয়</span>
            </div>
            <div
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-full text-xs font-semibold transition-all duration-300 ${
                step === "OTP"
                  ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-950/40"
                  : "text-slate-500"
              }`}
            >
              <span>২. ওটিপি</span>
            </div>
          </div>

          {/* Error Banner */}
          {error && (
            <div
              aria-live="polite"
              className="mb-6 flex items-start gap-3 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-3.5 animate-fade-in-down shadow-lg shadow-rose-950/20 backdrop-blur-md"
            >
              <HiExclamationCircle className="text-xl text-rose-400 shrink-0 mt-0.5" />
              <p className="text-[13px] text-rose-200 leading-relaxed font-medium">{error}</p>
            </div>
          )}

          {/* Info/Success Banner */}
          {infoMsg && !error && (
            <div
              aria-live="polite"
              className="mb-6 flex items-start gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 animate-fade-in-down shadow-lg shadow-emerald-950/20 backdrop-blur-md"
            >
              <HiCheckCircle className="text-xl text-emerald-400 shrink-0 mt-0.5" />
              <p className="text-[13px] text-emerald-200 leading-relaxed font-medium">{infoMsg}</p>
            </div>
          )}

          {/* =========================================================
              STEP 1: EMAIL & PASSWORD INPUT
             ========================================================= */}
          {step === "CREDENTIALS" && (
            <form onSubmit={handleCredentialsSubmit} className="space-y-5">
              {/* Email Field */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300 tracking-wide">
                    অ্যাডমিন ইমেইল
                  </label>
                  <span className="text-[11px] text-emerald-400/80 font-mono">অনুমোদিত অ্যাকাউন্ট</span>
                </div>
                <div className="relative group">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-400 text-lg pointer-events-none transition-colors">
                    <HiEnvelope />
                  </span>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="kishorkanthasylwest@gmail.com"
                    className="w-full pl-11 pr-4 py-3.5 bg-[#09101a]/90 border border-white/10 rounded-2xl text-white placeholder:text-slate-600 text-sm focus:outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/15 transition-all duration-200 font-medium shadow-inner"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300 tracking-wide">
                    পাসওয়ার্ড
                  </label>
                  <span className="text-[11px] text-slate-500">সুরক্ষিত সংযোগ</span>
                </div>
                <div className="relative group">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-400 text-lg pointer-events-none transition-colors">
                    <HiLockClosed />
                  </span>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="পাসওয়ার্ড লিখুন"
                    className="w-full pl-11 pr-12 py-3.5 bg-[#09101a]/90 border border-white/10 rounded-2xl text-white placeholder:text-slate-600 text-sm focus:outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/15 transition-all duration-200 font-medium shadow-inner"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-white/5 transition-colors"
                    tabIndex={-1}
                    aria-label={showPassword ? "পাসওয়ার্ড লুকান" : "পাসওয়ার্ড দেখুন"}
                  >
                    {showPassword ? (
                      <HiEyeSlash className="text-lg text-emerald-400" />
                    ) : (
                      <HiEye className="text-lg" />
                    )}
                  </button>
                </div>
              </div>

              {/* Submit CTA Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full min-h-[48px] px-6 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 text-white font-bold text-sm tracking-wide shadow-lg shadow-emerald-600/30 hover:shadow-emerald-600/50 hover:brightness-110 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <span className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                      <span>ওটিপি কোড পাঠানো হচ্ছে...</span>
                    </>
                  ) : (
                    <>
                      <span>ওটিপি কোড পাঠান</span>
                      <HiArrowRight className="text-lg transition-transform group-hover:translate-x-1" />
                    </>
                  )}
                </button>
              </div>

              {/* Alternative Google Sign-in */}
              <div className="pt-4 border-t border-white/10 mt-6">
                <div className="relative flex items-center justify-center mb-4">
                  <span className="bg-[#0e1726] px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-widest">
                    অথবা
                  </span>
                </div>
                <Button
                  type="button"
                  tone="neutral"
                  size="md"
                  block
                  onClick={handleGoogleLogin}
                  disabled={loading}
                  className="bg-[#09101a]/80 hover:bg-[#121c2c] border-white/10 hover:border-emerald-500/40 text-xs rounded-xl py-3 text-slate-300 hover:text-white transition-all shadow-md"
                >
                  <span className="inline-flex items-center justify-center gap-3 font-semibold">
                    <GoogleMark className="w-4 h-4" />
                    <span>Google দিয়ে সরাসরি লগইন করুন</span>
                  </span>
                </Button>
              </div>
            </form>
          )}

          {/* =========================================================
              STEP 2: 6-DIGIT OTP VERIFICATION
             ========================================================= */}
          {step === "OTP" && (
            <form onSubmit={handleOTPSubmit} className="space-y-6 animate-fade-in">
              {/* Target Mail Confirmation Pill */}
              <div className="flex items-center justify-center">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-mono">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span className="font-semibold">{email}</span>
                </div>
              </div>

              {/* 6 Digit Split Input Boxes */}
              <div
                onPaste={handleOtpPaste}
                className="flex justify-center items-center gap-2 sm:gap-3 my-2"
              >
                {otpDigits.map((digit, idx) => {
                  const isFilled = digit !== "";
                  const isCurrent = focusedIndex === idx;
                  return (
                    <input
                      key={idx}
                      ref={(el) => (otpInputRefs.current[idx] = el)}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onFocus={() => setFocusedIndex(idx)}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                      className={`w-11 h-14 sm:w-13 sm:h-16 text-center text-2xl sm:text-3xl font-bold font-mono rounded-2xl transition-all duration-200 shadow-lg ${
                        isFilled
                          ? "bg-emerald-950/40 border-emerald-400 text-emerald-300 shadow-emerald-950/50 scale-[1.02]"
                          : isCurrent
                          ? "bg-[#09101a] border-emerald-400 text-white ring-4 ring-emerald-500/20 scale-[1.05]"
                          : "bg-[#09101a]/90 border-white/10 text-white"
                      } focus:outline-none`}
                    />
                  );
                })}
              </div>

              {/* Expiry & Resend Bar */}
              <div className="flex items-center justify-between text-xs px-1 bg-[#09101a]/60 p-3 rounded-2xl border border-white/5">
                <span className="text-slate-400 font-medium flex items-center gap-1.5">
                  <span>মেয়াদ:</span>
                  <span
                    className={`font-mono font-bold px-2 py-0.5 rounded-md ${
                      expirySeconds < 60
                        ? "bg-rose-500/20 text-rose-300 animate-pulse"
                        : "bg-emerald-500/15 text-emerald-300"
                    }`}
                  >
                    {formatExpiryTime()}
                  </span>
                </span>

                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={resendSeconds > 0 || loading}
                  className={`inline-flex items-center gap-1.5 font-semibold transition-all ${
                    resendSeconds > 0 || loading
                      ? "text-slate-500 cursor-not-allowed"
                      : "text-emerald-400 hover:text-emerald-300 cursor-pointer hover:underline"
                  }`}
                >
                  <HiArrowPath className={`text-sm ${loading ? "animate-spin text-emerald-400" : ""}`} />
                  {resendSeconds > 0
                    ? `পুনরায় পাঠান (${toBengaliNumber(resendSeconds)}s)`
                    : "কোড পুনরায় পাঠান"}
                </button>
              </div>

              {/* Confirm Login Button */}
              <div className="pt-1">
                <button
                  type="submit"
                  disabled={otpDigits.join("").length < 6 || expirySeconds <= 0 || loading}
                  className="w-full min-h-[48px] px-6 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 text-white font-bold text-sm tracking-wide shadow-lg shadow-emerald-600/30 hover:shadow-emerald-600/50 hover:brightness-110 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <span className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                      <span>ওটিপি যাচাই করা হচ্ছে...</span>
                    </>
                  ) : (
                    <>
                      <HiShieldCheck className="text-xl" />
                      <span>লগইন নিশ্চিত করুন</span>
                    </>
                  )}
                </button>
              </div>

              {/* Back to Step 1 */}
              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setStep("CREDENTIALS");
                    setError("");
                    setInfoMsg("");
                  }}
                  className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-emerald-400 transition-colors font-medium cursor-pointer"
                >
                  <HiArrowLeft className="text-xs" />
                  <span>ইমেইল বা পাসওয়ার্ড পরিবর্তন করুন</span>
                </button>
              </div>
            </form>
          )}

          {/* Security Guarantee Footer */}
          <div className="mt-8 pt-6 border-t border-white/10 text-center flex flex-col items-center gap-1.5">
            <div className="inline-flex items-center gap-1.5 text-[11px] text-slate-400 font-mono tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
              <span>256-BIT SSL ENCRYPTED ADMIN ACCESS</span>
            </div>
            <div className="inline-block max-w-full mt-1">
              <span className="inline-block font-mono text-[11px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-3.5 py-1">
                {adminEmails.join(", ")}
              </span>
            </div>
          </div>
        </div>

        {/* Return to Website Navigation Link */}
        <div className="mt-6 text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-400 hover:text-emerald-400 transition-all duration-200 hover:-translate-x-1"
          >
            <HiArrowLeft className="text-sm" />
            <span>মূল ওয়েবসাইটে ফিরে যান</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
