import React, { useState, useEffect, useMemo } from "react";
import {
  HiClipboardDocument,
  HiClipboardDocumentCheck,
  HiArrowDownTray,
  HiMagnifyingGlass,
  HiChatBubbleLeftRight,
  HiCheck,
  HiCheckCircle,
  HiSparkles,
  HiUserGroup,
  HiPaperAirplane,
  HiArrowPath,
  HiXMark,
  HiChevronRight,
  HiChevronLeft,
  HiPhone,
  HiAcademicCap,
  HiIdentification,
  HiCalendarDays,
  HiBuildingOffice2,
} from "react-icons/hi2";
import { FaWhatsapp } from "react-icons/fa";
import { getRegistrations, getAllResults, getAdmitCardSettings } from "../../../services/firestore";
import { Button, Toast } from "../ui";

const CLASSES = [
  "সকল শ্রেণি",
  "৪র্থ শ্রেণি",
  "৫ম শ্রেণি",
  "৬ষ্ঠ শ্রেণি",
  "৭ম শ্রেণি",
  "৮ম শ্রেণি",
  "৯ম শ্রেণি",
  "১০ম শ্রেণি",
];

const toEnglishDigits = (str) => {
  if (!str) return "";
  const bnToEn = {
    "০": "0", "১": "1", "২": "2", "৩": "3", "৪": "4",
    "৫": "5", "৬": "6", "৭": "7", "৮": "8", "৯": "9"
  };
  return str.toString().replace(/[০-৯]/g, (d) => bnToEn[d] || d);
};

const toBengaliDigits = (num) => {
  if (num === null || num === undefined) return "০";
  const enToBn = {
    "0": "০", "1": "১", "2": "২", "3": "৩", "4": "৪",
    "5": "৫", "6": "৬", "7": "৭", "8": "৮", "9": "৯"
  };
  return num.toString().replace(/[0-9]/g, (d) => enToBn[d] || d);
};

const TEMPLATES = [
  {
    id: "admit",
    name: "🎫 প্রবেশপত্র প্রকাশ ও রোল বরাদ্দ",
    badge: "প্রবেশপত্র",
    description: "শিক্ষার্থীর আবেদন অনুমোদনের পর রোল ও প্রবেশপত্র লিংক পাঠানো",
    text: `কিশোরকণ্ঠ মেধাবৃত্তি পরীক্ষায় আপনার আবেদন সফলভাবে অনুমোদিত হয়েছে।

📌 পরীক্ষার বিবরণ:
• রোল নম্বর: {roll}
• পরীক্ষার্থীর নাম: {name}
• শ্রেণি: {class}
• পরীক্ষা কেন্দ্র: {center}
• পরীক্ষার তারিখ: {examDate}

🔗 প্রবেশপত্র ডাউনলোড লিংক:
{admitUrl}

পরীক্ষার দিন প্রবেশপত্রটি প্রিন্ট করে পরীক্ষা কেন্দ্রে সাথে নিয়ে আসতে হবে।

শুভেচ্ছান্তে,
কিশোরকণ্ঠ পাঠক ফোরাম, সিলেট জেলা পশ্চিম।`,
  },
  {
    id: "exam_reminder",
    name: "🎯 পরীক্ষার সময় ও কেন্দ্রের স্মরণিকা",
    badge: "পরীক্ষা স্মরণিকা",
    description: "পরীক্ষার আগের দিন কেন্দ্র ও সময়সূচি স্মরণ করিয়ে দেওয়া",
    text: `আসসালামু আলাইকুম {name},
আগামী {examDate} কিশোরকণ্ঠ মেধাবৃত্তি পরীক্ষা অনুষ্ঠিত হতে যাচ্ছে।

📌 পরীক্ষার তথ্য:
• রোল নম্বর: {roll}
• পরীক্ষা কেন্দ্র: {center}
• সময়: সকাল ১০:০০ টা (১৫ মিনিট পূর্বে উপস্থিতি কাম্য)

প্রবেশপত্র, কলম ও প্রয়োজনীয় উপকরণ সাথে আনুন। আপনার সাফল্য কামনা করি!

কিশোরকণ্ঠ মেধাবৃত্তি পরিষদ।`,
  },
  {
    id: "result",
    name: "🏆 ফলাফল প্রকাশ ও মেধা সম্মাননা",
    badge: "ফলাফল",
    description: "ফলাফল প্রকাশের পর বিস্তারিত রেজাল্ট ও মেধা সনদ লিংক পাঠানো",
    text: `অভিনন্দন {name}!
কিশোরকণ্ঠ মেধাবৃত্তি পরীক্ষার ফলাফল প্রকাশিত হয়েছে।

আপনার বিস্তারিত ফলাফল ও মেধা সনদ দেখতে নিচের লিংকে প্রবেশ করুন:
🔗 {resultUrl}

কিশোরকণ্ঠ পাঠক ফোরাম, সিলেট জেলা পশ্চিম।`,
  },
  {
    id: "custom",
    name: "✍️ কাস্টম ব্রডকাস্ট বার্তা (Custom)",
    badge: "কাস্টম",
    description: "নিজের ইচ্ছেমতো নোটিশ বা জরুরি নির্দেশনা তৈরি করুন",
    text: `আসসালামু আলাইকুম {name},

(এখানে আপনার বার্তা লিখুন...)

কিশোরকণ্ঠ পাঠক ফোরাম, সিলেট জেলা পশ্চিম।`,
  },
];

