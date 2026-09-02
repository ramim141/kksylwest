import React, { useState, useEffect, useMemo } from "react";
import {
  HiPrinter,
  HiMagnifyingGlass,
  HiArrowPath,
  HiIdentification,
  HiDocumentDuplicate,
  HiUser,
  HiAcademicCap,
  HiArrowDownTray,
} from "react-icons/hi2";
import { QRCodeSVG } from "qrcode.react";
import { jsPDF } from "jspdf";
import { toJpeg } from "html-to-image";
import {
  getRegistrations,
  getExamCenters,
  getAdmitCardSettings,
  DEFAULT_ADMIT_CARD_SETTINGS,
} from "../../../services/firestore";
import { useBranding } from "../../../context/BrandingContext";
import { useExamYear } from "../../../context/ExamYearContext";
import { Button, Chip, EmptyState, LoadingState, Toast } from "../ui";
import kkmLogo from "../../../assets/images/KKM LOGO.png";
import examControllerSign from "../../../assets/images/exam_controller.png";

const CLASSES = [
  "৪র্থ শ্রেণি",
  "৫ম শ্রেণি",
  "৬ষ্ঠ শ্রেণি",
  "৭ম শ্রেণি",
  "৮ম শ্রেণি",
  "৯ম শ্রেণি",
  "১০ম শ্রেণি",
];

const toBnDigits = (num) => {
  if (num === null || num === undefined) return "০";
  const enToBn = {
    0: "০", 1: "১", 2: "২", 3: "৩", 4: "৪",
    5: "৫", 6: "৬", 7: "৭", 8: "৮", 9: "৯",
  };
  return String(num).replace(/[0-9]/g, (d) => enToBn[d] || d);
};

const toEnDigits = (str) => {
  if (!str) return "";
  const bnToEn = {
    "০": "0", "১": "1", "২": "2", "৩": "3", "৪": "4",
    "৫": "5", "৬": "6", "৭": "7", "৮": "8", "৯": "9",
  };
  return String(str).replace(/[০-৯]/g, (d) => bnToEn[d] || d);
};

/* ===================================================================
   ADMIT CARD FRONT SIDE COMPONENT (এপিঠ)
   Matches Image 2 Exactly:
   - Left: Big Official Brand Logo
   - Right: Top Photo (w-20 h-24) -> 'বৃত্তি রোল :' -> Rounded Pill Roll Box
   - Red Pill • প্রবেশপত্র • over horizontal line
   - Dotted Underline Information Rows
   - Exam Center & Schedule Table
   =================================================================== */
