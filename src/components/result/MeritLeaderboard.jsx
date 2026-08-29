import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  HiTrophy,
  HiSparkles,
  HiAcademicCap,
  HiMagnifyingGlass,
  HiFunnel,
  HiStar,
  HiBuildingLibrary,
  HiUserGroup,
  HiArrowRight,
  HiShare,
  HiCheckBadge,
  HiCheckCircle,
  HiXMark,
  HiUser,
  HiBuildingOffice2,
  HiMapPin,
  HiChevronLeft,
  HiChevronRight,
  HiArrowTopRightOnSquare,
} from "react-icons/hi2";
import { FaCrown, FaMedal, FaAward, FaGraduationCap } from "react-icons/fa";
import { getAllResults } from "../../services/firestore";
import {
  Reveal,
  RevealGroup,
  SkeletonRegion,
  SkeletonHero,
  SkeletonStats,
  SkeletonPodium,
  SkeletonFilterBar,
  SkeletonTable,
} from "../common";
import { useExamYear } from "../../context/ExamYearContext";

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

const SCHOLARSHIP_GRADES = [
  { id: "all", label: "সকল ক্যাটাগরি", icon: "✨" },
  { id: "ট্যালেন্টপুল", label: "ট্যালেন্টপুল বৃত্তি", icon: "🏆" },
  { id: "সাধারণ", label: "সাধারণ বৃত্তি", icon: "🎖️" },
];

const PAGE_SIZE = 50;

