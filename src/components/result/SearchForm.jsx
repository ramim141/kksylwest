import React from "react";
import { Link } from "react-router-dom";
import {
  HiMagnifyingGlass,
  HiSparkles,
  HiAcademicCap,
  HiDocumentText,
  HiXMark,
  HiArrowRight,
  HiInformationCircle,
  HiCheckBadge,
} from "react-icons/hi2";
import { FaCrown, FaCertificate } from "react-icons/fa";

import { useExamYear } from "../../context/ExamYearContext";

const SearchForm = ({ onSearch, inputRoll, setInputRoll, loading, error }) => {
  const examYear = useExamYear();
  const handleClear = () => {
    setInputRoll("");
  };

  return (
    <div className="w-full max-w-4xl space-y-10 sm:space-y-12 animate-fadeIn text-white">
      {/* Search Header Banner */}
      <div className="text-center space-y-3 sm:space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/15 text-indigo-300 text-xs sm:text-sm font-bold border border-indigo-500/30 backdrop-blur-md shadow-sm">
          <HiSparkles className="text-amber-400 text-base" />
          <span>কিশোরকণ্ঠ মেধাবৃত্তি {examYear} • অফিশিয়াল ফলাফল প্রকাশ</span>
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
          আপনার বৃত্তির{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-400">
            ফলাফল অনুসন্ধান
          </span>{" "}
          করুন
        </h1>

        <p className="text-slate-300 text-xs sm:text-base max-w-2xl mx-auto leading-relaxed">
          আপনার পরীক্ষার রোল নম্বর প্রবেশ করিয়ে তাৎক্ষণিক গ্রেড, মেধা তালিকা ও সোশ্যাল ফটো কার্ড দেখুন।
        </p>
      </div>

      {/* Main Search Glassmorphic Card */}
      <div className="relative group">
        {/* Glow backdrop behind card */}
        <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500/20 via-emerald-500/20 to-indigo-500/20 rounded-3xl blur-xl opacity-40 group-hover:opacity-60 transition duration-700 pointer-events-none"></div>

        <div className="relative p-5 sm:p-8 md:p-10 rounded-3xl bg-[#14162b] border border-white/15 shadow-2xl backdrop-blur-xl">
          <form onSubmit={onSearch} className="space-y-5">
            <div className="space-y-2">
              <label className="flex items-center justify-between text-xs sm:text-sm font-bold text-slate-200">
                <span className="flex items-center gap-1.5">
                  <HiAcademicCap className="text-emerald-400 text-base" />
                  পরীক্ষার রোল নম্বর
                </span>
                <span className="text-[11px] text-slate-400 font-normal hidden sm:inline">
                  (যেমন: 10501)
                </span>
              </label>

              <div className="relative flex items-center">
                <div className="absolute left-3.5 text-slate-400 pointer-events-none">
                  <HiMagnifyingGlass className="text-lg text-emerald-400" />
                </div>

                <input
                  type="text"
                  value={inputRoll}
                  onChange={(e) => setInputRoll(e.target.value)}
                  placeholder="আপনার রোল নম্বর লিখুন..."
                  className="w-full pl-10 pr-10 py-3 sm:py-3.5 text-sm sm:text-base font-bold bg-[#090a16] border border-white/15 rounded-xl sm:rounded-2xl text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200"
                  autoFocus
                />

                {inputRoll && (
                  <button
                    type="button"
                    onClick={handleClear}
                    className="absolute right-3.5 p-1 rounded-full text-slate-400 hover:text-white hover:bg-white/[0.08] transition cursor-pointer"
                    title="মুছে ফেলুন"
                  >
                    <HiXMark className="text-base" />
                  </button>
                )}
              </div>
            </div>

            {/* Action Submit Button - Slim & Sleek */}
            <button
              type="submit"
              disabled={loading || !inputRoll.trim()}
              className="w-full relative group/btn overflow-hidden py-3 sm:py-3.5 px-6 rounded-xl sm:rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-xs sm:text-sm shadow-md shadow-emerald-500/25 transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-[0.99] flex items-center justify-center gap-2 whitespace-nowrap"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                  <span className="whitespace-nowrap">ফলাফল খোঁজা হচ্ছে...</span>
                </div>
              ) : (
                <>
                  <HiMagnifyingGlass className="text-base" />
                  <span className="whitespace-nowrap">ফলাফল দেখুন</span>
                  <HiArrowRight className="text-sm group-hover/btn:translate-x-1 transition-transform duration-200" />
                </>
              )}
            </button>
          </form>

          {/* Error Message Box */}
          {error && (
            <div className="mt-5 p-4 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs sm:text-sm font-bold flex items-center justify-between gap-3 animate-shake">
              <div className="flex items-center gap-2.5">
                <HiInformationCircle className="text-lg shrink-0 text-rose-400" />
                <span>{error}</span>
              </div>
              <Link
                to="/list"
                className="text-xs font-bold underline hover:text-white whitespace-nowrap"
              >
                উত্তীর্ণদের তালিকা দেখুন →
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Quick Navigation Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <Link
          to="/leaderboard"
          className="p-6 rounded-3xl bg-[#0f1124] border border-white/10 hover:border-amber-400/40 hover:-translate-y-1 hover:shadow-2xl transition-all duration-300 group"
        >
          <div className="w-12 h-12 rounded-2xl bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform shadow-md">
            <FaCrown />
          </div>
          <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-amber-300 transition-colors">
            টপ মেধা লিডারবোর্ড
          </h3>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            শ্রেণিভিত্তিক সেরা মেধাবী ও ১ম, ২য় ও ৩য় স্থান অধিকারীদের গোল্ডেন পোডিয়াম দেখুন।
          </p>
          <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-400 mt-3 group-hover:translate-x-1 transition-transform">
            লিডারবোর্ড দেখুন →
          </span>
        </Link>

        <Link
          to="/verify-certificate"
          className="p-6 rounded-3xl bg-[#0f1124] border border-white/10 hover:border-emerald-400/40 hover:-translate-y-1 hover:shadow-2xl transition-all duration-300 group"
        >
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform shadow-md">
            <FaCertificate />
          </div>
          <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-emerald-300 transition-colors">
            ডিজিটাল মেধা সনদ যাচাই
          </h3>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            অফিশিয়াল সিল ও স্বাক্ষরযুক্ত সার্টিফিকেট ভেরিফাই ও এইচডি ডাউনলোড করুন।
          </p>
          <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400 mt-3 group-hover:translate-x-1 transition-transform">
            সনদপত্র দেখুন →
          </span>
        </Link>

        <Link
          to="/list"
          className="p-6 rounded-3xl bg-[#0f1124] border border-white/10 hover:border-indigo-400/40 hover:-translate-y-1 hover:shadow-2xl transition-all duration-300 group sm:col-span-2 lg:col-span-1"
        >
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/15 text-indigo-400 border border-indigo-500/30 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform shadow-md">
            <HiDocumentText />
          </div>
          <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-indigo-300 transition-colors">
            সকল উত্তীর্ণদের তালিকা
          </h3>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            প্রতিটি শ্রেণি ও গ্রেড অনুযায়ী সকল বৃত্তিপ্রাপ্ত শিক্ষার্থীর সম্পূর্ণ ফলাফল তালিকা।
          </p>
          <span className="inline-flex items-center gap-1 text-xs font-bold text-indigo-400 mt-3 group-hover:translate-x-1 transition-transform">
            সম্পূর্ণ তালিকা →
          </span>
        </Link>
      </div>

      {/* Scholarship Perks & Guidelines */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#0f1124] border border-white/10 text-white space-y-4 shadow-xl">
        <h4 className="text-base font-extrabold text-white flex items-center gap-2">
          <HiInformationCircle className="text-emerald-400 text-lg" />
          মেধাবৃত্তি ফলাফল ও পুরস্কার বিতরণী নির্দেশিকা
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm leading-relaxed text-slate-300">
          <div className="flex items-start gap-2.5">
            <HiCheckBadge className="text-emerald-400 text-lg shrink-0 mt-0.5" />
            <p>
              <strong className="text-white">ট্যালেন্টপুল ও সাধারণ বৃত্তি:</strong> নির্বাচিত শিক্ষার্থীদের এককালীন বৃত্তির অর্থ, আকর্ষণীয় ক্রেস্ট ও মেধা সনদ প্রদান করা হবে।
            </p>
          </div>
          <div className="flex items-start gap-2.5">
            <HiCheckBadge className="text-emerald-400 text-lg shrink-0 mt-0.5" />
            <p>
              <strong className="text-white">সংবর্ধনা ও পুরস্কার বিতরণ:</strong> পুরস্কার বিতরণী অনুষ্ঠানের স্থান, তারিখ ও সময়সূচি খুব শীঘ্রই নোটিশ বোর্ডে প্রকাশ করা হবে।
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchForm;
