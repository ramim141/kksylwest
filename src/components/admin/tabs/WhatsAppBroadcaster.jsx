import React, { useState, useEffect, useMemo } from "react";
import {
  HiClipboardDocument,
  HiClipboardDocumentCheck,
  HiArrowDownTray,
  HiMagnifyingGlass,
  HiChatBubbleLeftRight,
  HiCheck,
  HiCheckCircle,
  HiUserGroup,
  HiPaperAirplane,
  HiArrowPath,
  HiXMark,
  HiChevronRight,
  HiChevronLeft,
  HiPhone,
  HiAcademicCap,
  HiBuildingOffice2,
  HiCalendarDays,
  HiSparkles,
} from "react-icons/hi2";
import { FaWhatsapp } from "react-icons/fa";
import { getRegistrations, getAllResults, getAdmitCardSettings } from "../../../services/firestore";
import { Button, IconButton, Chip, Panel, PanelHeader, Toast } from "../ui";

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
    name: "🎫 প্রবেশপত্র ও রোল বরাদ্দ",
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
    name: "✍️ কাস্টম ব্রডকাস্ট বার্তা",
    badge: "কাস্টম",
    description: "নিজের ইচ্ছেমতো নোটিশ বা জরুরি নির্দেশনা তৈরি করুন",
    text: `আসসালামু আলাইকুম {name},

(এখানে আপনার বার্তা লিখুন...)

কিশোরকণ্ঠ পাঠক ফোরাম, সিলেট জেলা পশ্চিম।`,
  },
];

