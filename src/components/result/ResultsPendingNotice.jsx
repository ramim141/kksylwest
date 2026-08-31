import React from "react";
import { Link } from "react-router-dom";
import { HiClock, HiBell, HiArrowLeft } from "react-icons/hi2";

/**
 * Stands in for the merit list or the roll-number search while the admin has
 * them switched off.
 *
 * Shared by both so the two pages say the same thing in the same voice — a
 * visitor who checks the leaderboard, finds nothing, and then tries the
 * search should not be met with a different explanation the second time.
 */
const ResultsPendingNotice = ({ year, title, description }) => (
  <div className="min-h-[calc(100vh-140px)] bg-[#0b1326] text-white flex items-center justify-center px-4 py-16 font-sans">
    <div className="w-full max-w-lg text-center">
      <span className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 text-3xl mb-6">
        <HiClock />
      </span>

      <h1 className="text-2xl sm:text-3xl font-black text-white leading-snug">
        {title}
      </h1>

      <p className="mt-4 text-sm sm:text-base text-slate-300 leading-relaxed">
        {description}
      </p>

      <div className="mt-7 flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4 text-left">
        <HiBell className="text-lg text-indigo-300 shrink-0 mt-0.5" />
        <p className="text-[13px] sm:text-sm text-slate-300 leading-relaxed">
          ফলাফল প্রকাশিত হলে এই ওয়েবসাইটেই জানিয়ে দেওয়া হবে। নোটিশ বোর্ডে চোখ
          রাখুন।
        </p>
      </div>

      <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
        <Link
          to="/notice"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm transition-colors"
        >
          <HiBell className="text-base" />
          নোটিশ বোর্ড
        </Link>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/15 text-white font-bold text-sm transition-colors"
        >
          <HiArrowLeft className="text-base" />
          হোমে ফিরুন
        </Link>
      </div>

      {year && (
        <p className="mt-6 text-xs text-slate-500 font-bangla-number">
          শিক্ষাবর্ষ {year}
        </p>
      )}
    </div>
  </div>
);

export default ResultsPendingNotice;