const DYNAMIC_TAGS = [
  { tag: "{name}", label: "নাম", desc: "শিক্ষার্থীর নাম" },
  { tag: "{roll}", label: "রোল", desc: "পরীক্ষার রোল" },
  { tag: "{class}", label: "শ্রেণি", desc: "শিক্ষার্থীর শ্রেণি" },
  { tag: "{school}", label: "প্রতিষ্ঠান", desc: "বিদ্যালয়/মাদরাসা" },
  { tag: "{center}", label: "কেন্দ্র", desc: "পরীক্ষা কেন্দ্র" },
  { tag: "{examDate}", label: "তারিখ", desc: "পরীক্ষার তারিখ" },
  { tag: "{admitUrl}", label: "প্রবেশপত্র লিংক", desc: "এডমিট ডাউনলোড URL" },
  { tag: "{resultUrl}", label: "ফলাফল লিংক", desc: "ফলাফল দেখার URL" },
];

const WhatsAppBroadcaster = () => {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState("সকল শ্রেণি");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTemplateId, setSelectedTemplateId] = useState("admit");
  const [customMessage, setCustomMessage] = useState(TEMPLATES[0].text);
  const [copiedNumbers, setCopiedNumbers] = useState(false);
  const [copiedStudentId, setCopiedStudentId] = useState(null);
  const [statusMessage, setStatusMessage] = useState(null);

  // Queue state
  const [currentQueueIndex, setCurrentQueueIndex] = useState(0);
  const [sentMap, setSentMap] = useState({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [regs, results, settings] = await Promise.all([
        getRegistrations(),
        getAllResults(),
        getAdmitCardSettings(),
      ]);

      let list = [];
      if (regs && regs.length > 0) {
        list = regs.map((r) => ({
          id: r.id,
          name: r.nameBn || r.nameEn || "শিক্ষার্থী",
          roll: r.assignedRoll || r.trackingId || "—",
          mobile: r.whatsappNumber || r.mobile || r.guardianPhone || "",
          studentClass: r.studentClass || "—",
          institution: r.institution || "—",
          center: r.examCenter || settings?.defaultCenter || "সিলেট সরকারি আলিয়া মাদরাসা কেন্দ্র",
          examDate: r.examDate || settings?.defaultExamDate || "২৪ অক্টোবর ২০২৬",
          status: r.status || "pending",
        }));
      } else if (results && results.length > 0) {
        list = results.map((res) => ({
          id: res.id || res.roll,
          name: res.name || "শিক্ষার্থী",
          roll: res.roll || "—",
          mobile: res.mobile || "",
          studentClass: res.class || "—",
          institution: res.school || "—",
          center: settings?.defaultCenter || "সিলেট সরকারি আলিয়া মাদরাসা কেন্দ্র",
          examDate: settings?.defaultExamDate || "২৪ অক্টোবর ২০২৬",
          status: "approved",
        }));
      }
      setCandidates(list);
    } catch (e) {
      console.error("Load broadcaster data error:", e);
    } finally {
      setLoading(false);
    }
  };

  // Filtered List
  const filteredList = useMemo(() => {
    return candidates.filter((c) => {
      // Class filter
      if (selectedClass !== "সকল শ্রেণি" && !c.studentClass?.includes(selectedClass.replace(" শ্রেণি", ""))) {
        return false;
      }
      // Status filter
      if (selectedStatus !== "all" && c.status !== selectedStatus) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches =
          c.name?.toLowerCase().includes(q) ||
          c.roll?.toString().includes(q) ||
          c.mobile?.includes(q) ||
          c.institution?.toLowerCase().includes(q);
        if (!matches) return false;
      }
      return true;
    });
  }, [candidates, selectedClass, selectedStatus, searchQuery]);

  const handleTemplateSelect = (tmplId) => {
    setSelectedTemplateId(tmplId);
    const tmpl = TEMPLATES.find((t) => t.id === tmplId);
    if (tmpl) setCustomMessage(tmpl.text);
  };

  // Format message for a specific candidate
  const formatMessageFor = (student) => {
    if (!student) return "";
    const origin = window.location.origin;
    const cleanRollNum = toEnglishDigits(student.roll);
    const admitUrl = `${origin}/admit-card?id=${cleanRollNum}`;
    const resultUrl = `${origin}/search?roll=${cleanRollNum}`;

    return customMessage
      .replace(/{name}|{নাম}/g, student.name || "")
      .replace(/{roll}|{রোল}/g, student.roll || "")
      .replace(/{class}|{শ্রেণি}/g, student.studentClass || "")
      .replace(/{school}|{প্রতিষ্ঠান}/g, student.institution || "")
      .replace(/{center}|{কেন্দ্র}/g, student.center || "সিলেট সরকারি আলিয়া মাদরাসা কেন্দ্র")
      .replace(/{examDate}|{তারিখ}/g, student.examDate || "২৪ অক্টোবর ২০২৬")
      .replace(/{admitUrl}|{প্রবেশপত্র_লিংক}/g, admitUrl)
      .replace(/{resultUrl}|{ফলাফল_লিংক}/g, resultUrl);
  };

  // Clean phone number for WhatsApp
  const cleanPhone = (num) => {
    if (!num) return "";
    let cleaned = num.replace(/[^0-9]/g, "");
    if (cleaned.startsWith("0")) cleaned = "880" + cleaned.substring(1);
    else if (!cleaned.startsWith("880") && cleaned.length === 10) cleaned = "880" + cleaned;
    return cleaned;
  };

  // Safe WhatsApp URL generator that prevents emoji stripping
  const openWhatsApp = (phone, msg) => {
    const encoded = encodeURIComponent(msg);
    const url = `https://api.whatsapp.com/send?phone=${phone}&text=${encoded}`;
    window.open(url, "_blank");
  };

  // Copy message text directly to clipboard
  const handleCopyMessage = (student) => {
    const msg = formatMessageFor(student);
    navigator.clipboard.writeText(msg);
    const id = student.id || student.roll;
    setCopiedStudentId(id);
    setStatusMessage({ type: "success", text: `📋 ${student.name}-এর বার্তাটি ক্লিপবোর্ডে কপি হয়েছে!` });
    setTimeout(() => setCopiedStudentId(null), 2500);
  };

  // Send to current candidate and advance
  const handleSendCurrentAndNext = () => {
    const currentStudent = filteredList[currentQueueIndex];
    if (!currentStudent) return;

    const phone = cleanPhone(currentStudent.mobile);
    if (!phone) {
      setStatusMessage({ type: "error", text: `${currentStudent.name}-এর কোনো বৈধ মোবাইল নম্বর পাওয়া যায়নি!` });
      return;
    }

    const msg = formatMessageFor(currentStudent);
    openWhatsApp(phone, msg);

    // Mark as sent
    setSentMap((prev) => ({ ...prev, [currentStudent.id || currentStudent.roll]: true }));

    // Advance queue
    if (currentQueueIndex < filteredList.length - 1) {
      setCurrentQueueIndex((prev) => prev + 1);
    }
  };

  const handleSendDirect = (student, index) => {
    if (index !== undefined) setCurrentQueueIndex(index);
    const phone = cleanPhone(student.mobile);
    if (!phone) {
      setStatusMessage({ type: "error", text: `${student.name}-এর কোনো বৈধ মোবাইল নম্বর পাওয়া যায়নি!` });
      return;
    }
    const msg = formatMessageFor(student);
    openWhatsApp(phone, msg);
    setSentMap((prev) => ({ ...prev, [student.id || student.roll]: true }));
  };

  // Copy all phone numbers
  const handleCopyAllNumbers = () => {
    const numbers = filteredList
      .map((c) => cleanPhone(c.mobile))
      .filter((n) => n && n.length >= 10);

    if (numbers.length === 0) {
      setStatusMessage({ type: "error", text: "কোনো মোবাইল নম্বর পাওয়া যায়নি!" });
      return;
    }

    const text = numbers.join(", ");
    navigator.clipboard.writeText(text);
    setCopiedNumbers(true);
    setStatusMessage({ type: "success", text: `${toBengaliDigits(numbers.length)}টি মোবাইল নম্বর কপি হয়েছে!` });
    setTimeout(() => setCopiedNumbers(false), 3000);
  };

  // Export CSV
  const handleExportCSV = () => {
    if (filteredList.length === 0) {
      setStatusMessage({ type: "error", text: "কোনো ডাটা পাওয়া যায়নি!" });
      return;
    }

    const headers = ["Name", "Roll", "Class", "Mobile", "WhatsApp Ready Phone", "Institution", "Status"];
    const rows = filteredList.map((c) => [
      `"${c.name}"`,
      `"${c.roll}"`,
      `"${c.studentClass}"`,
      `"${c.mobile}"`,
      `"${cleanPhone(c.mobile)}"`,
      `"${c.institution}"`,
      `"${c.status}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `WhatsApp_Contacts_${selectedClass}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const currentStudent = filteredList[currentQueueIndex];
  const sentCount = Object.keys(sentMap).length;
  const progressPercent = filteredList.length > 0 ? Math.round((sentCount / filteredList.length) * 100) : 0;

  return (
    <div className="space-y-6 text-ink-strong font-sans animate-fade-in">
      <Toast message={statusMessage} onDismiss={() => setStatusMessage(null)} />

      {/* ========================================================
          1. HEADER & LIVE METRICS
          ======================================================== */}
      <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-[#121526] via-[#161a33] to-[#0f1329] border border-white/10 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-white/10">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold">
              <FaWhatsapp className="text-sm" />
              <span>WhatsApp ব্রডকাস্ট ও বার্তা প্রেরণ কেন্দ্র</span>
            </div>
            <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
              স্মার্ট ওয়ান-টু-ওয়ান মেসেজিং হাব
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              শিক্ষার্থীদের রোল, প্রবেশপত্র ডাউনলোড লিংক ও ফলাফলের তথ্য ১-ক্লিকেই তাদের হোয়াটসঅ্যাপে পৌঁছে দিন।
            </p>
          </div>

          {/* Quick Global Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleCopyAllNumbers}
              className="px-3.5 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-slate-200 hover:text-white border border-white/10 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm"
              title="নির্বাচিত শিক্ষার্থীদের সকল ফোন নম্বর কপি করুন"
            >
              {copiedNumbers ? <HiClipboardDocumentCheck className="text-emerald-400 text-base" /> : <HiClipboardDocument className="text-base" />}
              <span>{copiedNumbers ? "নম্বরগুলো কপি হয়েছে" : "সকল নম্বর কপি"}</span>
            </button>

            <button
              type="button"
              onClick={handleExportCSV}
              className="px-3.5 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-slate-200 hover:text-white border border-white/10 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm"
              title="CSV স্প্রেডশিট ডাউনলোড করুন"
            >
              <HiArrowDownTray className="text-base" />
              <span>কন্টাক্ট শিট (CSV)</span>
            </button>

            <button
              type="button"
              onClick={loadData}
              className="p-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-slate-300 hover:text-white border border-white/10 transition cursor-pointer"
              title="ডাটা রিফ্রেশ করুন"
            >
              <HiArrowPath className="text-base" />
            </button>
          </div>
        </div>

        {/* 4 Stat Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-5 relative z-10">
          <div className="p-3.5 rounded-xl bg-white/[0.04] border border-white/5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 flex items-center justify-center shrink-0">
              <HiUserGroup className="text-lg" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-400 block">মোট ডাটাবেজ</span>
              <strong className="text-base sm:text-lg font-black text-white">{toBengaliDigits(candidates.length)} জন</strong>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-white/[0.04] border border-white/5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/15 border border-sky-500/30 text-sky-300 flex items-center justify-center shrink-0">
              <HiMagnifyingGlass className="text-lg" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-400 block">নির্বাচিত অডিয়েন্স</span>
              <strong className="text-base sm:text-lg font-black text-sky-300">{toBengaliDigits(filteredList.length)} জন</strong>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-white/[0.04] border border-white/5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 flex items-center justify-center shrink-0">
              <HiCheckCircle className="text-lg" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-400 block">মেসেজ পাঠানো হয়েছে</span>
              <strong className="text-base sm:text-lg font-black text-emerald-400">{toBengaliDigits(sentCount)} জন</strong>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-white/[0.04] border border-white/5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 flex items-center justify-center shrink-0">
              <HiPaperAirplane className="text-lg" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-400 block">কিউ অগ্রগতি</span>
              <strong className="text-base sm:text-lg font-black text-amber-300">{toBengaliDigits(progressPercent)}%</strong>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================
          2. MAIN 2-COLUMN WORKSPACE: COMPOSER & DISPATCH QUEUE
          ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

        {/* ----------------------------------------------------
            LEFT COLUMN: TEMPLATES, COMPOSER & LIVE PREVIEW (5 Cols)
            ---------------------------------------------------- */}
        <div className="lg:col-span-5 space-y-5">

          {/* Card 1: Message Composer */}
          <div className="p-5 rounded-2xl bg-[#14162b] border border-white/10 shadow-xl space-y-4">
            
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <HiChatBubbleLeftRight className="text-indigo-400 text-base" />
                <span>ধাপ ১: বার্তা টেমপ্লেট নির্বাচন</span>
              </h3>
              <span className="text-[11px] font-bold text-indigo-300 bg-indigo-500/15 px-2.5 py-0.5 rounded-full border border-indigo-500/30">
                {TEMPLATES.length}টি রেডিমেড
              </span>
            </div>

            {/* Template Selector Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {TEMPLATES.map((tmpl) => (
                <button
                  key={tmpl.id}
                  type="button"
                  onClick={() => handleTemplateSelect(tmpl.id)}
                  className={`p-3 rounded-xl border text-left text-xs font-bold transition flex flex-col justify-between gap-1 cursor-pointer ${
                    selectedTemplateId === tmpl.id
                      ? "bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border-emerald-500/50 text-white shadow-md"
                      : "bg-[#0c0e1e] border-white/5 text-slate-300 hover:text-white hover:border-white/20"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="truncate">{tmpl.name}</span>
                    {selectedTemplateId === tmpl.id && <HiCheck className="text-emerald-400 text-sm shrink-0" />}
                  </div>
                  <span className="text-[10px] text-slate-400 font-normal line-clamp-1">
                    {tmpl.description}
                  </span>
                </button>
              ))}
            </div>

            {/* Dynamic Tags Helper */}
            <div className="space-y-1.5 pt-2 border-t border-white/[0.08]">
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                ডাইনামিক ভেরিয়েবল ট্যাগ (ক্লিক করলে যুক্ত হবে):
              </label>
              <div className="flex flex-wrap gap-1.5">
                {DYNAMIC_TAGS.map(({ tag, label }) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setCustomMessage((prev) => prev + " " + tag)}
                    className="px-2.5 py-1 bg-white/[0.06] hover:bg-emerald-500/20 hover:text-emerald-300 hover:border-emerald-500/40 text-slate-300 font-mono text-[11px] rounded-lg border border-white/10 transition cursor-pointer flex items-center gap-1"
                    title={`${label} ট্যাগ যোগ করুন`}
                  >
                    <span>+</span>
                    <span>{tag}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Message Body Textarea */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-300">
                  মেসেজের পূর্ণ বিবরণ (Message Body):
                </label>
                <span className="text-[10px] text-slate-400 font-mono">
                  {customMessage.length} অক্ষর
                </span>
              </div>
              <textarea
                rows={9}
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                className="w-full p-3.5 bg-[#090a16] border border-white/10 rounded-xl text-white text-xs font-medium focus:outline-none focus:border-emerald-500 font-mono leading-relaxed resize-y"
                placeholder="এখানে মেসেজের টেক্সট লিখুন..."
              />
            </div>

          </div>

          {/* Card 2: Live WhatsApp Mockup Preview */}
          <div className="p-5 rounded-2xl bg-[#14162b] border border-white/10 shadow-xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <FaWhatsapp className="text-emerald-400 text-sm" />
                <span>লাইভ হোয়াটসঅ্যাপ প্রিভিউ (Phone Preview)</span>
              </h4>
              <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 font-bold">
                রিয়েল-টাইম
              </span>
            </div>

            {/* WhatsApp App Mockup Container */}
            <div className="rounded-2xl border border-white/10 bg-[#0b141a] overflow-hidden shadow-2xl">
              {/* WhatsApp Chat Top Header */}
              <div className="bg-[#1f2c34] px-4 py-2.5 flex items-center justify-between border-b border-white/5">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center text-xs font-bold">
                    KK
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-white">কিশোরকণ্ঠ পাঠক ফোরাম</h5>
                    <p className="text-[10px] text-emerald-400">অফিসিয়াল হেল্পলাইন</p>
                  </div>
                </div>
                <span className="text-[11px] text-slate-400">অনলাইন</span>
              </div>

              {/* Chat Canvas & Message Bubble */}
              <div className="p-4 bg-[#0b141a] bg-opacity-95 min-h-[160px] flex flex-col justify-end space-y-2">
                <div className="max-w-[95%] self-end bg-[#005c4b] text-white p-3.5 rounded-2xl rounded-tr-none text-xs font-normal leading-relaxed whitespace-pre-wrap shadow-lg border border-emerald-500/20">
                  {formatMessageFor(currentStudent || {
                    name: "মোহাম্মদ মুনতাসির মাহমুদ",
                    roll: "১০০১৩",
                    studentClass: "১০ম শ্রেণি",
                    institution: "শাহজালাল জামেয়া স্কুল এন্ড কলেজ",
                    center: "সিলেট সরকারি আলিয়া মাদরাসা কেন্দ্র",
                    examDate: "২৪ অক্টোবর ২০২৬",
                  })}
                  <div className="text-right text-[10px] text-emerald-200/80 mt-2 font-mono flex items-center justify-end gap-1">
                    <span>১২:৩০ PM</span>
                    <span>✓✓</span>
                  </div>
                </div>
              </div>
            </div>

            {currentStudent && (
              <p className="text-[11px] text-slate-400 text-center">
                প্রিভিউ দেখানো হচ্ছে: <strong className="text-emerald-300">{currentStudent.name}</strong>-এর তথ্যানুযায়ী
              </p>
            )}
          </div>

        </div>

        {/* ----------------------------------------------------
            RIGHT COLUMN: AUDIENCE FILTERS & QUEUE DISPATCH (7 Cols)
            ---------------------------------------------------- */}
        <div className="lg:col-span-7 space-y-5">

          {/* Card 1: Audience Filters */}
          <div className="p-5 rounded-2xl bg-[#14162b] border border-white/10 shadow-xl space-y-4">
            
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <HiUserGroup className="text-sky-400 text-base" />
                <span>ধাপ ২: টার্গেট অডিয়েন্স ফিল্টারিং</span>
              </h3>
              <span className="text-xs font-bold text-sky-300 bg-sky-500/15 px-2.5 py-0.5 rounded-full border border-sky-500/30">
                {toBengaliDigits(filteredList.length)} জন শিক্ষার্থী প্রস্তুত
              </span>
            </div>

            {/* Filter Inputs Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              
              {/* Class Dropdown */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  শ্রেণি নির্বাচন
                </label>
                <select
                  value={selectedClass}
                  onChange={(e) => {
                    setSelectedClass(e.target.value);
                    setCurrentQueueIndex(0);
                  }}
                  className="w-full px-3 py-2 bg-[#090a16] border border-white/10 rounded-xl text-white text-xs font-bold focus:outline-none focus:border-sky-400 cursor-pointer"
                >
                  {CLASSES.map((cls) => (
                    <option key={cls} value={cls}>{cls}</option>
                  ))}
                </select>
              </div>

              {/* Status Dropdown */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  আবেদন স্ট্যাটাস
                </label>
                <select
                  value={selectedStatus}
                  onChange={(e) => {
                    setSelectedStatus(e.target.value);
                    setCurrentQueueIndex(0);
                  }}
                  className="w-full px-3 py-2 bg-[#090a16] border border-white/10 rounded-xl text-white text-xs font-bold focus:outline-none focus:border-sky-400 cursor-pointer"
                >
                  <option value="all">সকল স্ট্যাটাস ({toBengaliDigits(candidates.length)})</option>
                  <option value="approved">✓ শুধুমাত্র অনুমোদিত (Approved)</option>
                  <option value="pending">⏳ অপেক্ষমাণ (Pending)</option>
                  <option value="rejected">✕ বাতিলকৃত (Rejected)</option>
                </select>
              </div>

              {/* Search Bar */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  প্রার্থী খুঁজুন
                </label>
                <div className="relative">
                  <HiMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentQueueIndex(0);
                    }}
                    placeholder="নাম / রোল / ফোন..."
                    className="w-full pl-8 pr-3 py-2 bg-[#090a16] border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-sky-400"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                    >
                      <HiXMark className="text-xs" />
                    </button>
                  )}
                </div>
              </div>

            </div>

          </div>

          {/* Card 2: Interactive Smart Queue Dispatcher */}
          {filteredList.length > 0 && currentStudent ? (
            <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-[#13162d] to-[#0e1022] border-2 border-emerald-500/40 shadow-2xl space-y-5 relative overflow-hidden">
              
              {/* Top Queue Progress & Navigation */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/[0.08]">
                <div className="flex items-center gap-2.5">
                  <span className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                  <div>
                    <h3 className="text-sm font-black text-white flex items-center gap-2">
                      <span>ধাপ ৩: ওয়ান-ক্লিক কিউ ডিসপ্যাচার</span>
                    </h3>
                    <span className="text-xs text-emerald-300 font-bold">
                      প্রার্থী নম্বর {toBengaliDigits(currentQueueIndex + 1)} / {toBengaliDigits(filteredList.length)}
                    </span>
                  </div>
                </div>

                {/* Sent indicator badge */}
                <div className="flex items-center gap-2">
                  {sentMap[currentStudent.id || currentStudent.roll] ? (
                    <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold flex items-center gap-1.5">
                      <HiCheckCircle className="text-sm" />
                      <span>মেসেজ পাঠানো হয়েছে</span>
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 text-xs font-bold">
                      ⏳ অপেক্ষমাণ
                    </span>
                  )}
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px] text-slate-400 font-bold">
                  <span>অগ্রগতি: {toBengaliDigits(sentCount)} / {toBengaliDigits(filteredList.length)} জন</span>
                  <span className="text-emerald-400">{toBengaliDigits(progressPercent)}% সম্পন্ন</span>
                </div>
                <div className="w-full h-2 bg-[#090a16] rounded-full overflow-hidden border border-white/5">
                  <div 
                    className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-indigo-500 transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              {/* Active Candidate Info Card */}
              <div className="p-4 rounded-xl bg-[#0a0c18] border border-white/[0.08] space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h4 className="text-base font-black text-white flex items-center gap-2">
                      <span>{currentStudent.name}</span>
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        {currentStudent.studentClass}
                      </span>
                    </h4>
                    <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                      <HiBuildingOffice2 className="text-xs text-indigo-400 shrink-0" />
                      <span>{currentStudent.institution}</span>
                    </p>
                  </div>

                  <div className="text-left sm:text-right">
                    <span className="text-[11px] font-bold text-slate-400 block">রোল / আইডি</span>
                    <strong className="text-sm font-black text-amber-300 font-mono">
                      {currentStudent.roll}
                    </strong>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2.5 border-t border-white/5 text-xs">
                  <div className="flex items-center gap-2 text-slate-300">
                    <HiPhone className="text-emerald-400 text-sm shrink-0" />
                    <span className="font-mono font-bold text-white">
                      {currentStudent.mobile || "মোবাইল নম্বর নেই"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <HiCalendarDays className="text-indigo-400 text-sm shrink-0" />
                    <span>কেন্দ্র: {currentStudent.center}</span>
                  </div>
                </div>
              </div>

              {/* Big Queue Action Controls */}
              <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-1">
                {/* Previous Button */}
                <button
                  type="button"
                  onClick={() => {
                    if (currentQueueIndex > 0) setCurrentQueueIndex((prev) => prev - 1);
                  }}
                  disabled={currentQueueIndex === 0}
                  className="w-full sm:w-auto px-3.5 py-3 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-slate-300 hover:text-white font-bold text-xs border border-white/10 transition cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-1"
                  title="পূর্ববর্তী প্রার্থী"
                >
                  <HiChevronLeft className="text-base" />
                  <span>আগেরটি</span>
                </button>

                {/* Primary WhatsApp Dispatch Button */}
                <button
                  type="button"
                  onClick={handleSendCurrentAndNext}
                  className="flex-1 w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-black text-xs sm:text-sm shadow-lg shadow-emerald-500/25 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
                >
                  <FaWhatsapp className="text-lg shrink-0" />
                  <span>হোয়াটসঅ্যাপে পাঠান ও পরেরটিতে যান ➡️</span>
                </button>

                {/* Copy Formatted Message Button */}
                <button
                  type="button"
                  onClick={() => handleCopyMessage(currentStudent)}
                  className="w-full sm:w-auto px-4 py-3 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-slate-200 hover:text-white font-bold text-xs border border-white/10 transition cursor-pointer flex items-center justify-center gap-1.5"
                  title="মেসেজের ফরম্যাটেড টেক্সট ক্লিপবোর্ডে কপি করুন"
                >
                  {copiedStudentId === (currentStudent.id || currentStudent.roll) ? (
                    <>
                      <HiClipboardDocumentCheck className="text-emerald-400 text-base" />
                      <span className="text-emerald-400">কপি হয়েছে!</span>
                    </>
                  ) : (
                    <>
                      <HiClipboardDocument className="text-base" />
                      <span>মেসেজ কপি</span>
                    </>
                  )}
                </button>

                {/* Skip / Next Button */}
                <button
                  type="button"
                  onClick={() => {
                    if (currentQueueIndex < filteredList.length - 1) setCurrentQueueIndex((prev) => prev + 1);
                  }}
                  disabled={currentQueueIndex >= filteredList.length - 1}
                  className="w-full sm:w-auto px-3.5 py-3 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-slate-300 hover:text-white font-bold text-xs border border-white/10 transition cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-1"
                  title="পরবর্তী প্রার্থী স্কিপ করুন"
                >
                  <span>পরেরটি</span>
                  <HiChevronRight className="text-base" />
                </button>
              </div>

            </div>
          ) : (
            <div className="p-10 rounded-2xl bg-[#14162b] border border-white/10 text-center text-slate-400 text-xs space-y-2">
              <p>আপনার নির্বাচিত ফিল্টারের সাথে মেলানো কোনো শিক্ষার্থী পাওয়া যায়নি।</p>
              <button
                type="button"
                onClick={() => {
                  setSelectedClass("সকল শ্রেণি");
                  setSelectedStatus("all");
                  setSearchQuery("");
                }}
                className="text-indigo-400 hover:underline font-bold"
              >
                ফিল্টার রিসেট করুন
              </button>
            </div>
          )}

          {/* Card 3: Complete Recipient Table */}
          <div className="rounded-2xl bg-[#14162b] border border-white/10 shadow-xl overflow-hidden">
            <div className="p-4 bg-[#090a16] border-b border-white/[0.08] flex items-center justify-between text-xs font-bold text-slate-300">
              <span className="flex items-center gap-2">
                <span>সম্পূর্ণ প্রার্থী তালিকা</span>
                <span className="text-[11px] font-bold text-slate-400 bg-white/[0.06] px-2 py-0.5 rounded-full">
                  {toBengaliDigits(filteredList.length)} জন
                </span>
              </span>
              <span className="text-[11px] text-slate-400 hidden sm:inline">
                যেকোনো সারিতে ক্লিক করলে সরাসরি কিউতে লোড হবে
              </span>
            </div>

            <div className="max-h-96 overflow-y-auto divide-y divide-white/5 text-xs">
              {filteredList.map((st, idx) => {
                const isSelected = currentQueueIndex === idx;
                const isSent = !!sentMap[st.id || st.roll];

                return (
                  <div
                    key={st.id || idx}
                    onClick={() => setCurrentQueueIndex(idx)}
                    className={`p-3.5 flex items-center justify-between gap-3 transition cursor-pointer ${
                      isSelected
                        ? "bg-emerald-500/10 border-l-4 border-emerald-400"
                        : "hover:bg-white/[0.03]"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-mono font-bold shrink-0 ${
                        isSelected 
                          ? "bg-emerald-500 text-slate-950" 
                          : "bg-white/[0.06] text-slate-400"
                      }`}>
                        {toBengaliDigits(idx + 1)}
                      </span>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <strong className="text-white font-bold truncate block">{st.name}</strong>
                          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-white/5 text-slate-400">
                            {st.studentClass}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-400 font-mono block truncate">
                          রোল: {st.roll} • {st.mobile || "নম্বর নেই"} • {st.institution}
                        </span>
                      </div>
                    </div>

                    {/* Action Controls for this Row */}
                    <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                      {isSent && (
                        <span className="text-[11px] text-emerald-400 font-bold flex items-center gap-1 mr-1 hidden sm:flex">
                          <HiCheck className="text-sm" />
                          <span>পাঠানো হয়েছে</span>
                        </span>
                      )}

                      {/* Copy message button */}
                      <button
                        type="button"
                        onClick={() => handleCopyMessage(st)}
                        className="w-8 h-8 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] text-slate-300 hover:text-white border border-white/10 transition flex items-center justify-center cursor-pointer"
                        title="মেসেজ কপি করুন"
                      >
                        {copiedStudentId === (st.id || st.roll) ? (
                          <HiClipboardDocumentCheck className="text-emerald-400 text-sm" />
                        ) : (
                          <HiClipboardDocument className="text-sm" />
                        )}
                      </button>

                      {/* Send WhatsApp direct */}
                      <button
                        type="button"
                        onClick={() => handleSendDirect(st, idx)}
                        className="w-8 h-8 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 transition flex items-center justify-center cursor-pointer"
                        title="সরাসরি WhatsApp পাঠান"
                      >
                        <FaWhatsapp className="text-sm" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

export default WhatsAppBroadcaster;
