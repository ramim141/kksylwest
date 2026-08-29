import React, { useState } from "react";
import {
  HiSparkles,
  HiClipboardDocumentList,
  HiChevronDown,
  HiChevronUp,
  HiCheckCircle,
  HiExclamationTriangle,
  HiInformationCircle,
} from "react-icons/hi2";

export const EXAM_RULES = [
  "প্রবেশপত্র ব্যতিত কোন পরীক্ষার্থী পরীক্ষায় অংশগ্রহণ করতে পারবে না।",
  "প্রবেশপত্র ব্যতিত কোন প্রকার কাগজপত্র পরীক্ষা কেন্দ্রে বহন করতে পারবে না।",
  "প্রত্যেক পরীক্ষার্থী প্রয়োজনীয় ক্যালকুলেটর, কলম ও জ্যামিতি বক্স অবশ্যই সাথে আনতে হবে।",
  "প্রবেশপত্রে উল্লেখিত সময়ের ১৫ মিনিট পূর্বে পরীক্ষার্থীকে অবশ্যই পরীক্ষার হলে উপস্থিত হতে হবে।",
  "পরীক্ষা মানবণ্টন অনুযায়ী MCQ পদ্ধতিতে হবে।",
  "পরীক্ষা প্রবেশপত্রে নির্দেশিত স্থানে সরাসরি অনুষ্ঠিত হবে।",
  "৪র্থ থেকে ১০ম শ্রেণিতে প্রতিটি সঠিক উত্তরের জন্য ১ নম্বর বরাদ্দ থাকবে।",
  "পরীক্ষার অন্তত তিন দিন পূর্বে প্রবেশপত্র সংগ্রহ করে পরীক্ষার কেন্দ্র, চূড়ান্ত তারিখ ও সময় জেনে নিতে হবে।",
];

const ExamRulesCard = ({ defaultExpanded = false, className = "" }) => {
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <div
      className={`card p-4 sm:p-6 rounded-xl text-ink-body transition-all ${className}`}
    >
      {/* Header Bar */}
      <div
        onClick={() => setExpanded(!expanded)}
        className="flex items-center justify-between cursor-pointer select-none gap-3"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary-container/10 text-primary-300 border border-primary/25 flex items-center justify-center text-xl shrink-0">
            <HiClipboardDocumentList />
          </div>
          <div>
            <div className="inline-block text-ink-strong font-black text-sm sm:text-base tracking-tight mb-0.5">
              পরীক্ষা সংক্রান্ত নিয়মাবলি
            </div>
            <p className="text-[11px] sm:text-xs text-ink-faint">
              মেধা বৃত্তি পরীক্ষায় অংশগ্রহণের জন্য পরীক্ষার্থীদের করণীয় নির্দেশিকা
            </p>
          </div>
        </div>

        <button
          type="button"
          aria-expanded={expanded}
          className="p-2 border rounded bg-surface-low border-line-soft text-ink-muted hover:text-primary hover:border-primary/50 press"
        >
          {expanded ? <HiChevronUp className="text-lg" /> : <HiChevronDown className="text-lg" />}
        </button>
      </div>

      {/* Rules List — kept mounted so the panel animates its height. */}
      <div className={`grid-collapse ${expanded ? 'is-open' : ''}`}>
        <div>
          <div
            className={`mt-4 pt-4 border-t border-line-soft space-y-2 text-xs sm:text-sm transition-opacity duration-300 ease-standard ${
              expanded ? 'opacity-100' : 'opacity-0'
            }`}
          >
            {EXAM_RULES.map((rule, idx) => (
              <div
                key={idx}
                className="flex items-start gap-2.5 p-2.5 rounded bg-surface-low border border-line-soft hover:border-primary/50 transition leading-relaxed text-ink-body"
              >
                <span className="text-sm font-black text-primary shrink-0 mt-0.5">
                  ■
                </span>
                <span className="font-medium">{rule}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExamRulesCard;
