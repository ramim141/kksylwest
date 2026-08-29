import React, { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { toPng } from "html-to-image";
import {
  HiMagnifyingGlass,
  HiPrinter,
  HiArrowDownTray,
  HiArrowPath,
  HiCheckCircle,
  HiExclamationCircle,
  HiAcademicCap,
  HiQrCode,
  HiCalendarDays,
  HiClock,
  HiMapPin,
  HiBuildingOffice2,
  HiIdentification,
  HiSparkles,
  HiUser,
  HiShieldCheck,
  HiArrowLeft,
  HiChevronRight,
  HiLightBulb,
} from "react-icons/hi2";
import { FaGraduationCap, FaQrcode, FaPrint, FaDownload, FaTrophy, FaStar, FaWhatsapp } from "react-icons/fa";
import { searchAdmitCard, getAdmitCardSettings, DEFAULT_ADMIT_CARD_SETTINGS } from "../../services/firestore";
import { Skeleton, SkeletonRegion } from "../common";

const AdmitCardPortal = () => {
  const [queryInput, setQueryInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [admitData, setAdmitData] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [downloading, setDownloading] = useState(false);
  const [admitSettings, setAdmitSettings] = useState(DEFAULT_ADMIT_CARD_SETTINGS);

  const admitCardRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  // Load Admin Admit Card Settings & Rules
  useEffect(() => {
    getAdmitCardSettings().then((data) => {
      if (data) setAdmitSettings(data);
    });
  }, []);

  // Auto-search if query param exists
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const searchId = params.get("id") || params.get("roll") || params.get("tracking");
    if (searchId) {
      setQueryInput(searchId);
      performSearch(searchId);
    }
  }, [location.search]);

  const performSearch = async (searchTerm) => {
    const term = (searchTerm || queryInput).trim();
    if (!term) return;

    setLoading(true);
    setErrorMessage("");
    setAdmitData(null);

    try {
      const data = await searchAdmitCard(term);
      if (data) {
        setAdmitData(data);
      } else {
        setErrorMessage(
          "দুঃখিত! এই রোল নম্বর, ট্র্যাকিং আইডি বা মোবাইল নম্বরে কোনো অনুমোদিত প্রবেশপত্র পাওয়া যায়নি। অ্যাডমিন প্যানেল থেকে আবেদন অনুমোদন সাপেক্ষে প্রবেশপত্র সক্রিয় হবে।"
        );
      }
    } catch (err) {
      console.error(err);
      setErrorMessage("প্রবেশপত্র খুঁজতে সমস্যা হয়েছে। দয়া করে আবার চেষ্টা করুন।");
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    performSearch(queryInput);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadHD = async () => {
    if (!admitCardRef.current) return;
    setDownloading(true);
    try {
      await new Promise((r) => setTimeout(r, 150));
      const dataUrl = await toPng(admitCardRef.current, {
        cacheBust: true,
        pixelRatio: 2.5,
        quality: 0.98,
        backgroundColor: "#ffffff",
      });

      const link = document.createElement("a");
      link.download = `AdmitCard_${admitData.assignedRoll || admitData.trackingId || "Student"}_2025.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Admit card image download error:", err);
      alert("ছবি ডাউনলোড করতে সমস্যা হয়েছে। দয়া করে প্রিন্ট বাটন ব্যবহার করুন।");
    } finally {
      setDownloading(false);
    }
  };

  const handleWhatsAppShare = () => {
    if (!admitData) return;
    const targetRoll = admitData.assignedRoll || admitData.trackingId || "";
    const studentName = admitData.nameBn || admitData.name || "";
    const center = admitData.examCenter || admitSettings.defaultCenter;
    const date = admitData.examDate || admitSettings.defaultExamDate;
    const time = admitData.examTime || admitSettings.defaultExamTime;
    const directUrl = `${window.location.origin}/admit-card?id=${encodeURIComponent(targetRoll)}`;

    const text = `🎫 *কিশোরকণ্ঠ মেধাবৃত্তি পরীক্ষা ২০২৫ — প্রবেশপত্র*\n\n👨‍🎓 নাম: ${studentName}\n📋 রোল/আইডি: ${targetRoll}\n🏛️ কেন্দ্র: ${center}\n📅 তারিখ: ${date}\n⏰ সময়: ${time}\n\nআপনার ডিজিটাল প্রবেশপত্র ডাউনলোড ও প্রিন্ট লিংক:\n🔗 ${directUrl}`;

    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  };

  const resetSearch = () => {
    setAdmitData(null);
    setQueryInput("");
    setErrorMessage("");
    navigate("/admit-card");
  };

  return (
    <div className="min-h-screen bg-[#0b1326] text-white py-8 sm:py-12 px-3 sm:px-6 font-sans print:bg-white print:text-slate-900 print:p-0">
      <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
        
        {/* TOP HERO HEADER - Hidden on Print */}
        <div className="text-center space-y-2.5 sm:space-y-3 print:hidden">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 text-xs font-bold shadow-sm">
            <HiIdentification className="text-sm text-emerald-400" />
            <span>কিশোরকণ্ঠ মেধাবৃত্তি পরীক্ষা ২০২৫</span>
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
            অফিসিয়াল <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-400">প্রবেশপত্র (Admit Card)</span>
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto leading-relaxed font-normal">
            আপনার বরাদ্দকৃত রোল নম্বর, ট্র্যাকিং আইডি বা মোবাইল নম্বর দিয়ে সরাসরি প্রবেশপত্র ডাউনলোড ও প্রিন্ট করুন।
          </p>
        </div>

        {/* SEARCH BAR CARD - Hidden on Print */}
        <div className="p-4 sm:p-6 bg-[#14162b] border border-white/10 rounded-2xl sm:rounded-3xl shadow-2xl space-y-3.5 print:hidden">
          <form onSubmit={handleSearchSubmit} className="space-y-3">
            <label className="block text-xs sm:text-sm font-bold text-slate-300">
              রোল নম্বর / ট্র্যাকিং আইডি / মোবাইল নম্বর লিখুন:
            </label>

            <div className="flex flex-col sm:flex-row gap-2.5">
              <div className="relative flex-1">
                <HiMagnifyingGlass className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-lg" />
                <input
                  type="text"
                  value={queryInput}
                  onChange={(e) => setQueryInput(e.target.value)}
                  placeholder="যেমন: 10501 অথবা KKMB-2025-XXXXXX অথবা 017XXXXXXXX"
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#090a16] border border-white/15 text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-400 font-mono font-bold"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-xs sm:text-sm hover:scale-102 active:scale-98 transition shadow-lg shadow-emerald-500/25 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5 whitespace-nowrap"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    <span>খোঁজা হচ্ছে...</span>
                  </>
                ) : (
                  <>
                    <HiMagnifyingGlass className="text-base" />
                    <span>প্রবেশপত্র খুঁজুন</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Error Notice */}
          {errorMessage && (
            <div className="p-4 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs sm:text-sm font-bold flex items-start gap-2 content-swap">
              <HiExclamationCircle className="text-lg shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>

        {/* Lookup in flight: toolbar + card footprint, so the layout is
            already the right shape when the real admit card arrives. */}
        {loading && !admitData && (
          <SkeletonRegion label="প্রবেশপত্র খোঁজা হচ্ছে" className="space-y-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 sm:p-4 bg-[#14162b] border border-white/10 rounded-2xl">
              <Skeleton className="w-56 h-4 max-w-full rounded-full" />
              <div className="flex flex-wrap items-center w-full gap-2 sm:w-auto sm:flex-nowrap">
                <Skeleton className="w-24 h-10 rounded-xl" />
                <Skeleton className="w-24 h-10 rounded-xl" />
                <Skeleton className="w-28 h-10 rounded-xl" />
              </div>
            </div>
            <Skeleton className="w-full aspect-[1/1.3] sm:aspect-[1.414/1] rounded-2xl" />
          </SkeletonRegion>
        )}

        {/* ===================================================================
            OFFICIAL ADMIT CARD VIEW CONTAINER
            =================================================================== */}
        {admitData && (
          <div className="space-y-4 content-swap">
            
            {/* Top Toolbar Action Bar - Hidden on Print */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 sm:p-4 bg-[#14162b] border border-white/10 rounded-2xl shadow-xl print:hidden">
              <div className="flex items-center gap-2 self-start sm:self-auto">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-bold text-slate-300">
                  প্রবেশপত্র প্রস্তুত: <strong className="text-emerald-400 font-mono">{admitData.assignedRoll || admitData.trackingId}</strong>
                </span>
              </div>

              <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handlePrint}
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3 sm:px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow transition cursor-pointer whitespace-nowrap"
                >
                  <HiPrinter className="text-sm shrink-0" />
                  <span className="whitespace-nowrap">প্রিন্ট করুন</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadHD}
                  disabled={downloading}
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3 sm:px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow transition cursor-pointer disabled:opacity-50 whitespace-nowrap"
                >
                  <FaDownload className="text-xs shrink-0" />
                  <span className="whitespace-nowrap">{downloading ? "ডাউনলোড হচ্ছে..." : "ডাউনলোড"}</span>
                </button>

                <button
                  type="button"
                  onClick={handleWhatsAppShare}
                  className="inline-flex items-center justify-center gap-1.5 px-3 sm:px-4 py-2.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 font-bold text-xs sm:text-sm rounded-xl transition cursor-pointer whitespace-nowrap"
                  title="হোয়াটসঅ্যাপে লিংক পাঠান"
                >
                  <FaWhatsapp className="text-sm shrink-0" />
                  <span className="whitespace-nowrap">WhatsApp</span>
                </button>

                <button
                  type="button"
                  onClick={resetSearch}
                  className="inline-flex items-center justify-center gap-1 px-3 py-2.5 bg-white/[0.08] text-slate-300 hover:text-white font-bold text-xs sm:text-sm rounded-xl hover:bg-white/[0.15] transition cursor-pointer shrink-0 whitespace-nowrap"
                  title="অন্য রোল নম্বর খুঁজুন"
                >
                  <HiArrowPath className="text-sm shrink-0" />
                  <span className="whitespace-nowrap">অন্য রোল</span>
                </button>
              </div>
            </div>

            {/* ===================================================================
                RESPONSIVE MOBILE-FRIENDLY ADMIT CARD CANVAS (Clean Single Card)
                =================================================================== */}
            <div className="w-full overflow-hidden">
              <div
                ref={admitCardRef}
                id="admit-card-canvas"
                className="w-full bg-white text-slate-900 p-4 sm:p-7 shadow-2xl border-2 border-sky-300/80 rounded-2xl relative overflow-hidden print:shadow-none print:border-none print:p-2 print:m-0 print:rounded-none print:w-full space-y-4"
              >
                
                {/* Decorative Subtle Background Watermark */}
                <div className="absolute -top-8 -right-8 w-36 h-36 rounded-full bg-sky-100/50 blur-[1px] pointer-events-none flex items-center justify-center text-sky-400/20 text-7xl font-sans select-none">
                  🌐
                </div>

                {/* =========================================================
                    TOP HEADER ROW: LOGO, TITLE, CAPSULE & ROLL/PHOTO
                    ========================================================= */}
                <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-3 relative z-10 border-b border-slate-200 pb-3">
                  
                  {/* Left: Trophy + Title */}
                  <div className="flex items-center gap-2.5 sm:gap-3 text-center sm:text-left">
                    {/* Golden Trophy */}
                    <div className="w-11 h-13 sm:w-14 sm:h-16 flex flex-col items-center justify-center bg-gradient-to-b from-amber-200 via-amber-400 to-amber-500 rounded-xl border border-amber-400 shrink-0 text-slate-950 font-black p-1 text-center shadow-sm">
                      <FaTrophy className="text-xl sm:text-2xl text-slate-950" />
                      <span className="text-[7px] sm:text-[8px] font-black uppercase tracking-tighter leading-none mt-0.5">
                        কিশোরকণ্ঠ
                      </span>
                    </div>

                    {/* Title Typography */}
                    <div className="leading-tight">
                      <div className="text-indigo-900 font-black text-base sm:text-2xl tracking-tight">
                        নতুন কিশোরকণ্ঠ
                      </div>
                      <div className="flex items-center justify-center sm:justify-start gap-1.5 mt-0.5">
                        <span className="text-rose-700 font-black text-lg sm:text-3xl tracking-tight">
                          মেধাবৃত্তি পরীক্ষা
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-indigo-900 text-white font-black text-xs sm:text-sm font-mono">
                          ২০২৫
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Center: Red Capsule Badge */}
                  <div className="flex items-center gap-1.5 self-center">
                    <span className="w-2 h-2 rounded-full bg-rose-600 animate-pulse" />
                    <span className="px-4 py-1 rounded-full bg-rose-600 text-white font-black text-xs sm:text-sm tracking-wider uppercase shadow-sm">
                      প্রবেশপত্র
                    </span>
                    <span className="w-2 h-2 rounded-full bg-rose-600 animate-pulse" />
                  </div>

                  {/* Right: Roll Box & Stamp Photo */}
                  <div className="flex items-center gap-2.5 shrink-0">
                    {/* Roll Box */}
                    <div className="text-right">
                      <span className="text-[11px] sm:text-xs font-black text-slate-800 block mb-0.5">
                        বৃত্তি রোল :
                      </span>
                      <div className="w-20 sm:w-28 h-8 sm:h-9 bg-slate-50 border-2 border-slate-300 rounded-lg flex items-center justify-center font-mono font-black text-sm sm:text-lg text-rose-700 shadow-inner">
                        {admitData.assignedRoll || admitData.roll || "—"}
                      </div>
                    </div>

                    {/* Stamp Photo Box */}
                    <div className="w-14 h-18 sm:w-20 sm:h-24 bg-slate-50 border-2 border-slate-300 rounded-xl overflow-hidden flex flex-col items-center justify-center text-center p-0.5 shrink-0 shadow-sm">
                      {admitData.photoUrl ? (
                        <img
                          src={admitData.photoUrl}
                          alt="Candidate"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-slate-400 space-y-0.5">
                          <HiUser className="text-xl sm:text-2xl mx-auto" />
                          <span className="text-[7px] sm:text-[8px] font-bold text-slate-500 block leading-tight">
                            স্ট্যাম্প সাইজ ছবি
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* =========================================================
                    CANDIDATE DETAILS (Clean Grid with Dotted Guides)
                    ========================================================= */}
                <div className="space-y-2 text-xs sm:text-sm font-bold text-slate-900 relative z-10 pt-1">
                  
                  {/* Line 1: Name & Mobile */}
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-1.5 sm:gap-2">
                    <div className="sm:col-span-8 flex items-baseline min-w-0">
                      <span className="shrink-0 text-slate-800 font-bold">পরীক্ষার্থীর নাম :</span>
                      <span className="font-black text-slate-950 px-1.5 text-xs sm:text-base truncate">
                        {admitData.nameBn || admitData.name}
                      </span>
                      <span className="flex-1 border-b border-dotted border-slate-400 min-w-[10px]" />
                    </div>
                    <div className="sm:col-span-4 flex items-baseline">
                      <span className="shrink-0 text-slate-800 font-bold">মোবাইল :</span>
                      <span className="font-mono font-bold px-1.5 text-slate-950 text-xs sm:text-sm truncate">
                        {admitData.whatsappNumber || admitData.mobile || admitData.guardianPhone || "—"}
                      </span>
                      <span className="flex-1 border-b border-dotted border-slate-400 min-w-[10px]" />
                    </div>
                  </div>

                  {/* Line 2: Father & Mother Name */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 sm:gap-2">
                    <div className="flex items-baseline min-w-0">
                      <span className="shrink-0 text-slate-800 font-bold">পিতার নাম :</span>
                      <span className="font-bold text-slate-950 px-1.5 truncate">
                        {admitData.fatherName || admitData.father || "—"}
                      </span>
                      <span className="flex-1 border-b border-dotted border-slate-400 min-w-[10px]" />
                    </div>
                    <div className="flex items-baseline min-w-0">
                      <span className="shrink-0 text-slate-800 font-bold">মাতার নাম :</span>
                      <span className="font-bold text-slate-950 px-1.5 truncate">
                        {admitData.motherName || "—"}
                      </span>
                      <span className="flex-1 border-b border-dotted border-slate-400 min-w-[10px]" />
                    </div>
                  </div>

                  {/* Line 3: Institution, Class, Section, Class Roll */}
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-1.5 sm:gap-2">
                    <div className="sm:col-span-6 flex items-baseline min-w-0">
                      <span className="shrink-0 text-slate-800 font-bold">প্রতিষ্ঠানের নাম :</span>
                      <span className="font-bold text-slate-950 px-1.5 truncate">
                        {admitData.institution || admitData.school}
                      </span>
                      <span className="flex-1 border-b border-dotted border-slate-400 min-w-[10px]" />
                    </div>

                    <div className="sm:col-span-2 flex items-baseline">
                      <span className="shrink-0 text-slate-800 font-bold">শ্রেণি :</span>
                      <span className="font-bold px-1.5 text-slate-950">
                        {admitData.studentClass || admitData.class}
                      </span>
                      <span className="flex-1 border-b border-dotted border-slate-400 min-w-[5px]" />
                    </div>

                    <div className="sm:col-span-2 flex items-baseline">
                      <span className="shrink-0 text-slate-800 font-bold">শাখা :</span>
                      <span className="font-bold px-1.5 text-slate-950">
                        {admitData.section || admitData.sectionGroup || "ক"}
                      </span>
                      <span className="flex-1 border-b border-dotted border-slate-400 min-w-[5px]" />
                    </div>

                    <div className="sm:col-span-2 flex items-baseline">
                      <span className="shrink-0 text-slate-800 font-bold">ক্লাস রোল :</span>
                      <span className="font-mono font-bold px-1.5 text-slate-950">
                        {admitData.classRoll || "—"}
                      </span>
                      <span className="flex-1 border-b border-dotted border-slate-400 min-w-[5px]" />
                    </div>
                  </div>
                </div>

                {/* =========================================================
                    SCHEDULE & EXAM CENTER SECTION (Single Elegant Card)
                    ========================================================= */}
                <div className="rounded-xl border-2 border-slate-300/90 overflow-hidden text-slate-900 space-y-0 relative z-10 shadow-sm">
                  
                  {/* Exam Center Header */}
                  <div className="bg-slate-100/90 px-3.5 py-2 flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-slate-300">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="font-black text-xs sm:text-sm text-slate-900 shrink-0">
                        পরীক্ষা কেন্দ্র :
                      </span>
                      <span className="font-black text-indigo-900 text-xs sm:text-sm">
                        {admitData.examCenter || admitSettings.defaultCenter}
                      </span>
                    </div>
                    <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 italic shrink-0">
                      (অফিস কর্তৃক পূরণীয়)
                    </span>
                  </div>

                  {/* Red Schedule Header Bar */}
                  <div className="bg-rose-600 text-white font-black text-center py-1 text-xs sm:text-sm tracking-wide">
                    পরীক্ষার সময়সূচী
                  </div>

                  {/* Table */}
                  <table className="w-full text-center text-xs sm:text-sm border-collapse bg-white">
                    <thead>
                      <tr className="bg-slate-50 text-slate-800 font-bold border-b border-slate-200">
                        <th className="py-1.5 px-2 border-r border-slate-200 w-1/2">তারিখ ও বার</th>
                        <th className="py-1.5 px-2 w-1/2">সময়</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-slate-200 font-bold text-slate-900">
                        <td className="py-2 px-2 border-r border-slate-200 text-xs sm:text-sm">
                          {admitData.examDate || admitSettings.defaultExamDate}
                        </td>
                        <td className="py-2 px-2 text-rose-700 font-black text-xs sm:text-sm">
                          {admitData.examTime || admitSettings.defaultExamTime}
                        </td>
                      </tr>
                      <tr className="bg-amber-50/60 font-bold text-[10px] sm:text-xs text-slate-800">
                        <td colSpan={2} className="py-1.5 px-2">
                          <span className="text-slate-600 font-normal">বিষয়সমূহ: </span>
                          <span className="font-bold text-slate-900">
                            {admitData.examSubjects || admitSettings.defaultSubjects}
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* =========================================================
                    OFFICIAL EXAM RULES
                    ========================================================= */}
                <div className="mt-2 pt-2.5 border-t border-slate-200 space-y-2">
                  <div className="flex items-center justify-center">
                    <span className="px-3.5 py-0.5 rounded-full bg-slate-900 text-white font-black text-[11px] sm:text-xs tracking-wide">
                      পরীক্ষা সংক্রান্ত সাধারণ নিয়মাবলি
                    </span>
                  </div>

                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-[10px] sm:text-[11px] text-slate-800 leading-relaxed font-semibold">
                    {(admitSettings.rules || DEFAULT_ADMIT_CARD_SETTINGS.rules).map((rule, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-rose-600 font-bold text-xs shrink-0 mt-0.5">■</span>
                        <span>{rule}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Signatures & Seal Footer */}
                  <div className="pt-3 border-t border-slate-200 flex items-end justify-between text-center text-xs">
                    <div className="space-y-0.5">
                      <div className="w-20 sm:w-28 border-b border-slate-500 mx-auto" />
                      <span className="text-[9px] sm:text-[10px] text-slate-600 block">
                        পরীক্ষার্থীর স্বাক্ষর
                      </span>
                    </div>

                    {/* Official Seal Stamp */}
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full border-2 border-dashed border-rose-600 flex flex-col items-center justify-center text-center p-0.5 text-[6px] sm:text-[7px] font-black text-rose-700 uppercase shrink-0">
                      <span>{admitSettings.sealText1 || "SEAL"}</span>
                      <span className="text-[8px] sm:text-[9px]">{admitSettings.sealText2 || "KKMB"}</span>
                      <span>{admitSettings.sealText3 || "SYLHET"}</span>
                    </div>

                    <div className="space-y-0.5">
                      <div className="w-20 sm:w-28 border-b border-slate-500 mx-auto" />
                      <span className="text-[9px] sm:text-[10px] font-bold text-slate-900 block">
                        {admitSettings.controllerTitle || "পরীক্ষা নিয়ন্ত্রক"}
                      </span>
                      <span className="text-[8px] text-slate-500 block">
                        {admitSettings.organizationTitle || "কিশোরকণ্ঠ পরিষদ"}
                      </span>
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

export default AdmitCardPortal;
