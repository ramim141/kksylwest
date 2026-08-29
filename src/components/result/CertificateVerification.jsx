import React, { useState, useRef, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { toPng } from "html-to-image";
import {
  HiShieldCheck,
  HiCheckBadge,
  HiPrinter,
  HiArrowDownTray,
  HiMagnifyingGlass,
  HiArrowPath,
  HiExclamationCircle,
  HiSparkles,
  HiAcademicCap,
  HiCalendarDays,
  HiTrophy,
} from "react-icons/hi2";
import { FaAward, FaCrown, FaQrcode, FaGraduationCap } from "react-icons/fa";
import { getAllResults } from "../../services/firestore";
import { Skeleton, SkeletonRegion } from "../common";

const CertificateVerification = () => {
  const [certQuery, setCertQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [studentData, setStudentData] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [downloading, setDownloading] = useState(false);

  const certRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = params.get("roll") || params.get("cert") || params.get("id");
    if (q) {
      setCertQuery(q);
      performLookup(q);
    }
  }, [location.search]);

  const performLookup = async (termToSearch) => {
    const term = (termToSearch || certQuery).trim();
    if (!term) return;

    setLoading(true);
    setErrorMessage("");
    setStudentData(null);

    try {
      const cleanRoll = term.replace(/[^0-9]/g, "");

      let results = await getAllResults();
      if (!results || results.length === 0) {
        const res = await fetch("/results.json");
        results = await res.json();
      }

      const match = results.find(
        (s) =>
          s.roll?.toString() === term ||
          (cleanRoll && s.roll?.toString() === cleanRoll) ||
          s.name?.toLowerCase() === term.toLowerCase()
      );

      if (match) {
        setStudentData(match);
      } else {
        setErrorMessage(
          "দুঃখিত! এই সনদ বা রোল নম্বরে কোনো মেধা সনদপত্র পাওয়া যায়নি। দয়া করে সঠিক রোল নম্বর দিয়ে চেষ্টা করুন।"
        );
      }
    } catch (err) {
      console.error(err);
      setErrorMessage("সনদ যাচাই করতে সমস্যা হয়েছে!");
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    performLookup(certQuery);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadHD = async () => {
    if (!certRef.current) return;
    setDownloading(true);
    try {
      await new Promise((r) => setTimeout(r, 100));
      const dataUrl = await toPng(certRef.current, {
        cacheBust: true,
        pixelRatio: 2.5,
        quality: 0.98,
        backgroundColor: "#ffffff",
        skipFonts: true,
      });

      const link = document.createElement("a");
      link.download = `Certificate_${studentData.name}_${studentData.roll}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error(err);
      alert("ডাউনলোড করতে সমস্যা হয়েছে, দয়া করে স্ক্রিনশট বা প্রিন্ট করুন।");
    } finally {
      setDownloading(false);
    }
  };

  const toBengaliNumber = (num) => {
    if (!num) return "০";
    const bengaliDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
    return num
      .toString()
      .split("")
      .map((digit) => bengaliDigits[digit] || digit)
      .join("");
  };

  return (
    <div className="min-h-screen bg-[#0b1326] text-white py-8 sm:py-16 px-3 sm:px-6">
      <div className="max-w-7xl mx-auto space-y-8 sm:space-y-12">
        
        {/* Page Header */}
        <div className="text-center space-y-3 max-w-3xl mx-auto print:hidden">
          <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 text-xs sm:text-sm font-bold uppercase tracking-wider shadow-sm">
            <HiShieldCheck className="text-emerald-400 text-base" />
            <span>ডিজিটাল মেধা সনদ ভেরিফিকেশন পোর্টাল</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            মেধা সনদপত্র <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-400">
              অনলাইন সত্যতা যাচাই
            </span>
          </h1>

          <p className="text-xs sm:text-base text-slate-300 leading-relaxed font-normal">
            কিশোরকণ্ঠ মেধাবৃত্তি পরীক্ষায় উত্তীর্ণ সকল শিক্ষার্থীর অফিসিয়াল মেধা সনদপত্র অনলাইন থেকে তাৎক্ষণিক যাচাই ও হাই-রেজোলিউশন কপি ডাউনলোড করুন।
          </p>
        </div>

        {/* Verification Lookup Card */}
        {!studentData && (
          <div className="max-w-xl mx-auto p-6 sm:p-8 rounded-3xl bg-[#0f1124] border border-white/10 shadow-2xl space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-white/[0.08]">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/15 text-indigo-400 border border-indigo-500/30 flex items-center justify-center text-2xl shadow-md">
                <HiShieldCheck />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-black text-white">রোল বা সনদ নম্বর দিন</h3>
                <p className="text-xs text-slate-400">আপনার পরীক্ষার রোল নম্বর দিয়ে অনুসন্ধান করুন</p>
              </div>
            </div>

            <form onSubmit={handleSearchSubmit} className="space-y-4">
              <div className="relative">
                <HiMagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg" />
                <input
                  type="text"
                  value={certQuery}
                  onChange={(e) => setCertQuery(e.target.value)}
                  placeholder="যেমন: ৪১০৩৫১ বা 410351"
                  className="w-full pl-11 pr-4 py-3.5 bg-[#090a16] border border-white/15 rounded-xl text-sm sm:text-base font-semibold text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-400 shadow-inner"
                />
              </div>

              <button
                type="submit"
                disabled={loading || !certQuery.trim()}
                className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-sm sm:text-base shadow-lg shadow-emerald-500/25 transition-all hover:scale-[1.01] active:scale-98 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    <span>যাচাই হচ্ছে...</span>
                  </>
                ) : (
                  <>
                    <HiShieldCheck className="text-xl" />
                    <span>সনদপত্র যাচাই ও দেখুন →</span>
                  </>
                )}
              </button>
            </form>

            {errorMessage && (
              <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs sm:text-sm flex items-start gap-2.5">
                <HiInformationCircle className="text-lg shrink-0 mt-0.5" />
                <p className="text-justify leading-relaxed flex-1 font-medium">{errorMessage}</p>
              </div>
            )}
          </div>
        )}

        {/* Verification in flight: hold the certificate's footprint so the
            page does not jump when it resolves. */}
        {loading && !studentData && (
          <SkeletonRegion label="সনদ যাচাই হচ্ছে" className="max-w-5xl mx-auto space-y-6">
            <div className="p-4 sm:p-5 bg-[#14162b] border border-white/10 rounded-2xl flex flex-wrap items-center justify-between gap-3">
              <Skeleton className="w-64 h-4 max-w-full rounded-full" />
              <div className="flex items-center gap-2">
                <Skeleton className="w-28 h-10 rounded-xl" />
                <Skeleton className="w-28 h-10 rounded-xl" />
              </div>
            </div>
            <Skeleton className="w-full aspect-[1.414/1] rounded-3xl" />
          </SkeletonRegion>
        )}

        {/* Certificate View */}
        {studentData && (
          <div className="max-w-5xl mx-auto space-y-6 content-swap">
            {/* Quick Action Bar */}
            <div className="p-4 sm:p-5 bg-[#14162b] border border-white/10 rounded-2xl shadow-xl flex flex-wrap items-center justify-between gap-3 print:hidden">
              <div className="flex items-center gap-2 text-xs sm:text-sm">
                <span className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-bold text-white">
                  যাচাইকৃত সনদ: {studentData.name} (রোল: {toBengaliNumber(studentData.roll)})
                </span>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={handlePrint}
                  className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm rounded-xl transition hover:scale-105 flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  <HiPrinter className="text-base" /> প্রিন্ট করুন
                </button>

                <button
                  onClick={handleDownloadHD}
                  disabled={downloading}
                  className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs sm:text-sm rounded-xl transition hover:scale-105 flex items-center gap-1.5 cursor-pointer shadow-md disabled:opacity-50"
                >
                  <HiArrowDownTray className="text-base" />
                  {downloading ? "ডাউনলোড হচ্ছে..." : "এইচডি সনদ ডাউনলোড"}
                </button>

                <button
                  onClick={() => {
                    setStudentData(null);
                    setCertQuery("");
                  }}
                  className="px-3.5 py-2.5 bg-white/[0.08] hover:bg-white/[0.15] text-white font-semibold text-xs sm:text-sm rounded-xl transition cursor-pointer flex items-center gap-1 border border-white/10"
                >
                  <HiArrowPath /> অন্য সনদ
                </button>
              </div>
            </div>

            {/* CERTIFICATE CANVAS (Clean White Frame) */}
            <div className="flex justify-center overflow-x-auto py-2 scrollbar-slim">
              <div
                ref={certRef}
                id="certificate-canvas"
                className="w-full max-w-[850px] min-w-[340px] bg-[#fffdfa] text-slate-900 rounded-2xl p-5 sm:p-12 shadow-2xl border-4 sm:border-8 border-[#d4af37] relative overflow-hidden print:border-4 print:border-slate-400 print:rounded-none print:p-8"
              >
                {/* Background Watermark Pattern */}
                <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
                  <FaGraduationCap className="text-[320px] text-[#d4af37]" />
                </div>

                {/* Inner Ornamental Frame */}
                <div className="border-2 sm:border-4 border-[#065f46] rounded-xl p-5 sm:p-8 relative print:border-slate-800 print:p-6">
                  {/* Certificate Top ID Bar */}
                  <div className="flex items-center justify-between text-[10px] sm:text-xs font-mono text-slate-500 border-b border-amber-200 pb-2 mb-4">
                    <span>সনদ নং: CERT-KKMB-{studentData.roll}</span>
                    <span className="text-emerald-700 font-bold uppercase">
                      VERIFIED OFFICIAL MERIT CERTIFICATE
                    </span>
                  </div>

                  {/* Header */}
                  <div className="text-center space-y-1">
                    <div className="flex items-center justify-center gap-2">
                      <FaAward className="text-3xl text-amber-500" />
                      <h2 className="text-2xl sm:text-3xl font-black text-[#065f46] uppercase tracking-tight">
                        কিশোরকণ্ঠ পাঠক ফোরাম
                      </h2>
                    </div>
                    <p className="text-xs font-bold text-slate-600 uppercase tracking-widest">
                      সিলেট জেলা পশ্চিম শাখা
                    </p>
                    <div className="pt-2">
                      <h3 className="text-base sm:text-xl font-black text-amber-600 tracking-wide inline-block border-b-2 border-amber-400 pb-0.5">
                        মেধা সনদপত্র (CERTIFICATE OF MERIT)
                      </h3>
                    </div>
                  </div>

                  {/* Certificate Body Text */}
                  <div className="py-6 text-center space-y-4 leading-relaxed">
                    <p className="text-xs sm:text-sm text-slate-600 italic">
                      গর্বের সাথে প্রত্যয়ন করা যাচ্ছে যে,
                    </p>

                    <h4 className="text-2xl sm:text-4xl font-black text-[#065f46] tracking-wide">
                      {studentData.name}
                    </h4>

                    <div className="max-w-2xl mx-auto text-xs sm:text-sm text-slate-700 space-y-2">
                      {studentData.father && (
                        <p>
                          পিতা: <strong className="text-slate-900">{studentData.father}</strong>
                        </p>
                      )}
                      <p>
                        প্রতিষ্ঠান: <strong className="text-slate-900">{studentData.school}</strong>
                      </p>
                      <p>
                        শ্রেণি: <strong className="text-slate-900 font-bangla-number">{studentData.class}</strong> • রোল নম্বর:{" "}
                        <strong className="text-slate-900 font-bangla-number font-bold text-base">{toBengaliNumber(studentData.roll)}</strong>
                      </p>
                    </div>

                    <div className="py-3 max-w-lg mx-auto bg-amber-50 rounded-xl border border-amber-200">
                      <p className="text-xs sm:text-sm font-bold text-amber-900">
                        কিশোরকণ্ঠ মেধাবৃত্তি পরীক্ষায় কৃতিত্বপূর্ণ ফলাফল অর্জন করায়
                        <span className="block text-base sm:text-lg font-black text-emerald-800 mt-1">
                          “{studentData.category || "ট্যালেন্টপুল"}” গ্রেডে
                        </span>
                        বৃত্তি ও এই সম্মাননা সনদপত্র প্রদান করা হলো।
                      </p>
                    </div>
                  </div>

                  {/* Signatures & Seal */}
                  <div className="pt-6 sm:pt-8 border-t border-amber-200 flex items-end justify-between text-center gap-4">
                    <div className="space-y-1">
                      <div className="w-24 sm:w-32 border-b border-slate-400 mx-auto" />
                      <p className="text-[10px] sm:text-xs font-bold text-slate-800">সদস্য সচিব</p>
                      <p className="text-[9px] text-slate-500">মেধাবৃত্তি পরীক্ষা কমিটি</p>
                    </div>

                    <div className="flex flex-col items-center justify-center">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full border-2 border-amber-500 bg-amber-100 flex items-center justify-center shadow-inner">
                        <FaCrown className="text-xl sm:text-2xl text-amber-600" />
                      </div>
                      <span className="text-[9px] font-bold text-amber-800 mt-1">অফিসিয়াল সিল</span>
                    </div>

                    <div className="space-y-1">
                      <div className="w-24 sm:w-32 border-b border-slate-400 mx-auto" />
                      <p className="text-[10px] sm:text-xs font-bold text-slate-800">চেয়ারম্যান</p>
                      <p className="text-[9px] text-slate-500">কিশোরকণ্ঠ পাঠক ফোরাম</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};

export default CertificateVerification;
