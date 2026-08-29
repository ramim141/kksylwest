import React, { useState, useEffect, useMemo } from "react";
import {
  HiBell,
  HiCalendar,
  HiClock,
  HiSparkles,
  HiPaperClip,
  HiPhoto,
  HiXMark,
  HiArrowTopRightOnSquare,
  HiMagnifyingGlass,
  HiPrinter,
  HiShare,
  HiCheckCircle,
  HiSquares2X2,
  HiBars3BottomLeft,
  HiEye,
  HiDocumentText,
  HiChevronRight,
  HiFunnel,
} from "react-icons/hi2";
import { FaThumbtack } from "react-icons/fa";
import { getNotices } from "../services/firestore";
import { Skeleton, SkeletonRegion, SkeletonCard, SkeletonGrid, Reveal } from "./common";

const DEFAULT_NOTICES = [
  {
    id: 1,
    title: "কিশোরকণ্ঠ মেধাবৃত্তি - ২০২৫ এর ফলাফল প্রকাশ",
    description:
      "কিশোরকণ্ঠ মেধাবৃত্তি পরীক্ষা - ২০২৫, সিলেট জেলা পশ্চিম এর ফলাফল প্রকাশিত হয়েছে। সার্চ অপশন ব্যবহার করে আপনার রোল নম্বর দিয়ে ফলাফল দেখুন। সকল উত্তীর্ণ শিক্ষার্থীদের আন্তরিক অভিনন্দন ও মোবারকবাদ।",
    date: "১৩ ডিসেম্বর ২০২৫",
    time: "১২:৩০ AM",
    type: "result",
    isPinned: false,
    refNo: "KKMB/NOT/2025/08",
  },
  {
    id: 2,
    title: "মেধাবৃত্তির পুরস্কার বিতরণী ও সংবর্ধনা অনুষ্ঠান প্রসঙ্গে",
    description:
      "২০২৬ সালের জানুয়ারী মাসের প্রথমার্ধে (সম্ভাব্য), কিশোরকণ্ঠ পাঠক ফোরাম সিলেট জেলা পশ্চিম-এর কিশোরকণ্ঠ মেধাবৃত্তি পরীক্ষা-২০২৫ এর পুরস্কার বিতরণী অনুষ্ঠান অনুষ্ঠিত হবে। সকল অভিভাবক ও শিক্ষার্থীদের উপস্থিত থাকার জন্য অনুরোধ করা হচ্ছে। মোবাইল এসএমএস, ওয়েবসাইট এবং ফেসবুক পেইজে বিস্তারিত স্থান ও সময়সূচি জানিয়ে দেওয়া হবে।",
    date: "১৫ ডিসেম্বর ২০২৫",
    time: "১০:০০ PM",
    type: "event",
    isPinned: false,
    refNo: "KKMB/NOT/2025/09",
  },
  {
    id: 3,
    title: "জরুরি নোটিশ: কিশোরকণ্ঠ মেধাবৃত্তি পরীক্ষা - ২০২৬ এর পুরষ্কার বিতরণী অনুষ্ঠান প্রসঙ্গে",
    description:
      "২০২৬ সালের মার্চ-২৮, কিশোরকণ্ঠ পাঠক ফোরাম সিলেট জেলা পশ্চিম-এর কিশোরকণ্ঠ মেধাবৃত্তি পরীক্ষা-২০২৫ এর পুরস্কার বিতরণী অনুষ্ঠান সিলেট কাজী নজরুল অডিটরিয়াম, রিকাবীবাজার, সিলেট-এ সফলভাবে সম্পন্ন হয়েছে। উক্ত অনুষ্ঠানে উত্তীর্ণ শিক্ষার্থীদের মাঝে ক্রেস্ট, সনদ ও নগদ বৃত্তির অর্থ প্রদান করা হয়েছে।",
    date: "২৮ মার্চ ২০২৬",
    time: "১০:০০ PM",
    type: "announcement",
    isPinned: true,
    refNo: "KKMB/NOT/2026/01",
  },
];

