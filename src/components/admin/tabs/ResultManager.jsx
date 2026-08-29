import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  HiDocumentArrowUp,
  HiTrash,
  HiPencilSquare,
  HiPlus,
  HiTableCells,
  HiMagnifyingGlass,
  HiArrowDownTray,
  HiXMark,
  HiAcademicCap,
  HiArchiveBox,
  HiArrowUturnLeft,
  HiBolt,
} from "react-icons/hi2";
import { FaCrown, FaAward, FaFileExcel } from "react-icons/fa";
import { parseExcelResults } from "../../../utils/excelParser";
import {
  getAllResults,
  getResultsByYear,
  batchUploadResults,
  clearResultsByYear,
  addSingleResult,
  updateSingleResult,
  deleteSingleResult,
  getAvailableResultYears,
  getArchivedResultYears,
  setResultYearArchived,
} from "../../../services/firestore";
import * as XLSX from "xlsx";
import { Button, Chip, SubTabs, Toast, useConfirm } from "../ui";

const CLASSES = [
  "৪র্থ শ্রেণি",
  "৫ম শ্রেণি",
  "৬ষ্ঠ শ্রেণি",
  "৭ম শ্রেণি",
  "৮ম শ্রেণি",
  "৯ম শ্রেণি",
  "১০ম শ্রেণি",
];

const CATEGORIES = [
  "ট্যালেন্টপুল",
  "সাধারণ",
  "বিশেষ",
  "শ্রেণিভিত্তিক সেরা",
];