const MeritLeaderboard = () => {
  const examYear = useExamYear();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState("সকল শ্রেণি");
  const [selectedGrade, setSelectedGrade] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Modal State for Popup Showcase
  const [selectedStudentModal, setSelectedStudentModal] = useState(null);
  const [modalRank, setModalRank] = useState(1);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);
        const data = await getAllResults();
        if (data && data.length > 0) {
          setResults(data);
        } else {
          const res = await fetch("/results.json");
          const localData = await res.json();
          setResults(localData || []);
        }
      } catch (err) {
        console.error("Leaderboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, []);

  // Reset to page 1 on filter/search change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedClass, selectedGrade, searchQuery]);

  // Filter and Sort Merit List
  const filteredMeritList = useMemo(() => {
    let list = [...results];

    // Filter by class
    if (selectedClass !== "সকল শ্রেণি") {
      list = list.filter((r) => {
        const cls = r.class || "";
        return cls.includes(selectedClass.replace(" শ্রেণি", "")) || cls === selectedClass;
      });
    }

    // Filter by scholarship category (grade / category)
    if (selectedGrade !== "all") {
      list = list.filter((r) => (r.category || r.grade) === selectedGrade);
    }

    // Search query (Roll, Name, School)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (r) =>
          r.name?.toLowerCase().includes(q) ||
          r.roll?.toString().includes(q) ||
          r.school?.toLowerCase().includes(q)
      );
    }

    // Sort order: Talentpool first, then by Roll
    return list.sort((a, b) => {
      const isTalentA = (a.category || "").includes("ট্যালেন্ট");
      const isTalentB = (b.category || "").includes("ট্যালেন্ট");
      if (isTalentA && !isTalentB) return -1;
      if (!isTalentA && isTalentB) return 1;
      return (parseInt(a.roll) || 0) - (parseInt(b.roll) || 0);
    });
  }, [results, selectedClass, selectedGrade, searchQuery]);

  // Quick summary counts
  const talentpoolCount = useMemo(() => {
    return results.filter((r) => (r.category || "").includes("ট্যালেন্ট")).length;
  }, [results]);

  const generalCount = useMemo(() => {
    return results.filter((r) => (r.category || "").includes("সাধারণ")).length;
  }, [results]);

  const totalSchools = useMemo(() => {
    return new Set(results.map((r) => r.school).filter(Boolean)).size;
  }, [results]);

  // Top 3 Podium Students
  const top1 = filteredMeritList[0];
  const top2 = filteredMeritList[1];
  const top3 = filteredMeritList[2];

  // Pagination Slice
  const totalPages = Math.ceil(filteredMeritList.length / PAGE_SIZE) || 1;
  const paginatedList = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredMeritList.slice(start, start + PAGE_SIZE);
  }, [filteredMeritList, currentPage]);

  const toBnNum = (num) => {
    if (num === null || num === undefined) return "০";
    const bengaliDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
    return num
      .toString()
      .split("")
      .map((digit) => bengaliDigits[digit] || digit)
      .join("");
  };

  const openStudentModal = (student, rank) => {
    if (!student) return;
    setSelectedStudentModal(student);
    setModalRank(rank);
  };

  const closeStudentModal = () => {
    setSelectedStudentModal(null);
  };

  if (loading) {
    return (
      <SkeletonRegion
        label="মেধা তালিকা লোড হচ্ছে"
        className="min-h-screen bg-[#0b1326] text-white py-8 sm:py-16 px-3 sm:px-6 font-sans"
      >
        {/* Same rhythm as the loaded page: hero, metrics, podium, filters, table. */}
        <div className="max-w-7xl mx-auto space-y-8 sm:space-y-12">
          <SkeletonHero />
          <SkeletonStats className="max-w-4xl mx-auto" />
          <SkeletonPodium />
          <SkeletonFilterBar pills={5} />
          <SkeletonTable rows={8} columns={7} />
        </div>
      </SkeletonRegion>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b1326] text-white py-8 sm:py-16 px-3 sm:px-6 font-sans">
      <div className="max-w-7xl mx-auto space-y-8 sm:space-y-12">
        
        {/* Header Hero */}
        <div className="text-center space-y-3 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 text-xs sm:text-sm font-bold uppercase tracking-wider shadow-sm">
            <HiTrophy className="text-base text-amber-400" />
            <span>অফিসিয়াল মেধা লিডারবোর্ড {examYear}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
            শ্রেণিভিত্তিক <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-400">
              মেধা তালিকা ও র‍্যাঙ্কিং
            </span>
          </h1>

          <p className="text-xs sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
            সিলেট জেলা পশ্চিমের ৮টি উপজেলার কৃতী শিক্ষার্থীদের মেধা তালিকা, ট্যালেন্টপুল ও সাধারণ বৃত্তি প্রাপ্তদের তালিকা।
          </p>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-4xl mx-auto pt-4">
            <div className="p-4 sm:p-5 bg-[#14162b] border border-white/10 rounded-2xl text-center shadow-lg">
              <span className="text-xl sm:text-3xl font-black text-amber-400 block font-mono">
                {toBnNum(results.length)}
              </span>
              <span className="text-[11px] text-slate-400 font-semibold uppercase">
                মোট বৃত্তিপ্রাপ্ত
              </span>
            </div>

            <div className="p-4 sm:p-5 bg-[#14162b] border border-amber-400/30 rounded-2xl text-center shadow-lg">
              <span className="text-xl sm:text-3xl font-black text-amber-400 block font-mono">
                {toBnNum(talentpoolCount)}
              </span>
              <span className="text-[11px] text-slate-400 font-semibold uppercase">
                ট্যালেন্টপুল বৃত্তি
              </span>
            </div>

            <div className="p-4 sm:p-5 bg-[#14162b] border border-emerald-500/30 rounded-2xl text-center shadow-lg">
              <span className="text-xl sm:text-3xl font-black text-emerald-400 block font-mono">
                {toBnNum(generalCount)}
              </span>
              <span className="text-[11px] text-slate-400 font-semibold uppercase">
                সাধারণ বৃত্তি
              </span>
            </div>

            <div className="p-4 sm:p-5 bg-[#14162b] border border-indigo-500/30 rounded-2xl text-center shadow-lg">
              <span className="text-xl sm:text-3xl font-black text-indigo-400 block font-mono">
                {toBnNum(totalSchools)}
              </span>
              <span className="text-[11px] text-slate-400 font-semibold uppercase">
                অংশগ্রহণকারী স্কুল
              </span>
            </div>
          </div>
        </div>

        {/* Top 3 Podium */}
        {!loading && filteredMeritList.length >= 3 && (
          <div className="pt-4 pb-2">
            <div className="text-center mb-6 sm:mb-8">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#14162b] border border-white/10 text-xs font-bold text-slate-300">
                <HiSparkles className="text-amber-400 text-sm" />
                <span>শীর্ষ ৩ মেধা স্থান (ট্যাপ করে বিস্তারিত দেখুন)</span>
              </span>
            </div>

            {/* 3-Column Podium */}
            <div className="grid items-end max-w-4xl grid-cols-3 gap-2 mx-auto stagger-in sm:gap-6">
              
              {/* 2nd Place (Silver) */}
              <div
                onClick={() => openStudentModal(top2, 2)}
                className="bg-[#14162b] border border-slate-400/40 rounded-2xl sm:rounded-3xl p-3 sm:p-6 text-center relative cursor-pointer group shadow-xl lift hover:border-slate-300/60"
              >
                <div className="absolute -top-3 sm:-top-4 left-1/2 -translate-x-1/2 w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-slate-300 text-slate-950 font-black flex items-center justify-center text-[10px] sm:text-xs shadow-md">
                  ২য়
                </div>
                
                <div className="pt-2 flex justify-center mb-1">
                  <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl bg-slate-400/20 text-slate-300 flex items-center justify-center text-lg sm:text-2xl group-hover:scale-110 transition-transform">
                    <FaMedal />
                  </div>
                </div>

                <div className="space-y-0.5">
                  <h3 className="text-xs sm:text-base font-black text-white truncate">
                    {top2.name}
                  </h3>
                  <p className="text-[10px] sm:text-xs text-slate-400 truncate">
                    {top2.school}
                  </p>
                </div>

                <div className="pt-2 mt-2 border-t border-white/[0.08] flex items-center justify-center gap-1 text-[10px] sm:text-xs text-slate-300 font-bold font-mono">
                  <span>রোল: {toBnNum(top2.roll)}</span>
                </div>
              </div>

              {/* 1st Place (Gold Champion) */}
              <div
                onClick={() => openStudentModal(top1, 1)}
                className="bg-[#14162b] border-2 border-amber-400 rounded-2xl sm:rounded-3xl p-4 sm:p-7 text-center relative cursor-pointer group shadow-2xl lift-podium"
              >
                <div className="absolute -top-4 sm:-top-5 left-1/2 -translate-x-1/2 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-amber-400 text-slate-950 font-black flex items-center justify-center text-xs sm:text-sm shadow-lg">
                  ১ম
                </div>

                <div className="pt-2 flex justify-center mb-1">
                  <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center text-xl sm:text-3xl group-hover:scale-110 transition-transform shadow-md">
                    <FaCrown />
                  </div>
                </div>

                <div className="space-y-0.5">
                  <h3 className="text-xs sm:text-lg font-black text-amber-300 truncate">
                    {top1.name}
                  </h3>
                  <p className="text-[10px] sm:text-xs text-slate-300 truncate">
                    {top1.school}
                  </p>
                </div>

                <div className="pt-2 mt-2 border-t border-amber-400/30 flex items-center justify-center gap-1 text-[10px] sm:text-xs text-amber-400 font-bold font-mono">
                  <span>রোল: {toBnNum(top1.roll)}</span>
                </div>
              </div>

              {/* 3rd Place (Bronze) */}
              <div
                onClick={() => openStudentModal(top3, 3)}
                className="bg-[#14162b] border border-amber-700/50 rounded-2xl sm:rounded-3xl p-3 sm:p-6 text-center relative cursor-pointer group shadow-xl lift hover:border-amber-600/70"
              >
                <div className="absolute -top-3 sm:-top-4 left-1/2 -translate-x-1/2 w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-amber-700 text-white font-black flex items-center justify-center text-[10px] sm:text-xs shadow-md">
                  ৩য়
                </div>

                <div className="pt-2 flex justify-center mb-1">
                  <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl bg-amber-800/20 text-amber-500 flex items-center justify-center text-lg sm:text-2xl group-hover:scale-110 transition-transform">
                    <FaAward />
                  </div>
                </div>

                <div className="space-y-0.5">
                  <h3 className="text-xs sm:text-base font-black text-white truncate">
                    {top3.name}
                  </h3>
                  <p className="text-[10px] sm:text-xs text-slate-400 truncate">
                    {top3.school}
                  </p>
                </div>

                <div className="pt-2 mt-2 border-t border-white/[0.08] flex items-center justify-center gap-1 text-[10px] sm:text-xs text-slate-300 font-bold font-mono">
                  <span>রোল: {toBnNum(top3.roll)}</span>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* Filter Controls Dock */}
        <div className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-[#0f1124] border border-white/10 shadow-2xl flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          
          {/* Class Filters */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
            {CLASSES.map((cls) => (
              <button
                key={cls}
                onClick={() => setSelectedClass(cls)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap cursor-pointer press ${
                  selectedClass === cls
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/25 scale-102"
                    : "bg-white/[0.05] text-slate-300 hover:bg-white/[0.10] hover:text-white border border-white/10"
                }`}
              >
                {cls}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-72 shrink-0">
            <HiMagnifyingGlass className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-base" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="রোল, নাম বা স্কুল খুঁজুন..."
              className="w-full pl-10 pr-9 py-2 bg-[#090a16] border border-white/15 rounded-xl text-xs sm:text-sm font-semibold text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <HiXMark />
              </button>
            )}
          </div>
        </div>

        {/* Leaderboard Table / Card List */}
        <div id="leaderboard-table-container" className="rounded-3xl border border-white/10 bg-[#0f1124] shadow-2xl overflow-hidden">
          
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-[#14162b] text-slate-400 font-bold uppercase tracking-wider border-b border-white/[0.08]">
                <tr>
                  <th className="py-4 px-5 text-center w-20">র‍্যাঙ্ক</th>
                  <th className="py-4 px-5">শিক্ষার্থীর নাম</th>
                  <th className="py-4 px-5">রোল নং</th>
                  <th className="py-4 px-5">শিক্ষা প্রতিষ্ঠান</th>
                  <th className="py-4 px-5">শ্রেণি</th>
                  <th className="py-4 px-5">বৃত্তির গ্রেড</th>
                  <th className="py-4 px-5 text-center">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody
                key={`${currentPage}-${selectedClass}-${searchQuery}`}
                className="divide-y divide-white/[0.06] stagger-in"
              >
                {paginatedList.map((st, idx) => {
                  const globalRank = (currentPage - 1) * PAGE_SIZE + idx + 1;
                  const isTalent = (st.category || "").includes("ট্যালেন্ট");

                  return (
                    <tr
                      key={st.roll || idx}
                      onClick={() => openStudentModal(st, globalRank)}
                      className="cursor-pointer transition-colors duration-200 ease-standard hover:bg-white/[0.06]"
                    >
                      <td className="py-4 px-5 text-center font-mono font-black text-amber-400">
                        {toBnNum(globalRank)}
                      </td>
                      <td className="py-4 px-5 font-bold text-white">
                        {st.name}
                      </td>
                      <td className="py-4 px-5 font-mono text-slate-300 font-semibold">
                        {toBnNum(st.roll)}
                      </td>
                      <td className="py-4 px-5 text-slate-300 font-medium">
                        {st.school}
                      </td>
                      <td className="py-4 px-5 font-semibold text-slate-300">
                        {st.class}
                      </td>
                      <td className="py-4 px-5">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold border ${
                            isTalent
                              ? "bg-amber-500/15 text-amber-300 border-amber-500/30"
                              : "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                          }`}
                        >
                          {st.category || "সাধারণ"}
                        </span>
                      </td>
                      <td className="py-4 px-5 text-center">
                        <span className="text-indigo-400 hover:text-indigo-300 font-bold inline-flex items-center gap-1 text-xs">
                          <span>দেখুন</span>
                          <HiArrowTopRightOnSquare />
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Card List View */}
          <div
            key={`m-${currentPage}-${selectedClass}-${searchQuery}`}
            className="md:hidden divide-y divide-white/[0.08] stagger-in"
          >
            {paginatedList.map((st, idx) => {
              const globalRank = (currentPage - 1) * PAGE_SIZE + idx + 1;
              const isTalent = (st.category || "").includes("ট্যালেন্ট");

              return (
                <div
                  key={st.roll || idx}
                  onClick={() => openStudentModal(st, globalRank)}
                  className="p-4 space-y-2 cursor-pointer press active:bg-white/[0.06]"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-amber-400/20 text-amber-400 font-mono font-black text-xs flex items-center justify-center border border-amber-400/40">
                        {toBnNum(globalRank)}
                      </span>
                      <h4 className="text-sm font-bold text-white truncate max-w-[200px]">
                        {st.name}
                      </h4>
                    </div>

                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        isTalent
                          ? "bg-amber-500/15 text-amber-300 border-amber-500/30"
                          : "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                      }`}
                    >
                      {st.category || "সাধারণ"}
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 truncate pl-8">{st.school}</p>

                  <div className="flex items-center justify-between text-[11px] text-slate-300 pt-1 pl-8">
                    <span>শ্রেণি: {st.class} • রোল: {toBnNum(st.roll)}</span>
                    <span className="text-indigo-400 font-bold flex items-center gap-1">
                      <span>কার্ড</span>
                      <HiArrowTopRightOnSquare />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

        </div>

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 pt-4">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 rounded-xl bg-[#14162b] border border-white/10 text-xs font-bold text-white hover:bg-indigo-600 disabled:opacity-40 cursor-pointer"
            >
              পূর্ববর্তী
            </button>
            <span className="text-xs font-bold text-slate-400 font-mono px-3">
              পৃষ্ঠা {toBnNum(currentPage)} / {toBnNum(totalPages)}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 rounded-xl bg-[#14162b] border border-white/10 text-xs font-bold text-white hover:bg-indigo-600 disabled:opacity-40 cursor-pointer"
            >
              পরবর্তী
            </button>
          </div>
        )}

      </div>

      {/* Student Showcase Modal */}
      {selectedStudentModal && (
        <div
          onClick={closeStudentModal}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 cursor-pointer bg-black/80 backdrop-blur-md backdrop-enter"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-md w-full bg-[#14162b] rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/15 space-y-5 text-white overlay-enter"
          >
            <div className="flex items-start justify-between gap-4 pb-3 border-b border-white/[0.08]">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center justify-center text-2xl shadow-md">
                  <FaCrown />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-black text-white">{selectedStudentModal.name}</h3>
                  <span className="text-xs text-amber-400 font-bold">র‍্যাঙ্ক: #{toBnNum(modalRank)}</span>
                </div>
              </div>

              <button
                onClick={closeStudentModal}
                className="p-2 text-slate-400 hover:text-white rounded-full bg-white/[0.06] hover:bg-rose-600 transition cursor-pointer"
              >
                <HiXMark className="text-lg" />
              </button>
            </div>

            <div className="space-y-2.5 text-xs sm:text-sm">
              <div className="p-3 bg-[#090a16] rounded-xl border border-white/10 flex justify-between">
                <span className="text-slate-400">রোল নম্বর:</span>
                <span className="font-mono font-bold text-white">{toBnNum(selectedStudentModal.roll)}</span>
              </div>
              <div className="p-3 bg-[#090a16] rounded-xl border border-white/10 flex justify-between">
                <span className="text-slate-400">শ্রেণি:</span>
                <span className="font-bold text-white">{selectedStudentModal.class}</span>
              </div>
              <div className="p-3 bg-[#090a16] rounded-xl border border-white/10 flex justify-between">
                <span className="text-slate-400">বৃত্তি ক্যাটাগরি:</span>
                <span className="font-bold text-amber-400">{selectedStudentModal.category || "ট্যালেন্টপুল"}</span>
              </div>
              <div className="p-3 bg-[#090a16] rounded-xl border border-white/10 space-y-1">
                <span className="text-slate-400 block">শিক্ষা প্রতিষ্ঠান:</span>
                <span className="font-bold text-white block">{selectedStudentModal.school}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-white/[0.08] flex items-center justify-between gap-3">
              <Link
                to={`/search?roll=${selectedStudentModal.roll}`}
                className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs text-center transition shadow-md"
              >
                পূর্ণাঙ্গ মার্কশীট দেখুন
              </Link>
              <button
                onClick={closeStudentModal}
                className="px-4 py-2.5 rounded-xl bg-white/[0.08] hover:bg-white/[0.15] text-white font-bold text-xs transition"
              >
                বন্ধ
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default MeritLeaderboard;
