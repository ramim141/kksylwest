import React, { useState, useEffect, useMemo } from "react";
import {
  HiTrash,
  HiPencilSquare,
  HiXMark,
  HiAcademicCap,
  HiMagnifyingGlass,
  HiArrowDownTray,
  HiCheck,
} from "react-icons/hi2";
import { FaWhatsapp, FaUserPlus } from "react-icons/fa";
import {
  getRegistrations,
  addRegistration,
  updateRegistrationStatus,
  deleteRegistration,
} from "../../../services/firestore";
import { uploadToImgBB } from "../../../services/imgbb";
import { Button, EmptyState, Toast, useConfirm } from "../ui";
const CLASSES = [
  "৪র্থ শ্রেণি",
  "৫ম শ্রেণি",
  "৬ষ্ঠ শ্রেণি",
  "৭ম শ্রেণি",
  "৮ম শ্রেণি",
  "৯ম শ্রেণি",
  "১০ম শ্রেণি",
];

const RELIGIONS = [
  "ইসলাম",
  "সনাতন (হিন্দু)",
  "বৌদ্ধ",
  "খ্রিস্টান",
  "অন্যান্য",
];

const GUARDIAN_RELATIONS = [
  "পিতা",
  "মাতা",
  "ভাই",
  "চাচা / মামা",
  "অন্যান্য অভিভাবক",
];

/* Same list the public form offers, so an offline entry lands in the same
   bucket as an online one and the upazila-wise reports stay comparable. */
const UPAZILAS = [
  "দক্ষিণ সুরমা থানা",
  "মোগলাবাজার থানা",
  "ফেঞ্চুগঞ্জ উপজেলা",
  "বিশ্বনাথ উপজেলা",
  "ওসমানীনগর উপজেলা",
  "সদর উপজেলা",
  "বালাগঞ্জ উপজেলা",
  "অন্যান্য",
];

/* "Cash/School" is stored verbatim because the public form and the existing
   records already use that exact string; changing it would split one bucket
   into two in every fee report. */
const PAYMENT_METHODS = [
  { value: "Cash/School", label: "নগদ টাকা (হাতে জমা)", online: false },
  { value: "bKash", label: "বিকাশ", online: true },
  { value: "Nagad", label: "নগদ (Nagad)", online: true },
  { value: "Rocket", label: "রকেট", online: true },
  { value: "Bank", label: "ব্যাংক জমা", online: true },
];

