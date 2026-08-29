import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  HiAcademicCap,
  HiTrophy,
  HiCheckBadge,
  HiSparkles,
  HiChevronDown,
  HiChevronUp,
  HiMagnifyingGlass,
  HiXMark,
  HiArchiveBox,
  HiFunnel,
} from "react-icons/hi2";
import { FaCrown } from "react-icons/fa";
import {
  getResultsByYear,
  getAvailableResultYears,
  getArchivedResultYears,
} from "../../services/firestore";
import {
  SkeletonRegion,
  SkeletonHero,
  SkeletonStats,
  SkeletonFilterBar,
  SkeletonTable,
} from "../common";

// Convert English numbers to Bengali
const toBengaliNumber = (num) => {
  if (num === null || num === undefined) return "০";
  const bengaliDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
  return num
    .toString()
    .split("")
    .map((digit) => bengaliDigits[digit] || digit)
    .join("");
};

const bengaliToEnglish = (str) => {
  if (!str) return "0";
  const bengaliDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
  return str
    .split("")
    .map((char) => {
      const index = bengaliDigits.indexOf(char);
      return index !== -1 ? index.toString() : char;
    })
    .join("");
};

const ResultList = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [groupedData, setGroupedData] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchRoll, setSearchRoll] = useState("");
  const [selectedClass, setSelectedClass] = useState("all");

  /* The archive year comes from ?year=, so a nav link can point straight at
     a past session and the choice survives a share or a refresh. The param
     is written in ASCII digits (?year=2025) because Bengali ones would be
     percent-encoded into an unreadable URL — it is converted on the way in. */
  const [selectedYear, setSelectedYear] = useState(() => {
    const param = searchParams.get("year");
    if (!param) return "২০২৫";
    return param === "all" ? "all" : toBengaliNumber(param);
  });

  const [availableYears, setAvailableYears] = useState(["২০২৫", "২০২৪", "২০২৩"]);
  const [archivedYears, setArchivedYears] = useState([]);
  const [expandedClasses, setExpandedClasses] = useState(new Set());
  const [bestStudents, setBestStudents] = useState([]);
  const [rawResults, setRawResults] = useState([]);

  // Keep the URL in step with the picker, so the address bar always names
  // the year on screen. `replace` so paging through years does not bury the
  // back button under one entry per click.
  const handleYearChange = (year) => {
    setSelectedYear(year);
    setSearchParams(
      year === "all" ? { year: "all" } : { year: bengaliToEnglish(year) },
      { replace: true }
    );
  };

  // Load available years and which of them are archived.
  //
  // Years are stored as free text, so the set can mix numeral systems
  // ("২০২৫" alongside "2026"). Once the real list arrives, reconcile the
  // year taken from the URL against it by comparing both in ASCII digits —
  // otherwise ?year=2026 would be converted to "২০২৬", match no stored
  // year, and quietly return an empty list.
  useEffect(() => {
    getArchivedResultYears().then((archived) => setArchivedYears(archived || []));

    getAvailableResultYears().then((yrs) => {
      if (!yrs || yrs.length === 0) return;
      setAvailableYears(yrs);

      setSelectedYear((current) => {
        if (current === "all" || yrs.includes(current)) return current;
        const wanted = bengaliToEnglish(current);
        return yrs.find((y) => bengaliToEnglish(y) === wanted) || current;
      });
    });
  }, []);

  // Fetch results by selected year
  useEffect(() => {
    setLoading(true);
    getResultsByYear(selectedYear)
      .then((data) => {
        if (!data) return;
        setRawResults(data);
        const groups = {};
        const bestList = [];

        data.forEach((student) => {
          const rawClass = student.class || "৪র্থ";
          const className = rawClass.includes("শ্রেণি") ? rawClass : `${rawClass} শ্রেণি`;

          if (!groups[className]) {
            groups[className] = { count: 0, categories: {} };
          }

          let categoryName = student.category || "সাধারণ";
          const catLower = categoryName.toLowerCase();

          if (catLower.includes("talent") || catLower.includes("ট্যালেন্ট")) {
            categoryName = "ট্যালেন্টপুল";
          } else if (
            catLower.includes("genral") ||
            catLower.includes("general") ||
            catLower.includes("সাধারণ") ||
            catLower.includes("normal")
          ) {
            categoryName = "সাধারণ";
          } else if (catLower.includes("special") || catLower.includes("বিশেষ")) {
            categoryName = "বিশেষ";
          } else if (categoryName.includes("সেরা") || categoryName.includes("best")) {
            categoryName = "শ্রেণিভিত্তিক সেরা";
            bestList.push(student);
          }

          if (!groups[className].categories[categoryName]) {
            groups[className].categories[categoryName] = [];
          }

          groups[className].categories[categoryName].push(student);
          groups[className].count += 1;
        });

        setGroupedData(groups);
        setBestStudents(bestList);
        setExpandedClasses(new Set(Object.keys(groups)));
      })
      .catch((err) => console.error("Failed to load list", err))
      .finally(() => setLoading(false));
  }, [selectedYear]);

  const toggleClass = (className) => {
    setExpandedClasses((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(className)) {
        newSet.delete(className);
      } else {
        newSet.add(className);
      }
      return newSet;
    });
  };

  const handleRollClick = (roll) => {
    navigate(`/search?roll=${roll}`);
  };

  // Sorted list of classes
  const classData = useMemo(() => {
    return Object.keys(groupedData).sort((a, b) => {
      const numA = parseInt(bengaliToEnglish(a).match(/\d+/)?.[0] || "0");
      const numB = parseInt(bengaliToEnglish(b).match(/\d+/)?.[0] || "0");
      return numA - numB;
    });
  }, [groupedData]);

  // Statistics calculation
  const totalStudents = rawResults.length;
  const talentCount = useMemo(() => {
    return Object.values(groupedData).reduce((sum, cls) => {
      return sum + (cls.categories["ট্যালেন্টপুল"]?.length || 0);
    }, 0);
  }, [groupedData]);

  const generalCount = useMemo(() => {
    return Object.values(groupedData).reduce((sum, cls) => {
      return sum + (cls.categories["সাধারণ"]?.length || 0);
    }, 0);
  }, [groupedData]);

  const specialCount = useMemo(() => {
    return Object.values(groupedData).reduce((sum, cls) => {
      return sum + (cls.categories["বিশেষ"]?.length || 0);
    }, 0);
  }, [groupedData]);

  const bestCount = bestStudents.length;

  const isYearArchived = (yr) => {
    const needle = bengaliToEnglish(String(yr).trim());
    return archivedYears.some(
      (a) => bengaliToEnglish(String(a).trim()) === needle
    );
  };

  /* Live sessions first, archived ones behind their own label. Which is
     which comes from the admin panel, not from a hardcoded year. */
  const liveYears = useMemo(
    () => availableYears.filter((yr) => !isYearArchived(yr)),
    [availableYears, archivedYears]
  );
  const archiveYears = useMemo(
    () => availableYears.filter((yr) => isYearArchived(yr)),
    [availableYears, archivedYears]
  );

  /* The class filters, as data. The desktop chip row and the mobile
     dropdown render the same list, so the two can never drift apart. */
  const classFilterOptions = useMemo(() => {
    const options = [{ value: "all", label: "সকল শ্রেণি", count: totalStudents }];
    if (bestStudents.length > 0) {
      options.push({
        value: "best",
        label: "শ্রেণিভিত্তিক সেরা",
        count: bestStudents.length,
      });
    }
    classData.forEach((cls) =>
      options.push({ value: cls, label: cls, count: groupedData[cls]?.count || 0 })
    );
    return options;
  }, [classData, groupedData, bestStudents.length, totalStudents]);

  // Filter classes based on active tab
  const filteredClasses = useMemo(() => {
    if (selectedClass === "all") return classData;
    if (selectedClass === "best") {
      return classData.filter(
        (className) => groupedData[className]?.categories["শ্রেণিভিত্তিক সেরা"]
      );
    }
    return classData.filter((c) => c === selectedClass);
  }, [classData, groupedData, selectedClass]);

  // Roll search inside the already-filtered class lists
  const filterStudents = (students) => {
    if (!searchRoll.trim()) return students;
    const needle = bengaliToEnglish(searchRoll.trim());
    return students.filter((st) =>
      bengaliToEnglish((st.roll ?? "").toString()).includes(needle)
    );
  };

  if (loading) {
    return (
      <SkeletonRegion
        label="ফলাফল তালিকা লোড হচ্ছে"
        className="min-h-screen bg-[#0b1326] text-white pb-20 font-sans"
      >
        {/* Mirrors the real page: hero band, stat row, filter dock, table. */}
        <section className="w-full px-3 sm:px-6 pt-14 sm:pt-20 pb-12 sm:pb-16 bg-[#0f1124] border-b border-white/[0.08]">
          <div className="max-w-7xl mx-auto space-y-8">
            <SkeletonHero />
            <SkeletonStats />
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-8 sm:py-10 space-y-6">
          <SkeletonFilterBar pills={6} />
          <SkeletonTable rows={8} columns={6} />
        </div>
      </SkeletonRegion>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b1326] text-white pb-20 font-sans">

      {/* 1. Header Hero Banner */}
      <section className="relative w-full px-3 sm:px-6 pt-14 sm:pt-20 pb-12 sm:pb-16 bg-[#0f1124] border-b border-white/[0.08] overflow-hidden">
        <div className="pointer-events-none absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />

        <div className="max-w-7xl mx-auto relative z-10 space-y-8">
          <div className="text-center space-y-3 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 text-xs sm:text-sm font-extrabold backdrop-blur-md shadow-sm">
              <HiSparkles className="text-amber-400 text-base" />
              <span>
                মেধাবৃত্তি ফলাফল ও মেধা তালিকা • শিক্ষাবর্ষ{" "}
                {selectedYear === "all" ? "সকল বছর" : selectedYear}
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
              সকল উত্তীর্ণ শিক্ষার্থীদের <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-400">
                সম্পূর্ণ ফলাফল তালিকা
              </span>
            </h1>

            <p className="text-xs sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
              শ্রেণি ও বৃত্তি ক্যাটাগরি ভিত্তিক উত্তীর্ণ সকল শিক্ষার্থীর রোল তালিকা।
              যেকোনো রোলে ক্লিক করে তাৎক্ষণিক বিস্তারিত ফলাফল দেখুন।
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">

            {/* Total */}
            <div className="p-4 sm:p-5 rounded-2xl bg-[#14162b] border border-white/10 shadow-lg text-center space-y-2">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/15 text-indigo-400 border border-indigo-500/30 flex items-center justify-center text-xl mx-auto shadow-md">
                <HiAcademicCap />
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-extrabold font-bangla-number text-white">{toBengaliNumber(totalStudents)}</p>
                <p className="text-[11px] font-semibold text-slate-400">মোট বৃত্তিপ্রাপ্ত</p>
              </div>
            </div>

            {/* Talentpool */}
            <div className="p-4 sm:p-5 rounded-2xl bg-[#14162b] border border-amber-400/30 shadow-lg text-center space-y-2">
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center justify-center text-xl mx-auto shadow-md">
                <FaCrown />
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-extrabold font-bangla-number text-amber-400">{toBengaliNumber(talentCount)}</p>
                <p className="text-[11px] font-semibold text-slate-400">ট্যালেন্টপুল বৃত্তি</p>
              </div>
            </div>

            {/* General */}
            <div className="p-4 sm:p-5 rounded-2xl bg-[#14162b] border border-emerald-500/30 shadow-lg text-center space-y-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center justify-center text-xl mx-auto shadow-md">
                <HiCheckBadge />
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-extrabold font-bangla-number text-emerald-400">{toBengaliNumber(generalCount)}</p>
                <p className="text-[11px] font-semibold text-slate-400">সাধারণ বৃত্তি</p>
              </div>
            </div>

            {/* Special */}
            <div className="p-4 sm:p-5 rounded-2xl bg-[#14162b] border border-purple-500/30 shadow-lg text-center space-y-2">
              <div className="w-10 h-10 rounded-xl bg-purple-500/15 text-purple-400 border border-purple-500/30 flex items-center justify-center text-xl mx-auto shadow-md">
                <HiSparkles />
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-extrabold font-bangla-number text-purple-400">{toBengaliNumber(specialCount)}</p>
                <p className="text-[11px] font-semibold text-slate-400">বিশেষ বৃত্তি</p>
              </div>
            </div>

            {/* Best per class */}
            <div className="p-4 sm:p-5 rounded-2xl bg-[#14162b] border border-sky-500/30 shadow-lg text-center space-y-2 col-span-2 sm:col-span-1">
              <div className="w-10 h-10 rounded-xl bg-sky-500/15 text-sky-400 border border-sky-500/30 flex items-center justify-center text-xl mx-auto shadow-md">
                <HiTrophy />
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-extrabold font-bangla-number text-sky-400">{toBengaliNumber(bestCount || classData.length)}</p>
                <p className="text-[11px] font-semibold text-slate-400">শ্রেণিভিত্তিক সেরা</p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. Multi-Year Archive Selector + Controls & Search Filter Dock */}
      <div className="w-full px-3 sm:px-6 -mt-6 relative z-20">
        <div className="max-w-7xl mx-auto space-y-3">

          {/* Year Archive Filter Strip */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-[#14162b] border border-white/10 shadow-2xl flex flex-wrap items-center gap-x-4 gap-y-3">
            <div className="flex items-center gap-2">
              <HiArchiveBox className="text-lg text-amber-400 shrink-0" />
              <span className="text-xs font-black text-white sm:text-sm">
                ফলাফল শিক্ষাবর্ষ:
              </span>
            </div>

            {/* Live sessions */}
            {liveYears.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                {liveYears.map((yr) => {
                  const isSelected =
                    selectedYear === yr ||
                    bengaliToEnglish(selectedYear) === bengaliToEnglish(yr);
                  return (
                    <button
                      key={yr}
                      type="button"
                      onClick={() => handleYearChange(yr)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold cursor-pointer whitespace-nowrap press flex items-center gap-1.5 ${
                        isSelected
                          ? "bg-amber-400 text-slate-950 font-black shadow-md shadow-amber-400/25"
                          : "bg-white/[0.06] text-slate-300 hover:text-white hover:bg-white/[0.12] border border-white/10"
                      }`}
                    >
                      <span>📅</span>
                      <span className="font-bangla-number font-extrabold">{toBengaliNumber(yr)}</span>
                      <span>(চলতি বর্ষ)</span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Archived sessions, behind their own label so the current year
                never gets lost among the old ones. */}
            {archiveYears.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="hidden w-px h-5 sm:block bg-white/10" aria-hidden="true" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1 bg-white/[0.04] px-2.5 py-1 rounded-lg border border-white/5">
                  🗃️ আর্কাইভ:
                </span>
                {archiveYears.map((yr) => {
                  const isSelected =
                    selectedYear === yr ||
                    bengaliToEnglish(selectedYear) === bengaliToEnglish(yr);
                  return (
                    <button
                      key={yr}
                      type="button"
                      onClick={() => handleYearChange(yr)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold cursor-pointer whitespace-nowrap press flex items-center gap-1.5 ${
                        isSelected
                          ? "bg-amber-400 text-slate-950 font-black shadow-md shadow-amber-400/25"
                          : "bg-white/[0.05] text-slate-300 hover:text-white hover:bg-white/[0.12] border border-white/10"
                      }`}
                    >
                      <span>📁</span>
                      <span className="font-bangla-number font-extrabold">{toBengaliNumber(yr)}</span>
                    </button>
                  );
                })}
              </div>
            )}

            <button
              type="button"
              onClick={() => handleYearChange("all")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold cursor-pointer whitespace-nowrap press sm:ml-auto ${
                selectedYear === "all"
                  ? "bg-indigo-600 text-white font-black shadow-md shadow-indigo-600/25"
                  : "bg-white/[0.06] text-slate-300 hover:text-white hover:bg-white/[0.12] border border-white/10"
              }`}
            >
              📁 সকল বছর
            </button>
          </div>

          {/* Class Filter & Search Bar */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#14162b] border border-white/10 shadow-2xl backdrop-blur-xl flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-4">

            {/* Mobile: a single dropdown. Ten class chips cannot fit on a
                phone, and the scrolling row hid its own last option behind
                the search box. */}
            <div className="relative md:hidden">
              <HiFunnel className="absolute text-base -translate-y-1/2 pointer-events-none left-3.5 top-1/2 text-indigo-400" />
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                aria-label="শ্রেণি নির্বাচন"
                className="w-full appearance-none py-3 pl-10 pr-10 bg-[#090a16] border border-white/15 rounded-xl text-xs font-bold text-white cursor-pointer focus:outline-none focus:border-indigo-400"
              >
                {classFilterOptions.map((opt) => (
                  <option key={opt.value} value={opt.value} className="bg-[#14162b] text-white">
                    {opt.label} ({toBengaliNumber(opt.count)})
                  </option>
                ))}
              </select>
              <HiChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 text-base text-slate-400 pointer-events-none" />
            </div>

            {/* Desktop: the full chip row. It wraps rather than scrolls —
                a sideways scroller put the last class behind the search box
                and gave no hint it was there. */}
            <div className="hidden md:flex flex-wrap items-center gap-1.5 min-w-0">
              {classFilterOptions.map((opt) => {
                const active = selectedClass === opt.value;
                const isBestTab = opt.value === "best";
                return (
                  <button
                    key={opt.value}
                    onClick={() => setSelectedClass(opt.value)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap cursor-pointer press ${
                      active
                        ? isBestTab
                          ? "bg-amber-500 text-slate-950 font-black shadow-lg shadow-amber-500/25"
                          : "bg-indigo-600 text-white shadow-lg shadow-indigo-500/25"
                        : "bg-white/[0.05] text-slate-300 hover:bg-white/[0.10] hover:text-white border border-white/10"
                    }`}
                  >
                    {opt.value === "all" || isBestTab
                      ? opt.label
                      : `${opt.label} (${toBengaliNumber(opt.count)})`}
                  </button>
                );
              })}
            </div>

            {/* Quick Roll Search Input */}
            <div className="relative w-full md:w-72 shrink-0">
              <HiMagnifyingGlass className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-base" />
              <input
                type="text"
                placeholder="তালিকায় রোল খুঁজুন..."
                value={searchRoll}
                onChange={(e) => setSearchRoll(e.target.value)}
                className="w-full pl-10 pr-9 py-2.5 bg-[#090a16] border border-white/15 rounded-xl text-xs sm:text-sm text-white placeholder:text-slate-500 font-mono font-bold focus:outline-none focus:border-indigo-400"
              />
              {searchRoll && (
                <button
                  onClick={() => setSearchRoll("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  <HiXMark className="text-base" />
                </button>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* 3. Class-wise Result Lists.
             Padding goes on the outer full-width element and the cap on the
             inner one — the same order as the hero and the filter dock, so
             all three align on wide screens. */}
      <div className="w-full px-3 sm:px-6 mt-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {filteredClasses.length === 0 ? (
            <div className="text-center py-16 bg-[#14162b] border border-white/10 rounded-2xl p-6">
              <HiAcademicCap className="text-5xl text-slate-600 mx-auto mb-3" />
              <p className="text-base font-bold text-slate-300">কোনো ফলাফল পাওয়া যায়নি!</p>
              <p className="text-xs text-slate-500 mt-1">অন্য শিক্ষাবর্ষ বা শ্রেণি নির্বাচন করে দেখুন।</p>
            </div>
          ) : (
            filteredClasses.map((className) => {
              const classObj = groupedData[className];
              if (!classObj) return null;

              const isExpanded = expandedClasses.has(className);
              const categories = classObj.categories;

              const talent = categories["ট্যালেন্টপুল"]?.length || 0;
              const general = categories["সাধারণ"]?.length || 0;
              const special = categories["বিশেষ"]?.length || 0;

              return (
                <div
                  key={className}
                  className="bg-[#14162b] border border-white/10 rounded-2xl sm:rounded-3xl shadow-xl overflow-hidden transition-all duration-300"
                >
                  {/* Class Card Header Accordion */}
                  <button
                    onClick={() => toggleClass(className)}
                    aria-expanded={isExpanded}
                    className="w-full p-4 sm:p-6 bg-[#101224] hover:bg-[#15172e] flex items-center justify-between gap-4 transition-colors cursor-pointer text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 text-xl sm:text-2xl font-black shrink-0">
                        🎓
                      </div>
                      <div>
                        <h2 className="text-base sm:text-xl font-black text-white flex items-center gap-2">
                          <span>{className}</span>
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-[10px] sm:text-xs font-bold">
                            মোট: {toBengaliNumber(classObj.count)} জন
                          </span>
                        </h2>
                        <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">
                          ট্যালেন্টপুল: {toBengaliNumber(talent)} | সাধারণ: {toBengaliNumber(general)} | বিশেষ: {toBengaliNumber(special)}
                        </p>
                      </div>
                    </div>

                    <div className="shrink-0 text-slate-400">
                      {isExpanded ? (
                        <HiChevronUp className="text-xl sm:text-2xl" />
                      ) : (
                        <HiChevronDown className="text-xl sm:text-2xl" />
                      )}
                    </div>
                  </button>

                  {/* Expanded Category Lists */}
                  {isExpanded && (
                    <div className="p-4 sm:p-6 border-t border-white/[0.08] divide-y divide-white/[0.06]">
                      {Object.keys(categories).map((catName) => {
                        const filteredStudents = filterStudents(categories[catName]);
                        if (filteredStudents.length === 0) return null;

                        const isTalent = catName === "ট্যালেন্টপুল";
                        const isSpecial = catName === "বিশেষ";
                        const isBest = catName === "শ্রেণিভিত্তিক সেরা";

                        return (
                          <div key={catName} className="pt-5 first:pt-0 space-y-3">
                            <div className="flex items-center justify-between">
                              <h3 className={`text-xs sm:text-sm font-black flex items-center gap-1.5 ${
                                isTalent
                                  ? "text-amber-400"
                                  : isSpecial
                                  ? "text-purple-400"
                                  : isBest
                                  ? "text-sky-400"
                                  : "text-emerald-400"
                              }`}>
                                {isTalent ? <FaCrown /> : <HiTrophy />}
                                <span>{catName} বৃত্তি ({toBengaliNumber(filteredStudents.length)} জন)</span>
                              </h3>
                              <span className="text-[10px] text-slate-500 font-mono">
                                ক্লিক করে ফলাফল দেখুন
                              </span>
                            </div>

                            {/* Rolls Grid */}
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                              {filteredStudents.map((st) => (
                                <button
                                  key={st.roll || st.id}
                                  onClick={() => handleRollClick(st.roll)}
                                  className={`p-2.5 rounded-md border text-center transition-all hover:scale-102 active:scale-98 cursor-pointer flex flex-col items-center justify-center gap-0.5 ${
                                    isTalent
                                      ? "bg-amber-500/10 hover:bg-amber-500/20 border-amber-500/30 text-amber-300"
                                      : isSpecial
                                      ? "bg-purple-500/10 hover:bg-purple-500/20 border-purple-500/30 text-purple-300"
                                      : isBest
                                      ? "bg-sky-500/10 hover:bg-sky-500/20 border-sky-500/30 text-sky-300"
                                      : "bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/30 text-emerald-300"
                                  }`}
                                >
                                  <span className="block text-base sm:text-lg font-bold font-bangla-number tracking-wider">
                                    {toBengaliNumber(st.roll)}
                                  </span>
                                  <span className="block w-full text-[11px] font-medium text-slate-300 truncate">
                                    {st.name}
                                  </span>
                                </button>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

    </div>
  );
};

export default ResultList;
