import React, { useState } from "react";
import {
  HiClipboardDocumentList,
  HiChevronDown,
} from "react-icons/hi2";

export const EXAM_RULES = [
  "প্রবেশপত্র ব্যতিত কোনো পরীক্ষার্থী পরীক্ষায় অংশগ্রহণ করতে পারবে না।",
  "প্রবেশপত্র ব্যতিত কোনো প্রকার অতিরিক্ত কাগজপত্র পরীক্ষা কেন্দ্রে বহন করা সম্পূর্ণ নিষিদ্ধ।",
  "প্রত্যেক পরীক্ষার্থী প্রয়োজনীয় কলম, পেন্সিল ও সাধারণ জ্যামিতি বক্স অবশ্যই সাথে আনতে হবে।",
  "প্রবেশপত্রে উল্লেখিত পরীক্ষার সময়ের অন্তত ১৫ মিনিট পূর্বে পরীক্ষার্থীকে অবশ্যই পরীক্ষার হলে উপস্থিত হতে হবে।",
  "পরীক্ষা সম্পূর্ণ ওএমআর (OMR) শিটে MCQ পদ্ধতিতে অনুষ্ঠিত হবে।",
  "পরীক্ষা প্রবেশপত্রে নির্দেশিত নির্দিষ্ট পরীক্ষা কেন্দ্র ও কক্ষে সরাসরি অনুষ্ঠিত হবে।",
  "৪র্থ থেকে ১০ম শ্রেণির প্রতিটি সঠিক উত্তরের জন্য নির্ধারিত ১ নম্বর বরাদ্দ থাকবে।",
  "পরীক্ষার অন্তত ৩ দিন পূর্বে ডিজিটাল প্রবেশপত্র সংগ্রহ করে পরীক্ষার কেন্দ্র, চূড়ান্ত তারিখ ও সময় জেনে নিতে হবে।",
];

const toBengaliNumber = (num) => {
  const bengaliDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
  return num.toString().replace(/[0-9]/g, (digit) => bengaliDigits[digit]);
};

const ExamRulesCard = ({ defaultExpanded = false, className = "" }) => {
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <div
      className={`rounded-2xl border border-white/10 bg-[#121528] shadow-xl hover:border-emerald-500/30 transition-all duration-300 overflow-hidden ${className}`}
    >
      {/* Header Bar — Responsive & Touch-friendly */}
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        aria-expanded={expanded}
        className="w-full p-3.5 sm:p-5 flex items-center justify-between text-left cursor-pointer select-none gap-2.5 sm:gap-4 group focus:outline-none"
      >
        <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0 flex-1">
          {/* Left Icon Pill */}
          <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center justify-center text-lg sm:text-2xl shrink-0 group-hover:scale-105 transition-transform duration-300">
            <HiClipboardDocumentList />
          </div>

          {/* Title & Subtitle */}
          <div className="min-w-0 flex-1">
            <h3 className="text-xs sm:text-base font-black text-white group-hover:text-emerald-300 transition-colors leading-snug truncate sm:whitespace-normal">
              পরীক্ষা সংক্রান্ত নিয়মাবলি
            </h3>
            <p className="text-[10px] sm:text-xs text-slate-400 mt-0.5 leading-tight truncate sm:whitespace-normal">
              মেধা বৃত্তি পরীক্ষায় অংশগ্রহণের জন্য পরীক্ষার্থীদের করণীয় নির্দেশিকা
            </p>
          </div>
        </div>

        {/* Right Chevron Toggle Button */}
        <div
          className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-white/[0.05] border border-white/10 text-slate-300 group-hover:text-white group-hover:border-emerald-500/40 flex items-center justify-center shrink-0 transition-colors duration-300`}
        >
          <HiChevronDown
            className={`text-base sm:text-lg transition-transform duration-300 ${
              expanded ? "rotate-180 text-emerald-400" : ""
            }`}
          />
        </div>
      </button>

      {/* Rules List Panel */}
      <div className={`grid-collapse ${expanded ? "is-open" : ""}`}>
        <div>
          <div
            className={`px-3.5 pb-4 sm:px-5 sm:pb-5 pt-1 border-t border-white/[0.08] transition-opacity duration-300 ease-standard ${
              expanded ? "opacity-100" : "opacity-0"
            }`}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5">
              {EXAM_RULES.map((rule, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2.5 p-2.5 sm:p-3 rounded-xl bg-[#090b17] border border-white/5 hover:border-emerald-500/25 transition leading-relaxed text-slate-200 text-xs sm:text-sm"
                >
                  <span className="w-5 h-5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                    {toBengaliNumber(idx + 1)}
                  </span>
                  <span className="font-medium text-slate-300">{rule}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExamRulesCard;
