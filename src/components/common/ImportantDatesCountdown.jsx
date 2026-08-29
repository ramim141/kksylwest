import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  HiCalendarDays,
  HiClock,
  HiSparkles,
  HiArrowRight,
  HiFire,
  HiCheckCircle,
  HiIdentification,
  HiDocumentText,
} from "react-icons/hi2";
import { FaHourglassHalf, FaCalendarCheck } from "react-icons/fa";
import { getImportantDates, DEFAULT_IMPORTANT_DATES } from "../../services/firestore";

const toBengaliNumber = (num) =>
  num?.toString().padStart(2, "0").replace(/\d/g, (d) => "০১২৩৪৫৬৭৮৯"[d]) || "০০";

/* The ISO date fields in Firestore can come back with Bengali digits
   ("২০২৬-১০-২৪ T..."), because the admin form and the seed data both
   accept them. Date() cannot parse those, and the countdown rendered
   "NaN" in every tile. Mapping the digits back to ASCII before parsing
   costs nothing and accepts either form. */
const BENGALI_DIGIT = /[০-৯]/g;

const toParsableDate = (value) =>
  typeof value === "string"
    ? value.replace(BENGALI_DIGIT, (d) => String(d.charCodeAt(0) - 0x09e6))
    : value;

const ImportantDatesCountdown = () => {
  const [dates, setDates] = useState(DEFAULT_IMPORTANT_DATES);
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isExpired: false,
  });

  useEffect(() => {
    getImportantDates().then((data) => {
      if (data) setDates(data);
    });
  }, []);

  useEffect(() => {
    const calculateTimeLeft = () => {
      // Determine target date based on activeCountdownTarget
      let targetDateStr = dates.examDate;
      if (dates.activeCountdownTarget === "registrationDeadline") {
        targetDateStr = dates.registrationDeadline;
      } else if (dates.activeCountdownTarget === "resultPublishDate") {
        targetDateStr = dates.resultPublishDate;
      }

      const target = new Date(toParsableDate(targetDateStr)).getTime();
      if (Number.isNaN(target)) {
        // Unset or unreadable: show the dates panel without a broken timer.
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true });
        return;
      }
      const now = new Date().getTime();
      const difference = target - now;

      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true });
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const seconds = Math.floor((difference / 1000) % 60);

      setTimeLeft({ days, hours, minutes, seconds, isExpired: false });
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(interval);
  }, [dates]);

  const getTargetTitle = () => {
    if (dates.activeCountdownTarget === "registrationDeadline") {
      return "অনলাইন রেজিস্ট্রেশন শেষ হতে বাকি";
    }
    if (dates.activeCountdownTarget === "resultPublishDate") {
      return "ফলাফল প্রকাশের আর মাত্র বাকি";
    }
    return "মেধাবৃত্তি পরীক্ষা অনুষ্ঠিত হতে বাকি";
  };

  return (
    <section className="relative w-full max-w-7xl mx-auto px-3 sm:px-6 my-10 sm:my-14 font-sans">
      <div className="relative rounded-3xl bg-gradient-to-br from-[#14162b] via-[#101224] to-[#0b1326] border border-white/15 p-6 sm:p-10 shadow-2xl overflow-hidden">
        
        {/* Decorative Background Accents */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Column: Live Countdown Box (7 Cols) */}
          <div className="lg:col-span-7 space-y-5 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-400/15 border border-amber-400/30 text-amber-300 text-xs font-black uppercase tracking-wider">
              <FaHourglassHalf className="animate-spin text-xs" style={{ animationDuration: "6s" }} />
              <span>লাইভ কাউন্টডাউন • শিক্ষাবর্ষ {dates.examYear || "২০২৫"}</span>
            </div>

            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight leading-tight">
              {getTargetTitle()}
            </h2>

            {/* Countdown Blocks */}
            {!timeLeft.isExpired ? (
              <div className="grid grid-cols-4 gap-2.5 sm:gap-4 max-w-lg mx-auto lg:mx-0 pt-2">
                {/* Days */}
                <div className="p-3 sm:p-4 rounded-2xl bg-[#090a16] border border-white/10 text-center shadow-lg">
                  <div className="font-bangla-number font-extrabold text-2xl sm:text-4xl text-amber-300">
                    {toBengaliNumber(timeLeft.days)}
                  </div>
                  <span className="text-[10px] sm:text-xs text-slate-400 font-bold uppercase tracking-wider mt-1 block">
                    দিন
                  </span>
                </div>

                {/* Hours */}
                <div className="p-3 sm:p-4 rounded-2xl bg-[#090a16] border border-white/10 text-center shadow-lg">
                  <div className="font-bangla-number font-extrabold text-2xl sm:text-4xl text-emerald-400">
                    {toBengaliNumber(timeLeft.hours)}
                  </div>
                  <span className="text-[10px] sm:text-xs text-slate-400 font-bold uppercase tracking-wider mt-1 block">
                    ঘণ্টা
                  </span>
                </div>

                {/* Minutes */}
                <div className="p-3 sm:p-4 rounded-2xl bg-[#090a16] border border-white/10 text-center shadow-lg">
                  <div className="font-bangla-number font-extrabold text-2xl sm:text-4xl text-sky-400">
                    {toBengaliNumber(timeLeft.minutes)}
                  </div>
                  <span className="text-[10px] sm:text-xs text-slate-400 font-bold uppercase tracking-wider mt-1 block">
                    মিনিট
                  </span>
                </div>

                {/* Seconds */}
                <div className="p-3 sm:p-4 rounded-2xl bg-[#090a16] border border-white/10 text-center shadow-lg">
                  <div className="font-bangla-number font-extrabold text-2xl sm:text-4xl text-rose-400 animate-pulse">
                    {toBengaliNumber(timeLeft.seconds)}
                  </div>
                  <span className="text-[10px] sm:text-xs text-slate-400 font-bold uppercase tracking-wider mt-1 block">
                    সেকেন্ড
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-bold text-sm">
                🎉 নির্ধারিত সময়সূচী চলমান বা সমাপ্ত হয়েছে!
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 justify-center lg:justify-start pt-2">
              <Link
                to="/scholarship"
                className="px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-xs sm:text-sm shadow-lg shadow-emerald-500/25 transition cursor-pointer flex items-center gap-2"
              >
                <HiDocumentText className="text-base" />
                <span>অনলাইন রেজিস্ট্রেশন করুন</span>
              </Link>

              <Link
                to="/admit-card"
                className="px-5 py-3 rounded-xl bg-white/[0.08] hover:bg-white/[0.15] text-slate-200 hover:text-white font-bold text-xs sm:text-sm border border-white/10 transition cursor-pointer flex items-center gap-2"
              >
                <HiIdentification className="text-base text-indigo-400" />
                <span>প্রবেশপত্র ডাউনলোড</span>
              </Link>
            </div>
          </div>

          {/* Right Column: Important Timeline Matrix (5 Cols) */}
          <div className="lg:col-span-5 space-y-3 bg-[#090a16]/80 p-5 sm:p-6 rounded-2xl border border-white/10">
            <h3 className="text-xs sm:text-sm font-black text-white uppercase tracking-wider flex items-center gap-2 border-b border-white/10 pb-3">
              <FaCalendarCheck className="text-emerald-400" />
              <span>গুরুত্বপূর্ণ তারিখ ও সময়সূচী</span>
            </h3>

            <div className="space-y-3 text-xs sm:text-sm">
              {/* Item 1 */}
              <div className="flex items-start justify-between gap-3 border-b border-white/[0.06] pb-2.5">
                <span className="text-slate-400 font-medium">📝 আবেদন সমাপ্তি:</span>
                <span className="font-bold text-white text-right">
                  {dates.registrationDeadlineBn || "১৫ অক্টোবর ২০২৫"}
                </span>
              </div>

              {/* Item 2 */}
              <div className="flex items-start justify-between gap-3 border-b border-white/[0.06] pb-2.5">
                <span className="text-slate-400 font-medium">🎫 প্রবেশপত্র সংগ্রহ:</span>
                <span className="font-bold text-indigo-300 text-right">
                  {dates.admitCardReleaseDateBn || "১৮ অক্টোবর ২০২৫"}
                </span>
              </div>

              {/* Item 3 */}
              <div className="flex items-start justify-between gap-3 border-b border-white/[0.06] pb-2.5">
                <span className="text-slate-400 font-medium">🎯 পরীক্ষার তারিখ:</span>
                <span className="font-black text-amber-300 text-right">
                  {dates.examDateBn || "২৪ অক্টোবর ২০২৫"}
                </span>
              </div>

              {/* Item 4 */}
              <div className="flex items-start justify-between gap-3 border-b border-white/[0.06] pb-2.5">
                <span className="text-slate-400 font-medium">⏰ পরীক্ষার সময়:</span>
                <span className="font-bold text-emerald-400 text-right">
                  {dates.examTimeBn || "সকাল ১০:০০ টা - ১১:৩০ টা"}
                </span>
              </div>

              {/* Item 5 */}
              <div className="flex items-start justify-between gap-3">
                <span className="text-slate-400 font-medium">🏆 ফলাফল প্রকাশ:</span>
                <span className="font-bold text-sky-300 text-right">
                  {dates.resultPublishDateBn || "১০ নভেম্বর ২০২৫"}
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default ImportantDatesCountdown;