const CATEGORIES = [
  { id: "all", label: "সকল নোটিশ" },
  { id: "result", label: "ফলাফল ও বৃত্তি" },
  { id: "announcement", label: "জরুরি ঘোষণা" },
  { id: "event", label: "অনুষ্ঠান ও সংবর্ধনা" },
  { id: "circular", label: "সার্কুলার" },
];

const getTypeStyle = (type) => {
  switch (type) {
    case "result":
      return {
        badgeBg: "bg-emerald-500/15",
        badgeText: "text-emerald-300",
        badgeBorder: "border-emerald-500/30",
        dot: "bg-emerald-400",
        label: "ফলাফল",
      };
    case "announcement":
      return {
        badgeBg: "bg-purple-500/15",
        badgeText: "text-purple-300",
        badgeBorder: "border-purple-500/30",
        dot: "bg-purple-400",
        label: "জরুরি ঘোষণা",
      };
    case "event":
      return {
        badgeBg: "bg-sky-500/15",
        badgeText: "text-sky-300",
        badgeBorder: "border-sky-500/30",
        dot: "bg-sky-400",
        label: "অনুষ্ঠান",
      };
    case "circular":
      return {
        badgeBg: "bg-amber-500/15",
        badgeText: "text-amber-300",
        badgeBorder: "border-amber-500/30",
        dot: "bg-amber-400",
        label: "সার্কুলার",
      };
    default:
      return {
        badgeBg: "bg-white/[0.08]",
        badgeText: "text-slate-300",
        badgeBorder: "border-white/15",
        dot: "bg-indigo-400",
        label: "সাধারণ নোটিশ",
      };
  }
};