const AdmitCardFront = ({ student, logo, admitSettings }) => {
  if (!student) {
    return (
      <div className="w-full h-full border-2 border-dashed border-slate-300 rounded-2xl flex items-center justify-center bg-slate-50/50 text-slate-400 text-xs">
        (খালি স্থান)
      </div>
    );
  }

  const rollDisplay = student.assignedRoll || student.roll || "—";
  const centerName = student.examCenter || admitSettings.defaultCenter || "সিলেট সরকারি আলিয়া মাদরাসা কেন্দ্র, সিলেট";
  const examDate = student.examDate || admitSettings.defaultExamDate || "২৪ অক্টোবর ২০২৫ (শুক্রবার)";
  const rawExamTime = student.examTime || admitSettings.defaultExamTime || "সকাল ১০:০০ টা - ১১:০০ টা";
  const examTime = rawExamTime.replace(/১১:৩০/g, "১১:০০");
  const subjects = student.examSubjects || admitSettings.defaultSubjects || "বাংলা, ইংরেজি, গণিত, বিজ্ঞান, সাধারণ জ্ঞান";

  return (
    <div
      className="w-full h-full bg-white text-slate-900 px-6 sm:px-7 py-4 sm:py-5 flex flex-col justify-between relative overflow-hidden border-2 border-sky-300/80 rounded-2xl shadow-sm box-sizing-border"
      style={{
        fontFamily:
          "'Hind Siliguri', 'Anek Bangla', 'Noto Sans Bengali', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      }}
    >
      {/* Decorative Subtle Watermark */}
      <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full bg-sky-100/40 pointer-events-none flex items-center justify-center text-sky-400/20 text-7xl select-none">
        🌐
      </div>

      {/* TOP HEADER ROW: LOGO & PHOTO / ROLL STACK */}
      <div className="flex items-start justify-between gap-4 relative z-10 pb-0.5">
        {/* Left: Brand Logo (Slightly bigger and shifted right) */}
        <div className="flex items-center pl-3 sm:pl-5 pt-0.5">
          <img
            src={logo || kkmLogo}
            alt="কিশোরকণ্ঠ মেধাবৃত্তি পরীক্ষা"
            className="h-28 sm:h-32 md:h-34 w-auto max-w-[300px] object-contain drop-shadow-sm"
          />
        </div>

        {/* Right: Vertical Stack of Stamp Photo & Roll Pill */}
        <div className="flex flex-col items-center gap-1.5 shrink-0 pr-1 pt-0.5">
          {/* Stamp Photo Box */}
          <div className="w-18 h-22 sm:w-20 sm:h-24 bg-slate-50 border-2 border-slate-300 rounded-2xl overflow-hidden flex flex-col items-center justify-center text-center p-0.5 shrink-0 shadow-sm">
            {student.photoUrl ? (
              <img
                src={student.photoUrl}
                alt="Candidate"
                className="w-full h-full object-cover rounded-xl"
              />
            ) : (
              <div className="text-slate-400 space-y-0.5">
                <HiUser className="text-2xl mx-auto text-slate-400" />
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
            <div className="px-4 py-0.5 bg-slate-50 border-2 border-slate-300 rounded-full flex items-center justify-center font-bold text-sm sm:text-base text-rose-700 shadow-inner min-w-[100px]">
              {toBnDigits(rollDisplay)}
            </div>
          </div>
        </div>
      </div>

      {/* DEDICATED DIVIDER & • প্রবেশপত্র • BADGE */}
      <div className="relative flex items-center justify-center py-1 z-10">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-rose-300" />
        </div>
        <div className="relative px-7 py-0.5 rounded-full bg-rose-600 text-white font-black text-xs sm:text-sm tracking-wider shadow-sm flex items-center gap-2 select-none">
          <span className="text-xs">•</span>
          <span>প্রবেশপত্র</span>
          <span className="text-xs">•</span>
        </div>
      </div>

      {/* CANDIDATE DETAILS GRID WITH DOTTED UNDERLINES */}
      <div className="space-y-1.5 text-[12px] font-bold text-slate-900 relative z-10">
        {/* Line 1: Name & Mobile */}
        <div className="flex items-center gap-3">
          <div className="flex-[7] flex items-baseline border-b border-dotted border-slate-400 pb-0.5 min-w-0">
            <span className="shrink-0 text-slate-800 font-bold mr-1.5 whitespace-nowrap">
              পরীক্ষার্থীর নাম :
            </span>
            <span className="font-black text-slate-950 text-[13.5px] truncate">
              {student.nameBn || student.name || "—"}
            </span>
          </div>
          <div className="flex-[5] flex items-baseline border-b border-dotted border-slate-400 pb-0.5 min-w-0">
            <span className="shrink-0 text-slate-800 font-bold mr-1.5 whitespace-nowrap">
              মোবাইল :
            </span>
            <span className="font-mono font-bold text-slate-950 text-xs truncate">
              {student.whatsappNumber || student.mobile || student.guardianPhone || "—"}
            </span>
          </div>
        </div>

        {/* Line 2: Father & Mother Name */}
        <div className="flex items-center gap-3">
          <div className="flex-1 flex items-baseline border-b border-dotted border-slate-400 pb-0.5 min-w-0">
            <span className="shrink-0 text-slate-800 font-bold mr-1.5 whitespace-nowrap">
              পিতার নাম :
            </span>
            <span className="font-bold text-slate-950 text-[12px] truncate">
              {student.fatherName || student.father || "—"}
            </span>
          </div>
          <div className="flex-1 flex items-baseline border-b border-dotted border-slate-400 pb-0.5 min-w-0">
            <span className="shrink-0 text-slate-800 font-bold mr-1.5 whitespace-nowrap">
              মাতার নাম :
            </span>
            <span className="font-bold text-slate-950 text-[12px] truncate">
              {student.motherName || student.mother || "—"}
            </span>
          </div>
        </div>

        {/* Line 3: Institution, Class, Section, Class Roll */}
        <div className="flex items-center gap-2.5">
          <div className="flex-[5] flex items-baseline border-b border-dotted border-slate-400 pb-0.5 min-w-0">
            <span className="shrink-0 text-slate-800 font-bold mr-1.5 whitespace-nowrap">
              প্রতিষ্ঠানের নাম :
            </span>
            <span className="font-bold text-slate-950 text-[11.5px] truncate">
              {student.institution || student.school || "—"}
            </span>
          </div>

          <div className="flex-[1.6] flex items-baseline border-b border-dotted border-slate-400 pb-0.5 min-w-0">
            <span className="shrink-0 text-slate-800 font-bold mr-1 whitespace-nowrap">
              শ্রেণি :
            </span>
            <span className="font-bold text-slate-950 text-[11.5px] truncate">
              {student.studentClass || student.class || "—"}
            </span>
          </div>

          <div className="flex-[1.2] flex items-baseline border-b border-dotted border-slate-400 pb-0.5 min-w-0">
            <span className="shrink-0 text-slate-800 font-bold mr-1 whitespace-nowrap">
              শাখা :
            </span>
            <span className="font-bold text-slate-950 text-[11.5px] truncate">
              {student.section || "ক"}
            </span>
          </div>

          <div className="flex-[1.5] flex items-baseline border-b border-dotted border-slate-400 pb-0.5 min-w-0">
            <span className="shrink-0 text-slate-800 font-bold mr-1 whitespace-nowrap">
              ক্লাস রোল :
            </span>
            <span className="font-mono font-bold text-slate-950 text-[11.5px] truncate">
              {toBnDigits(student.classRoll || "—")}
            </span>
          </div>
        </div>

        {/* Line 4: Union & Thana / Upazila */}
        <div className="flex items-center gap-3">
          <div className="flex-1 flex items-baseline border-b border-dotted border-slate-400 pb-0.5 min-w-0">
            <span className="shrink-0 text-slate-800 font-bold mr-1.5 whitespace-nowrap">
              ইউনিয়ন :
            </span>
            <span className="font-bold text-slate-950 text-[12px] truncate">
              {student.union || "—"}
            </span>
          </div>
          <div className="flex-1 flex items-baseline border-b border-dotted border-slate-400 pb-0.5 min-w-0">
            <span className="shrink-0 text-slate-800 font-bold mr-1.5 whitespace-nowrap">
              থানা / উপজেলা :
            </span>
            <span className="font-bold text-slate-950 text-[12px] truncate">
              {student.thana || student.upazila || "—"}
            </span>
          </div>
        </div>
      </div>

      {/* SCHEDULE & EXAM CENTER SECTION */}
      <div className="rounded-xl border-2 border-slate-300/90 overflow-hidden text-slate-900 relative z-10 shadow-sm mt-1">
        {/* Exam Center Header */}
        <div className="bg-slate-100/90 px-3.5 py-1.5 flex items-center justify-between gap-1 border-b border-slate-300">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="font-black text-xs sm:text-sm text-slate-900 shrink-0">
              পরীক্ষা কেন্দ্র :
            </span>
            <span className="font-black text-indigo-900 text-xs sm:text-sm truncate">
              {centerName}
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
        <table className="w-full text-center text-xs border-collapse bg-white">
          <thead>
            <tr className="bg-slate-50 text-slate-800 font-bold border-b border-slate-200">
              <th className="py-1 px-2 border-r border-slate-200 w-1/2">তারিখ ও বার</th>
              <th className="py-1 px-2 w-1/2">সময়</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-slate-200 font-bold text-slate-900">
              <td className="py-1.5 px-2 border-r border-slate-200">{examDate}</td>
              <td className="py-1.5 px-2 text-rose-700 font-black">{examTime}</td>
            </tr>
            <tr className="bg-amber-50/60 font-bold text-[11px] text-slate-800">
              <td colSpan={2} className="py-1 px-2">
                <span className="text-slate-600 font-normal">বিষয়সমূহ: </span>
                <span className="font-bold text-slate-900">{subjects}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

/* ===================================================================
   ADMIT CARD BACK SIDE COMPONENT (ওপিঠ)
   Matches Image 2 Exactly:
   - Dark Pill • পরীক্ষা সংক্রান্ত সাধারণ নিয়মাবলি •
   - 2-Column Rules with Red Bullet Squares (■)
   - Bottom Row: Student Signature Line | QR Code with ✓ VERIFIED ADMIT | Controller Signature
   =================================================================== */
const AdmitCardBack = ({ student, originUrl }) => {
  if (!student) {
    return (
      <div className="w-full h-full border-2 border-dashed border-slate-300 rounded-2xl flex items-center justify-center bg-slate-50/50 text-slate-400 text-xs">
        (খালি স্থান)
      </div>
    );
  }

  const cleanRollNum = toEnDigits(student.assignedRoll || student.roll || "");
  const qrUrl = `${originUrl}/admit-card?id=${cleanRollNum}`;

  const rules = [
    {
      c1: "প্রবেশপত্র ব্যতিত কোন পরীক্ষার্থী পরীক্ষায় অংশগ্রহণ করতে পারবে না।",
      c2: "প্রবেশপত্র ব্যতিত কোন প্রকার অতিরিক্ত কাগজপত্র পরীক্ষা কেন্দ্রে বহন করা সম্পূর্ণ নিষেধ।",
    },
    {
      c1: "প্রত্যেক পরীক্ষার্থী প্রয়োজনীয় কলম, পেন্সিল ও জ্যামিতি বক্স অবশ্যই সাথে আনতে হবে।",
      c2: "প্রবেশপত্রে উল্লিখিত সময়ের ১৫ মিনিট পূর্বে পরীক্ষার্থীকে অবশ্যই পরীক্ষার হলে উপস্থিত হতে হবে।",
    },
    {
      c1: "পরীক্ষা মানবন্টন অনুযায়ী MCQ পদ্ধতিতে ১০০ নম্বরে সরাসরি অনুষ্ঠিত হবে।",
      c2: "পরীক্ষার অন্তত তিন দিন পূর্বে প্রবেশপত্র সংগ্রহ করে চূড়ান্ত কেন্দ্র ও আসন বিন্যাস জেনে নিতে হবে।",
    },
  ];

  return (
    <div
      className="w-full h-full bg-white text-slate-900 px-7 sm:px-8 py-5 sm:py-6 flex flex-col justify-between relative overflow-hidden border-2 border-sky-300/80 rounded-2xl shadow-sm box-sizing-border"
      style={{
        fontFamily:
          "'Hind Siliguri', 'Anek Bangla', 'Noto Sans Bengali', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      }}
    >
      {/* RULES TOP PILL */}
      <div className="text-center pt-1 pb-2">
        <span className="inline-block px-7 py-1 rounded-full bg-slate-900 text-white font-black text-xs sm:text-sm tracking-wide shadow-sm select-none">
          পরীক্ষা সংক্রান্ত সাধারণ নিয়মাবলি
        </span>
      </div>

      {/* 2-COLUMN RULES GRID */}
      <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-[11.5px] text-slate-800 leading-relaxed font-semibold px-2">
        {/* Column 1 */}
        <div className="space-y-3">
          {rules.map((r, i) => (
            <div key={i} className="flex items-start gap-2">
              <span className="text-rose-600 font-bold text-[11px] mt-0.5 shrink-0">
                ■
              </span>
              <span>{r.c1}</span>
            </div>
          ))}
        </div>

        {/* Column 2 */}
        <div className="space-y-3">
          {rules.map((r, i) => (
            <div key={i} className="flex items-start gap-2">
              <span className="text-rose-600 font-bold text-[11px] mt-0.5 shrink-0">
                ■
              </span>
              <span>{r.c2}</span>
            </div>
          ))}
        </div>
      </div>

      {/* BOTTOM SIGNATURE & QR CODE BAR */}
      <div className="flex items-end justify-between gap-4 pt-4 border-t border-slate-200/80 px-2 mt-auto">
        {/* Left: Student Signature Line */}
        <div className="w-40 text-center space-y-1">
          <div className="w-full border-b-2 border-slate-400 mb-1" />
          <span className="text-xs font-bold text-slate-700 block">
            পরীক্ষার্থীর স্বাক্ষর
          </span>
        </div>

        {/* Center: QR Code with Verified Badge */}
        <div className="flex flex-col items-center justify-center shrink-0">
          <div className="p-1.5 bg-white border border-slate-300 rounded-lg shadow-sm">
            <QRCodeSVG value={qrUrl} size={52} level="M" />
          </div>
          <span className="text-[10px] font-black text-emerald-600 mt-1 flex items-center gap-0.5">
            <span>✓</span> VERIFIED ADMIT
          </span>
        </div>

        {/* Right: Controller Signature & Seal */}
        <div className="w-40 text-center flex flex-col items-center">
          <img
            src={examControllerSign}
            alt="Signature"
            className="h-8 w-auto object-contain mb-0.5"
          />
          <div className="w-full border-b-2 border-slate-400 mb-1" />
          <span className="text-xs font-black text-slate-900 block leading-tight">
            পরীক্ষা নিয়ন্ত্রক
          </span>
          <span className="text-[10px] font-semibold text-slate-500 block leading-tight">
            কিশোরকণ্ঠ পরিষদ
          </span>
        </div>
      </div>
    </div>
  );
};

/* ===================================================================
   MAIN ADMIT CARD BULK PRINT MANAGER TAB
   =================================================================== */
const AdmitCardBulkPrintManager = () => {
  const examYear = useExamYear();
  const { getLogoFor } = useBranding();
  const currentLogo = getLogoFor("admitCard") || kkmLogo;

  const [registrations, setRegistrations] = useState([]);
  const [examCenters, setExamCenters] = useState([]);
  const [admitSettings, setAdmitSettings] = useState(DEFAULT_ADMIT_CARD_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState(null);

  // Filters
  const [selectedClass, setSelectedClass] = useState("all");
  const [selectedCenter, setSelectedCenter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Print Mode: 'duplex' (Front then Back sheet pair), 'front-only', 'back-only'
  const [printMode, setPrintMode] = useState("duplex");
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  const showToast = (text, type = "success") => setStatusMessage({ type, text });

  const loadData = async () => {
    try {
      setLoading(true);
      const [regs, centers, settings] = await Promise.all([
        getRegistrations(),
        getExamCenters(),
        getAdmitCardSettings(),
      ]);
      setRegistrations(regs || []);
      setExamCenters(centers || []);
      if (settings) setAdmitSettings(settings);
    } catch (err) {
      console.error(err);
      showToast("ডাটা লোড করতে সমস্যা হয়েছে!", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter approved students with assigned rolls
  const filteredStudents = useMemo(() => {
    return registrations.filter((r) => {
      // Must be approved with a roll number
      if (r.status !== "approved") return false;
      if (!r.assignedRoll && !r.roll) return false;

      // Class filter
      if (selectedClass !== "all" && r.studentClass !== selectedClass) {
        return false;
      }

      // Center filter
      if (selectedCenter !== "all" && r.examCenter !== selectedCenter) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches =
          (r.nameBn && r.nameBn.toLowerCase().includes(q)) ||
          (r.nameEn && r.nameEn.toLowerCase().includes(q)) ||
          (r.assignedRoll && r.assignedRoll.toString().includes(q)) ||
          (r.trackingId && r.trackingId.toLowerCase().includes(q)) ||
          (r.institution && r.institution.toLowerCase().includes(q)) ||
          (r.mobile && r.mobile.includes(q));
        if (!matches) return false;
      }

      return true;
    });
  }, [registrations, selectedClass, selectedCenter, searchQuery]);

  // Pair students into 2 per A4 sheet
  const studentPairs = useMemo(() => {
    const pairs = [];
    for (let i = 0; i < filteredStudents.length; i += 2) {
      pairs.push({
        pairIndex: Math.floor(i / 2) + 1,
        topStudent: filteredStudents[i],
        bottomStudent: filteredStudents[i + 1] || null,
      });
    }
    return pairs;
  }, [filteredStudents]);

  const originUrl = typeof window !== "undefined" ? window.location.origin : "https://kksylwest.web.app";

  const handlePrint = () => {
    if (filteredStudents.length === 0) {
      showToast("প্রিন্ট করার মতো কোনো প্রবেশপত্র নেই!", "error");
      return;
    }
    window.print();
  };

  // Direct Bulk PDF Generator and Downloader (Clean Pixel-Perfect A4 Capture)
  const handleDownloadPDF = async () => {
    if (filteredStudents.length === 0) {
      showToast("ডাউনলোড করার মতো কোনো প্রবেশপত্র নেই!", "error");
      return;
    }

    try {
      setDownloadingPdf(true);
      showToast("উচ্চ মানের A4 PDF তৈরি হচ্ছে, অনুগ্রহ করে অপেক্ষা করুন...", "info");

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
        compress: true,
      });

      const sheetElements = [];
      studentPairs.forEach((pair) => {
        if (printMode === "duplex" || printMode === "front-only") {
          const frontEl = document.getElementById(`pdf-sheet-front-${pair.pairIndex}`);
          if (frontEl) sheetElements.push({ el: frontEl, type: "front" });
        }
        if (printMode === "duplex" || printMode === "back-only") {
          const backEl = document.getElementById(`pdf-sheet-back-${pair.pairIndex}`);
          if (backEl) sheetElements.push({ el: backEl, type: "back" });
        }
      });

      if (sheetElements.length === 0) {
        throw new Error("কোনো শিট পাওয়া যায়নি!");
      }

      for (let i = 0; i < sheetElements.length; i++) {
        if (i > 0) {
          pdf.addPage("a4", "portrait");
        }
        const item = sheetElements[i];
        const dataUrl = await toJpeg(item.el, {
          quality: 0.98,
          pixelRatio: 2,
          backgroundColor: "#ffffff",
        });

        // A4 dimensions in mm: 210 x 297
        pdf.addImage(dataUrl, "JPEG", 0, 0, 210, 297, undefined, "FAST");
      }

      const classNameStr = selectedClass === "all" ? "All_Classes" : selectedClass.replace(/\s+/g, "_");
      const fileName = `AdmitCards_${classNameStr}_${examYear || 2025}.pdf`;
      pdf.save(fileName);

      showToast("PDF সফলভাবে ডাউনলোড হয়েছে!", "success");
    } catch (err) {
      console.error("PDF generation failed:", err);
      showToast("PDF তৈরি করতে সমস্যা হয়েছে! ব্রাউজারের প্রিন্ট ডায়ালগ থেকে 'Save as PDF' অপশনটি ব্যবহার করতে পারেন।", "error");
    } finally {
      setDownloadingPdf(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn text-ink-strong font-sans">
      <Toast message={statusMessage} onDismiss={() => setStatusMessage(null)} />

      {/* PRINT-ONLY CSS STYLES FOR EXACT A4 DUPLEX FIT */}
      <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 0;
          }
          html, body {
            background: #ffffff !important;
            color: #000000 !important;
            margin: 0 !important;
            padding: 0 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          #admin-sidebar, #admin-topbar, .no-print {
            display: none !important;
          }
          #printable-canvas-container {
            display: block !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          .a4-print-sheet {
            width: 210mm !important;
            height: 297mm !important;
            max-height: 297mm !important;
            min-height: 297mm !important;
            page-break-after: always !important;
            break-after: page !important;
            box-sizing: border-box !important;
            padding: 8mm 10mm !important;
            margin: 0 auto !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: space-between !important;
            background: #ffffff !important;
            overflow: hidden !important;
          }
          .admit-card-slot {
            height: 136mm !important;
            max-height: 136mm !important;
            box-sizing: border-box !important;
          }
        }
      `}</style>

      {/* TOP CONTROLS & FILTER PANEL - HIDDEN ON PRINT */}
      <div className="p-5 sm:p-6 rounded-2xl bg-surface-card border border-line-soft/90 shadow-xl space-y-5 no-print">
        {/* Header Title Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-line-soft/80">
          <div className="flex items-center gap-3.5">
            <span className="w-12 h-12 rounded-xl bg-primary/20 text-primary border border-primary/30 flex items-center justify-center text-2xl shadow-sm">
              <HiPrinter />
            </span>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-ink-strong tracking-tight">
                প্রবেশপত্র বাল্ক প্রিন্ট ও PDF জেনারেটর
              </h2>
              <p className="text-xs sm:text-[13px] text-ink-muted mt-0.5">
                A4 ডুপ্লেক্স শিটে এক ক্লিকে ২-ইন-১ এপিঠ-ওপিঠ প্রবেশপত্র প্রস্তুত ও PDF ডাউনলোড করুন।
              </p>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="flex flex-wrap items-center gap-2.5">
            <Chip tone="primary" icon={HiAcademicCap}>
              যোগ্য শিক্ষার্থী: {toBnDigits(filteredStudents.length)} জন
            </Chip>
            <Chip tone="neutral" icon={HiDocumentDuplicate}>
              প্রয়োজনীয় A4 শিট: {toBnDigits(studentPairs.length)} টি
            </Chip>
          </div>
        </div>

        {/* Filters Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* Class Filter */}
          <div>
            <label className="block text-xs font-bold text-ink-body mb-1">
              শ্রেণি বাছাই করুন
            </label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full min-h-[42px] px-3.5 bg-surface-low border border-line-soft/80 rounded-xl text-ink-strong text-xs sm:text-sm font-medium focus:outline-none focus:border-primary cursor-pointer"
            >
              <option value="all">সকল শ্রেণি ({registrations.filter((r) => r.status === "approved" && (r.assignedRoll || r.roll)).length})</option>
              {CLASSES.map((cls) => {
                const count = registrations.filter(
                  (r) => r.status === "approved" && (r.assignedRoll || r.roll) && r.studentClass === cls
                ).length;
                return (
                  <option key={cls} value={cls}>
                    {cls} ({count})
                  </option>
                );
              })}
            </select>
          </div>

          {/* Center Filter */}
          <div>
            <label className="block text-xs font-bold text-ink-body mb-1">
              পরীক্ষা কেন্দ্র বাছাই করুন
            </label>
            <select
              value={selectedCenter}
              onChange={(e) => setSelectedCenter(e.target.value)}
              className="w-full min-h-[42px] px-3.5 bg-surface-low border border-line-soft/80 rounded-xl text-ink-strong text-xs sm:text-sm font-medium focus:outline-none focus:border-primary cursor-pointer"
            >
              <option value="all">সকল কেন্দ্র</option>
              {examCenters.map((center) => (
                <option key={center.id || center.name} value={center.name}>
                  {center.name}
                </option>
              ))}
            </select>
          </div>

          {/* Search Box */}
          <div>
            <label className="block text-xs font-bold text-ink-body mb-1">
              নাম / রোল / প্রতিষ্ঠান দিয়ে খুঁজুন
            </label>
            <div className="relative">
              <HiMagnifyingGlass className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted text-base" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="যেমন: ১০৫০১ বা নাম..."
                className="w-full min-h-[42px] pl-10 pr-3.5 bg-surface-low border border-line-soft/80 rounded-xl text-ink-strong text-xs sm:text-sm focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          {/* Print Mode Selector */}
          <div>
            <label className="block text-xs font-bold text-ink-body mb-1">
              প্রিন্ট ও PDF মোড
            </label>
            <select
              value={printMode}
              onChange={(e) => setPrintMode(e.target.value)}
              className="w-full min-h-[42px] px-3.5 bg-surface-low border border-primary/40 rounded-xl text-primary text-xs sm:text-sm font-bold focus:outline-none focus:border-primary cursor-pointer"
            >
              <option value="duplex">📑 এপিঠ-ওপিঠ (Duplex A4)</option>
              <option value="front-only">📄 শুধু এপিঠ (Front Side Only)</option>
              <option value="back-only">📜 শুধু ওপিঠ (Back Side Rules Only)</option>
            </select>
          </div>
        </div>

        {/* Action Row */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-line-soft/80">
          <div className="flex items-center gap-2">
            <span className="text-xs text-ink-muted font-medium">
              💡 সরাসরি <strong className="text-amber-400 font-bold">PDF ডাউনলোড</strong> করুন অথবা প্রিন্ট ডায়ালগ থেকে প্রিন্ট নিন।
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto justify-end">
            <Button
              type="button"
              tone="neutral"
              icon={HiArrowPath}
              onClick={loadData}
              loading={loading}
            >
              রিফ্রেশ
            </Button>

            {/* Direct PDF Download Button */}
            <button
              type="button"
              onClick={handleDownloadPDF}
              disabled={filteredStudents.length === 0 || downloadingPdf}
              className="min-h-[42px] px-5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:brightness-110 text-slate-950 font-black text-xs sm:text-sm shadow-lg shadow-amber-500/25 transition-all hover:scale-[1.01] active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 select-none"
            >
              {downloadingPdf ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  <span>PDF তৈরি হচ্ছে...</span>
                </>
              ) : (
                <>
                  <HiArrowDownTray className="text-lg" />
                  <span>PDF ডাউনলোড ({toBnDigits(filteredStudents.length)})</span>
                </>
              )}
            </button>

            {/* Print Button */}
            <button
              type="button"
              onClick={handlePrint}
              disabled={filteredStudents.length === 0 || downloadingPdf}
              className="min-h-[42px] px-5 rounded-xl bg-gradient-to-r from-emerald-500 via-primary to-emerald-600 hover:brightness-110 text-primary-on font-black text-xs sm:text-sm shadow-lg shadow-emerald-500/25 transition-all hover:scale-[1.01] active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 select-none"
            >
              <HiPrinter className="text-lg" />
              <span>প্রিন্ট করুন</span>
            </button>
          </div>
        </div>
      </div>

      {/* ON-SCREEN PREVIEW CONTAINER */}
      <div className="space-y-4 no-print">
        {loading ? (
          <LoadingState label="প্রবেশপত্রের ডাটা লোড হচ্ছে..." />
        ) : filteredStudents.length === 0 ? (
          <EmptyState
            icon={HiIdentification}
            title="কোনো অনুমোদিত প্রবেশপত্র পাওয়া যায়নি"
            description="অনলাইন রেজিস্ট্রেশন ট্যাব থেকে শিক্ষার্থীদের আবেদন অনুমোদন ও রোল বরাদ্দ করলে এখানে স্বয়ংক্রিয়ভাবে প্রবেশপত্র তৈরি হবে।"
          />
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-ink-strong flex items-center gap-2">
                <span>📄 প্রিন্ট ও PDF প্রিভিউ</span>
                <span className="text-xs text-ink-muted font-normal">
                  ({toBnDigits(studentPairs.length)} টি A4 শিট • {toBnDigits(filteredStudents.length)} জন শিক্ষার্থী)
                </span>
              </h3>
            </div>

            {/* Interactive Sheet Stack Preview */}
            <div className="space-y-8 flex flex-col items-center">
              {studentPairs.map((pair) => (
                <div key={pair.pairIndex} className="w-full max-w-4xl space-y-4">
                  {/* Sheet Header Badge */}
                  <div className="flex items-center justify-between text-xs font-bold text-ink-muted px-2">
                    <span>
                      📋 A4 শিট #{toBnDigits(pair.pairIndex)} —{" "}
                      <span className="text-ink-strong">
                        রোল {pair.topStudent?.assignedRoll || pair.topStudent?.roll}
                        {pair.bottomStudent
                          ? ` ও ${pair.bottomStudent.assignedRoll || pair.bottomStudent.roll}`
                          : " (একক শিক্ষার্থী)"}
                      </span>
                    </span>
                    <span className="text-primary font-mono text-[11px]">
                      {printMode === "duplex"
                        ? "এপিঠ ও ওপিঠ উভয় পাশ"
                        : printMode === "front-only"
                        ? "শুধু এপিঠ"
                        : "শুধু ওপিঠ"}
                    </span>
                  </div>

                  {/* SIDE 1: FRONT (এপিঠ) */}
                  {(printMode === "duplex" || printMode === "front-only") && (
                    <div className="p-4 sm:p-6 bg-slate-100/90 rounded-2xl border-2 border-slate-300 shadow-xl space-y-4">
                      <div className="text-center">
                        <span className="inline-block px-3 py-0.5 rounded-md bg-emerald-600 text-white font-bold text-[11px]">
                          ১ম পাতা: এপিঠ (Front Side)
                        </span>
                      </div>

                      {/* Top Admit Card Slot */}
                      <div className="shadow-sm rounded-2xl overflow-hidden bg-white">
                        <AdmitCardFront
                          student={pair.topStudent}
                          logo={currentLogo}
                          admitSettings={admitSettings}
                        />
                      </div>

                      {/* Middle Cut Guideline */}
                      <div className="relative flex items-center justify-center py-1">
                        <div className="w-full border-t-2 border-dashed border-slate-400" />
                        <span className="absolute bg-slate-200 px-2.5 py-0.5 rounded-full text-xs font-bold text-slate-600 select-none shadow-sm">
                          ✂️
                        </span>
                      </div>

                      {/* Bottom Admit Card Slot */}
                      <div className="shadow-sm rounded-2xl overflow-hidden bg-white">
                        <AdmitCardFront
                          student={pair.bottomStudent}
                          logo={currentLogo}
                          admitSettings={admitSettings}
                        />
                      </div>
                    </div>
                  )}

                  {/* SIDE 2: BACK (ওপিঠ) */}
                  {(printMode === "duplex" || printMode === "back-only") && (
                    <div className="p-4 sm:p-6 bg-slate-100/90 rounded-2xl border-2 border-slate-300 shadow-xl space-y-4">
                      <div className="text-center">
                        <span className="inline-block px-3 py-0.5 rounded-md bg-indigo-600 text-white font-bold text-[11px]">
                          ২য় পাতা: ওপিঠ (Back Side Rules)
                        </span>
                      </div>

                      {/* Top Admit Card Back Slot */}
                      <div className="shadow-sm rounded-2xl overflow-hidden bg-white">
                        <AdmitCardBack
                          student={pair.topStudent}
                          originUrl={originUrl}
                        />
                      </div>

                      {/* Middle Cut Guideline */}
                      <div className="relative flex items-center justify-center py-1">
                        <div className="w-full border-t-2 border-dashed border-slate-400" />
                        <span className="absolute bg-slate-200 px-2.5 py-0.5 rounded-full text-xs font-bold text-slate-600 select-none shadow-sm">
                          ✂️
                        </span>
                      </div>

                      {/* Bottom Admit Card Back Slot */}
                      <div className="shadow-sm rounded-2xl overflow-hidden bg-white">
                        <AdmitCardBack
                          student={pair.bottomStudent}
                          originUrl={originUrl}
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ===================================================================
          CLEAN A4 SHEETS FOR DIRECT HIGH-RES PDF EXPORT (OFFSCREEN)
          =================================================================== */}
      <div id="pdf-export-container" className="fixed -left-[9999px] top-0 pointer-events-none opacity-0 select-none">
        {studentPairs.map((pair) => (
          <React.Fragment key={`pdf-pair-${pair.pairIndex}`}>
            {/* Front Sheet */}
            <div
              id={`pdf-sheet-front-${pair.pairIndex}`}
              style={{
                width: "794px",
                height: "1123px",
                backgroundColor: "#ffffff",
                padding: "24px 28px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                boxSizing: "border-box",
              }}
            >
              <div style={{ height: "518px", boxSizing: "border-box" }}>
                <AdmitCardFront
                  student={pair.topStudent}
                  logo={currentLogo}
                  admitSettings={admitSettings}
                />
              </div>

              {/* Scissor Cut Line */}
              <div style={{ width: "100%", textAlign: "center", position: "relative", margin: "4px 0" }}>
                <div style={{ borderTop: "2px dashed #94a3b8", width: "100%", position: "absolute", top: "50%" }} />
                <span style={{ backgroundColor: "#ffffff", padding: "0 8px", position: "relative", fontSize: "14px" }}>
                  ✂️
                </span>
              </div>

              <div style={{ height: "518px", boxSizing: "border-box" }}>
                <AdmitCardFront
                  student={pair.bottomStudent}
                  logo={currentLogo}
                  admitSettings={admitSettings}
                />
              </div>
            </div>

            {/* Back Sheet */}
            <div
              id={`pdf-sheet-back-${pair.pairIndex}`}
              style={{
                width: "794px",
                height: "1123px",
                backgroundColor: "#ffffff",
                padding: "24px 28px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                boxSizing: "border-box",
              }}
            >
              <div style={{ height: "518px", boxSizing: "border-box" }}>
                <AdmitCardBack
                  student={pair.topStudent}
                  originUrl={originUrl}
                />
              </div>

              {/* Scissor Cut Line */}
              <div style={{ width: "100%", textAlign: "center", position: "relative", margin: "4px 0" }}>
                <div style={{ borderTop: "2px dashed #94a3b8", width: "100%", position: "absolute", top: "50%" }} />
                <span style={{ backgroundColor: "#ffffff", padding: "0 8px", position: "relative", fontSize: "14px" }}>
                  ✂️
                </span>
              </div>

              <div style={{ height: "518px", boxSizing: "border-box" }}>
                <AdmitCardBack
                  student={pair.bottomStudent}
                  originUrl={originUrl}
                />
              </div>
            </div>
          </React.Fragment>
        ))}
      </div>

      {/* ===================================================================
          OFFICIAL PRINT CANVAS - RENDERED ONLY ON WINDOW.PRINT()
          =================================================================== */}
      <div id="printable-canvas-container" className="hidden">
        {studentPairs.map((pair) => (
          <React.Fragment key={`print-pair-${pair.pairIndex}`}>
            {/* FRONT SHEET (এপিঠ) */}
            {(printMode === "duplex" || printMode === "front-only") && (
              <div className="a4-print-sheet">
                {/* Top Card Slot */}
                <div className="admit-card-slot">
                  <AdmitCardFront
                    student={pair.topStudent}
                    logo={currentLogo}
                    admitSettings={admitSettings}
                  />
                </div>

                {/* Middle Cut Guideline */}
                <div className="w-full border-t border-dashed border-slate-400 my-1 text-center relative flex items-center justify-center">
                  <span className="text-[9px] text-slate-500 bg-white px-2">
                    ✂- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - ✂
                  </span>
                </div>

                {/* Bottom Card Slot */}
                <div className="admit-card-slot">
                  <AdmitCardFront
                    student={pair.bottomStudent}
                    logo={currentLogo}
                    admitSettings={admitSettings}
                  />
                </div>
              </div>
            )}

            {/* BACK SHEET (ওপিঠ) */}
            {(printMode === "duplex" || printMode === "back-only") && (
              <div className="a4-print-sheet">
                {/* Top Card Back Slot */}
                <div className="admit-card-slot">
                  <AdmitCardBack
                    student={pair.topStudent}
                    originUrl={originUrl}
                  />
                </div>

                {/* Middle Cut Guideline */}
                <div className="w-full border-t border-dashed border-slate-400 my-1 text-center relative flex items-center justify-center">
                  <span className="text-[9px] text-slate-500 bg-white px-2">
                    ✂- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - ✂
                  </span>
                </div>

                {/* Bottom Card Back Slot */}
                <div className="admit-card-slot">
                  <AdmitCardBack
                    student={pair.bottomStudent}
                    originUrl={originUrl}
                  />
                </div>
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default AdmitCardBulkPrintManager;
