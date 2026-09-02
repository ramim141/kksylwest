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
import { QRCodeSVG } from "qrcode.react";
import { searchAdmitCard, getAdmitCardSettings, DEFAULT_ADMIT_CARD_SETTINGS } from "../../services/firestore";
import { Skeleton, SkeletonRegion } from "../common";
import { useExamYear } from "../../context/ExamYearContext";
import { useBranding } from "../../context/BrandingContext";
import kkmLogo from "../../assets/images/KKM LOGO.png";
import examControllerSign from "../../assets/images/exam_controller.png";

const AdmitCardPortal = () => {
  const examYear = useExamYear();
  const { getLogoFor } = useBranding();
  const currentLogo = getLogoFor("admitCard") || kkmLogo;
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
      const node = admitCardRef.current;
      const dataUrl = await toPng(node, {
        cacheBust: true,
        pixelRatio: 2.5,
        quality: 0.98,
        backgroundColor: "#ffffff",
        width: node.offsetWidth,
        height: node.offsetHeight,
        style: {
          margin: "0",
          transform: "none",
          left: "0",
          top: "0",
        },
      });

      const link = document.createElement("a");
      link.download = `AdmitCard_${admitData.assignedRoll || admitData.trackingId || "Student"}_2025.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.warn("Retrying download with skipFonts fallback:", err);
      try {
        const node = admitCardRef.current;
        const fallbackUrl = await toPng(node, {
          pixelRatio: 2.2,
          quality: 0.95,
          backgroundColor: "#ffffff",
          skipFonts: true,
          width: node?.offsetWidth,
          height: node?.offsetHeight,
          style: {
            margin: "0",
            transform: "none",
            left: "0",
            top: "0",
          },
        });
        const link = document.createElement("a");
        link.download = `AdmitCard_${admitData.assignedRoll || admitData.trackingId || "Student"}_2025.png`;
        link.href = fallbackUrl;
        link.click();
      } catch (e) {
        console.error("Admit card image download error:", e);
        alert("ছবি ডাউনলোড করতে সমস্যা হয়েছে। দয়া করে প্রিন্ট বাটন ব্যবহার করুন।");
      }
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
    const rawTime = admitData.examTime || admitSettings.defaultExamTime || "সকাল ১০:০০ টা - ১১:০০ টা";
    const time = rawTime.replace(/১১:৩০/g, "১১:০০");
    const directUrl = `${window.location.origin}/admit-card?id=${encodeURIComponent(targetRoll)}`;

    const text = `🎫 *কিশোরকণ্ঠ মেধাবৃত্তি পরীক্ষা ${examYear} — প্রবেশপত্র*\n\n👨‍🎓 নাম: ${studentName}\n📋 রোল/আইডি: ${targetRoll}\n🏛️ কেন্দ্র: ${center}\n📅 তারিখ: ${date}\n⏰ সময়: ${time}\n\nআপনার ডিজিটাল প্রবেশপত্র ডাউনলোড ও প্রিন্ট লিংক:\n🔗 ${directUrl}`;

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
            <span>কিশোরকণ্ঠ মেধাবৃত্তি পরীক্ষা {examYear}</span>
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
            <div className="p-4 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs sm:text-sm font-bold flex items-start gap-2.5 content-swap">
              <HiExclamationCircle className="text-lg shrink-0 mt-0.5 text-rose-400" />
              <p className="text-justify leading-relaxed flex-1">{errorMessage}</p>
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
            <div className="flex items-center justify-between gap-2 p-3 sm:p-4 bg-[#14162b] border border-white/10 rounded-2xl shadow-xl print:hidden">
              <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                <span className="text-[11px] sm:text-xs font-bold text-slate-300 truncate">
                  প্রবেশপত্র প্রস্তুত: <strong className="text-emerald-400 font-mono">{admitData.assignedRoll || admitData.trackingId}</strong>
                </span>
              </div>

              <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handlePrint}
                  className="p-2.5 sm:px-4 sm:py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow transition cursor-pointer flex items-center justify-center gap-1.5"
                  title="প্রিন্ট করুন"
                >
                  <HiPrinter className="text-base sm:text-sm shrink-0" />
                  <span className="hidden sm:inline whitespace-nowrap">প্রিন্ট করুন</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadHD}
                  disabled={downloading}
                  className="p-2.5 sm:px-4 sm:py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow transition cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
                  title="এইচডি প্রবেশপত্র ডাউনলোড করুন"
                >
                  <FaDownload className="text-sm sm:text-xs shrink-0" />
                  <span className="hidden sm:inline whitespace-nowrap">{downloading ? "ডাউনলোড হচ্ছে..." : "ডাউনলোড"}</span>
                </button>

                <button
                  type="button"
                  onClick={handleWhatsAppShare}
                  className="p-2.5 sm:px-4 sm:py-2.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 font-bold text-xs sm:text-sm rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5"
                  title="হোয়াটসঅ্যাপে লিংক পাঠান"
                >
                  <FaWhatsapp className="text-base sm:text-sm shrink-0" />
                  <span className="hidden sm:inline whitespace-nowrap">WhatsApp</span>
                </button>

                <button
                  type="button"
                  onClick={resetSearch}
                  className="p-2.5 sm:px-3 sm:py-2.5 bg-white/[0.08] text-slate-300 hover:text-white font-bold text-xs sm:text-sm rounded-xl hover:bg-white/[0.15] transition cursor-pointer shrink-0 flex items-center justify-center gap-1"
                  title="অন্য রোল নম্বর খুঁজুন"
                >
                  <HiArrowPath className="text-base sm:text-sm shrink-0" />
                  <span className="hidden sm:inline whitespace-nowrap">অন্য রোল</span>
                </button>
              </div>
            </div>

            {/* ===================================================================
                FIXED A4 PROPORTION ADMIT CARD CANVAS (Scrollable on small mobile)
                =================================================================== */}
            <div className="w-full overflow-x-auto pb-4 scrollbar-thin flex justify-center">
              <div
                ref={admitCardRef}
                id="admit-card-canvas"
                className="w-[750px] min-w-[750px] max-w-[750px] shrink-0 bg-white text-slate-900 p-6 sm:p-7 shadow-2xl border-2 border-sky-300/80 rounded-2xl relative overflow-hidden print:shadow-none print:border-none print:p-2 print:m-0 print:rounded-none print:w-full space-y-3.5"
                style={{
                  fontFamily: "'Hind Siliguri', 'Anek Bangla', 'Noto Sans Bengali', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                }}
              >
                
                {/* Decorative Subtle Background Watermark */}
                <div className="absolute -top-8 -right-8 w-36 h-36 rounded-full bg-sky-100/50 blur-[1px] pointer-events-none flex items-center justify-center text-sky-400/20 text-7xl font-sans select-none">
                  🌐
                </div>

                {/* =========================================================
                    TOP HEADER ROW: CUSTOM BRAND LOGO & PHOTO / ROLL STACK
                    ========================================================= */}
                <div className="flex items-start justify-between gap-4 relative z-10 pb-1">
                  
                  {/* Left: Official Custom Brand Title Logo */}
                  <div className="flex items-center pl-2">
                    <img
                      src={currentLogo}
                      alt="নতুন কিশোরকণ্ঠ মেধাবৃত্তি পরীক্ষা"
                      className="h-32 sm:h-36 md:h-40 w-auto max-w-full object-contain drop-shadow-sm"
                    />
                  </div>

                  {/* Right: Vertical Stack of Stamp Photo & Roll Pill */}
                  <div className="flex flex-col items-center gap-1.5 shrink-0 pr-2 pt-1">
                    {/* Stamp Photo Box */}
                    <div className="w-20 h-24 bg-slate-50 border-2 border-slate-300 rounded-2xl overflow-hidden flex flex-col items-center justify-center text-center p-0.5 shrink-0 shadow-sm">
                      {admitData.photoUrl ? (
                        <img
                          src={admitData.photoUrl}
                          alt="Candidate"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-slate-400 space-y-0.5">
                          <HiUser className="text-2xl mx-auto" />
                          <span className="text-[8px] font-bold text-slate-500 block leading-tight">
                            স্ট্যাম্প সাইজ ছবি
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Roll Label & Rounded Pill */}
                    <div className="text-center space-y-0.5">
                      <span className="text-[11px] font-black text-slate-800 block">
                        বৃত্তি রোল :
                      </span>
                      <div className="px-4 py-1 bg-slate-50 border-2 border-slate-300 rounded-full flex items-center justify-center font-mono font-black text-base text-rose-700 shadow-inner min-w-[100px]">
                        {admitData.assignedRoll || admitData.roll || "—"}
                      </div>
                    </div>
                  </div>
                </div>

                {/* =========================================================
                    DEDICATED FULL-WIDTH DIVIDER & • প্রবেশপত্র • BADGE
                    ========================================================= */}
                <div className="relative flex items-center justify-center py-1.5 z-10">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-rose-300" />
                  </div>
                  <div className="relative px-7 py-1 rounded-full bg-rose-600 text-white font-black text-xs sm:text-sm tracking-wider shadow-sm flex items-center gap-2 select-none">
                    <span className="text-xs">•</span>
                    <span>প্রবেশপত্র</span>
                    <span className="text-xs">•</span>
                  </div>
                </div>

                {/* =========================================================
                    CANDIDATE DETAILS (Robust Fixed-Width Grid with Clean Underlines)
                    ========================================================= */}
                <div className="space-y-2 text-[13px] font-bold text-slate-900 relative z-10 pt-1">
                  
                  {/* Line 1: Name & Mobile */}
                  <div className="flex items-center gap-4">
                    <div className="flex-[7] flex items-baseline border-b border-dotted border-slate-400 pb-0.5 min-w-0">
                      <span className="shrink-0 text-slate-800 font-bold mr-1.5 whitespace-nowrap">পরীক্ষার্থীর নাম :</span>
                      <span className="font-black text-slate-950 text-[15px] truncate">
                        {admitData.nameBn || admitData.name}
                      </span>
                    </div>
                    <div className="flex-[5] flex items-baseline border-b border-dotted border-slate-400 pb-0.5 min-w-0">
                      <span className="shrink-0 text-slate-800 font-bold mr-1.5 whitespace-nowrap">মোবাইল :</span>
                      <span className="font-mono font-bold text-slate-950 text-xs truncate">
                        {admitData.whatsappNumber || admitData.mobile || admitData.guardianPhone || "—"}
                      </span>
                    </div>
                  </div>

                  {/* Line 2: Father & Mother Name */}
                  <div className="flex items-center gap-4">
                    <div className="flex-1 flex items-baseline border-b border-dotted border-slate-400 pb-0.5 min-w-0">
                      <span className="shrink-0 text-slate-800 font-bold mr-1.5 whitespace-nowrap">পিতার নাম :</span>
                      <span className="font-bold text-slate-950 text-xs truncate">
                        {admitData.fatherName || admitData.father || "—"}
                      </span>
                    </div>
                    <div className="flex-1 flex items-baseline border-b border-dotted border-slate-400 pb-0.5 min-w-0">
                      <span className="shrink-0 text-slate-800 font-bold mr-1.5 whitespace-nowrap">মাতার নাম :</span>
                      <span className="font-bold text-slate-950 text-xs truncate">
                        {admitData.motherName || "—"}
                      </span>
                    </div>
                  </div>

                  {/* Line 3: Institution, Class, Section, Class Roll */}
                  <div className="flex items-center gap-3">
                    <div className="flex-[5] flex items-baseline border-b border-dotted border-slate-400 pb-0.5 min-w-0">
                      <span className="shrink-0 text-slate-800 font-bold mr-1.5 whitespace-nowrap">প্রতিষ্ঠানের নাম :</span>
                      <span className="font-bold text-slate-950 text-xs truncate">
                        {admitData.institution || admitData.school}
                      </span>
                    </div>

                    <div className="flex-[1.5] flex items-baseline border-b border-dotted border-slate-400 pb-0.5 min-w-0">
                      <span className="shrink-0 text-slate-800 font-bold mr-1 whitespace-nowrap">শ্রেণি :</span>
                      <span className="font-bold text-slate-950 text-xs truncate">
                        {admitData.studentClass || admitData.class}
                      </span>
                    </div>

                    <div className="flex-[1.3] flex items-baseline border-b border-dotted border-slate-400 pb-0.5 min-w-0">
                      <span className="shrink-0 text-slate-800 font-bold mr-1 whitespace-nowrap">শাখা :</span>
                      <span className="font-bold text-slate-950 text-xs truncate">
                        {admitData.section || admitData.sectionGroup || "ক"}
                      </span>
                    </div>

                    <div className="flex-[1.7] flex items-baseline border-b border-dotted border-slate-400 pb-0.5 min-w-0">
                      <span className="shrink-0 text-slate-800 font-bold mr-1 whitespace-nowrap">ক্লাস রোল :</span>
                      <span className="font-mono font-bold text-slate-950 text-xs truncate">
                        {admitData.classRoll || "—"}
                      </span>
                    </div>
                  </div>

                  {/* Line 4: Union & Thana / Upazila */}
                  <div className="flex items-center gap-4">
                    <div className="flex-1 flex items-baseline border-b border-dotted border-slate-400 pb-0.5 min-w-0">
                      <span className="shrink-0 text-slate-800 font-bold mr-1.5 whitespace-nowrap">ইউনিয়ন :</span>
                      <span className="font-bold text-slate-950 text-xs truncate">
                        {admitData.union || "—"}
                      </span>
                    </div>
                    <div className="flex-1 flex items-baseline border-b border-dotted border-slate-400 pb-0.5 min-w-0">
                      <span className="shrink-0 text-slate-800 font-bold mr-1.5 whitespace-nowrap">থানা / উপজেলা :</span>
                      <span className="font-bold text-slate-950 text-xs truncate">
                        {admitData.thana || admitData.upazila || "—"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* =========================================================
                    SCHEDULE & EXAM CENTER SECTION (Single Elegant Card)
                    ========================================================= */}
                <div className="rounded-xl border-2 border-slate-300/90 overflow-hidden text-slate-900 space-y-0 relative z-10 shadow-sm">
                  
                  {/* Exam Center Header */}
                  <div className="bg-slate-100/90 px-3.5 py-2 flex items-center justify-between gap-1 border-b border-slate-300">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="font-black text-xs sm:text-sm text-slate-900 shrink-0">
                        পরীক্ষা কেন্দ্র :
                      </span>
                      <span className="font-black text-indigo-900 text-xs sm:text-sm">
                        {admitData.examCenter || admitSettings.defaultCenter}
                      </span>
                    </div>
                    <span className="text-[11px] font-bold text-slate-500 italic shrink-0">
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
                          {(admitData.examTime || admitSettings.defaultExamTime || "সকাল ১০:০০ টা - ১১:০০ টা").replace(/১১:৩০/g, "১১:০০")}
                        </td>
                      </tr>
                      <tr className="bg-amber-50/60 font-bold text-[11px] sm:text-xs text-slate-800">
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
                <div className="mt-2 pt-2 border-t border-slate-200 space-y-2">
                  <div className="text-center">
                    <span className="inline-block px-5 py-0.5 rounded-full bg-slate-900 text-white font-black text-xs tracking-wide">
                      পরীক্ষা সংক্রান্ত সাধারণ নিয়মাবলি
                    </span>
                  </div>

                  <ul className="grid grid-cols-2 gap-x-6 gap-y-1 text-[11px] text-slate-800 leading-relaxed font-semibold">
                    {(admitSettings.rules || DEFAULT_ADMIT_CARD_SETTINGS.rules).map((rule, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-rose-600 font-bold text-xs shrink-0 mt-0.5">■</span>
                        <span className="leading-snug">{rule}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Signatures & Seal Footer */}
                  <div className="pt-3 border-t border-slate-200 flex items-end justify-between text-center text-xs">
                    <div className="space-y-0.5">
                      <div className="w-24 sm:w-28 border-b border-slate-500 mx-auto" />
                      <span className="text-[10px] text-slate-600 block">
                        পরীক্ষার্থীর স্বাক্ষর
                      </span>
                    </div>

                    {/* Official QR Code Verification */}
                    <div className="flex flex-col items-center justify-center text-center shrink-0">
                      <QRCodeSVG
                        value={
                          typeof window !== "undefined"
                            ? `${window.location.origin}/admit-card?id=${encodeURIComponent(
                                admitData.assignedRoll || admitData.roll || admitData.trackingId || ""
                              )}`
                            : ""
                        }
                        size={56}
                        level="M"
                        includeMargin={false}
                      />
                      <span className="text-[9px] font-black text-emerald-700 mt-1 tracking-tight flex items-center gap-0.5">
                        <span className="text-[10px]">✓</span> VERIFIED ADMIT
                      </span>
                    </div>

                    <div className="flex flex-col items-center justify-end">
                      <img
                        src={admitSettings.controllerSignatureUrl || examControllerSign}
                        alt="পরীক্ষা নিয়ন্ত্রকের স্বাক্ষর"
                        className="h-7 sm:h-9 w-auto max-w-[110px] object-contain -mb-1"
                      />
                      <div className="w-24 sm:w-28 border-b border-slate-500 mx-auto" />
                      <span className="text-[10px] font-bold text-slate-900 block mt-0.5">
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