const Notice = () => {
  const [notices, setNotices] = useState(DEFAULT_NOTICES);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("grid"); // 'grid' | 'table'
  const [selectedNotice, setSelectedNotice] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    getNotices()
      .then((data) => {
        if (data && data.length > 0) {
          setNotices(data);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const filteredNotices = useMemo(() => {
    return notices.filter((item) => {
      const matchCat =
        selectedCategory === "all" || item.type === selectedCategory;
      const matchSearch =
        searchTerm === "" ||
        item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.refNo?.toLowerCase().includes(searchTerm.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [notices, selectedCategory, searchTerm]);

  const pinnedNotices = useMemo(
    () => filteredNotices.filter((n) => n.isPinned),
    [filteredNotices]
  );
  const regularNotices = useMemo(
    () => filteredNotices.filter((n) => !n.isPinned),
    [filteredNotices]
  );

  const handleShare = (notice) => {
    const url = `${window.location.origin}/notice`;
    if (navigator.share) {
      navigator
        .share({
          title: notice.title,
          text: `${notice.title}\n\nবিস্তারিত পড়ুন: ${url}`,
          url,
        })
        .catch(() => {});
    } else {
      navigator.clipboard.writeText(`${notice.title}\n\n${url}`);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2500);
    }
  };

  const handlePrintModal = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-[#0b1326] text-white pb-24 font-sans">
      
      {/* 1. Header Banner */}
      <section className="relative w-full px-3 sm:px-6 pt-12 sm:pt-20 pb-10 sm:pb-16 bg-[#0f1124] border-b border-white/[0.08] overflow-hidden">
        <div className="pointer-events-none absolute top-0 left-1/4 w-80 sm:w-96 h-80 sm:h-96 bg-indigo-500/10 rounded-full blur-3xl" />
        <div className="pointer-events-none absolute top-10 right-1/4 w-80 sm:w-96 h-80 sm:h-96 bg-emerald-500/10 rounded-full blur-3xl" />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 sm:gap-6">
            <div className="space-y-2 sm:space-y-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 text-xs font-bold backdrop-blur-md">
                <HiBell className="text-amber-400 text-sm" />
                <span>অফিশিয়াল নোটিশ ও সার্কুলার বোর্ড</span>
              </div>

              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
                সকল গুরুত্বপূর্ণ <br className="sm:hidden" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-400">
                  বিজ্ঞপ্তি বোর্ড
                </span>
              </h1>

              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed font-normal">
                কিশোরকণ্ঠ পাঠক ফোরাম সিলেট জেলা পশ্চিম কর্তৃক প্রকাশিত পরীক্ষার ফলাফল, প্রবেশপত্র, সংবর্ধনা ও যাবতীয় অফিশিয়াল নোটিশ।
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Controls, Filter Tabs & Search Bar */}
      <div className="w-full px-3 sm:px-6 -mt-5 sm:-mt-6 relative z-20">
        <div className="max-w-7xl mx-auto">
          <div className="p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl bg-[#14162b] border border-white/10 shadow-2xl backdrop-blur-xl space-y-3 sm:space-y-4">
            
            {/* Top Row: Search Input & View Toggle */}
            <div className="flex items-center gap-2.5">
              <div className="relative flex-1">
                <HiMagnifyingGlass className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-base" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="নোটিশের শিরোনাম বা স্মারক খুঁজুন..."
                  className="w-full pl-10 pr-9 py-2.5 bg-[#090a16] border border-white/15 rounded-xl text-xs sm:text-sm font-semibold text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-400"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    <HiXMark />
                  </button>
                )}
              </div>

              {/* View Mode Toggle (Desktop) */}
              <div className="hidden sm:flex items-center p-1 bg-[#090a16] border border-white/10 rounded-xl">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-lg text-sm transition cursor-pointer ${
                    viewMode === "grid"
                      ? "bg-indigo-600 text-white font-bold"
                      : "text-slate-400 hover:text-white"
                  }`}
                  title="কার্ড ভিউ"
                >
                  <HiSquares2X2 />
                </button>
                <button
                  onClick={() => setViewMode("table")}
                  className={`p-2 rounded-lg text-sm transition cursor-pointer ${
                    viewMode === "table"
                      ? "bg-indigo-600 text-white font-bold"
                      : "text-slate-400 hover:text-white"
                  }`}
                  title="টেবিল ভিউ"
                >
                  <HiBars3BottomLeft />
                </button>
              </div>
            </div>

            {/* Bottom Row: Filter Chips with No Ugly Scrollbar and Clean Wrapping */}
            <div className="pt-1 border-t border-white/[0.08]">
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                {CATEGORIES.map((cat) => {
                  const active = selectedCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                        active
                          ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/25 scale-102"
                          : "bg-white/[0.05] text-slate-300 hover:bg-white/[0.10] hover:text-white border border-white/10"
                      }`}
                    >
                      {cat.label}
                    </button>
                  );
                })}
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* 3. Main Notice Content Body */}
      <div className="w-full px-3 sm:px-6 mt-6 sm:mt-8">
        <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
          
          {/* While the fetch is in flight the defaults are still on screen,
              so a skeleton stands in rather than showing content that is
              about to be replaced. */}
          {loading ? (
            <SkeletonRegion label="নোটিশ লোড হচ্ছে" className="space-y-6 sm:space-y-8">
              <div className="space-y-3 sm:space-y-4">
                <Skeleton className="w-56 h-5 rounded-full" />
                <SkeletonCard media={false} lines={3} className="sm:p-7 rounded-2xl sm:rounded-3xl" />
              </div>
              <div className="space-y-4">
                <Skeleton className="w-48 h-5 rounded-full" />
                <SkeletonGrid count={6} media={false} />
              </div>
            </SkeletonRegion>
          ) : (
          <>
          {/* Pinned VIP Spotlight Notice */}
          {pinnedNotices.length > 0 && (
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-center gap-2">
                <FaThumbtack className="text-amber-400 rotate-45 text-sm" />
                <h2 className="text-sm sm:text-base font-extrabold text-white">
                  গুরুত্বপূর্ণ ও পিন করা নোটিশ
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 text-[10px] font-bold uppercase">
                  Featured
                </span>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {pinnedNotices.map((notice) => {
                  const style = getTypeStyle(notice.type);
                  return (
                    <div
                      key={notice.id}
                      className="relative p-5 sm:p-7 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-amber-950/25 via-[#0f1124] to-[#0f1124] border-2 border-amber-400/40 hover:border-amber-400 shadow-2xl transition-all duration-300 space-y-4"
                    >
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <span
                          className={`px-2.5 py-0.5 rounded-full font-bold text-[11px] border ${style.badgeBg} ${style.badgeText} ${style.badgeBorder}`}
                        >
                          {style.label}
                        </span>
                        <span className="text-slate-400 text-xs font-semibold flex items-center gap-1">
                          <HiCalendar className="text-emerald-400" />
                          {notice.date}
                        </span>
                        {notice.refNo && (
                          <span className="text-slate-400 text-[10px] sm:text-[11px] font-mono bg-white/[0.06] border border-white/10 px-2 py-0.5 rounded">
                            স্মারক: {notice.refNo}
                          </span>
                        )}
                      </div>

                      <h3
                        onClick={() => setSelectedNotice(notice)}
                        className="text-base sm:text-xl font-black text-white hover:text-amber-300 transition-colors cursor-pointer leading-snug"
                      >
                        {notice.title}
                      </h3>

                      <p className="text-xs sm:text-sm text-slate-300 leading-relaxed line-clamp-3">
                        {notice.description}
                      </p>

                      {/* Attachments Pills */}
                      {(notice.imageUrl || notice.attachmentUrl) && (
                        <div className="flex flex-wrap items-center gap-2 pt-1">
                          {notice.imageUrl && (
                            <button
                              type="button"
                              onClick={() => setPreviewImage(notice.imageUrl)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 text-xs font-bold transition border border-emerald-500/30 cursor-pointer"
                            >
                              <HiPhoto /> সার্কুলার ছবি
                            </button>
                          )}
                          {notice.attachmentUrl && (
                            <a
                              href={notice.attachmentUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-500/15 hover:bg-sky-500/25 text-sky-300 text-xs font-bold transition border border-sky-500/30"
                            >
                              <HiPaperClip /> ফাইল ডাউনলোড <HiArrowTopRightOnSquare />
                            </a>
                          )}
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="pt-2 border-t border-white/[0.08] flex items-center justify-between gap-3">
                        <button
                          onClick={() => setSelectedNotice(notice)}
                          className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-lg transition cursor-pointer"
                        >
                          <HiEye className="text-base" />
                          <span>পূর্ণাঙ্গ নোটিশ পড়ুন</span>
                        </button>
                        <button
                          onClick={() => handleShare(notice)}
                          className="p-2.5 rounded-xl bg-white/[0.08] hover:bg-white/[0.15] border border-white/10 text-white text-xs transition cursor-pointer"
                          title="শেয়ার করুন"
                        >
                          <HiShare className="text-base" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Regular Notices Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                <HiDocumentText className="text-emerald-400 text-lg" />
                <span>সকল প্রকাশিত নোটিশ</span>
                <span className="text-xs text-slate-400 font-normal">
                  ({regularNotices.length} টি)
                </span>
              </h2>
            </div>

            {/* Grid View */}
            {viewMode === "grid" ? (
              <div
                key={`grid-${selectedCategory}-${searchTerm}`}
                className="grid grid-cols-1 gap-4 stagger-in sm:grid-cols-2 lg:grid-cols-3 sm:gap-5"
              >
                {regularNotices.map((notice) => {
                  const style = getTypeStyle(notice.type);
                  return (
                    <div
                      key={notice.id}
                      className="p-4 sm:p-5 rounded-2xl bg-[#0f1124] border border-white/10 hover:border-indigo-400/40 shadow-xl flex flex-col justify-between group space-y-3 lift"
                    >
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between gap-2">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${style.badgeBg} ${style.badgeText} ${style.badgeBorder}`}
                          >
                            {style.label}
                          </span>
                          <span className="text-[11px] text-slate-400 font-semibold flex items-center gap-1">
                            <HiCalendar className="text-slate-400" />
                            {notice.date}
                          </span>
                        </div>

                        <h3
                          onClick={() => setSelectedNotice(notice)}
                          className="text-sm sm:text-base font-bold text-white group-hover:text-indigo-300 transition-colors cursor-pointer line-clamp-2 leading-snug"
                        >
                          {notice.title}
                        </h3>

                        <p className="text-xs text-slate-300 leading-relaxed line-clamp-3">
                          {notice.description}
                        </p>

                        {/* Attachments */}
                        {(notice.imageUrl || notice.attachmentUrl) && (
                          <div className="flex items-center gap-2 flex-wrap pt-1">
                            {notice.imageUrl && (
                              <button
                                type="button"
                                onClick={() => setPreviewImage(notice.imageUrl)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-300 text-[10px] font-bold border border-emerald-500/30 cursor-pointer"
                              >
                                <HiPhoto /> ছবি
                              </button>
                            )}
                            {notice.attachmentUrl && (
                              <a
                                href={notice.attachmentUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-sky-500/15 text-sky-300 text-[10px] font-bold border border-sky-500/30"
                              >
                                <HiPaperClip /> ফাইল
                              </a>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="pt-3 border-t border-white/[0.08] flex items-center justify-between">
                        <span className="text-[10px] font-mono text-slate-400 truncate max-w-[120px]">
                          {notice.refNo ? `স্মারক: ${notice.refNo}` : "অফিশিয়াল"}
                        </span>

                        <button
                          onClick={() => setSelectedNotice(notice)}
                          className="text-xs font-bold text-indigo-300 hover:text-white flex items-center gap-1 group-hover:translate-x-1 transition-transform cursor-pointer"
                        >
                          <span>বিস্তারিত</span>
                          <HiChevronRight />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* Table View */
              <div className="overflow-hidden rounded-2xl bg-[#0f1124] border border-white/10 shadow-xl">
                <div className="overflow-x-auto scrollbar-none">
                  <table className="w-full text-left text-xs sm:text-sm">
                    <thead className="bg-[#090a16] text-slate-400 uppercase font-bold text-[10px] sm:text-xs border-b border-white/10">
                      <tr>
                        <th className="px-4 py-3 sm:px-6 sm:py-4">স্মারক / তারিখ</th>
                        <th className="px-4 py-3 sm:px-6 sm:py-4">ক্যাটাগরি</th>
                        <th className="px-4 py-3 sm:px-6 sm:py-4">নোটিশ শিরোনাম</th>
                        <th className="px-4 py-3 sm:px-6 sm:py-4 text-center">সংযুক্তি</th>
                        <th className="px-4 py-3 sm:px-6 sm:py-4 text-right">অ্যাকশন</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.08] text-slate-300">
                      {regularNotices.map((notice) => {
                        const style = getTypeStyle(notice.type);
                        return (
                          <tr
                            key={notice.id}
                            className="hover:bg-white/[0.04] transition-colors"
                          >
                            <td className="px-4 py-3 sm:px-6 sm:py-4 whitespace-nowrap">
                              <div className="font-bold text-white">
                                {notice.date}
                              </div>
                              <span className="text-[10px] font-mono text-slate-400 block">
                                {notice.refNo || "KKMB/NOT/GEN"}
                              </span>
                            </td>
                            <td className="px-4 py-3 sm:px-6 sm:py-4 whitespace-nowrap">
                              <span
                                className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${style.badgeBg} ${style.badgeText} ${style.badgeBorder}`}
                              >
                                {style.label}
                              </span>
                            </td>
                            <td className="px-4 py-3 sm:px-6 sm:py-4 font-bold text-white hover:text-indigo-300 cursor-pointer"
                                onClick={() => setSelectedNotice(notice)}>
                              {notice.title}
                            </td>
                            <td className="px-4 py-3 sm:px-6 sm:py-4 text-center whitespace-nowrap">
                              {notice.imageUrl || notice.attachmentUrl ? (
                                <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400">
                                  <HiPaperClip /> আছে
                                </span>
                              ) : (
                                <span className="text-slate-500 text-xs">—</span>
                              )}
                            </td>
                            <td className="px-4 py-3 sm:px-6 sm:py-4 text-right whitespace-nowrap">
                              <button
                                onClick={() => setSelectedNotice(notice)}
                                className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition cursor-pointer"
                              >
                                পড়ুন
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Empty Search Result */}
            {filteredNotices.length === 0 && (
              <div className="p-12 text-center rounded-2xl bg-[#0f1124] border border-dashed border-white/10 space-y-2">
                <HiBell className="text-4xl text-slate-500 mx-auto animate-pulse" />
                <h3 className="text-sm sm:text-base font-bold text-white">
                  কোনো নোটিশ পাওয়া যায়নি
                </h3>
                <p className="text-xs text-slate-400">
                  অন্য কোনো ক্যাটাগরি বা কিওয়ার্ড দিয়ে অনুসন্ধান করুন।
                </p>
              </div>
            )}
          </div>
          </>
          )}

        </div>
      </div>

      {/* 4. Official Notice Reader Document Modal */}
      {selectedNotice && (
        <div
          onClick={() => setSelectedNotice(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-3 cursor-pointer sm:p-4 bg-black/80 backdrop-blur-md backdrop-enter"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-2xl w-full bg-[#14162b] rounded-3xl p-5 sm:p-8 shadow-2xl border border-white/15 max-h-[88vh] overflow-y-auto space-y-5 text-white scrollbar-none overlay-enter"
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-white/10">
              <div className="space-y-1">
                <span className="text-xs font-bold text-emerald-400">
                  কিশোরকণ্ঠ পাঠক ফোরাম • অফিশিয়াল বিজ্ঞপ্তি
                </span>
                <h3 className="text-base sm:text-xl font-black text-white leading-snug">
                  {selectedNotice.title}
                </h3>
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 pt-0.5">
                  <span>📅 {selectedNotice.date}</span>
                  {selectedNotice.refNo && (
                    <span>• 📋 স্মারক: {selectedNotice.refNo}</span>
                  )}
                </div>
              </div>

              <button
                onClick={() => setSelectedNotice(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-full bg-white/[0.08] hover:bg-rose-600 transition cursor-pointer shrink-0"
              >
                <HiXMark className="text-lg" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-6 rounded-2xl bg-[#090a16] border border-white/10">
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-wrap font-normal">
                {selectedNotice.description}
              </p>
            </div>

            {/* Attachment in Modal */}
            {selectedNotice.imageUrl && (
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-400 block">
                  সংযুক্ত নোটিশ পত্র / ছবি:
                </span>
                <img
                  src={selectedNotice.imageUrl}
                  alt="Notice Doc"
                  onClick={() => setPreviewImage(selectedNotice.imageUrl)}
                  className="w-full max-h-64 object-cover rounded-xl border border-white/10 cursor-zoom-in"
                />
              </div>
            )}

            {/* Modal Actions Footer */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/10">
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrintModal}
                  className="px-3.5 py-2 rounded-xl bg-white/[0.08] hover:bg-white/[0.15] border border-white/10 text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
                >
                  <HiPrinter className="text-sm" />
                  <span>প্রিন্ট</span>
                </button>

                <button
                  onClick={() => handleShare(selectedNotice)}
                  className="px-3.5 py-2 rounded-xl bg-white/[0.08] hover:bg-white/[0.15] border border-white/10 text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
                >
                  <HiShare className="text-sm" />
                  <span>শেয়ার</span>
                </button>
              </div>

              {copySuccess && (
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                  <HiCheckCircle /> কপি হয়েছে!
                </span>
              )}

              <button
                onClick={() => setSelectedNotice(null)}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition cursor-pointer"
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Image Zoom Preview Modal */}
      {previewImage && (
        <div
          onClick={() => setPreviewImage(null)}
          className="fixed inset-0 z-60 flex items-center justify-center p-3 cursor-pointer sm:p-4 bg-black/85 backdrop-blur-md backdrop-enter"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-4xl w-full bg-[#14162b] rounded-3xl p-3 sm:p-4 shadow-2xl border border-white/15 overlay-enter"
          >
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute top-4 right-4 p-2 text-white rounded-full bg-black/60 hover:bg-rose-600 transition cursor-pointer z-10"
            >
              <HiXMark className="text-lg" />
            </button>
            <img
              src={previewImage}
              alt="Notice Attachment Full"
              className="w-full max-h-[82vh] object-contain rounded-2xl"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Notice;