const RegistrationManager = () => {
  const [registrations, setRegistrations] = useState([]);
  const [confirm, confirmUI] = useConfirm();
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClass, setSelectedClass] = useState("all");
  const [selectedUpazila, setSelectedUpazila] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedStudent, setSelectedStudent] = useState(null); // Edit Modal view
  const [statusMessage, setStatusMessage] = useState(null);

  // Offline registration modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addingSubmitting, setAddingSubmitting] = useState(false);
  const [offlinePhotoFile, setOfflinePhotoFile] = useState(null);
  const [offlinePhotoPreview, setOfflinePhotoPreview] = useState("");

  const [offlineForm, setOfflineForm] = useState({
    nameBn: "",
    nameEn: "",
    gender: "ছাত্র",
    fatherName: "",
    motherName: "",
    guardianName: "",
    guardianRelation: "পিতা",
    dateOfBirth: "",
    religion: "ইসলাম",
    mobile: "",
    whatsappNumber: "",
    
    // Academic
    institution: "",
    studentClass: "১০ম শ্রেণি",
    section: "ক",
    classRoll: "",
    upazila: "দক্ষিণ সুরমা থানা",

    // Address
    village: "",
    postOffice: "",
    union: "",
    thana: "দক্ষিণ সুরমা",
    district: "সিলেট",
    presentAddress: "",

    // Admin Assigments
    assignedRoll: "",
    examCenter: "সিলেট সরকারি আলিয়া মাদরাসা কেন্দ্র, সিলেট",
    examDate: "২৪ অক্টোবর ২০২৫ (শুক্রবার)",
    examTime: "সকাল ১০:০০ টা - ১১:৩০ টা",
    roomNo: "",
    status: "approved", // Approved immediately for offline forms

    // Fee collection
    paymentMethod: "Cash/School",
    feeAmount: "২০০ টাকা",
    collectedBy: "",
    receiptNo: "",
    senderNumber: "",
    trxId: "",

    adminNote: "অফলাইন ফরম পূরণকৃত ও অনুমোদিত",
  });

  // Edit / Roll assignment state for existing records
  const [assignData, setAssignData] = useState({
    status: "approved",
    adminNote: "",
    assignedRoll: "",
    examCenter: "",
    examDate: "২৪ অক্টোবর ২০২৫ (শুক্রবার)",
    examTime: "সকাল ১০:০০ টা - ১১:৩০ টা",
    roomNo: "",
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await getRegistrations();
      setRegistrations(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filtered registrations
  const filteredList = useMemo(() => {
    return registrations.filter((r) => {
      const matchSearch =
        !searchQuery ||
        r.nameBn?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.nameEn?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.trackingId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.assignedRoll?.toString().includes(searchQuery) ||
        r.mobile?.includes(searchQuery) ||
        r.whatsappNumber?.includes(searchQuery) ||
        r.guardianPhone?.includes(searchQuery) ||
        r.institution?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchClass =
        selectedClass === "all" || r.studentClass === selectedClass;
      const matchUpazila =
        selectedUpazila === "all" || r.upazila === selectedUpazila;
      const matchStatus =
        selectedStatus === "all" || r.status === selectedStatus;

      return matchSearch && matchClass && matchUpazila && matchStatus;
    });
  }, [registrations, searchQuery, selectedClass, selectedUpazila, selectedStatus]);

  // Statistics
  const stats = useMemo(() => {
    const total = registrations.length;
    const pending = registrations.filter((r) => r.status === "pending").length;
    const approved = registrations.filter((r) => r.status === "approved").length;
    const rejected = registrations.filter((r) => r.status === "rejected").length;
    return { total, pending, approved, rejected };
  }, [registrations]);

  /* Cash handed over in person has no transaction to record; every other
     method does, so the sender/TrxID rows only appear for those. */
  const isOfflinePaymentOnline = useMemo(
    () =>
      PAYMENT_METHODS.find((pm) => pm.value === offlineForm.paymentMethod)?.online ?? false,
    [offlineForm.paymentMethod]
  );

  const handleOpenModal = (student) => {
    setSelectedStudent(student);
    setAssignData({
      status: student.status || "approved",
      adminNote: student.adminNote || "",
      assignedRoll: student.assignedRoll || "",
      examCenter: student.examCenter || "সিলেট সরকারি আলিয়া মাদরাসা কেন্দ্র, সিলেট",
      examDate: student.examDate || "২৪ অক্টোবর ২০২৫ (শুক্রবার)",
      examTime: student.examTime || "সকাল ১০:০০ টা - ১১:৩০ টা",
      roomNo: student.roomNo || "",
    });
  };

  const handleSaveStatus = async (e) => {
    e.preventDefault();
    if (!selectedStudent) return;

    try {
      await updateRegistrationStatus(
        selectedStudent.id,
        assignData.status,
        assignData.adminNote,
        assignData.assignedRoll,
        assignData.examCenter,
        assignData.examDate,
        assignData.examTime,
        assignData.roomNo
      );

      setStatusMessage({
        type: "success",
        text: `আবেদনকারী ${selectedStudent.nameBn}-এর রোল ও স্ট্যাটাস সফলভাবে সংরক্ষিত হয়েছে!`,
      });

      // Update locally
      setRegistrations((prev) =>
        prev.map((r) =>
          r.id === selectedStudent.id
            ? {
                ...r,
                status: assignData.status,
                adminNote: assignData.adminNote,
                assignedRoll: assignData.assignedRoll,
                examCenter: assignData.examCenter,
                examDate: assignData.examDate,
                examTime: assignData.examTime,
                roomNo: assignData.roomNo,
              }
            : r
        )
      );

      // Keep student in modal with updated data for 1-click whatsapp
      setSelectedStudent((prev) => ({
        ...prev,
        status: assignData.status,
        adminNote: assignData.adminNote,
        assignedRoll: assignData.assignedRoll,
        examCenter: assignData.examCenter,
        examDate: assignData.examDate,
        examTime: assignData.examTime,
        roomNo: assignData.roomNo,
      }));
    } catch (err) {
      console.error(err);
      setStatusMessage({
        type: "error",
        text: "স্ট্যাটাস পরিবর্তন করতে ব্যর্থ হয়েছে!",
      });
    }
  };

  // Handle Adding New Offline Registration
  const handleOfflineInputChange = (e) => {
    const { name, value } = e.target;
    setOfflineForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleOfflinePhotoSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setStatusMessage({ type: "error", text: "ছবির সাইজ ৫MB এর কম হতে হবে!" });
        return;
      }
      setOfflinePhotoFile(file);
      setOfflinePhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleAddOfflineSubmit = async (e) => {
    e.preventDefault();
    if (!offlineForm.nameBn.trim() || !offlineForm.institution.trim()) {
      setStatusMessage({
        type: "error",
        text: "অনুগ্রহ করে শিক্ষার্থীর নাম ও শিক্ষা প্রতিষ্ঠানের নাম লিখুন!",
      });
      return;
    }
    if (!offlineForm.thana.trim() || !offlineForm.union.trim()) {
      setStatusMessage({
        type: "error",
        text: "অনুগ্রহ করে থানা ও ইউনিয়নের নাম লিখুন!",
      });
      return;
    }

    setAddingSubmitting(true);
    try {
      let finalPhotoUrl = "";
      if (offlinePhotoFile) {
        try {
          const uploadRes = await uploadToImgBB(offlinePhotoFile);
          if (uploadRes?.url) {
            finalPhotoUrl = uploadRes.url;
          }
        } catch (uploadErr) {
          console.warn("ImgBB upload issue for offline reg:", uploadErr);
        }
      }

      const payload = {
        nameBn: offlineForm.nameBn.trim(),
        nameEn: offlineForm.nameEn.trim(),
        gender: offlineForm.gender,
        fatherName: offlineForm.fatherName.trim(),
        motherName: offlineForm.motherName.trim(),
        guardianName: offlineForm.guardianName.trim() || offlineForm.fatherName.trim(),
        guardianRelation: offlineForm.guardianRelation,
        dateOfBirth: offlineForm.dateOfBirth,
        religion: offlineForm.religion,
        mobile: offlineForm.mobile.trim(),
        whatsappNumber: offlineForm.whatsappNumber.trim() || offlineForm.mobile.trim(),
        
        institution: offlineForm.institution.trim(),
        studentClass: offlineForm.studentClass,
        section: offlineForm.section.trim(),
        classRoll: offlineForm.classRoll.trim(),
        upazila: offlineForm.upazila,

        village: offlineForm.village.trim(),
        postOffice: offlineForm.postOffice.trim(),
        union: offlineForm.union.trim(),
        thana: offlineForm.thana.trim(),
        district: offlineForm.district.trim(),
        presentAddress: offlineForm.presentAddress.trim(),

        photoUrl: finalPhotoUrl,
        paymentMethod: offlineForm.paymentMethod,
        feeAmount: offlineForm.feeAmount.trim(),
        collectedBy: offlineForm.collectedBy.trim(),
        receiptNo: offlineForm.receiptNo.trim(),
        senderNumber: offlineForm.senderNumber.trim(),
        trxId: offlineForm.trxId.trim(),
        status: offlineForm.status,
        assignedRoll: offlineForm.assignedRoll.trim(),
        examCenter: offlineForm.examCenter.trim(),
        examDate: offlineForm.examDate.trim(),
        examTime: offlineForm.examTime.trim(),
        roomNo: offlineForm.roomNo.trim(),
        adminNote: offlineForm.adminNote.trim() || "অফলাইন রেজিস্ট্রেশন",
      };

      const res = await addRegistration(payload);
      const newEntry = { ...payload, trackingId: res.trackingId, id: res.id };

      setRegistrations((prev) => [newEntry, ...prev]);
      setIsAddModalOpen(false);
      setStatusMessage({
        type: "success",
        text: `অফলাইন শিক্ষার্থী ${newEntry.nameBn}-এর রেজিস্ট্রেশন সফলভাবে সম্পন্ন ও রোল (${newEntry.assignedRoll || "অপেক্ষমান"}) বরাদ্দ হয়েছে!`,
      });

      // Reset form
      setOfflineForm({
        nameBn: "",
        nameEn: "",
        gender: "ছাত্র",
        fatherName: "",
        motherName: "",
        guardianName: "",
        guardianRelation: "পিতা",
        dateOfBirth: "",
        religion: "ইসলাম",
        mobile: "",
        whatsappNumber: "",
        institution: "",
        studentClass: "১০ম শ্রেণি",
        section: "ক",
        classRoll: "",
        upazila: "দক্ষিণ সুরমা থানা",
        village: "",
        postOffice: "",
        union: "",
        thana: "দক্ষিণ সুরমা",
        district: "সিলেট",
        presentAddress: "",
        assignedRoll: "",
        examCenter: "সিলেট সরকারি আলিয়া মাদরাসা কেন্দ্র, সিলেট",
        examDate: "২৪ অক্টোবর ২০২৫ (শুক্রবার)",
        examTime: "সকাল ১০:০০ টা - ১১:৩০ টা",
        roomNo: "",
        status: "approved",
        paymentMethod: "Cash/School",
        feeAmount: "২০০ টাকা",
        /* Cleared with the rest: a stack of paper forms can each have been
           collected by a different person, so carrying the last name over
           would quietly credit the money to the wrong one. */
        collectedBy: "",
        receiptNo: "",
        senderNumber: "",
        trxId: "",
        adminNote: "অফলাইন ফরম পূরণকৃত ও অনুমোদিত",
      });
      setOfflinePhotoFile(null);
      setOfflinePhotoPreview("");
    } catch (err) {
      console.error(err);
      setStatusMessage({ type: "error", text: "রেজিস্ট্রেশন সংরক্ষণে সমস্যা হয়েছে: " + err.message });
    } finally {
      setAddingSubmitting(false);
    }
  };

  const handleSendWhatsAppNotification = (student, roll, center, date, time) => {
    const rawPhone =
      student.whatsappNumber ||
      student.mobile ||
      student.guardianPhone ||
      student.studentPhone ||
      "";
    let cleanPhone = rawPhone.replace(/[^0-9]/g, "");

    if (cleanPhone.startsWith("0")) {
      cleanPhone = "88" + cleanPhone;
    } else if (!cleanPhone.startsWith("880") && cleanPhone.length === 10) {
      cleanPhone = "880" + cleanPhone;
    }

    const assignedRollNum = roll || student.assignedRoll || "অ্যাসাইনকৃত";
    const centerName = center || student.examCenter || "সিলেট সরকারি আলিয়া মাদরাসা কেন্দ্র, সিলেট";
    const examDateStr = date || student.examDate || "২৪ অক্টোবর ২০২৫ (শুক্রবার)";
    const examTimeStr = time || student.examTime || "সকাল ১০:০০ টা - ১১:৩০ টা";
    const trackingIdStr = student.trackingId || "";

    const baseUrl = window.location.origin;
    const cleanRollUrl = assignedRollNum.toString().replace(/[০-৯]/g, (d) => "0123456789"["০১২৩৪৫৬৭৮৯".indexOf(d)] || d);
    const admitUrl = `${baseUrl}/admit-card?id=${cleanRollUrl}`;

    const msg = `আসসালামু আলাইকুম ${student.nameBn || "শিক্ষার্থী"}! 🎉
কিশোরকণ্ঠ মেধা বৃত্তি পরীক্ষায় আপনার আবেদন সফলভাবে অনুমোদিত হয়েছে।

📌 *আপনার পরীক্ষার বিবরণ:*
• রোল নম্বর: *${assignedRollNum}*
• শ্রেণি: ${student.studentClass || ""}
• পরীক্ষা কেন্দ্র: *${centerName}*
• পরীক্ষার সময়: ${examDateStr} (${examTimeStr})
• ট্র্যাকিং আইডি: ${trackingIdStr}

🔗 *আপনার অফিসিয়াল প্রবেশপত্র (Admit Card) ডাউনলোড লিংক:*
${admitUrl}

পরীক্ষার দিন প্রবেশপত্রটি প্রিন্ট করে সাথে নিয়ে আসতে হবে।

ধন্যবাদান্তে,
কিশোরকণ্ঠ পাঠক ফোরাম, সিলেট জেলা পশ্চিম।`;

    const waUrl = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(msg)}`;
    window.open(waUrl, "_blank");
  };

  const handleDelete = async (id, name) => {
    const ok = await confirm({
        title: "আবেদনটি মুছে ফেলবেন?",
        body: "শিক্ষার্থীর সম্পূর্ণ আবেদন, ছবি ও বরাদ্দকৃত রোল স্থায়ীভাবে মুছে যাবে।",
        detail: name,
      });
      if (!ok) return;

    try {
      await deleteRegistration(id);
      setRegistrations((prev) => prev.filter((r) => r.id !== id));
      setStatusMessage({
        type: "success",
        text: "আবেদন সফলভাবে মুছে ফেলা হয়েছে!",
      });
    } catch (err) {
      setStatusMessage({ type: "error", text: "মুছে ফেলতে ব্যর্থ হয়েছে!" });
    }
  };

  // Export CSV
  const exportToCSV = () => {
    if (filteredList.length === 0) {
      setStatusMessage({ type: "error", text: "কোনো ডাটা পাওয়া যায়নি!" });
      return;
    }

    const headers = [
      "Tracking ID",
      "Name (Bn)",
      "Name (En)",
      "Gender",
      "Father",
      "Mother",
      "Class",
      "Section",
      "Class Roll",
      "Institution",
      "Upazila",
      "Village",
      "Post Office",
      "Union",
      "Thana",
      "District",
      "Mobile",
      "WhatsApp",
      "Status",
      "Payment",
      "TrxID",
      "Assigned Roll",
      "Exam Center",
    ];

    const rows = filteredList.map((r) => [
      r.trackingId || "",
      r.nameBn || "",
      r.nameEn || "",
      r.gender || "",
      r.fatherName || "",
      r.motherName || "",
      r.studentClass || "",
      r.section || "",
      r.classRoll || "",
      r.institution || "",
      r.upazila || "",
      r.village || "",
      r.postOffice || "",
      r.union || "",
      r.thana || "",
      r.district || "",
      r.mobile || r.guardianPhone || "",
      r.whatsappNumber || "",
      r.status || "",
      r.paymentMethod || "",
      r.trxId || "",
      r.assignedRoll || "",
      r.examCenter || "",
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8,\uFEFF" +
      [headers.join(","), ...rows.map((e) => e.map(item => `"${item}"`).join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `registrations_export_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-fadeIn font-sans text-ink-strong">
      <div className="flex flex-wrap justify-end gap-2">
        <Button tone="primary" icon={FaUserPlus} onClick={() => setIsAddModalOpen(true)}>
          অফলাইন নতুন রেজিস্ট্রেশন
        </Button>
        <Button tone="neutral" icon={HiArrowDownTray} onClick={exportToCSV}>
          CSV এক্সপোর্ট
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 bg-surface-card border border-line-soft rounded-lg shadow-none">
          <span className="text-2xl font-semibold text-ink-strong block font-mono">
            {stats.total}
          </span>
          <span className="text-[13px] text-ink-muted font-medium">মোট আবেদনকারী</span>
        </div>
        <div className="p-4 bg-surface-card border border-secondary/30 rounded-lg shadow-none">
          <span className="text-2xl font-semibold text-secondary block font-mono">
            {stats.pending}
          </span>
          <span className="text-[13px] text-ink-muted font-medium">অপেক্ষমাণ (Pending)</span>
        </div>
        <div className="p-4 bg-surface-card border border-primary-500/30 rounded-lg shadow-none">
          <span className="text-2xl font-semibold text-primary-400 block font-mono">
            {stats.approved}
          </span>
          <span className="text-[13px] text-ink-muted font-medium">অনুমোদিত (Approved)</span>
        </div>
        <div className="p-4 bg-surface-card border border-error/30 rounded-lg shadow-none">
          <span className="text-2xl font-semibold text-error block font-mono">
            {stats.rejected}
          </span>
          <span className="text-[13px] text-ink-muted font-medium">বাতিলকৃত (Rejected)</span>
        </div>
      </div>

      {/* Status Alert */}
      <Toast message={statusMessage} onDismiss={() => setStatusMessage(null)} />

      {/* Filters Bar */}
      <div className="p-4 bg-surface-card border border-line-soft rounded-lg grid grid-cols-1 sm:grid-cols-4 gap-3 shadow-lg">
        <div className="relative sm:col-span-2">
          <HiMagnifyingGlass className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted text-base" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="নাম, রোল, ট্র্যাকিং আইডি, মোবাইল বা প্রতিষ্ঠান..."
            className="w-full pl-10 pr-4 py-2.5 bg-surface border border-line-soft rounded text-[13px] text-ink-strong placeholder:text-ink-muted focus:outline-none focus:border-primary font-medium"
          />
        </div>

        <div>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full px-3 py-2.5 bg-surface border border-line-soft rounded text-[13px] text-ink-strong font-bold focus:outline-none focus:border-primary"
          >
            <option value="all">সকল স্ট্যাটাস</option>
            <option value="pending">⏳ শুধু অপেক্ষমাণ (Pending)</option>
            <option value="approved">✓ অনুমোদিত (Approved)</option>
            <option value="rejected">✕ বাতিলকৃত (Rejected)</option>
          </select>
        </div>

        <div>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="w-full px-3 py-2.5 bg-surface border border-line-soft rounded text-[13px] text-ink-strong font-bold focus:outline-none focus:border-primary"
          >
            <option value="all">সকল শ্রেণি</option>
            {CLASSES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Registrations Table */}
      <div className="bg-surface-card border border-line-soft rounded-lg shadow-none overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-ink-muted text-[13px]">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            আবেদন তালিকা লোড হচ্ছে...
          </div>
        ) : filteredList.length === 0 ? (
          <EmptyState
            icon={HiAcademicCap}
            title={
              registrations.length === 0
                ? "এখনো কোনো আবেদন জমা পড়েনি"
                : "এই ফিল্টারে কোনো আবেদন মেলেনি"
            }
            description={
              registrations.length === 0
                ? "অনলাইন আবেদন জমা পড়লে এখানে দেখা যাবে। কাগজের ফরম হাতে থাকলে উপরের বাটন থেকে সরাসরি অফলাইন এন্ট্রি দিন।"
                : `মোট ${registrations.length} টি আবেদনের কোনোটিই বর্তমান সার্চ ও ফিল্টারের সাথে মেলেনি।`
            }
            action={
              registrations.length > 0 ? (
                <Button
                  tone="neutral"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedClass("all");
                    setSelectedUpazila("all");
                    setSelectedStatus("all");
                  }}
                >
                  সব ফিল্টার মুছুন
                </Button>
              ) : (
                <Button tone="primary" icon={FaUserPlus} onClick={() => setIsAddModalOpen(true)}>
                  অফলাইন নতুন রেজিস্ট্রেশন
                </Button>
              )
            }
            className="m-4"
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[13px]">
              <thead className="bg-surface text-ink-muted uppercase text-[12px] tracking-wider border-b border-line-soft font-bold">
                <tr>
                  <th className="p-3.5">ট্র্যাকিং ও ছবি</th>
                  <th className="p-3.5">পরীক্ষার্থীর নাম</th>
                  <th className="p-3.5">শ্রেণি ও প্রতিষ্ঠান</th>
                  <th className="p-3.5">পেমেন্ট ও TrxID</th>
                  <th className="p-3.5">বরাদ্দ রোল ও কেন্দ্র</th>
                  <th className="p-3.5">স্ট্যাটাস</th>
                  <th className="p-3.5 text-right">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line-soft text-ink-body">
                {filteredList.map((st) => (
                  <tr key={st.id} className="hover:bg-surface-overlay/40 transition">
                    <td className="p-3.5">
                      <div className="flex items-center gap-2">
                        {st.photoUrl ? (
                          <img
                            src={st.photoUrl}
                            alt=""
                            className="w-9 h-9 rounded-lg object-cover border border-line-soft"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-lg bg-surface-overlay/40 flex items-center justify-center text-ink-muted font-bold">
                            {st.nameBn?.charAt(0) || "👨‍🎓"}
                          </div>
                        )}
                        <div>
                          <span className="font-mono text-primary-400 font-bold block text-[13px]">
                            {st.trackingId}
                          </span>
                          <span className="text-[12px] text-ink-muted block font-mono">
                            {st.gender || "ছাত্র"}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="p-3.5">
                      <span className="font-bold text-ink-strong block text-sm">
                        {st.nameBn}
                      </span>
                      <span className="text-[12px] text-ink-muted block font-mono">
                        📱 {st.whatsappNumber || st.mobile || st.guardianPhone}
                      </span>
                    </td>

                    <td className="p-3.5">
                      <span className="font-semibold text-ink-strong block">
                        {st.studentClass} {st.section ? `(${st.section})` : ""}
                      </span>
                      <span className="text-[12px] text-ink-muted block truncate max-w-[160px]">
                        {st.institution}
                      </span>
                    </td>

                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded-full bg-surface-overlay/40 text-[12px] font-bold block w-fit mb-0.5 text-ink-body">
                        {st.paymentMethod}
                      </span>
                      <span className="font-mono text-[12px] text-secondary block">
                        {st.trxId ? `Trx: ${st.trxId}` : "ক্যাশ গ্রহণ"}
                      </span>
                    </td>

                    <td className="p-3.5">
                      {st.assignedRoll ? (
                        <div>
                          <span className="px-2 py-0.5 rounded-md bg-primary-500/20 text-primary-300 font-mono font-semibold text-[13px] block w-fit border border-primary-500/30">
                            রোল: {st.assignedRoll}
                          </span>
                          <span className="text-[12px] text-ink-muted block truncate max-w-[140px] mt-0.5">
                            {st.examCenter || "কেন্দ্র নির্ধারিত"}
                          </span>
                        </div>
                      ) : (
                        <span className="text-[13px] text-ink-muted italic">
                          রোল বরাদ্দ হয়নি
                        </span>
                      )}
                    </td>

                    <td className="p-3.5">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[12px] font-bold ${
                          st.status === "approved"
                            ? "bg-primary-500/20 text-primary-300 border border-primary-500/30"
                            : st.status === "rejected"
                            ? "bg-error/20 text-error border border-error/30"
                            : "bg-secondary/20 text-secondary border border-secondary/30"
                        }`}
                      >
                        {st.status === "approved"
                          ? "✓ Approved"
                          : st.status === "rejected"
                          ? "✕ Rejected"
                          : "⏳ Pending"}
                      </span>
                    </td>

                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* 1-Click WhatsApp Button */}
                        <button
                          type="button"
                          onClick={() => handleSendWhatsAppNotification(st)}
                          title="WhatsApp-এ প্রবেশপত্র নোটিফিকেশন পাঠান"
                          className="w-10 h-10 inline-flex items-center justify-center shrink-0 rounded bg-primary-500/15 hover:bg-primary-500/30 text-primary-400 border border-primary-500/30 transition cursor-pointer"
                        >
                          <FaWhatsapp className="text-sm" />
                        </button>

                        {/* Edit / Approve Modal Button */}
                        <button
                          type="button"
                          onClick={() => handleOpenModal(st)}
                          className="px-3 py-1.5 rounded bg-surface-overlay/40 hover:bg-surface-overlay text-ink-strong font-bold text-[13px] border border-line-soft transition cursor-pointer flex items-center gap-1"
                        >
                          <HiPencilSquare className="text-sm text-primary" />
                          <span>রোল ও অনুমোদন</span>
                        </button>

                        {/* Delete Button */}
                        <button
                          type="button"
                          onClick={() => handleDelete(st.id, st.nameBn)}
                          className="w-10 h-10 inline-flex items-center justify-center shrink-0 rounded bg-error/10 hover:bg-error/25 text-error transition cursor-pointer"
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
      </div>

      {/* ===================================================================
          MODAL 1: ADD NEW OFFLINE STUDENT REGISTRATION MODAL
          =================================================================== */}
      {isAddModalOpen && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center p-2 sm:p-3 bg-surface-lowest/80 backdrop-blur-md animate-fadeIn"
          onClick={() => setIsAddModalOpen(false)}
        >
          <div
            className="relative w-full max-w-5xl bg-surface border border-line-soft rounded-lg p-4 sm:p-5 shadow-overlay space-y-3 max-h-[96vh] overflow-y-auto scrollbar-none overlay-enter"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-line-soft pb-3">
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-ink-strong flex items-center gap-2">
                  <FaUserPlus className="text-primary" />
                  <span>অফলাইন কাগজের ফরম শিক্ষার্থী এন্ট্রি</span>
                </h3>
                <span className="text-[13px] text-ink-muted">
                  অফলাইনে জমাকৃত ফরম থেকে সরাসরি ডাটাবেজে এন্ট্রি ও রোল বরাদ্দ করুন।
                </span>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="w-8 h-8 rounded-full bg-surface-card hover:bg-surface-overlay text-ink-body flex items-center justify-center transition cursor-pointer"
              >
                <HiXMark className="text-lg" />
              </button>
            </div>

            <form onSubmit={handleAddOfflineSubmit} className="space-y-3">
              
              {/* SECTION 1: PERSONAL DETAILS */}
              <div className="space-y-2.5 p-3 bg-surface-lowest/80 rounded-lg border border-line-soft">
                <span className="text-[13px] font-bold text-primary uppercase tracking-wider block">
                  ১. পরীক্ষার্থীর ব্যক্তিগত তথ্য
                </span>

                {/* Eight fields in two rows on a wide screen; the modal is
                    sized so this section never needs its own scroll. */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div className="min-w-0">
                    <label className="block text-[13px] font-bold text-ink-body mb-0.5">
                      পরীক্ষার্থীর নাম (বাংলায়) <span className="text-tertiary">*</span>
                    </label>
                    <input
                      type="text"
                      name="nameBn"
                      value={offlineForm.nameBn}
                      onChange={handleOfflineInputChange}
                      placeholder="নাম বাংলায়"
                      required
                      className="w-full px-3 py-1.5 bg-surface border border-line-soft rounded text-ink-strong text-[13px] focus:outline-none focus:border-primary/40"
                    />
                  </div>

                  <div className="min-w-0">
                    <label className="block text-[13px] font-bold text-ink-body mb-0.5">Name (English - Capital)</label>
                    <input
                      type="text"
                      name="nameEn"
                      value={offlineForm.nameEn}
                      onChange={handleOfflineInputChange}
                      placeholder="KAZI SHAFAYAT..."
                      className="w-full px-3 py-1.5 bg-surface border border-line-soft rounded text-ink-strong text-[13px] focus:outline-none focus:border-primary/40 uppercase"
                    />
                  </div>

                  <div className="min-w-0">
                    <label className="block text-[13px] font-bold text-ink-body mb-0.5">লিঙ্গ</label>
                    <select
                      name="gender"
                      value={offlineForm.gender}
                      onChange={handleOfflineInputChange}
                      className="w-full px-3 py-1.5 bg-surface border border-line-soft rounded text-ink-strong text-[13px] focus:outline-none focus:border-primary/40"
                    >
                      <option value="ছাত্র">👨‍🎓 ছাত্র</option>
                      <option value="ছাত্রী">👩‍🎓 ছাত্রী</option>
                    </select>
                  </div>

                  <div className="min-w-0">
                    <label className="block text-[13px] font-bold text-ink-body mb-0.5">ধর্ম</label>
                    <select
                      name="religion"
                      value={offlineForm.religion}
                      onChange={handleOfflineInputChange}
                      className="w-full px-3 py-1.5 bg-surface border border-line-soft rounded text-ink-strong text-[13px] focus:outline-none focus:border-primary/40"
                    >
                      {RELIGIONS.map((rel) => (
                        <option key={rel} value={rel}>
                          {rel}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="min-w-0">
                    <label className="block text-[13px] font-bold text-ink-body mb-0.5">মোবাইল নম্বর</label>
                    <input
                      type="tel"
                      name="mobile"
                      value={offlineForm.mobile}
                      onChange={handleOfflineInputChange}
                      placeholder="017XXXXXXXX"
                      className="w-full px-3 py-1.5 bg-surface border border-line-soft rounded text-ink-strong text-[13px] focus:outline-none focus:border-primary/40 font-mono"
                    />
                  </div>

                  <div className="min-w-0">
                    <label className="block text-[13px] font-bold text-primary mb-0.5 flex items-center gap-1">
                      <FaWhatsapp /> WhatsApp নম্বর
                    </label>
                    <input
                      type="tel"
                      name="whatsappNumber"
                      value={offlineForm.whatsappNumber}
                      onChange={handleOfflineInputChange}
                      placeholder="017XXXXXXXX"
                      className="w-full px-3 py-1.5 bg-surface border border-primary/40 rounded text-ink-strong text-[13px] font-mono focus:outline-none focus:border-primary/40"
                    />
                  </div>

                  <div className="min-w-0">
                    <label className="block text-[13px] font-bold text-ink-body mb-0.5">পিতার নাম</label>
                    <input
                      type="text"
                      name="fatherName"
                      value={offlineForm.fatherName}
                      onChange={handleOfflineInputChange}
                      placeholder="পিতার নাম"
                      className="w-full px-3 py-1.5 bg-surface border border-line-soft rounded text-ink-strong text-[13px] focus:outline-none focus:border-primary/40"
                    />
                  </div>

                  <div className="min-w-0">
                    <label className="block text-[13px] font-bold text-ink-body mb-0.5">মাতার নাম</label>
                    <input
                      type="text"
                      name="motherName"
                      value={offlineForm.motherName}
                      onChange={handleOfflineInputChange}
                      placeholder="মাতার নাম"
                      className="w-full px-3 py-1.5 bg-surface border border-line-soft rounded text-ink-strong text-[13px] focus:outline-none focus:border-primary/40"
                    />
                  </div>
                </div>
              </div>
              {/* SECTION 2: ACADEMIC & ADDRESS */}
              <div className="space-y-2.5 p-3 bg-surface-lowest/80 rounded-lg border border-line-soft">
                <span className="text-[13px] font-bold text-tertiary uppercase tracking-wider block">
                  ২. শিক্ষাগত ও ঠিকানার তথ্য
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-[13px] font-bold text-ink-body mb-0.5">
                      শিক্ষা প্রতিষ্ঠানের নাম <span className="text-tertiary">*</span>
                    </label>
                    <input
                      type="text"
                      name="institution"
                      value={offlineForm.institution}
                      onChange={handleOfflineInputChange}
                      placeholder="স্কুল / মাদ্রাসার নাম"
                      required
                      className="w-full px-3 py-1.5 bg-surface border border-line-soft rounded text-ink-strong text-[13px] focus:outline-none focus:border-primary/40"
                    />
                  </div>

                  <div>
                    <label className="block text-[13px] font-bold text-ink-body mb-0.5">
                      শ্রেণি
                    </label>
                    <select
                      name="studentClass"
                      value={offlineForm.studentClass}
                      onChange={handleOfflineInputChange}
                      className="w-full px-3 py-1.5 bg-surface border border-line-soft rounded text-ink-strong text-[13px] focus:outline-none focus:border-primary/40 font-bold"
                    >
                      {CLASSES.map((cls) => (
                        <option key={cls} value={cls}>
                          {cls}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[13px] font-bold text-ink-body mb-0.5">
                      শাখা / ক্লাস রোল
                    </label>
                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        name="section"
                        value={offlineForm.section}
                        onChange={handleOfflineInputChange}
                        placeholder="শাখা"
                        className="w-1/2 px-2.5 py-1.5 bg-surface border border-line-soft rounded text-ink-strong text-[13px]"
                      />
                      <input
                        type="text"
                        name="classRoll"
                        value={offlineForm.classRoll}
                        onChange={handleOfflineInputChange}
                        placeholder="রোল"
                        className="w-1/2 px-2.5 py-1.5 bg-surface border border-line-soft rounded text-ink-strong text-[13px] font-mono"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 pt-1">
                  {/* Without this the offline entry silently kept the default
                      upazila, which skewed every upazila-wise report. */}
                  <div className="min-w-0">
                    <label className="block text-[13px] text-ink-muted">উপজেলা / থানা *</label>
                    <select
                      name="upazila"
                      value={offlineForm.upazila}
                      onChange={handleOfflineInputChange}
                      className="w-full px-2.5 py-1.5 bg-surface border border-line-soft rounded text-ink-strong text-[13px]"
                    >
                      {UPAZILAS.map((u) => (
                        <option key={u} value={u}>
                          {u}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[13px] text-ink-muted">গ্রাম</label>
                    <input
                      type="text"
                      name="village"
                      value={offlineForm.village}
                      onChange={handleOfflineInputChange}
                      placeholder="গ্রাম"
                      className="w-full px-2.5 py-1.5 bg-surface border border-line-soft rounded text-ink-strong text-[13px]"
                    />
                  </div>
                  <div>
                    <label className="block text-[13px] text-ink-muted">ডাকঘর</label>
                    <input
                      type="text"
                      name="postOffice"
                      value={offlineForm.postOffice}
                      onChange={handleOfflineInputChange}
                      placeholder="ডাকঘর"
                      className="w-full px-2.5 py-1.5 bg-surface border border-line-soft rounded text-ink-strong text-[13px]"
                    />
                  </div>
                  <div>
                    <label className="block text-[13px] text-ink-muted">ইউনিয়ন *</label>
                    <input
                      type="text"
                      name="union"
                      value={offlineForm.union}
                      onChange={handleOfflineInputChange}
                      placeholder="ইউনিয়ন"
                      required
                      className="w-full px-2.5 py-1.5 bg-surface border border-line-soft rounded text-ink-strong text-[13px]"
                    />
                  </div>
                  <div>
                    <label className="block text-[13px] text-ink-muted">থানা *</label>
                    <input
                      type="text"
                      name="thana"
                      value={offlineForm.thana}
                      onChange={handleOfflineInputChange}
                      placeholder="থানা"
                      required
                      className="w-full px-2.5 py-1.5 bg-surface border border-line-soft rounded text-ink-strong text-[13px]"
                    />
                  </div>
                  <div>
                    <label className="block text-[13px] text-ink-muted">জেলা</label>
                    <input
                      type="text"
                      name="district"
                      value={offlineForm.district}
                      onChange={handleOfflineInputChange}
                      placeholder="জেলা"
                      className="w-full px-2.5 py-1.5 bg-surface border border-line-soft rounded text-ink-strong text-[13px]"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 3: EXAM ROLL & CENTER ASSIGNMENT */}
              <div className="space-y-2.5 p-3 bg-primary-900/20 rounded-lg border border-primary/30">
                <span className="text-[13px] font-bold text-secondary uppercase tracking-wider block">
                  ৩. অফিস কর্তৃক রোল ও কেন্দ্র বরাদ্দ (Exam Roll & Center)
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div className="min-w-0">
                    <label title="পরেও এডিট করা যাবে" className="block text-[13px] font-bold text-ink-body mb-0.5">
                      🔢 পরীক্ষার রোল (Exam Roll)
                    </label>
                    <input
                      type="text"
                      name="assignedRoll"
                      value={offlineForm.assignedRoll}
                      onChange={handleOfflineInputChange}
                      placeholder="যেমন: ১০৫০২"
                      className="w-full px-3 py-1.5 bg-surface-lowest border border-primary/60 rounded text-primary-300 font-mono font-semibold text-sm focus:outline-none focus:border-primary/40"
                    />
                  </div>

                  <div className="min-w-0 lg:col-span-2">
                    <label className="block text-[13px] font-bold text-ink-body mb-0.5">
                      🏫 পরীক্ষা কেন্দ্রের নাম (Exam Center)
                    </label>
                    <input
                      type="text"
                      name="examCenter"
                      value={offlineForm.examCenter}
                      onChange={handleOfflineInputChange}
                      placeholder="সিলেট সরকারি আলিয়া মাদরাসা কেন্দ্র, সিলেট"
                      className="w-full px-3 py-1.5 bg-surface-lowest border border-line-soft rounded text-ink-strong text-[13px] focus:outline-none focus:border-primary/40 font-medium"
                    />
                  </div>

                  <div className="min-w-0">
                    <label className="block text-[13px] font-bold text-ink-body mb-0.5">
                      স্ট্যাটাস
                    </label>
                    <select
                      name="status"
                      value={offlineForm.status}
                      onChange={handleOfflineInputChange}
                      className="w-full px-3 py-1.5 bg-surface-lowest border border-line-soft rounded text-primary text-[13px] font-bold"
                    >
                      <option value="approved">✓ অনুমোদিত (Approved)</option>
                      <option value="pending">⏳ অপেক্ষমাণ (Pending)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
                  <div className="min-w-0 lg:col-span-2">
                    <label className="block text-[13px] font-bold text-ink-body mb-0.5">
                      📅 পরীক্ষার তারিখ ও সময়
                    </label>
                    <input
                      type="text"
                      name="examDate"
                      value={offlineForm.examDate}
                      onChange={handleOfflineInputChange}
                      placeholder="২৪ অক্টোবর ২০২৫ (শুক্রবার)"
                      className="w-full px-3 py-1.5 bg-surface-lowest border border-line-soft rounded text-ink-strong text-[13px]"
                    />
                  </div>

                  {/* Optional Photo Attachment */}
                  <div className="min-w-0 lg:col-span-2">
                    <label className="block text-[13px] font-bold text-ink-body mb-0.5">
                      পাসপোর্ট সাইজ ছবি আপলোড (ঐচ্ছিক)
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleOfflinePhotoSelect}
                        className="flex-1 min-w-0 text-[13px] text-ink-muted file:mr-2 file:py-1 file:px-3 file:rounded file:border-0 file:text-[13px] file:font-bold file:bg-primary-container file:text-ink-strong hover:file:bg-primary-container cursor-pointer"
                      />
                      {offlinePhotoPreview && (
                        <img
                          src={offlinePhotoPreview}
                          alt="Preview"
                          className="w-10 h-12 shrink-0 rounded object-cover border border-primary/40"
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 4: REGISTRATION FEE COLLECTION */}
              <div className="space-y-2.5 p-3 bg-surface-lowest/80 rounded-lg border border-secondary/30">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-[13px] font-bold text-secondary uppercase tracking-wider">
                    ৪. রেজিস্ট্রেশন ফি আদায়
                  </span>
                  <span className="text-[12px] text-ink-muted">
                    এই তথ্য ড্যাশবোর্ডের “ফি আদায়ের হিসাব”-এ যোগ হবে
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
                  <div className="min-w-0">
                    <label className="block text-[13px] font-bold text-ink-body mb-0.5 truncate">
                      💰 কীভাবে দিয়েছে
                    </label>
                    <select
                      name="paymentMethod"
                      value={offlineForm.paymentMethod}
                      onChange={handleOfflineInputChange}
                      className="w-full px-3 py-1.5 bg-surface border border-line-soft rounded text-ink-strong text-[13px] focus:outline-none focus:border-primary/40 font-medium"
                    >
                      {PAYMENT_METHODS.map((pm) => (
                        <option key={pm.value} value={pm.value}>
                          {pm.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="min-w-0">
                    <label className="block text-[13px] font-bold text-ink-body mb-0.5 truncate">
                      ফি-এর পরিমাণ
                    </label>
                    <input
                      type="text"
                      name="feeAmount"
                      value={offlineForm.feeAmount}
                      onChange={handleOfflineInputChange}
                      placeholder="২০০ টাকা"
                      className="w-full px-3 py-1.5 bg-surface border border-line-soft rounded text-ink-strong text-[13px] focus:outline-none focus:border-primary/40"
                    />
                  </div>

                  <div className="min-w-0">
                    <label className="block text-[13px] font-bold text-ink-body mb-0.5 truncate">
                      🧑 কার কাছে জমা
                    </label>
                    <input
                      type="text"
                      name="collectedBy"
                      value={offlineForm.collectedBy}
                      onChange={handleOfflineInputChange}
                      placeholder="যিনি টাকা নিয়েছেন তাঁর নাম"
                      className="w-full px-3 py-1.5 bg-surface border border-line-soft rounded text-ink-strong text-[13px] focus:outline-none focus:border-primary/40"
                    />
                  </div>

                  <div className="min-w-0">
                    <label className="block text-[13px] font-bold text-ink-body mb-0.5 truncate">
                      🧾 রশিদ নম্বর
                    </label>
                    <input
                      type="text"
                      name="receiptNo"
                      value={offlineForm.receiptNo}
                      onChange={handleOfflineInputChange}
                      placeholder="যেমন: ১০২৪"
                      className="w-full px-3 py-1.5 bg-surface border border-line-soft rounded text-ink-strong text-[13px] font-mono focus:outline-none focus:border-primary/40"
                    />
                  </div>

                  {/* Mobile-banking fields sit in the same row rather than a
                      block of their own: a second grid added a row to the
                      section whenever a non-cash method was picked, which is
                      what pushed the form into a scroll. */}
                  {isOfflinePaymentOnline && (
                    <>
                      <div className="min-w-0">
                        <label className="block text-[13px] font-bold text-ink-body mb-0.5 truncate">
                      প্রেরকের নম্বর
                        </label>
                        <input
                          type="tel"
                          name="senderNumber"
                          value={offlineForm.senderNumber}
                          onChange={handleOfflineInputChange}
                          placeholder="017XXXXXXXX"
                          className="w-full px-3 py-1.5 bg-surface border border-line-soft rounded text-ink-strong text-[13px] font-mono focus:outline-none focus:border-primary/40"
                        />
                      </div>

                      <div className="min-w-0">
                        <label className="block text-[13px] font-bold text-ink-body mb-0.5 truncate">
                      TrxID <span className="text-tertiary">*</span>
                        </label>
                        <input
                          type="text"
                          name="trxId"
                          value={offlineForm.trxId}
                          onChange={handleOfflineInputChange}
                          placeholder="8F3KD92LA"
                          required
                          className="w-full px-3 py-1.5 bg-surface border border-line-soft rounded text-ink-strong text-[13px] font-mono uppercase focus:outline-none focus:border-primary/40"
                        />
                      </div>
                    </>
                  )}
                </div>

                {/* Mobile-banking rows only matter when the money did not come in
                    as cash. Asking for a TrxID on a cash entry would just train
                    people to type junk into a field the fee report checks. */}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-line-soft">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 bg-surface-card hover:bg-surface-overlay text-ink-body text-[13px] rounded cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={addingSubmitting}
                  className="px-6 py-2.5 bg-gradient-to-r from-primary-container to-tertiary-container hover:from-primary-container hover:to-tertiary-container text-ink-strong font-semibold rounded text-[13px] transition cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                >
                  {addingSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>সংরক্ষণ হচ্ছে...</span>
                    </>
                  ) : (
                    <>
                      <HiCheck className="text-base" />
                      <span>সংরক্ষণ ও প্রবেশপত্র সক্রিয় করুন</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================================
          MODAL 2: ADMIN EDIT / ROLL ASSIGNMENT MODAL (Existing Records)
          =================================================================== */}
      {selectedStudent && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center p-2 sm:p-3 bg-surface-lowest/80 backdrop-blur-md animate-fadeIn"
          onClick={() => setSelectedStudent(null)}
        >
          <div
            className="relative w-full max-w-2xl bg-surface border border-line-soft rounded-lg p-5 sm:p-7 shadow-overlay space-y-5 max-h-[90vh] overflow-y-auto scrollbar-none overlay-enter"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-line-soft pb-3">
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-ink-strong">
                  আবেদন পর্যালোচনা ও রোল অ্যাসাইনমেন্ট
                </h3>
                <span className="text-[13px] text-primary font-mono">
                  ট্র্যাকিং আইডি: {selectedStudent.trackingId}
                </span>
              </div>
              <button
                onClick={() => setSelectedStudent(null)}
                className="w-8 h-8 rounded-full bg-surface-card hover:bg-surface-overlay text-ink-body flex items-center justify-center transition cursor-pointer"
              >
                <HiXMark className="text-lg" />
              </button>
            </div>

            {/* Student Full Info Card */}
            <div className="p-4 bg-surface-lowest rounded-lg border border-line-soft flex flex-col sm:flex-row items-start gap-4 text-[13px]">
              {selectedStudent.photoUrl ? (
                <img
                  src={selectedStudent.photoUrl}
                  alt=""
                  className="w-20 h-24 rounded object-cover border border-line-soft flex-shrink-0"
                />
              ) : (
                <div className="w-20 h-24 rounded bg-surface-card border border-line-soft flex items-center justify-center text-ink-muted text-2xl flex-shrink-0">
                  👨‍🎓
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-ink-body w-full">
                <p>
                  <strong className="text-ink-strong">নাম (বাংলা):</strong> {selectedStudent.nameBn}
                </p>
                <p>
                  <strong className="text-ink-strong">নাম (En):</strong> {selectedStudent.nameEn || "—"}
                </p>
                <p>
                  <strong className="text-ink-strong">লিঙ্গ:</strong> {selectedStudent.gender || "ছাত্র"}
                </p>
                <p>
                  <strong className="text-ink-strong">জন্ম তারিখ:</strong> {selectedStudent.dateOfBirth || "—"}
                </p>
                <p>
                  <strong className="text-ink-strong">পিতা:</strong> {selectedStudent.fatherName}
                </p>
                <p>
                  <strong className="text-ink-strong">মাতা:</strong> {selectedStudent.motherName || "—"}
                </p>
                <p>
                  <strong className="text-ink-strong">শ্রেণি ও শাখা:</strong> {selectedStudent.studentClass} ({selectedStudent.section || "ক"}) • রোল: {selectedStudent.classRoll || "—"}
                </p>
                <p>
                  <strong className="text-ink-strong">প্রতিষ্ঠান:</strong> {selectedStudent.institution}
                </p>
                <p>
                  <strong className="text-ink-strong">মোবাইল:</strong> {selectedStudent.mobile || selectedStudent.guardianPhone}
                </p>
                <p>
                  <strong className="text-ink-strong">WhatsApp:</strong>{" "}
                  <span className="text-primary font-mono font-bold">
                    {selectedStudent.whatsappNumber || selectedStudent.mobile}
                  </span>
                </p>
                <p className="sm:col-span-2">
                  <strong className="text-ink-strong">ঠিকানা:</strong> {[selectedStudent.village, selectedStudent.postOffice, selectedStudent.union, selectedStudent.thana, selectedStudent.district].filter(Boolean).join(", ") || "—"}
                </p>
                <p className="sm:col-span-2 text-secondary pt-1 border-t border-line-soft">
                  <strong>পেমেন্ট:</strong> {selectedStudent.paymentMethod} | প্রেরক: {selectedStudent.senderNumber || "—"} | TrxID: {selectedStudent.trxId || "—"}
                </p>
              </div>
            </div>

            {/* Admin Edit Form */}
            <form onSubmit={handleSaveStatus} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[13px] font-bold text-ink-body mb-1">
                    আবেদনের স্ট্যাটাস নির্ধারণ <span className="text-tertiary">*</span>
                  </label>
                  <select
                    value={assignData.status}
                    onChange={(e) =>
                      setAssignData((prev) => ({ ...prev, status: e.target.value }))
                    }
                    className="w-full px-3 py-2.5 bg-surface-lowest border border-line-soft rounded text-ink-strong text-[13px] font-bold focus:outline-none focus:border-primary/40"
                  >
                    <option value="approved">✓ অনুমোদন করুন (Approved)</option>
                    <option value="pending">⏳ অপেক্ষমান রাখুন (Pending)</option>
                    <option value="rejected">✕ বাতিল করুন (Rejected)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[13px] font-bold text-ink-body mb-1">
                    🔢 পরীক্ষার রোল নম্বর বরাদ্দ করুন (Roll Number)
                  </label>
                  <input
                    type="text"
                    value={assignData.assignedRoll}
                    onChange={(e) =>
                      setAssignData((prev) => ({ ...prev, assignedRoll: e.target.value }))
                    }
                    placeholder="যেমন: ১০৫০১"
                    className="w-full px-3 py-2.5 bg-surface-lowest border border-primary/50 rounded text-primary text-[13px] font-mono font-bold focus:outline-none focus:border-primary/40"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[13px] font-bold text-ink-body mb-1">
                  🏫 পরীক্ষা কেন্দ্রের নাম (Exam Center)
                </label>
                <input
                  type="text"
                  value={assignData.examCenter}
                  onChange={(e) =>
                    setAssignData((prev) => ({ ...prev, examCenter: e.target.value }))
                  }
                  placeholder="যেমন: সিলেট সরকারি আলিয়া মাদরাসা কেন্দ্র, সিলেট"
                  className="w-full px-3 py-2.5 bg-surface-lowest border border-line-soft rounded text-ink-strong text-[13px] focus:outline-none focus:border-primary/40 font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div className="sm:col-span-2">
                  <label className="block text-[13px] font-bold text-ink-body mb-1">
                    📅 পরীক্ষার তারিখ ও সময়
                  </label>
                  <input
                    type="text"
                    value={assignData.examDate}
                    onChange={(e) =>
                      setAssignData((prev) => ({ ...prev, examDate: e.target.value }))
                    }
                    placeholder="২৪ অক্টোবর ২০২৫ (শুক্রবার) | সকাল ১০:০০ টা"
                    className="w-full px-3 py-2.5 bg-surface-lowest border border-line-soft rounded text-ink-strong text-[13px] focus:outline-none focus:border-primary/40 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[13px] font-bold text-ink-body mb-1">
                    🏢 রুম / সিট নম্বর
                  </label>
                  <input
                    type="text"
                    value={assignData.roomNo}
                    onChange={(e) =>
                      setAssignData((prev) => ({ ...prev, roomNo: e.target.value }))
                    }
                    placeholder="রুম-২০৪"
                    className="w-full px-3 py-2.5 bg-surface-lowest border border-line-soft rounded text-ink-strong text-[13px] focus:outline-none focus:border-primary/40"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[13px] font-bold text-ink-body mb-1">
                  📝 অ্যাডমিন নোট / মন্তব্য
                </label>
                <input
                  type="text"
                  value={assignData.adminNote}
                  onChange={(e) =>
                    setAssignData((prev) => ({ ...prev, adminNote: e.target.value }))
                  }
                  placeholder="যেমন: ফি যাচাইকৃত ও প্রবেশপত্র প্রস্তুত"
                  className="w-full px-3 py-2.5 bg-surface-lowest border border-line-soft rounded text-ink-strong text-[13px] focus:outline-none focus:border-primary/40"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 pt-4 border-t border-line-soft">
                {/* 1-Click WhatsApp Dispatch Button */}
                <button
                  type="button"
                  onClick={() =>
                    handleSendWhatsAppNotification(
                      selectedStudent,
                      assignData.assignedRoll,
                      assignData.examCenter,
                      assignData.examDate,
                      assignData.examTime
                    )
                  }
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded bg-primary-container hover:bg-primary-container text-ink-strong font-bold text-[13px] transition cursor-pointer"
                >
                  <FaWhatsapp className="text-base" />
                  <span>📲 WhatsApp-এ প্রবেশপত্র নোটিফিকেশন পাঠান</span>
                </button>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <button
                    type="button"
                    onClick={() => setSelectedStudent(null)}
                    className="px-4 py-2.5 bg-surface-card hover:bg-surface-overlay text-ink-body text-[13px] rounded cursor-pointer"
                  >
                    বন্ধ করুন
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-gradient-to-r from-primary-container to-tertiary-container hover:from-primary-container hover:to-tertiary-container text-ink-strong font-bold rounded text-[13px] transition cursor-pointer"
                  >
                    সংরক্ষণ ও অনুমোদন
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {confirmUI}
    </div>
  );
};

export default RegistrationManager;