const ResultManager = () => {
  const [activeSubTab, setActiveSubTab] = useState("database"); // 'database' | 'upload'
  
  // Database CRUD state
  const [resultsList, setResultsList] = useState([]);
  const [confirm, confirmUI] = useConfirm();
  const [loadingResults, setLoadingResults] = useState(true);
  const [dbSearch, setDbSearch] = useState("");
  const [dbClassFilter, setDbClassFilter] = useState("all");
  const [dbCategoryFilter, setDbCategoryFilter] = useState("all");
  const [dbYearFilter, setDbYearFilter] = useState("২০২৫");
  const [availableYears, setAvailableYears] = useState(["২০২৫", "২০২৪", "২০২৩"]);
  const [archivedYears, setArchivedYears] = useState([]);
  const [archivingYear, setArchivingYear] = useState(null);
  const [dbPage, setDbPage] = useState(1);
  const dbItemsPerPage = 15;

  // Single Add / Edit Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null); // null = Add, obj = Edit
  const [submittingModal, setSubmittingModal] = useState(false);
  const [modalForm, setModalForm] = useState({
    roll: "",
    name: "",
    studentClass: "৪র্থ শ্রেণি",
    category: "ট্যালেন্টপুল",
    school: "",
    father: "",
    mobile: "",
    year: "২০২৫",
  });

  // Excel Upload state
  const [selectedFile, setSelectedFile] = useState(null);
  const [parsedData, setParsedData] = useState([]);
  const [examYear, setExamYear] = useState("২০২৫");
  const [parsing, setParsing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressInfo, setProgressInfo] = useState({ processed: 0, total: 0 });
  const [statusMessage, setStatusMessage] = useState(null);
  const [deleteYear, setDeleteYear] = useState("২০২৫");
  const [isDeleting, setIsDeleting] = useState(false);

  // Preview in Upload
  const [previewSearch, setPreviewSearch] = useState("");
  const [previewCategoryFilter, setPreviewCategoryFilter] = useState("all");
  const [previewPage, setPreviewPage] = useState(1);
  const previewItemsPerPage = 10;

  const fileInputRef = useRef(null);

  // Load Results
  const loadDatabaseResults = async () => {
    try {
      setLoadingResults(true);
      const [allRes, yrs, archived] = await Promise.all([
        getResultsByYear(dbYearFilter),
        getAvailableResultYears(),
        getArchivedResultYears(),
      ]);
      setResultsList(allRes || []);
      if (yrs && yrs.length > 0) setAvailableYears(yrs);
      setArchivedYears(archived || []);
    } catch (err) {
      console.error("Load database results error:", err);
    } finally {
      setLoadingResults(false);
    }
  };

  useEffect(() => {
    loadDatabaseResults();
  }, [dbYearFilter]);

  /* One click flips a session between live and archived. No confirm:
     it changes a label on the public page and is reversible from the
     same button — unlike the delete below it, nothing is destroyed. */
  const handleToggleArchive = async (year) => {
    const wasArchived = archivedYears.includes(year);
    try {
      setArchivingYear(year);
      const next = await setResultYearArchived(year, !wasArchived);
      setArchivedYears(next);
      showToast(
        wasArchived
          ? `${year} শিক্ষাবর্ষ আবার চলতি হিসেবে দেখাবে।`
          : `${year} শিক্ষাবর্ষ আর্কাইভে সরানো হয়েছে।`
      );
    } catch (err) {
      console.error(err);
      showToast(err.message || "স্ট্যাটাস বদলাতে ব্যর্থ হয়েছে!", "error");
    } finally {
      setArchivingYear(null);
    }
  };

  const showToast = (text, type = "success") => {
    setStatusMessage({ type, text });
    setTimeout(() => setStatusMessage(null), 5000);
  };

  // Open Add Modal
  const handleOpenAddModal = () => {
    setEditingStudent(null);
    setModalForm({
      roll: "",
      name: "",
      studentClass: "৪র্থ শ্রেণি",
      category: "ট্যালেন্টপুল",
      school: "",
      father: "",
      mobile: "",
      year: dbYearFilter === "all" ? "২০২৫" : dbYearFilter,
    });
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (student) => {
    setEditingStudent(student);
    setModalForm({
      roll: student.roll || "",
      name: student.name || "",
      studentClass: student.class || student.studentClass || "৪র্থ শ্রেণি",
      category: student.category || "ট্যালেন্টপুল",
      school: student.school || student.institution || "",
      father: student.father || "",
      mobile: student.mobile || "",
      year: student.year || "২০২৫",
    });
    setIsModalOpen(true);
  };

  // Submit Modal Form (Add or Edit)
  const handleModalSubmit = async (e) => {
    e.preventDefault();
    if (!modalForm.roll || !modalForm.name) {
      setStatusMessage({ type: "error", text: "রোল ও শিক্ষার্থীর নাম আবশ্যক!" });
      return;
    }

    setSubmittingModal(true);
    try {
      const payload = {
        roll: modalForm.roll.toString().trim(),
        name: modalForm.name.trim(),
        class: modalForm.studentClass,
        category: modalForm.category,
        school: modalForm.school.trim(),
        father: modalForm.father.trim(),
        mobile: modalForm.mobile.trim(),
        year: modalForm.year.toString().trim(),
      };

      if (editingStudent && editingStudent.id) {
        // Update
        await updateSingleResult(editingStudent.id, payload);
        setResultsList((prev) =>
          prev.map((item) => (item.id === editingStudent.id ? { ...item, ...payload } : item))
        );
        showToast(`রোল ${payload.roll}-এর ফলাফল সফলভাবে আপডেট হয়েছে!`);
      } else {
        // Add
        const added = await addSingleResult(payload);
        setResultsList((prev) => [added, ...prev]);
        showToast(`নতুন ফলাফল (রোল ${payload.roll}) সফলভাবে যুক্ত করা হয়েছে!`);
      }

      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
      showToast("রেজাল্ট সংরক্ষণ করতে ব্যর্থ হয়েছে!", "error");
    } finally {
      setSubmittingModal(false);
    }
  };

  // Delete Single Result
  const handleDeleteSingle = async (student) => {
    const ok = await confirm({
      title: "ফলাফলটি মুছে ফেলবেন?",
      body: "এই শিক্ষার্থীর ফলাফল ডেটাবেজ থেকে স্থায়ীভাবে মুছে যাবে এবং ওয়েবসাইটে আর খুঁজে পাওয়া যাবে না।",
      detail: `${student.name} — রোল: ${student.roll}`,
    });
    if (!ok) return;

    try {
      if (student.id) {
        await deleteSingleResult(student.id);
      }
      setResultsList((prev) => prev.filter((item) => item.roll !== student.roll));
      showToast(`রোল ${student.roll}-এর রেজাল্ট সফলভাবে মুছে ফেলা হয়েছে!`);
    } catch (err) {
      console.error(err);
      showToast("মুছে ফেলতে ব্যর্থ হয়েছে!", "error");
    }
  };

  // Filter Database Results
  const filteredDatabaseResults = useMemo(() => {
    return resultsList.filter((item) => {
      // Class filter
      if (dbClassFilter !== "all") {
        const itemCls = item.class || item.studentClass || "";
        if (!itemCls.includes(dbClassFilter.replace(" শ্রেণি", ""))) return false;
      }
      // Category filter
      if (dbCategoryFilter !== "all") {
        const itemCat = item.category || "";
        if (!itemCat.includes(dbCategoryFilter)) return false;
      }
      // Search query
      if (dbSearch.trim()) {
        const q = dbSearch.toLowerCase();
        const matches =
          item.name?.toLowerCase().includes(q) ||
          item.roll?.toString().includes(q) ||
          item.school?.toLowerCase().includes(q) ||
          item.father?.toLowerCase().includes(q) ||
          item.mobile?.includes(q);
        if (!matches) return false;
      }
      return true;
    });
  }, [resultsList, dbClassFilter, dbCategoryFilter, dbSearch]);

  const totalDbPages = Math.ceil(filteredDatabaseResults.length / dbItemsPerPage) || 1;
  const paginatedDbResults = useMemo(() => {
    const start = (dbPage - 1) * dbItemsPerPage;
    return filteredDatabaseResults.slice(start, start + dbItemsPerPage);
  }, [filteredDatabaseResults, dbPage]);

  // Export DB Results to Excel
  const handleExportExcel = () => {
    if (filteredDatabaseResults.length === 0) {
      setStatusMessage({ type: "error", text: "কোনো ডাটা পাওয়া যায়নি!" });
      return;
    }

    const exportRows = filteredDatabaseResults.map((r, i) => ({
      "ক্রমিক": i + 1,
      "রোল": r.roll,
      "শিক্ষার্থীর নাম": r.name,
      "শ্রেণি": r.class || r.studentClass,
      "বৃত্তি ক্যাটাগরি": r.category,
      "শিক্ষা প্রতিষ্ঠান": r.school || r.institution,
      "পিতার নাম": r.father || "—",
      "মোবাইল": r.mobile || "—",
      "শিক্ষাবর্ষ": r.year || "২০২৫",
    }));

    const ws = XLSX.utils.json_to_sheet(exportRows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Results");
    XLSX.writeFile(wb, `KKMB_Results_${dbYearFilter}_${Date.now()}.xlsx`);
  };

  // ==================== EXCEL UPLOAD HANDLERS ====================

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setParsing(true);
    setStatusMessage(null);
    setProgress(0);
    setPreviewPage(1);

    try {
      const results = await parseExcelResults(file);
      setParsedData(results);
      showToast(`এক্সেল ফাইলে মোট ${results.length} জন শিক্ষার্থীর ডাটা পাওয়া গেছে!`);
    } catch (err) {
      console.error(err);
      showToast(err.message || "এক্সেল ফাইল রিড করতে সমস্যা হয়েছে!", "error");
      setParsedData([]);
    } finally {
      setParsing(false);
    }
  };

  const handleBatchUpload = async () => {
    if (!parsedData || parsedData.length === 0) return;

    setUploading(true);
    setProgress(0);
    setStatusMessage(null);

    try {
      const formattedList = parsedData.map((student) => ({
        ...student,
        year: examYear,
      }));

      await batchUploadResults(
        formattedList,
        examYear,
        (percent, processed, total) => {
          setProgress(percent);
          setProgressInfo({ processed, total });
        }
      );

      showToast(`সাফল্যের সাথে মোট ${parsedData.length} জন শিক্ষার্থীর রেজাল্ট আপলোড সম্পন্ন হয়েছে! (${examYear} সেশন)`);
      // Switch back to database tab and refresh
      setDbYearFilter(examYear);
      loadDatabaseResults();
    } catch (err) {
      console.error(err);
      showToast(err.message || "আপলোড করতে সমস্যা হয়েছে!", "error");
    } finally {
      setUploading(false);
    }
  };

  const handleClearBatch = async () => {
    const ok = await confirm({
      title: `${deleteYear} শিক্ষাবর্ষের সব ফলাফল মুছে ফেলবেন?`,
      body: "এই শিক্ষাবর্ষে আপলোড করা প্রতিটি শিক্ষার্থীর ফলাফল একসাথে মুছে যাবে। কাজটি ফেরানো যাবে না — মুছে ফেলার আগে এক্সেল এক্সপোর্ট করে রাখা নিরাপদ।",
      detail: `${resultsList.length} টি ফলাফল রেকর্ড মুছে যাবে`,
      confirmLabel: "সব মুছে ফেলুন",
    });
    if (!ok) return;

    setIsDeleting(true);
    setStatusMessage(null);

    try {
      const res = await clearResultsByYear(deleteYear);
      showToast(`মোট ${res.deleted} জন শিক্ষার্থীর ডাটা সফলভাবে মুছে ফেলা হয়েছে! (${deleteYear})`);
      loadDatabaseResults();
    } catch (err) {
      console.error(err);
      showToast(err.message || "মুছতে সমস্যা হয়েছে!", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  // Preview filtered in upload tab
  const filteredPreview = useMemo(() => {
    return parsedData.filter((item) => {
      const matchesSearch =
        previewSearch === "" ||
        item.name?.toLowerCase().includes(previewSearch.toLowerCase()) ||
        item.roll?.toString().includes(previewSearch) ||
        item.school?.toLowerCase().includes(previewSearch.toLowerCase());

      const matchesCat =
        previewCategoryFilter === "all" ||
        item.category?.toLowerCase() === previewCategoryFilter.toLowerCase();

      return matchesSearch && matchesCat;
    });
  }, [parsedData, previewSearch, previewCategoryFilter]);

  return (
    <div className="space-y-6 text-ink-strong font-sans">
      
      {activeSubTab === "database" && (
        <div className="flex flex-wrap justify-end gap-2">
          <Button tone="primary" icon={HiPlus} onClick={handleOpenAddModal}>
            নতুন রেজাল্ট যুক্ত করুন
          </Button>
          <Button tone="neutral" icon={HiArrowDownTray} onClick={handleExportExcel}>
            এক্সেল এক্সপোর্ট
          </Button>
        </div>
      )}

      {/* Status Alert */}
      <Toast message={statusMessage} onDismiss={() => setStatusMessage(null)} />

      {/* Main Tab Switcher */}
      <SubTabs
        value={activeSubTab}
        onChange={setActiveSubTab}
        tabs={[
          { id: "database", label: "ফলাফল ডেটাবেজ", icon: HiTableCells, count: resultsList.length },
          { id: "upload", label: "এক্সেল শিট আপলোড", icon: HiDocumentArrowUp },
        ]}
      />

      {/* ===================================================================
          SUBTAB 1: RESULT DATABASE & FULL CRUD TABLE
          =================================================================== */}
      {activeSubTab === "database" && (
        <div className="space-y-4 animate-fadeIn">
          
          {/* Controls Bar: Filters & Search */}
          <div className="p-4 sm:p-5 bg-surface-card border border-line-soft rounded-lg shadow-none space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              
              {/* Year Filter */}
              <div>
                <label className="block text-[13px] font-bold text-ink-muted mb-1">শিক্ষাবর্ষ (Session Year)</label>
                <select
                  value={dbYearFilter}
                  onChange={(e) => {
                    setDbYearFilter(e.target.value);
                    setDbPage(1);
                  }}
                  className="w-full px-3 py-2.5 bg-surface border border-line-soft rounded text-ink-strong text-[13px] font-bold focus:outline-none focus:border-primary"
                >
                  {availableYears.map((yr) => (
                    <option key={yr} value={yr}>📅 {yr} শিক্ষাবর্ষ</option>
                  ))}
                  <option value="all">📁 সকল শিক্ষাবর্ষ</option>
                </select>
              </div>

              {/* Class Filter */}
              <div>
                <label className="block text-[13px] font-bold text-ink-muted mb-1">শ্রেণি নির্বাচন</label>
                <select
                  value={dbClassFilter}
                  onChange={(e) => {
                    setDbClassFilter(e.target.value);
                    setDbPage(1);
                  }}
                  className="w-full px-3 py-2.5 bg-surface border border-line-soft rounded text-ink-strong text-[13px] font-bold focus:outline-none focus:border-primary"
                >
                  <option value="all">সকল শ্রেণি</option>
                  {CLASSES.map((cls) => (
                    <option key={cls} value={cls}>{cls}</option>
                  ))}
                </select>
              </div>

              {/* Category Filter */}
              <div>
                <label className="block text-[13px] font-bold text-ink-muted mb-1">বৃত্তি ক্যাটাগরি</label>
                <select
                  value={dbCategoryFilter}
                  onChange={(e) => {
                    setDbCategoryFilter(e.target.value);
                    setDbPage(1);
                  }}
                  className="w-full px-3 py-2.5 bg-surface border border-line-soft rounded text-ink-strong text-[13px] font-bold focus:outline-none focus:border-primary"
                >
                  <option value="all">সকল ক্যাটাগরি</option>
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Search Bar */}
              <div>
                <label className="block text-[13px] font-bold text-ink-muted mb-1">প্রার্থী খুঁজুন</label>
                <div className="relative">
                  <HiMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted text-[13px]" />
                  <input
                    type="text"
                    value={dbSearch}
                    onChange={(e) => {
                      setDbSearch(e.target.value);
                      setDbPage(1);
                    }}
                    placeholder="রোল / নাম / প্রতিষ্ঠান..."
                    className="w-full pl-8 pr-3 py-2.5 bg-surface border border-line-soft rounded text-ink-strong text-[13px] font-medium focus:outline-none focus:border-primary"
                  />
                  {dbSearch && (
                    <button
                      onClick={() => setDbSearch("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink-strong"
                    >
                      <HiXMark className="text-sm" />
                    </button>
                  )}
                </div>
              </div>

            </div>

            {/* Results Count Strip */}
            <div className="flex items-center justify-between text-[13px] pt-1 border-t border-line-soft text-ink-muted">
              <span>
                মোট ফলাফল: <strong className="text-ink-strong font-bold">{filteredDatabaseResults.length} জন</strong>
              </span>
              <span>
                পৃষ্ঠা: <strong className="text-primary-400 font-mono">{dbPage}</strong> / {totalDbPages}
              </span>
            </div>
          </div>

          {/* Results Table */}
          <div className="bg-surface-card border border-line-soft rounded-lg shadow-none overflow-hidden">
            {loadingResults ? (
              <div className="p-16 text-center text-ink-muted text-[13px]">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                <span>ফলাফল লোড হচ্ছে...</span>
              </div>
            ) : filteredDatabaseResults.length === 0 ? (
              <div className="p-16 text-center text-ink-muted text-[13px] space-y-2">
                <HiAcademicCap className="text-4xl mx-auto text-ink-muted" />
                <p>কোনো ফলাফল পাওয়া যায়নি!</p>
                <button
                  type="button"
                  onClick={handleOpenAddModal}
                  className="px-4 py-1.5 bg-primary-500/20 text-primary-300 border border-primary-500/30 rounded text-[13px] font-bold"
                >
                  + ম্যানুয়ালি রেজাল্ট যোগ করুন
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-[13px]">
                  <thead className="bg-surface-card text-ink-muted uppercase text-[12px] tracking-wider border-b border-line-soft font-bold">
                    <tr>
                      <th className="p-3.5">রোল নম্বর</th>
                      <th className="p-3.5">শিক্ষার্থীর নাম</th>
                      <th className="p-3.5">শ্রেণি</th>
                      <th className="p-3.5">ক্যাটাগরি</th>
                      <th className="p-3.5">শিক্ষা প্রতিষ্ঠান</th>
                      <th className="p-3.5">পিতা / মোবাইল</th>
                      <th className="p-3.5">বর্ষ</th>
                      <th className="p-3.5 text-right">অ্যাকশন</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line-soft text-ink-body">
                    {paginatedDbResults.map((st) => (
                      <tr key={st.id || st.roll} className="hover:bg-surface-overlay/40 transition">
                        
                        {/* Roll */}
                        <td className="p-3.5">
                          <span className="px-2.5 py-1 rounded-lg bg-primary/20 text-primary font-mono font-semibold text-[13px] border border-primary/30 block w-fit">
                            {st.roll}
                          </span>
                        </td>

                        {/* Name */}
                        <td className="p-3.5">
                          <strong className="text-ink-strong font-bold text-sm block">
                            {st.name}
                          </strong>
                        </td>

                        {/* Class */}
                        <td className="p-3.5">
                          <span className="font-semibold text-ink-body">
                            {st.class || st.studentClass}
                          </span>
                        </td>

                        {/* Category */}
                        <td className="p-3.5">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[13px] font-bold inline-flex items-center gap-1 ${
                              st.category?.includes("ট্যালেন্ট")
                                ? "bg-secondary/20 text-secondary border border-secondary/30"
                                : st.category?.includes("বিশেষ")
                                ? "bg-tertiary/20 text-tertiary border border-tertiary/30"
                                : st.category?.includes("সেরা")
                                ? "bg-tertiary/20 text-tertiary border border-tertiary/30"
                                : "bg-primary-500/20 text-primary-300 border border-primary-500/30"
                            }`}
                          >
                            {st.category?.includes("ট্যালেন্ট") && <FaCrown className="text-[12px]" />}
                            {st.category}
                          </span>
                        </td>

                        {/* School */}
                        <td className="p-3.5">
                          <span className="text-ink-body truncate max-w-[180px] block" title={st.school}>
                            {st.school || st.institution || "—"}
                          </span>
                        </td>

                        {/* Father & Mobile */}
                        <td className="p-3.5">
                          <span className="text-ink-body block text-[13px] truncate max-w-[130px]">
                            {st.father || "—"}
                          </span>
                          {st.mobile && (
                            <span className="font-mono text-[12px] text-ink-muted block">
                              {st.mobile}
                            </span>
                          )}
                        </td>

                        {/* Year */}
                        <td className="p-3.5">
                          <span className="font-mono text-[13px] text-ink-muted">
                            {st.year || "২০২৫"}
                          </span>
                        </td>

                        {/* Action Buttons (Edit & Delete) */}
                        <td className="p-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleOpenEditModal(st)}
                              className="w-10 h-10 inline-flex items-center justify-center shrink-0 rounded bg-surface-overlay/40 hover:bg-surface-overlay text-primary hover:text-ink-strong transition cursor-pointer border border-line-soft"
                              title="এডিট করুন"
                            >
                              <HiPencilSquare className="text-sm" />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDeleteSingle(st)}
                              className="w-10 h-10 inline-flex items-center justify-center shrink-0 rounded bg-error/10 hover:bg-error/25 text-error transition cursor-pointer border border-error/20"
                              title="মুছে ফেলুন"
                            >
                              <HiTrash className="text-sm" />
                            </button>
                          </div>
                        </td>

                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination Controls */}
            {totalDbPages > 1 && (
              <div className="p-4 bg-surface-card border-t border-line-soft flex items-center justify-between text-[13px]">
                <button
                  type="button"
                  onClick={() => setDbPage((p) => Math.max(1, p - 1))}
                  disabled={dbPage === 1}
                  className="px-3.5 py-1.5 rounded bg-surface-overlay/40 hover:bg-surface-overlay text-ink-body disabled:opacity-40 transition cursor-pointer"
                >
                  ← পূর্ববর্তী
                </button>

                <span className="text-ink-muted font-medium">
                  পৃষ্ঠা {dbPage} / {totalDbPages}
                </span>

                <button
                  type="button"
                  onClick={() => setDbPage((p) => Math.min(totalDbPages, p + 1))}
                  disabled={dbPage === totalDbPages}
                  className="px-3.5 py-1.5 rounded bg-surface-overlay/40 hover:bg-surface-overlay text-ink-body disabled:opacity-40 transition cursor-pointer"
                >
                  পরবর্তী →
                </button>
              </div>
            )}
          </div>

        </div>
      )}

      {/* ===================================================================
          SUBTAB 2: EXCEL FILE UPLOAD & BATCH IMPORT
          =================================================================== */}
      {activeSubTab === "upload" && (
        <div className="space-y-6 animate-fadeIn">
          
          {/* Upload Dropzone Container */}
          <div className="p-6 sm:p-8 bg-surface-card border border-line-soft rounded-lg shadow-none space-y-6">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[13px] font-bold text-ink-body mb-1.5">
                  শিক্ষাবর্ষ নির্বাচন (Exam Session Year) *
                </label>
                <input
                  type="text"
                  value={examYear}
                  onChange={(e) => setExamYear(e.target.value)}
                  className="w-full px-4 py-3 bg-surface border border-line-soft rounded text-ink-strong font-mono font-bold text-sm"
                  placeholder="যেমন: ২০২৫"
                />
              </div>

              <div>
                <label className="block text-[13px] font-bold text-ink-body mb-1.5">
                  এক্সেল ফাইলের স্ট্যান্ডার্ড ফরম্যাট
                </label>
                <div className="p-3 bg-surface rounded border border-line-soft text-ink-muted text-[13px]">
                  কলাম হেডার: <code className="text-secondary font-bold">Roll, Name, Class, Category, School, Father, Mobile</code>
                </div>
              </div>
            </div>

            {/* File Input Box */}
            <div className="p-8 border-2 border-dashed border-line-strong/40 hover:border-primary/60 rounded-lg text-center space-y-4 bg-surface-card transition">
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx, .xls, .csv"
                onChange={handleFileChange}
                className="hidden"
                id="excel-file-input"
              />

              <div className="w-14 h-14 rounded-lg bg-primary/20 text-primary flex items-center justify-center text-3xl mx-auto shadow-inner">
                <FaFileExcel />
              </div>

              <div className="space-y-1">
                <label
                  htmlFor="excel-file-input"
                  className="inline-block px-6 py-2.5 bg-primary hover:bg-primary text-ink-strong font-bold text-[13px] rounded shadow cursor-pointer transition"
                >
                  এক্সেল ফাইল নির্বাচন করুন (.xlsx / .xls)
                </label>
                <p className="text-[13px] text-ink-muted">
                  {selectedFile ? `নির্বাচিত ফাইল: ${selectedFile.name}` : "কম্পিউটার থেকে এক্সেল ফাইল সিলেক্ট করুন"}
                </p>
              </div>
            </div>

            {/* Upload Action & Progress */}
            {parsedData.length > 0 && (
              <div className="p-5 bg-surface rounded-lg border border-line-soft space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <span className="text-[13px] text-ink-muted block">আপলোডের জন্য প্রস্তুত:</span>
                    <strong className="text-base text-primary-400 font-semibold">
                      {parsedData.length} জন শিক্ষার্থীর ফলাফল ({examYear} শিক্ষাবর্ষ)
                    </strong>
                  </div>

                  <button
                    type="button"
                    onClick={handleBatchUpload}
                    disabled={uploading}
                    className="px-8 py-3 bg-gradient-to-r from-primary-500 to-tertiary hover:from-primary-400 hover:to-tertiary text-primary-on font-semibold rounded text-[13px] sm:text-sm shadow-none transition cursor-pointer disabled:opacity-50 flex items-center gap-2"
                  >
                    {uploading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-line-soft border-t-transparent rounded-full animate-spin" />
                        <span>আপলোড হচ্ছে ({progress}%)...</span>
                      </>
                    ) : (
                      <>
                        <HiDocumentArrowUp className="text-base" />
                        <span>ফায়ারস্টোরে সেভ ও পাবলিশ করুন</span>
                      </>
                    )}
                  </button>
                </div>

                {uploading && (
                  <div className="space-y-1.5">
                    <div className="w-full h-2.5 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-primary-500 to-tertiary transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[13px] text-ink-muted font-mono">
                      <span>প্রসেসিং: {progressInfo.processed} / {progressInfo.total}</span>
                      <span>{progress}% সম্পন্ন</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Preview Table */}
            {parsedData.length > 0 && (
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-[13px] font-semibold text-ink-strong uppercase tracking-wider">
                    এক্সেল প্রিভিউ ({filteredPreview.length} জন)
                  </h3>
                </div>

                <div className="bg-surface border border-line-soft rounded overflow-x-auto max-h-72">
                  <table className="w-full text-left text-[13px]">
                    <thead className="bg-surface-card text-ink-muted uppercase text-[12px] border-b border-line-soft font-bold sticky top-0">
                      <tr>
                        <th className="p-3">রোল</th>
                        <th className="p-3">নাম</th>
                        <th className="p-3">শ্রেণি</th>
                        <th className="p-3">ক্যাটাগরি</th>
                        <th className="p-3">প্রতিষ্ঠান</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-line-soft text-ink-body">
                      {filteredPreview.slice(0, 30).map((st, i) => (
                        <tr key={i} className="hover:bg-surface-overlay/40">
                          <td className="p-3 font-mono text-primary-400 font-bold">{st.roll}</td>
                          <td className="p-3 font-bold text-ink-strong">{st.name}</td>
                          <td className="p-3">{st.class}</td>
                          <td className="p-3 text-secondary font-bold">{st.category}</td>
                          <td className="p-3 text-ink-muted truncate max-w-[200px]">{st.school}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

          </div>

          {/* Session status: which years the public page shows as live and
              which it files under the archive. */}
          <div className="p-4 space-y-3 border rounded-lg sm:p-5 bg-surface-card border-line-soft">
            <div className="flex flex-wrap items-start justify-between gap-2 pb-3 border-b border-line-soft">
              <div className="min-w-0">
                <h4 className="inline-flex items-center gap-2 text-sm font-semibold text-ink-strong">
                  <HiArchiveBox className="text-base text-secondary" />
                  শিক্ষাবর্ষ আর্কাইভ ব্যবস্থাপনা
                </h4>
                <p className="text-[13px] text-ink-muted mt-1 leading-relaxed">
                  আর্কাইভ করলে সেই বছরের ফলাফল পাবলিক পেজে আর্কাইভ সেকশনে দেখাবে। কোনো ডাটা মুছে যাবে না — যেকোনো সময় ফিরিয়ে আনা যাবে।
                </p>
              </div>
            </div>

            <ul className="space-y-2">
              {availableYears.map((yr) => {
                const isArchived = archivedYears.includes(yr);
                const busy = archivingYear === yr;
                return (
                  <li
                    key={yr}
                    className="flex flex-wrap items-center justify-between gap-3 p-3 border rounded bg-surface border-line-soft"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="font-mono text-sm font-semibold text-ink-strong">
                        {yr}
                      </span>
                      {isArchived ? (
                        <Chip tone="neutral" icon={HiArchiveBox}>আর্কাইভ</Chip>
                      ) : (
                        <Chip tone="primary" icon={HiBolt}>চলতি বর্ষ</Chip>
                      )}
                    </div>

                    <Button
                      type="button"
                      size="sm"
                      tone={isArchived ? "outline" : "neutral"}
                      icon={isArchived ? HiArrowUturnLeft : HiArchiveBox}
                      loading={busy}
                      onClick={() => handleToggleArchive(yr)}
                    >
                      {isArchived ? "চলতি করুন" : "আর্কাইভ করুন"}
                    </Button>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Danger Zone: Clear Year Results */}
          <div className="p-5 bg-error/10 border border-error/20 rounded-lg space-y-3">
            <h4 className="text-[13px] font-semibold text-error uppercase tracking-wider flex items-center gap-1.5">
              <HiTrash /> ডেঞ্জার জোন: নির্দিষ্ট শিক্ষাবর্ষের সকল ফলাফল মুছে ফেলুন
            </h4>
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <input
                type="text"
                value={deleteYear}
                onChange={(e) => setDeleteYear(e.target.value)}
                placeholder="যেমন: ২০২৫"
                className="w-full sm:w-48 px-3.5 py-2.5 bg-surface border border-error/30 rounded text-ink-strong font-mono font-bold text-[13px]"
              />
              <button
                type="button"
                onClick={handleClearBatch}
                disabled={isDeleting}
                className="w-full sm:w-auto px-5 py-2.5 bg-error hover:bg-error text-ink-strong font-bold text-[13px] rounded shadow transition cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? "মুছে ফেলা হচ্ছে..." : `${deleteYear} সেশনের সব ডাটা ডিলিট করুন`}
              </button>
            </div>
          </div>

        </div>
      )}

      {/* ===================================================================
          MODAL: ADD / EDIT RESULT RECORD
          =================================================================== */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto animate-fadeIn font-sans">
          <div className="relative w-full max-w-2xl bg-surface-card border border-line-soft rounded-lg shadow-2xl overflow-hidden">
            
            {/* Modal Header */}
            <div className="p-5 bg-surface-card border-b border-line-soft flex items-center justify-between">
              <h3 className="text-base font-semibold text-ink-strong flex items-center gap-2">
                <HiAcademicCap className="text-primary-400" />
                <span>{editingStudent ? "রেজাল্ট তথ্য এডিট করুন" : "নতুন ফলাফল যোগ করুন"}</span>
              </h3>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-10 h-10 inline-flex items-center justify-center shrink-0 rounded bg-surface-overlay/40 hover:bg-surface-overlay text-ink-body hover:text-ink-strong transition cursor-pointer"
              >
                <HiXMark className="text-lg" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleModalSubmit} className="p-5 sm:p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Roll */}
                <div>
                  <label className="block text-[13px] font-bold text-ink-body mb-1">
                    বৃত্তি রোল নম্বর *
                  </label>
                  <input
                    type="text"
                    required
                    value={modalForm.roll}
                    onChange={(e) => setModalForm({ ...modalForm, roll: e.target.value })}
                    placeholder="যেমন: 413960"
                    className="w-full px-3.5 py-2.5 bg-surface border border-line-soft rounded text-ink-strong font-mono font-semibold text-[13px] sm:text-sm focus:outline-none focus:border-primary"
                  />
                </div>

                {/* Name */}
                <div>
                  <label className="block text-[13px] font-bold text-ink-body mb-1">
                    শিক্ষার্থীর নাম (বাংলা) *
                  </label>
                  <input
                    type="text"
                    required
                    value={modalForm.name}
                    onChange={(e) => setModalForm({ ...modalForm, name: e.target.value })}
                    placeholder="যেমন: জান্নাতুল ফাতেমা"
                    className="w-full px-3.5 py-2.5 bg-surface border border-line-soft rounded text-ink-strong font-bold text-[13px] sm:text-sm focus:outline-none focus:border-primary"
                  />
                </div>

                {/* Class */}
                <div>
                  <label className="block text-[13px] font-bold text-ink-body mb-1">
                    শ্রেণি *
                  </label>
                  <select
                    value={modalForm.studentClass}
                    onChange={(e) => setModalForm({ ...modalForm, studentClass: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-surface border border-line-soft rounded text-ink-strong font-bold text-[13px] focus:outline-none focus:border-primary"
                  >
                    {CLASSES.map((cls) => (
                      <option key={cls} value={cls}>{cls}</option>
                    ))}
                  </select>
                </div>

                {/* Category */}
                <div>
                  <label className="block text-[13px] font-bold text-ink-body mb-1">
                    বৃত্তি ক্যাটাগরি *
                  </label>
                  <select
                    value={modalForm.category}
                    onChange={(e) => setModalForm({ ...modalForm, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-surface border border-line-soft rounded text-ink-strong font-bold text-[13px] focus:outline-none focus:border-primary"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                {/* School */}
                <div className="sm:col-span-2">
                  <label className="block text-[13px] font-bold text-ink-body mb-1">
                    শিক্ষা প্রতিষ্ঠান *
                  </label>
                  <input
                    type="text"
                    required
                    value={modalForm.school}
                    onChange={(e) => setModalForm({ ...modalForm, school: e.target.value })}
                    placeholder="যেমন: ধুপাগুল সরকারি প্রাথমিক বিদ্যালয়"
                    className="w-full px-3.5 py-2.5 bg-surface border border-line-soft rounded text-ink-strong text-[13px] sm:text-sm focus:outline-none focus:border-primary font-medium"
                  />
                </div>

                {/* Father */}
                <div>
                  <label className="block text-[13px] font-bold text-ink-body mb-1">
                    পিতার নাম
                  </label>
                  <input
                    type="text"
                    value={modalForm.father}
                    onChange={(e) => setModalForm({ ...modalForm, father: e.target.value })}
                    placeholder="পিতার নাম লিখুন..."
                    className="w-full px-3.5 py-2.5 bg-surface border border-line-soft rounded text-ink-strong text-[13px] focus:outline-none focus:border-primary"
                  />
                </div>

                {/* Mobile */}
                <div>
                  <label className="block text-[13px] font-bold text-ink-body mb-1">
                    মোবাইল নম্বর
                  </label>
                  <input
                    type="text"
                    value={modalForm.mobile}
                    onChange={(e) => setModalForm({ ...modalForm, mobile: e.target.value })}
                    placeholder="01XXXXXXXXX"
                    className="w-full px-3.5 py-2.5 bg-surface border border-line-soft rounded text-ink-strong font-mono text-[13px] focus:outline-none focus:border-primary"
                  />
                </div>

                {/* Session Year */}
                <div>
                  <label className="block text-[13px] font-bold text-ink-body mb-1">
                    শিক্ষাবর্ষ *
                  </label>
                  <input
                    type="text"
                    value={modalForm.year}
                    onChange={(e) => setModalForm({ ...modalForm, year: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-surface border border-line-soft rounded text-ink-strong font-mono font-bold text-[13px] focus:outline-none focus:border-primary"
                  />
                </div>

              </div>

              {/* Modal Action Buttons */}
              <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-line-soft">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded bg-surface-overlay/40 hover:bg-surface-overlay text-ink-body text-[13px] font-bold transition cursor-pointer"
                >
                  বাতিল
                </button>

                <button
                  type="submit"
                  disabled={submittingModal}
                  className="px-6 py-2.5 rounded bg-gradient-to-r from-primary-500 to-tertiary hover:from-primary-400 hover:to-tertiary text-primary-on font-semibold text-[13px] sm:text-sm shadow-none shadow-primary-500/25 transition cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                >
                  {submittingModal ? "সংরক্ষণ হচ্ছে..." : editingStudent ? "আপডেট করুন" : "যুক্ত করুন"}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {confirmUI}
    </div>
  );
};

export default ResultManager;