const DYNAMIC_TAGS = [
  { tag: "{name}", label: "নাম" },
  { tag: "{roll}", label: "রোল" },
  { tag: "{class}", label: "শ্রেণি" },
  { tag: "{school}", label: "প্রতিষ্ঠান" },
  { tag: "{center}", label: "কেন্দ্র" },
  { tag: "{examDate}", label: "তারিখ" },
  { tag: "{admitUrl}", label: "এডমিট লিংক" },
  { tag: "{resultUrl}", label: "ফলাফল লিংক" },
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
    const origin = typeof window !== "undefined" ? window.location.origin : "https://kksylwest.web.app";
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

  const openWhatsApp = (phone, msg) => {
    const encoded = encodeURIComponent(msg);
    const url = `https://api.whatsapp.com/send?phone=${phone}&text=${encoded}`;
    window.open(url, "_blank");
  };

  const handleCopyMessage = (student) => {
    const msg = formatMessageFor(student);
    navigator.clipboard.writeText(msg);
    const id = student.id || student.roll;
    setCopiedStudentId(id);
    setStatusMessage({ type: "success", text: `📋 ${student.name}-এর বার্তাটি ক্লিপবোর্ডে কপি হয়েছে!` });
    setTimeout(() => setCopiedStudentId(null), 2500);
  };

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

    setSentMap((prev) => ({ ...prev, [currentStudent.id || currentStudent.roll]: true }));

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
    <div className="space-y-6 text-ink-body font-sans animate-fade-in">
      <Toast message={statusMessage} onDismiss={() => setStatusMessage(null)} />

      {/* ========================================================
          1. HEADER & LIVE METRICS
          ======================================================== */}
      <div className="p-5 sm:p-7 rounded-2xl bg-surface-card/90 backdrop-blur-md border border-line-soft/80 shadow-md relative overflow-hidden">
        {/* Luminous top gradient wash */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-emerald-500 via-primary to-teal-400 opacity-80" />
        <div className="absolute top-0 right-0 w-80 h-80 bg-primary/[0.06] rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-line-soft/70">
          <div className="space-y-1.5 min-w-0">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/15 border border-primary/30 text-primary text-xs font-bold shadow-sm">
              <FaWhatsapp className="text-sm" />
              <span>WhatsApp ব্রডকাস্ট ও ওয়ান-টু-ওয়ান মেসেজিং হাব</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-ink-strong tracking-tight flex items-center gap-2">
              স্মার্ট বার্তা প্রেরণ কেন্দ্র
            </h2>
            <p className="text-xs sm:text-sm text-ink-muted leading-relaxed max-w-2xl font-normal">
              শিক্ষার্থীদের পরীক্ষার রোল, প্রবেশপত্র ডাউনলোড লিংক ও ফলাফলের বিস্তারিত তথ্য সরাসরি তাদের হোয়াটসঅ্যাপ নম্বরে ১-ক্লিকেই পৌঁছে দিন।
            </p>
          </div>

          {/* Quick Global Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <Button
              type="button"
              tone="neutral"
              size="sm"
              icon={copiedNumbers ? HiClipboardDocumentCheck : HiClipboardDocument}
              onClick={handleCopyAllNumbers}
              title="নির্বাচিত শিক্ষার্থীদের সকল ফোন নম্বর কপি করুন"
            >
              {copiedNumbers ? "নম্বরগুলো কপি হয়েছে" : "সকল নম্বর কপি"}
            </Button>

            <Button
              type="button"
              tone="neutral"
              size="sm"
              icon={HiArrowDownTray}
              onClick={handleExportCSV}
              title="CSV স্প্রেডশিট ডাউনলোড করুন"
            >
              কন্টাক্ট শিট (CSV)
            </Button>

            <IconButton
              icon={HiArrowPath}
              label="ডাটা রিফ্রেশ করুন"
              tone="neutral"
              size="sm"
              onClick={loadData}
              loading={loading}
            />
          </div>
        </div>

        {/* 4 Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 pt-5 relative z-10">
          <div className="p-4 rounded-xl bg-surface-low/80 border border-line-soft/80 shadow-sm flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-primary/15 border border-primary/30 text-primary flex items-center justify-center text-xl shrink-0 shadow-sm">
              <HiUserGroup />
            </div>
            <div className="min-w-0">
              <span className="text-[11px] font-semibold text-ink-muted uppercase tracking-wider block">মোট ডাটাবেজ</span>
              <strong className="text-base sm:text-lg font-bold text-ink-strong font-bangla-number">{toBengaliDigits(candidates.length)} জন</strong>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-surface-low/80 border border-line-soft/80 shadow-sm flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-tertiary/15 border border-tertiary/30 text-tertiary flex items-center justify-center text-xl shrink-0 shadow-sm">
              <HiMagnifyingGlass />
            </div>
            <div className="min-w-0">
              <span className="text-[11px] font-semibold text-ink-muted uppercase tracking-wider block">ফিল্টারকৃত অডিয়েন্স</span>
              <strong className="text-base sm:text-lg font-bold text-tertiary font-bangla-number">{toBengaliDigits(filteredList.length)} জন</strong>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-surface-low/80 border border-line-soft/80 shadow-sm flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-primary/20 border border-primary/35 text-primary flex items-center justify-center text-xl shrink-0 shadow-sm">
              <HiCheckCircle />
            </div>
            <div className="min-w-0">
              <span className="text-[11px] font-semibold text-ink-muted uppercase tracking-wider block">মেসেজ পাঠানো হয়েছে</span>
              <strong className="text-base sm:text-lg font-bold text-primary font-bangla-number">{toBengaliDigits(sentCount)} জন</strong>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-surface-low/80 border border-line-soft/80 shadow-sm flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-secondary/15 border border-secondary/30 text-secondary flex items-center justify-center text-xl shrink-0 shadow-sm">
              <HiPaperAirplane />
            </div>
            <div className="min-w-0">
              <span className="text-[11px] font-semibold text-ink-muted uppercase tracking-wider block">কিউ সম্পন্ন</span>
              <strong className="text-base sm:text-lg font-bold text-secondary font-bangla-number">{toBengaliDigits(progressPercent)}%</strong>
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
        <div className="lg:col-span-5 space-y-6">

          {/* Card 1: Message Composer */}
          <Panel>
            <PanelHeader
              icon={HiChatBubbleLeftRight}
              title="ধাপ ১: বার্তা টেমপ্লেট নির্বাচন"
              hint="রেডিমেড টেমপ্লেট বেছে নিন অথবা নিজের বার্তা লিখুন"
              actions={
                <span className="text-[11px] font-bold text-primary bg-primary/15 px-2.5 py-1 rounded-full border border-primary/30 font-bangla-number">
                  {TEMPLATES.length}টি প্রস্তুত
                </span>
              }
            />

            {/* Template Selector Dropdown */}
            <div className="space-y-2 mb-4">
              <label className="block text-xs font-bold text-ink-body">
                মেসেজ টেমপ্লেট নির্বাচন করুন
              </label>
              <div className="relative">
                <select
                  value={selectedTemplateId}
                  onChange={(e) => handleTemplateSelect(e.target.value)}
                  className="w-full min-h-[44px] px-3.5 pr-9 bg-surface-low border border-line-soft/80 rounded-xl text-ink-strong text-xs sm:text-sm font-bold focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/25 cursor-pointer transition-all shadow-sm"
                >
                  {TEMPLATES.map((tmpl) => (
                    <option key={tmpl.id} value={tmpl.id}>
                      {tmpl.name}
                    </option>
                  ))}
                </select>
              </div>
              {/* Active template description hint */}
              {TEMPLATES.find((t) => t.id === selectedTemplateId)?.description && (
                <p className="text-[11.5px] text-ink-muted leading-relaxed">
                  💡 {TEMPLATES.find((t) => t.id === selectedTemplateId)?.description}
                </p>
              )}
            </div>

            {/* Dynamic Tags Helper */}
            <div className="space-y-2 pt-3 border-t border-line-soft/70 mb-4">
              <label className="block text-[11px] font-bold text-ink-muted uppercase tracking-wider">
                ডাইনামিক ভেরিয়েবল ট্যাগ (ক্লিক করলে বার্তায় যুক্ত হবে):
              </label>
              <div className="flex flex-wrap gap-1.5">
                {DYNAMIC_TAGS.map(({ tag, label }) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setCustomMessage((prev) => prev + " " + tag)}
                    className="px-2.5 py-1 bg-surface-low hover:bg-primary/20 hover:text-primary hover:border-primary/40 text-ink-body font-mono text-[11px] rounded-lg border border-line-soft transition cursor-pointer flex items-center gap-1 active:scale-95 shadow-sm"
                    title={`${label} ট্যাগ যোগ করুন`}
                  >
                    <span className="text-primary font-bold">+</span>
                    <span>{tag}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Message Body Textarea */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-[13px] font-bold text-ink-strong">
                  মেসেজের পূর্ণ বিবরণ (Message Body):
                </label>
                <span className="text-[11px] text-ink-muted font-mono font-bangla-number">
                  {toBengaliDigits(customMessage.length)} অক্ষর
                </span>
              </div>
              <textarea
                rows={9}
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                className="w-full p-3.5 bg-surface-low border border-line-soft/80 rounded-xl text-ink-strong text-xs font-medium focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/25 font-mono leading-relaxed resize-y transition-all shadow-inner"
                placeholder="এখানে মেসেজের টেক্সট লিখুন..."
              />
            </div>
          </Panel>

          {/* Card 2: Live WhatsApp Mockup Preview */}
          <Panel>
            <PanelHeader
              icon={FaWhatsapp}
              title="লাইভ হোয়াটসঅ্যাপ প্রিভিউ"
              hint="শিক্ষার্থীর ফোনে যেভাবে বার্তাটি প্রদর্শিত হবে"
              tone="primary"
            />

            {/* WhatsApp App Mockup Phone Box */}
            <div className="rounded-2xl border border-line-soft/90 bg-[#0b141a] overflow-hidden shadow-2xl">
              {/* WhatsApp Chat Top Header Bar */}
              <div className="bg-[#1f2c34] px-4 py-3 flex items-center justify-between border-b border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center text-xs font-bold shadow-sm">
                    KK
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-white leading-tight">কিশোরকণ্ঠ পাঠক ফোরাম</h5>
                    <p className="text-[10px] text-emerald-400">অফিসিয়াল নোটিফিকেশন সার্ভিস</p>
                  </div>
                </div>
                <span className="text-[11px] text-slate-400 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  অনলাইন
                </span>
              </div>

              {/* Chat Canvas & Message Bubble */}
              <div className="p-4 bg-[#0b141a] min-h-[170px] flex flex-col justify-end space-y-2">
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
                    <span className="text-emerald-300">✓✓</span>
                  </div>
                </div>
              </div>
            </div>

            {currentStudent && (
              <p className="text-[11.5px] text-ink-muted text-center mt-3 font-medium">
                প্রিভিউ দেখানো হচ্ছে: <strong className="text-primary">{currentStudent.name}</strong>-এর তথ্যানুযায়ী
              </p>
            )}
          </Panel>

        </div>

        {/* ----------------------------------------------------
            RIGHT COLUMN: AUDIENCE FILTERS & QUEUE DISPATCH (7 Cols)
            ---------------------------------------------------- */}
        <div className="lg:col-span-7 space-y-6">

          {/* Card 1: Audience Filters */}
          <Panel>
            <PanelHeader
              icon={HiUserGroup}
              title="ধাপ ২: টার্গেট অডিয়েন্স ফিল্টারিং"
              hint="শ্রেণি বা স্ট্যাটাস অনুযায়ী ফিল্টার করে প্রাপক তালিকা নির্ধারণ করুন"
              tone="tertiary"
              actions={
                <span className="text-xs font-bold text-tertiary bg-tertiary/15 px-3 py-1 rounded-full border border-tertiary/30 font-bangla-number">
                  {toBengaliDigits(filteredList.length)} জন প্রস্তুত
                </span>
              }
            />

            {/* Filter Inputs Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Class Dropdown */}
              <div>
                <label className="block text-xs font-bold text-ink-body mb-1.5">
                  শ্রেণি নির্বাচন
                </label>
                <select
                  value={selectedClass}
                  onChange={(e) => {
                    setSelectedClass(e.target.value);
                    setCurrentQueueIndex(0);
                  }}
                  className="w-full min-h-[42px] px-3.5 bg-surface-low border border-line-soft/80 rounded-lg text-ink-strong text-xs font-bold focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/25 cursor-pointer transition-all"
                >
                  {CLASSES.map((cls) => (
                    <option key={cls} value={cls}>{cls}</option>
                  ))}
                </select>
              </div>

              {/* Status Dropdown */}
              <div>
                <label className="block text-xs font-bold text-ink-body mb-1.5">
                  আবেদন স্ট্যাটাস
                </label>
                <select
                  value={selectedStatus}
                  onChange={(e) => {
                    setSelectedStatus(e.target.value);
                    setCurrentQueueIndex(0);
                  }}
                  className="w-full min-h-[42px] px-3.5 bg-surface-low border border-line-soft/80 rounded-lg text-ink-strong text-xs font-bold focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/25 cursor-pointer transition-all"
                >
                  <option value="all">সকল স্ট্যাটাস ({toBengaliDigits(candidates.length)})</option>
                  <option value="approved">✓ শুধুমাত্র অনুমোদিত (Approved)</option>
                  <option value="pending">⏳ অপেক্ষমাণ (Pending)</option>
                  <option value="rejected">✕ বাতিলকৃত (Rejected)</option>
                </select>
              </div>

              {/* Search Input */}
              <div>
                <label className="block text-xs font-bold text-ink-body mb-1.5">
                  প্রার্থী খুঁজুন
                </label>
                <div className="relative">
                  <HiMagnifyingGlass className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted text-sm" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentQueueIndex(0);
                    }}
                    placeholder="নাম / রোল / ফোন..."
                    className="w-full min-h-[42px] pl-9 pr-8 bg-surface-low border border-line-soft/80 rounded-lg text-ink-strong text-xs focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/25 transition-all placeholder:text-ink-muted/60"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink-strong"
                    >
                      <HiXMark className="text-sm" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </Panel>

          {/* Card 2: Interactive Smart Queue Dispatcher */}
          {filteredList.length > 0 && currentStudent ? (
            <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-surface-card via-surface-low to-surface-card border-2 border-primary/40 shadow-xl space-y-5 relative overflow-hidden">
              {/* Luminous glow */}
              <div className="absolute top-0 right-0 w-60 h-60 bg-primary/[0.08] rounded-full blur-3xl pointer-events-none" />

              {/* Top Queue Progress Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-line-soft/70">
                <div className="flex items-center gap-3">
                  <span className="w-3 h-3 rounded-full bg-primary animate-pulse shrink-0 ring-4 ring-primary/20" />
                  <div>
                    <h3 className="text-base font-bold text-ink-strong flex items-center gap-2">
                      <span>ধাপ ৩: ওয়ান-ক্লিক কিউ ডিসপ্যাচার</span>
                    </h3>
                    <span className="text-xs text-primary font-bold font-bangla-number">
                      প্রার্থী ক্রম: {toBengaliDigits(currentQueueIndex + 1)} / {toBengaliDigits(filteredList.length)}
                    </span>
                  </div>
                </div>

                {/* Sent indicator badge */}
                <div className="flex items-center gap-2">
                  {sentMap[currentStudent.id || currentStudent.roll] ? (
                    <Chip tone="primary" icon={HiCheckCircle}>
                      মেসেজ পাঠানো হয়েছে
                    </Chip>
                  ) : (
                    <Chip tone="secondary">
                      ⏳ অপেক্ষমাণ
                    </Chip>
                  )}
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px] text-ink-muted font-bold">
                  <span className="font-bangla-number">অগ্রগতি: {toBengaliDigits(sentCount)} / {toBengaliDigits(filteredList.length)} জন</span>
                  <span className="text-primary font-bangla-number">{toBengaliDigits(progressPercent)}% সম্পন্ন</span>
                </div>
                <div className="w-full h-2.5 bg-surface-low rounded-full overflow-hidden border border-line-soft/60">
                  <div 
                    className="h-full bg-gradient-to-r from-primary via-emerald-400 to-teal-400 transition-all duration-500 rounded-full"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              {/* Active Candidate Info Card */}
              <div className="p-5 rounded-xl bg-surface-low border border-line-soft/80 space-y-4 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <h4 className="text-lg sm:text-xl font-bold text-ink-strong tracking-tight">
                        {currentStudent.name}
                      </h4>
                      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/30">
                        {currentStudent.studentClass}
                      </span>
                    </div>
                    <p className="text-xs sm:text-[13px] text-ink-muted flex items-center gap-1.5 font-medium">
                      <HiBuildingOffice2 className="text-sm text-primary shrink-0" />
                      <span>{currentStudent.institution}</span>
                    </p>
                  </div>

                  <div className="text-left sm:text-right shrink-0 bg-surface-card/60 sm:bg-transparent p-2 sm:p-0 rounded-lg border sm:border-0 border-line-soft/60">
                    <span className="text-[11px] font-semibold text-ink-muted block uppercase tracking-wider">রোল / আইডি</span>
                    <strong className="text-base sm:text-lg font-bold text-secondary font-mono font-bangla-number tracking-tight">
                      {currentStudent.roll}
                    </strong>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3.5 border-t border-line-soft/70 text-xs sm:text-[13px]">
                  <div className="flex items-center gap-2.5 text-ink-body">
                    <span className="w-7 h-7 rounded-lg bg-primary/15 text-primary flex items-center justify-center shrink-0">
                      <HiPhone className="text-sm" />
                    </span>
                    <span className="font-mono font-bold text-ink-strong">
                      {currentStudent.mobile || "মোবাইল নম্বর নেই"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5 text-ink-muted">
                    <span className="w-7 h-7 rounded-lg bg-tertiary/15 text-tertiary flex items-center justify-center shrink-0">
                      <HiCalendarDays className="text-sm" />
                    </span>
                    <span className="truncate">কেন্দ্র: {currentStudent.center}</span>
                  </div>
                </div>
              </div>

              {/* Queue Action Controls */}
              <div className="space-y-3 pt-1">
                {/* Primary WhatsApp Dispatch Button */}
                <button
                  type="button"
                  onClick={handleSendCurrentAndNext}
                  className="w-full min-h-[48px] px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 via-primary to-emerald-600 hover:brightness-110 text-primary-on font-bold text-sm sm:text-[15px] shadow-lg shadow-emerald-500/25 transition-all hover:scale-[1.005] active:scale-[0.98] cursor-pointer flex items-center justify-center gap-3 select-none"
                >
                  <FaWhatsapp className="text-xl shrink-0" />
                  <span className="tracking-wide">হোয়াটসঅ্যাপে পাঠান ও পরেরটিতে যান ➡️</span>
                </button>

                {/* Secondary Navigation & Utility Row */}
                <div className="grid grid-cols-3 gap-2.5">
                  {/* Previous Button */}
                  <button
                    type="button"
                    onClick={() => {
                      if (currentQueueIndex > 0) setCurrentQueueIndex((prev) => prev - 1);
                    }}
                    disabled={currentQueueIndex === 0}
                    className="min-h-[42px] px-3.5 py-2 rounded-xl bg-surface-low hover:bg-surface-overlay text-ink-body hover:text-ink-strong border border-line-soft/80 font-semibold text-xs sm:text-[13px] transition-all active:scale-[0.98] cursor-pointer disabled:opacity-35 disabled:cursor-not-allowed disabled:pointer-events-none flex items-center justify-center gap-1.5 shadow-sm select-none"
                    title="পূর্ববর্তী প্রার্থী"
                  >
                    <HiChevronLeft className="text-base shrink-0" />
                    <span>আগেরটি</span>
                  </button>

                  {/* Copy Message Button */}
                  <button
                    type="button"
                    onClick={() => handleCopyMessage(currentStudent)}
                    className="min-h-[42px] px-3.5 py-2 rounded-xl bg-surface-low hover:bg-surface-overlay text-ink-body hover:text-ink-strong border border-line-soft/80 font-semibold text-xs sm:text-[13px] transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-1.5 shadow-sm select-none"
                    title="মেসেজের ফরম্যাটেড টেক্সট ক্লিপবোর্ডে কপি করুন"
                  >
                    {copiedStudentId === (currentStudent.id || currentStudent.roll) ? (
                      <>
                        <HiClipboardDocumentCheck className="text-primary text-base shrink-0" />
                        <span className="text-primary font-bold">কপি হয়েছে!</span>
                      </>
                    ) : (
                      <>
                        <HiClipboardDocument className="text-base shrink-0 text-ink-muted" />
                        <span>মেসেজ কপি</span>
                      </>
                    )}
                  </button>

                  {/* Next / Skip Button */}
                  <button
                    type="button"
                    onClick={() => {
                      if (currentQueueIndex < filteredList.length - 1) setCurrentQueueIndex((prev) => prev + 1);
                    }}
                    disabled={currentQueueIndex >= filteredList.length - 1}
                    className="min-h-[42px] px-3.5 py-2 rounded-xl bg-surface-low hover:bg-surface-overlay text-ink-body hover:text-ink-strong border border-line-soft/80 font-semibold text-xs sm:text-[13px] transition-all active:scale-[0.98] cursor-pointer disabled:opacity-35 disabled:cursor-not-allowed disabled:pointer-events-none flex items-center justify-center gap-1.5 shadow-sm select-none"
                    title="পরবর্তী প্রার্থী স্কিপ করুন"
                  >
                    <span>পরেরটি</span>
                    <HiChevronRight className="text-base shrink-0" />
                  </button>
                </div>
              </div>

            </div>
          ) : (
            <div className="p-10 rounded-2xl bg-surface-card border border-line-soft/80 text-center text-ink-muted text-xs space-y-2">
              <p>আপনার নির্বাচিত ফিল্টারের সাথে মেলানো কোনো শিক্ষার্থী পাওয়া যায়নি।</p>
              <button
                type="button"
                onClick={() => {
                  setSelectedClass("সকল শ্রেণি");
                  setSelectedStatus("all");
                  setSearchQuery("");
                }}
                className="text-primary hover:underline font-bold cursor-pointer"
              >
                ফিল্টার রিসেট করুন
              </button>
            </div>
          )}

          {/* Card 3: Complete Recipient Table / List */}
          <div className="rounded-2xl bg-surface-card border border-line-soft/80 shadow-md overflow-hidden">
            <div className="p-4 bg-surface-low border-b border-line-soft/80 flex items-center justify-between text-xs font-bold text-ink-strong">
              <span className="flex items-center gap-2">
                <span>সম্পূর্ণ প্রার্থী তালিকা</span>
                <span className="text-[11px] font-bold text-ink-muted bg-surface-overlay/80 px-2.5 py-0.5 rounded-full font-bangla-number">
                  {toBengaliDigits(filteredList.length)} জন
                </span>
              </span>
              <span className="text-[11px] text-ink-muted hidden sm:inline font-normal">
                যেকোনো সারিতে ক্লিক করলে সরাসরি কিউতে লোড হবে
              </span>
            </div>

            <div className="max-h-96 overflow-y-auto divide-y divide-line-soft/50 text-xs scrollbar-slim">
              {filteredList.map((st, idx) => {
                const isSelected = currentQueueIndex === idx;
                const isSent = !!sentMap[st.id || st.roll];

                return (
                  <div
                    key={st.id || idx}
                    onClick={() => setCurrentQueueIndex(idx)}
                    className={`p-3.5 flex items-center justify-between gap-3 transition-colors cursor-pointer ${
                      isSelected
                        ? "bg-primary/12 border-l-4 border-primary"
                        : "hover:bg-surface-overlay/40"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-mono font-bold shrink-0 font-bangla-number ${
                        isSelected 
                          ? "bg-primary text-primary-on" 
                          : "bg-surface-overlay text-ink-muted"
                      }`}>
                        {toBengaliDigits(idx + 1)}
                      </span>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <strong className="text-ink-strong font-bold truncate block">{st.name}</strong>
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-surface-overlay text-ink-muted">
                            {st.studentClass}
                          </span>
                        </div>
                        <span className="text-[11px] text-ink-muted font-mono block truncate mt-0.5">
                          রোল: {st.roll} • {st.mobile || "নম্বর নেই"} • {st.institution}
                        </span>
                      </div>
                    </div>

                    {/* Action Controls for this Row */}
                    <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                      {isSent && (
                        <span className="text-[11px] text-primary font-bold flex items-center gap-1 mr-1 hidden sm:flex">
                          <HiCheck className="text-sm" />
                          <span>পাঠানো হয়েছে</span>
                        </span>
                      )}

                      {/* Copy message button */}
                      <button
                        type="button"
                        onClick={() => handleCopyMessage(st)}
                        className="w-8 h-8 rounded-lg bg-surface-overlay hover:bg-surface-overlay/80 text-ink-muted hover:text-ink-strong border border-line-soft/80 transition flex items-center justify-center cursor-pointer shadow-sm"
                        title="মেসেজ কপি করুন"
                      >
                        {copiedStudentId === (st.id || st.roll) ? (
                          <HiClipboardDocumentCheck className="text-primary text-sm" />
                        ) : (
                          <HiClipboardDocument className="text-sm" />
                        )}
                      </button>

                      {/* Send WhatsApp direct */}
                      <button
                        type="button"
                        onClick={() => handleSendDirect(st, idx)}
                        className="w-8 h-8 rounded-lg bg-primary/15 hover:bg-primary/25 text-primary border border-primary/30 transition flex items-center justify-center cursor-pointer shadow-sm"
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
