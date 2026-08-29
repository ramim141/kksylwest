import React, { useState, useEffect, useMemo } from "react";
import {
  HiClipboardDocument,
  HiClipboardDocumentCheck,
  HiArrowDownTray,
  HiMagnifyingGlass,
  HiChatBubbleLeftRight,
  HiCheck,
} from "react-icons/hi2";
import { FaWhatsapp, FaUserCheck, FaMobileAlt, FaPaperPlane } from "react-icons/fa";
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

const TEMPLATES = [
  {
    id: "admit",
    name: "🎫 প্রবেশপত্র প্রকাশ ও রোল বরাদ্দ",
    badge: "প্রবেশপত্র",
    text: `কিশোরকণ্ঠ মেধাবৃত্তি পরীক্ষা ২০২৫-এ আপনার আবেদন সফলভাবে অনুমোদিত হয়েছে।

📌 আপনার পরীক্ষার বিবরণ:
• রোল নম্বর: {roll}
• পরীক্ষার্থীর নাম: {name}
• শ্রেণি: {class}
• পরীক্ষা কেন্দ্র: {center}
• পরীক্ষার তারিখ: {examDate}

🪪 প্রবেশপত্র ডাউনলোড লিংক:
👉 {admitUrl}

পরীক্ষার দিন প্রবেশপত্রটি প্রিন্ট করে পরীক্ষা কেন্দ্রে সাথে নিয়ে আসতে হবে।

শুভেচ্ছান্তে,
কিশোরকণ্ঠ পাঠক ফোরাম, সিলেট জেলা পশ্চিম।`,
  },
  {
    id: "exam_reminder",
    name: "🎯 পরীক্ষার চূড়ান্ত সময় ও কেন্দ্রের স্মরণিকা",
    badge: "পরীক্ষা স্মরণিকা",
    text: `আসসালামু আলাইকুম {name},
আগামী {examDate} কিশোরকণ্ঠ মেধাবৃত্তি পরীক্ষা অনুষ্ঠিত হতে যাচ্ছে।

📌 আপনার পরীক্ষার তথ্য:
• রোল নম্বর: {roll}
• পরীক্ষা কেন্দ্র: {center}
• সময়: সকাল ১০:০০টা (১৫ মিনিট পূর্বে উপস্থিতি কাম্য)

প্রবেশপত্র, কলম ও প্রয়োজনীয় জ্যামিতি বক্স সাথে আনুন। আপনার সাফল্য কামনা করি!

কিশোরকণ্ঠ মেধাবৃত্তি পরিষদ।`,
  },
  {
    id: "result",
    name: "🏆 ফলাফল প্রকাশ ও মেধা সম্মাননা",
    badge: "ফলাফল",
    text: `অভিনন্দন {name}!
কিশোরকণ্ঠ মেধাবৃত্তি পরীক্ষা ২০২৫-এর ফলাফল প্রকাশিত হয়েছে।

আপনার বিস্তারিত ফলাফল ও মেধা সনদ দেখতে নিচের লিংকে প্রবেশ করুন:
👉 {resultUrl}

কিশোরকণ্ঠ পাঠক ফোরাম, সিলেট জেলা পশ্চিম।`,
  },
  {
    id: "custom",
    name: "✍️ কাস্টম ব্রডকাস্ট বার্তা (Custom Message)",
    badge: "কাস্টম",
    text: `আসসালামু আলাইকুম {name},

(এখানে আপনার নোটিশ বা বার্তা লিখুন...)

কিশোরকণ্ঠ পাঠক ফোরাম, সিলেট জেলা পশ্চিম।`,
  },
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
          examDate: r.examDate || settings?.defaultExamDate || "২৪ অক্টোবর ২০২৫",
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
          examDate: settings?.defaultExamDate || "২৪ অক্টোবর ২০২৫",
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
    const admitUrl = `${origin}/admit-card?id=${encodeURIComponent(student.roll)}`;
    const resultUrl = `${origin}/search?roll=${encodeURIComponent(student.roll)}`;

    return customMessage
      .replace(/{name}|{নাম}/g, student.name || "")
      .replace(/{roll}|{রোল}/g, student.roll || "")
      .replace(/{class}|{শ্রেণি}/g, student.studentClass || "")
      .replace(/{school}|{প্রতিষ্ঠান}/g, student.institution || "")
      .replace(/{center}|{কেন্দ্র}/g, student.center || "সিলেট সরকারি আলিয়া মাদরাসা কেন্দ্র")
      .replace(/{examDate}|{তারিখ}/g, student.examDate || "২৪ অক্টোবর ২০২৫")
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
    const waUrl = `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
    window.open(waUrl, "_blank");

    // Mark as sent
    setSentMap((prev) => ({ ...prev, [currentStudent.id || currentStudent.roll]: true }));

    // Advance queue
    if (currentQueueIndex < filteredList.length - 1) {
      setCurrentQueueIndex((prev) => prev + 1);
    }
  };

  const handleSendDirect = (student) => {
    const phone = cleanPhone(student.mobile);
    if (!phone) {
      setStatusMessage({ type: "error", text: `${student.name}-এর কোনো বৈধ মোবাইল নম্বর পাওয়া যায়নি!` });
      return;
    }
    const msg = formatMessageFor(student);
    const waUrl = `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
    window.open(waUrl, "_blank");
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

  return (
    <div className="space-y-6 text-ink-strong font-sans">
      
      <div className="flex flex-wrap justify-end gap-2">
        <Button
          tone="neutral"
          icon={copiedNumbers ? HiClipboardDocumentCheck : HiClipboardDocument}
          onClick={handleCopyAllNumbers}
        >
          {copiedNumbers ? "নম্বরগুলো কপি হয়েছে" : "সব নম্বর কপি করুন"}
        </Button>
        <Button tone="neutral" icon={HiArrowDownTray} onClick={handleExportCSV}>
          কন্টাক্ট শিট (CSV)
        </Button>
      </div>

      {/* Main 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 items-start">
        
        {/* Left Column: Template & Message Composer (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-5 bg-surface-card border border-line-soft rounded-lg shadow-none space-y-4">
            
            <div className="flex items-center justify-between border-b border-line-soft pb-3">
              <h3 className="text-[13px] sm:text-sm font-semibold text-ink-strong uppercase tracking-wider flex items-center gap-2">
                <HiChatBubbleLeftRight className="text-primary-400 text-base" />
                <span>মেসেজ টেমপ্লেট ও বার্তা কম্পোজার</span>
              </h3>
            </div>

            {/* Template Presets */}
            <div className="space-y-2">
              <label className="block text-[13px] font-bold text-ink-body">রেডিমেড টেমপ্লেট নির্বাচন করুন:</label>
              <div className="grid grid-cols-1 gap-2">
                {TEMPLATES.map((tmpl) => (
                  <button
                    key={tmpl.id}
                    type="button"
                    onClick={() => handleTemplateSelect(tmpl.id)}
                    className={`p-2.5 rounded border text-left text-[13px] font-bold transition cursor-pointer flex items-center justify-between ${
                      selectedTemplateId === tmpl.id
                        ? "bg-primary-500/15 border-primary-500/50 text-primary-300 shadow-sm"
                        : "bg-surface border-line-soft text-ink-muted hover:text-ink-strong"
                    }`}
                  >
                    <span>{tmpl.name}</span>
                    {selectedTemplateId === tmpl.id && <HiCheck className="text-primary-400 text-base shrink-0" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Dynamic Tags Helper */}
            <div>
              <label className="block text-[13px] font-bold text-ink-muted mb-1.5">
                ক্লিক করে ডাইনামিক ভেরিয়েবল ট্যাগ যোগ করুন:
              </label>
              <div className="flex flex-wrap gap-1.5">
                {["{name}", "{roll}", "{class}", "{school}", "{center}", "{examDate}", "{admitUrl}", "{resultUrl}"].map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setCustomMessage((prev) => prev + " " + tag)}
                    className="px-2.5 py-1 bg-surface-overlay/40 hover:bg-surface-overlay text-secondary font-mono text-[12px] rounded-lg border border-line-soft transition cursor-pointer"
                  >
                    + {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Message Textarea */}
            <div>
              <label className="block text-[13px] font-bold text-ink-body mb-1.5">
                মেসেজের পূর্ণ বিবরণ (Message Body):
              </label>
              <textarea
                rows={9}
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                className="w-full p-3.5 bg-surface border border-line-soft rounded text-ink-strong text-[13px] font-medium focus:outline-none focus:border-primary-400 font-mono leading-relaxed"
                placeholder="মেসেজ লিখুন..."
              />
            </div>

            {/* WhatsApp Live Preview Bubble */}
            <div className="pt-2 border-t border-line-soft">
              <label className="block text-[13px] font-bold text-ink-muted mb-2">
                লাইভ হোয়াটসঅ্যাপ প্রিভিউ (Live WhatsApp Preview):
              </label>
              <div className="bg-[#0b141a] p-3.5 rounded border border-line-soft space-y-2">
                <div className="bg-[#005c4b] text-ink-strong p-3 rounded-lg rounded-tl-sm text-[13px] font-normal leading-relaxed whitespace-pre-wrap shadow-none">
                  {formatMessageFor(currentStudent || {
                    name: "মোহাম্মদ মুনতাসির মাহমুদ",
                    roll: "১০০১৩",
                    studentClass: "১০ম শ্রেণি",
                    institution: "শাহজালাল স্কুল",
                    center: "সিলেট সরকারি আলিয়া মাদরাসা কেন্দ্র",
                    examDate: "২৪ অক্টোবর ২০২৫",
                  })}
                  <div className="text-right text-[9px] text-primary-200/70 mt-1 font-mono">
                    ১২:৩০ PM • ✓✓
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Right Column: Audience Filters & Interactive Dispatch Queue (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Audience Filter Bar */}
          <div className="p-4 sm:p-5 bg-surface-card border border-line-soft rounded-lg shadow-none space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              
              {/* Class Filter */}
              <div>
                <label className="block text-[13px] font-bold text-ink-muted mb-1">শ্রেণি ফিল্টার</label>
                <select
                  value={selectedClass}
                  onChange={(e) => {
                    setSelectedClass(e.target.value);
                    setCurrentQueueIndex(0);
                  }}
                  className="w-full px-3 py-2 bg-surface border border-line-soft rounded text-ink-strong text-[13px] font-bold"
                >
                  {CLASSES.map((cls) => (
                    <option key={cls} value={cls}>{cls}</option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-[13px] font-bold text-ink-muted mb-1">আবেদন স্ট্যাটাস</label>
                <select
                  value={selectedStatus}
                  onChange={(e) => {
                    setSelectedStatus(e.target.value);
                    setCurrentQueueIndex(0);
                  }}
                  className="w-full px-3 py-2 bg-surface border border-line-soft rounded text-ink-strong text-[13px] font-bold"
                >
                  <option value="all">সকল স্ট্যাটাস</option>
                  <option value="approved">✓ শুধুমাত্র অনুমোদিত (Approved)</option>
                  <option value="pending">⏳ অপেক্ষমাণ (Pending)</option>
                  <option value="rejected">✕ বাতিলকৃত (Rejected)</option>
                </select>
              </div>

              {/* Search input */}
              <div>
                <label className="block text-[13px] font-bold text-ink-muted mb-1">প্রার্থী খুঁজুন</label>
                <div className="relative">
                  <HiMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted text-[13px]" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentQueueIndex(0);
                    }}
                    placeholder="নাম / রোল / মোবাইল..."
                    className="w-full pl-8 pr-3 py-2 bg-surface border border-line-soft rounded text-ink-strong text-[13px]"
                  />
                </div>
              </div>

            </div>

            {/* Audience Count Summary Strip */}
            <div className="flex items-center justify-between text-[13px] pt-1 border-t border-line-soft">
              <span className="text-ink-muted font-medium">
                নির্বাচিত শিক্ষার্থী: <strong className="text-primary-400 font-bold">{filteredList.length} জন</strong>
              </span>
              <span className="text-ink-muted font-medium">
                মেসেজ পাঠানো হয়েছে: <strong className="text-secondary font-mono font-bold">{sentCount} জন</strong>
              </span>
            </div>
          </div>

          {/* Interactive Queue Card */}
          {filteredList.length > 0 && currentStudent ? (
            <div className="p-5 bg-surface-card border border-primary/40 rounded-lg space-y-4 animate-fadeIn relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/10 rounded-full blur-2xl pointer-events-none" />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-primary-400 animate-pulse" />
                  <span className="text-[13px] font-bold text-primary-400 uppercase tracking-wider">
                    পরবর্তী কিউ প্রার্থী ({currentQueueIndex + 1}/{filteredList.length})
                  </span>
                </div>

                {sentMap[currentStudent.id || currentStudent.roll] && (
                  <span className="px-2.5 py-0.5 rounded-full bg-primary-500/20 text-primary-300 border border-primary-500/40 text-[12px] font-bold">
                    ✓ পাঠানো সম্পন্ন
                  </span>
                )}
              </div>

              {/* Candidate Quick Matrix */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 bg-surface-card p-3.5 rounded border border-line-soft text-[13px]">
                <div>
                  <span className="text-[12px] text-ink-muted block">নাম:</span>
                  <strong className="text-ink-strong font-bold block truncate">{currentStudent.name}</strong>
                </div>
                <div>
                  <span className="text-[12px] text-ink-muted block">রোল / ট্র্যাকিং:</span>
                  <strong className="text-secondary font-mono font-bold block">{currentStudent.roll}</strong>
                </div>
                <div>
                  <span className="text-[12px] text-ink-muted block">মোবাইল নম্বর:</span>
                  <strong className="text-primary-400 font-mono font-bold block">{currentStudent.mobile || "নম্বর নেই"}</strong>
                </div>
                <div>
                  <span className="text-[12px] text-ink-muted block">শ্রেণি:</span>
                  <strong className="text-tertiary font-bold block">{currentStudent.studentClass}</strong>
                </div>
              </div>

              {/* Big Queue Action Button */}
              <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={handleSendCurrentAndNext}
                  className="flex-1 py-3.5 px-6 rounded bg-gradient-to-r from-primary-500 to-tertiary hover:from-primary-400 hover:to-tertiary text-primary-on font-semibold text-[13px] sm:text-sm shadow-none shadow-primary-500/25 transition cursor-pointer flex items-center justify-center gap-2 hover:scale-102 active:scale-98"
                >
                  <FaWhatsapp className="text-lg shrink-0" />
                  <span>WhatsApp-এ পাঠান ও পরেরটিতে যান ➡️</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (currentQueueIndex < filteredList.length - 1) {
                      setCurrentQueueIndex((prev) => prev + 1);
                    }
                  }}
                  disabled={currentQueueIndex >= filteredList.length - 1}
                  className="px-4 py-3.5 rounded bg-surface-overlay/40 hover:bg-surface-overlay text-ink-body hover:text-ink-strong font-bold text-[13px] border border-line-soft transition cursor-pointer disabled:opacity-40"
                >
                  পরেরটি ⏭️
                </button>
              </div>
            </div>
          ) : (
            <div className="p-8 bg-surface-card border border-line-soft rounded-lg text-center text-ink-muted text-[13px]">
              কোনো প্রার্থী ফিল্টারের সাথে মেলেনি।
            </div>
          )}

          {/* Student Recipient List Table */}
          <div className="bg-surface-card border border-line-soft rounded-lg shadow-none overflow-hidden">
            <div className="p-3.5 bg-surface-card border-b border-line-soft flex items-center justify-between text-[13px] font-bold text-ink-body">
              <span>প্রার্থী তালিকা ({filteredList.length})</span>
              <span className="text-[12px] text-ink-muted">সরাসরি পাঠাতে বাটনে ক্লিক করুন</span>
            </div>

            <div className="max-h-80 overflow-y-auto divide-y divide-line-soft text-[13px]">
              {filteredList.map((st, idx) => (
                <div
                  key={st.id || idx}
                  className={`p-3 flex items-center justify-between gap-3 hover:bg-surface-overlay/40 transition ${
                    currentQueueIndex === idx ? "bg-primary-500/10 border-l-4 border-primary-400" : ""
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="w-6 h-6 rounded-full bg-surface-overlay/40 text-ink-muted flex items-center justify-center text-[12px] font-mono shrink-0">
                      {idx + 1}
                    </span>
                    <div className="min-w-0">
                      <strong className="text-ink-strong font-bold block truncate">{st.name}</strong>
                      <span className="text-[12px] text-ink-muted font-mono">
                        রোল: {st.roll} • {st.studentClass} • {st.mobile || "নম্বর নেই"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {sentMap[st.id || st.roll] && (
                      <span className="text-[12px] text-primary-400 font-bold flex items-center gap-1">
                        <HiCheck /> পাঠানো হয়েছে
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        setCurrentQueueIndex(idx);
                        handleSendDirect(st);
                      }}
                      className="w-10 h-10 inline-flex items-center justify-center shrink-0 rounded bg-primary-500/15 hover:bg-primary-500/30 text-primary-400 border border-primary-500/30 transition cursor-pointer"
                      title="সরাসরি এই শিক্ষার্থীকে WhatsApp পাঠান"
                    >
                      <FaWhatsapp className="text-sm" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>


      <Toast message={statusMessage} onDismiss={() => setStatusMessage(null)} />
    </div>
  );
};

export default WhatsAppBroadcaster;
