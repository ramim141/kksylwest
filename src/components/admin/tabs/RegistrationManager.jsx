import React, { useState, useEffect, useMemo, useCallback } from "react";
import { createPortal } from "react-dom";
import {
  HiTrash,
  HiPencilSquare,
  HiXMark,
  HiAcademicCap,
  HiMagnifyingGlass,
  HiArrowDownTray,
  HiCheck,
  HiHashtag,
  HiShieldCheck,
  HiBuildingLibrary,
  HiCalendarDays,
  HiMapPin,
  HiChatBubbleBottomCenterText,
} from "react-icons/hi2";
import { FaWhatsapp, FaUserPlus } from "react-icons/fa";
import {
  getRegistrations,
  addRegistration,
  updateRegistrationStatus,
  deleteRegistration,
  bulkAssignRolls,
  getExamCenters,
  markRegistrationNotified,
} from "../../../services/firestore";
import { uploadToImgBB } from "../../../services/imgbb";
import {
  NOTICE_FIELDS,
  NOTICE_LABELS,
  NOTICE_STAGES,
  buildNoticeText,
  dueStages,
  noticeStateOf,
  openWhatsApp,
  whatsappNumberOf,
} from "../../../utils/whatsappNotify";
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

export const isFemale = (gender) => {
  const g = String(gender || "").trim().toLowerCase();
  return (
    g.includes("ছাত্রী") ||
    g.includes("female") ||
    g.includes("girl") ||
    g.includes("নারী") ||
    g.includes("মহিলা")
  );
};

/* Class and Gender wise roll start blocks:
   4th: Male 40101, Female 41101
   5th: Male 50101, Female 51101
   6th: Male 60101, Female 61101
   7th: Male 70101, Female 71101
   8th: Male 80101, Female 81101
   9th: Male 90101, Female 91101
   10th: Male 10101, Female 11101 */
const CLASS_GENDER_ROLL_START = {
  [CLASSES[0]]: { male: 40101, female: 41101 },
  [CLASSES[1]]: { male: 50101, female: 51101 },
  [CLASSES[2]]: { male: 60101, female: 61101 },
  [CLASSES[3]]: { male: 70101, female: 71101 },
  [CLASSES[4]]: { male: 80101, female: 81101 },
  [CLASSES[5]]: { male: 90101, female: 91101 },
  [CLASSES[6]]: { male: 10101, female: 11101 },
};

const getStartRoll = (studentClass, gender) => {
  const classObj = CLASS_GENDER_ROLL_START[studentClass];
  if (!classObj) return null;
  return isFemale(gender) ? classObj.female : classObj.male;
};

/* Rolls are stored in ASCII digits: the admit-card link and searchAdmitCard
   both compare them raw, so a Bengali-digit roll would never match. */
const toAsciiDigits = (value) =>
  String(value ?? "").replace(/[\u09e6-\u09ef]/g, (d) =>
    String(d.charCodeAt(0) - 0x09e6)
  );

const rollNumberOf = (value) => {
  const digits = toAsciiDigits(value).replace(/[^0-9]/g, "");
  return digits ? parseInt(digits, 10) : NaN;
};

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
  "দক্ষিন সুরমা উপজেলা",
  "ফেঞ্চুগঞ্জ উপজেলা",
  "বিশ্বনাথ উপজেলা",
  "ওসমানীনগর উপজেলা",
  "সদর উপজেলা",
  "বালাগঞ্জ উপজেলা",
  "কোম্পানিগঞ্জ উপজেলা",
];

const THANAS = [
  "ফতেহপুর কামিল মাদ্রাসা",
  "সদর উপজেলা পূর্ব",
  "সদর উপজেলা উত্তর",
  "সদর উপজেলা দক্ষিন",
  "ফেঞ্চুগঞ্জ উপজেলা",
  "ফেঞ্চুগঞ্জ সরকারি কলেজ",
  "মোগলাবাজার থানা পূর্ব",
  "মোগলাবাজার থানা পশ্চিম",
  "কোম্পানিগঞ্জ উপজেলা",
  "বিশ্বনাথ পৌরসভা",
  "বিশ্বনাথ উপজেলা উত্তর",
  "বিশ্বনাথ উপজেলা পশ্চিম",
  "দক্ষিন সুরমা থানা",
  "ওসমানীনগর উপজেলা",
  "তাজপুর ডিগ্রি কলেজ",
  "বালাগঞ্জ উপজেলা উত্তর",
  "বালাগঞ্জ উপজেলা দক্ষিন",
];

/* One tap = one stage of the two-stage WhatsApp notice (stage 1 = tracking
   number on approval, stage 2 = roll & centre). An already-sent stage stays
   clickable so a lost message can be resent, but it reads as done. */
const NoticeButton = ({ badge, title, sent, disabled, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    title={title}
    className={`relative w-10 h-10 inline-flex items-center justify-center shrink-0 rounded border transition ${
      disabled
        ? "bg-surface-overlay/30 text-ink-muted border-line-soft cursor-not-allowed"
        : sent
        ? "bg-primary-500/25 text-primary-300 border-primary-500/40 hover:bg-primary-500/40 cursor-pointer"
        : "bg-secondary/15 text-secondary border-secondary/30 hover:bg-secondary/30 cursor-pointer"
    }`}
  >
    <FaWhatsapp className="text-sm" />
    <span
      className={`absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full text-[10px] font-bold
        flex items-center justify-center border ${
          sent
            ? "bg-primary text-primary-on border-primary"
            : "bg-surface-card text-ink-muted border-line-soft"
        }`}
    >
      {sent ? "✓" : badge}
    </span>
  </button>
);

/* Both stages side by side, in order. Reads the record itself, so a row and
   the modal can never disagree about what has already gone out. */
const NoticeButtons = ({ student, onSend }) => {
  const notice = noticeStateOf(student);
  const approvalBlocked = student.status !== "approved";

  return (
    <>
      <NoticeButton
        badge="১"
        sent={notice.approvalSent}
        disabled={approvalBlocked}
        title={
          approvalBlocked
            ? "আবেদন অনুমোদনের পরেই ট্র্যাকিং নোটিশ পাঠানো যাবে"
            : notice.approvalSent
            ? "১ম নোটিশ (ট্র্যাকিং নম্বর) পাঠানো হয়েছে — আবার পাঠাতে ক্লিক করুন"
            : "১ম নোটিশ: ট্র্যাকিং নম্বর WhatsApp-এ পাঠান"
        }
        onClick={() => onSend(student, NOTICE_STAGES.APPROVAL)}
      />
      <NoticeButton
        badge="২"
        sent={notice.rollSent}
        disabled={!notice.rollReady}
        title={
          !notice.rollReady
            ? "রোল ও কেন্দ্র দুটোই নির্ধারিত হলে ২য় নোটিশ পাঠানো যাবে"
            : notice.rollSent
            ? "২য় নোটিশ (রোল ও কেন্দ্র) পাঠানো হয়েছে — আবার পাঠাতে ক্লিক করুন"
            : "২য় নোটিশ: রোল, কেন্দ্র ও প্রবেশপত্রের লিংক পাঠান"
        }
        onClick={() => onSend(student, NOTICE_STAGES.ROLL)}
      />
    </>
  );
};

const isOfflineRegistration = (r) => {
  if (!r) return false;
  return (
    r.registrationType === "offline" ||
    r.isOffline === true ||
    String(r.adminNote || "").includes("অফলাইন")
  );
};

const RegistrationManager = ({ mode = "all" }) => {
  const [registrations, setRegistrations] = useState([]);
  const [confirm, confirmUI] = useConfirm();
  const [loading, setLoading] = useState(true);
  const [originFilter, setOriginFilter] = useState(mode);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClass, setSelectedClass] = useState("all");
  const [selectedUpazila, setSelectedUpazila] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [displayCount, setDisplayCount] = useState(20);
  const [selectedStudent, setSelectedStudent] = useState(null); // Edit Modal view
  const [statusMessage, setStatusMessage] = useState(null);
  const [bulkAssigning, setBulkAssigning] = useState(false);
  const [examCenters, setExamCenters] = useState([]);

  useEffect(() => {
    setOriginFilter(mode);
  }, [mode]);

  // Reset pagination when search or filters change
  useEffect(() => {
    setDisplayCount(20);
  }, [searchQuery, selectedClass, selectedUpazila, selectedStatus, originFilter]);

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
    section: "",
    classRoll: "",
    upazila: "দক্ষিন সুরমা উপজেলা",

    // Address
    village: "",
    postOffice: "",
    union: "",
    thana: "ফতেহপুর কামিল মাদ্রাসা",
    district: "সিলেট",
    presentAddress: "",

    // Admin Assigments
    assignedRoll: "",
    examCenter: "সিলেট সরকারি আলিয়া মাদরাসা কেন্দ্র, সিলেট",
    examDate: "২৪ অক্টোবর ২০২৫ (শুক্রবার)",
    examTime: "সকাল ১০:০০ টা - ১১:০০ টা",
    roomNo: "",
    status: "approved", // Approved immediately for offline forms

    /* Offline forms are paid in cash at the desk, so the fee is recorded as
       such without asking. "Cash/School" is stored verbatim because the public
       form and every existing record use that exact string — changing it would
       split one bucket into two in the dashboard fee report. */
    paymentMethod: "Cash/School",
    feeAmount: "১৫০ টাকা",

    adminNote: "অফলাইন ফরম পূরণকৃত ও অনুমোদিত",
  });

  // Edit / Roll assignment state for existing records
  const [assignData, setAssignData] = useState({
    status: "approved",
    adminNote: "",
    assignedRoll: "",
    examCenter: "",
    examDate: "২৪ অক্টোবর ২০২৫ (শুক্রবার)",
    examTime: "সকাল ১০:০০ টা - ১১:০০ টা",
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

  const refreshCenters = useCallback(() => {
    getExamCenters()
      .then((list) => setExamCenters(list || []))
      .catch((err) => console.warn("Exam centre list unavailable:", err));
  }, []);

  useEffect(() => {
    loadData();
    refreshCenters();
    window.addEventListener("kk_exam_centers_updated", refreshCenters);
    return () => {
      window.removeEventListener("kk_exam_centers_updated", refreshCenters);
    };
  }, [refreshCenters]);

  // Overall counts
  const totalOnlineCount = useMemo(
    () => registrations.filter((r) => !isOfflineRegistration(r)).length,
    [registrations]
  );
  const totalOfflineCount = useMemo(
    () => registrations.filter((r) => isOfflineRegistration(r)).length,
    [registrations]
  );

  // Filtered registrations scoped by origin + search + filters
  const filteredList = useMemo(() => {
    return registrations.filter((r) => {
      const isOff = isOfflineRegistration(r);
      if (originFilter === "online" && isOff) return false;
      if (originFilter === "offline" && !isOff) return false;

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
      /* The status select doubles as a notice queue: a "notice:*" value asks
         who is still owed which of the two WhatsApp messages. */
      const matchStatus = selectedStatus.startsWith("notice:")
        ? dueStages(r).includes(selectedStatus.slice("notice:".length))
        : selectedStatus === "all" || r.status === selectedStatus;

      return matchSearch && matchClass && matchUpazila && matchStatus;
    });
  }, [registrations, originFilter, searchQuery, selectedClass, selectedUpazila, selectedStatus]);

  // Paginated list for table display (20 items at a time)
  const visibleList = useMemo(
    () => filteredList.slice(0, displayCount),
    [filteredList, displayCount]
  );

  // Statistics scoped to current origin selection
  const scopedList = useMemo(() => {
    if (originFilter === "online") return registrations.filter((r) => !isOfflineRegistration(r));
    if (originFilter === "offline") return registrations.filter((r) => isOfflineRegistration(r));
    return registrations;
  }, [registrations, originFilter]);

  const stats = useMemo(() => {
    const total = scopedList.length;
    const pending = scopedList.filter((r) => r.status === "pending").length;
    const approved = scopedList.filter((r) => r.status === "approved").length;
    const rejected = scopedList.filter((r) => r.status === "rejected").length;
    const withRoll = scopedList.filter((r) => Boolean(String(r.assignedRoll || "").trim())).length;
    const withoutRoll = Math.max(0, approved - withRoll);
    return { total, pending, approved, rejected, withRoll, withoutRoll };
  }, [scopedList]);

  /* How many applicants are still owed each notice — shown on the filter so
     nobody is left waiting on a message the admin forgot to send. */
  const noticeCounts = useMemo(() => {
    let approval = 0;
    let roll = 0;
    let blocked = 0;
    scopedList.forEach((r) => {
      const stages = dueStages(r);
      if (stages.includes(NOTICE_STAGES.APPROVAL)) approval += 1;
      if (stages.includes(NOTICE_STAGES.ROLL)) roll += 1;
      if (noticeStateOf(r).rollBlocked) blocked += 1;
    });
    return { approval, roll, blocked };
  }, [scopedList]);

  /* Next free roll inside a class and gender block. */
  const nextRollFor = useCallback(
    (studentClass, gender = "ছাত্র") => {
      const start = getStartRoll(studentClass, gender);
      if (!start) return "";
      const female = isFemale(gender);
      const blockEnd = start + 898; // e.g. 40101 to 40999 (male) or 41101 to 41999 (female)
      const used = registrations
        .filter((r) => r.studentClass === studentClass && isFemale(r.gender) === female)
        .map((r) => rollNumberOf(r.assignedRoll))
        .filter((n) => Number.isFinite(n) && n >= start && n <= blockEnd);
      return String(used.length ? Math.max(...used) + 1 : start);
    },
    [registrations]
  );

  /* Who a one-click run would touch: everyone in the current filter still
     without a roll, oldest application first. Rejected ones are skipped -- a
     roll on its own is enough to publish an admit card (searchAdmitCard). */
  const bulkTargets = useMemo(
    () =>
      filteredList
        .filter((r) => !String(r.assignedRoll || "").trim() && r.status !== "rejected")
        .sort(
          (a, b) =>
            (a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0) ||
            String(a.trackingId || "").localeCompare(String(b.trackingId || ""))
        ),
    [filteredList]
  );

  /* Active centres, plus whatever the record already carries: a centre that
     was later closed (or typed by hand before this list existed) must still
     show as the current value instead of silently switching to another. */
  const centerOptions = useCallback(
    (current) => {
      const names = examCenters
        .filter((c) => c.isActive !== false)
        .map((c) => c.name)
        .filter(Boolean);
      const value = (current || "").trim();
      if (value && !names.includes(value)) return [value, ...names];
      return names;
    },
    [examCenters]
  );

  const handleBulkAssignRolls = async () => {
    if (bulkTargets.length === 0) {
      setStatusMessage({
        type: "error",
        text: "এই ফিল্টারে রোল বরাদ্দের অপেক্ষায় থাকা কোনো শিক্ষার্থী নেই।",
      });
      return;
    }

    const assignments = [];
    const summaryLines = [];

    // Process classes: either all or selected class
    const targetClasses = selectedClass === "all" ? CLASSES : [selectedClass];

    for (const cls of targetClasses) {
      const classTargets = bulkTargets.filter((st) => st.studentClass === cls);
      if (!classTargets.length) continue;

      const males = classTargets.filter((st) => !isFemale(st.gender));
      const females = classTargets.filter((st) => isFemale(st.gender));

      if (males.length > 0) {
        const startM = Number(nextRollFor(cls, "ছাত্র"));
        males.forEach((st, idx) => {
          assignments.push({ id: st.id, assignedRoll: String(startM + idx) });
        });
        summaryLines.push(
          `${cls} (ছাত্র - ${males.length} জন): রোল ${startM} - ${startM + males.length - 1}`
        );
      }

      if (females.length > 0) {
        const startF = Number(nextRollFor(cls, "ছাত্রী"));
        females.forEach((st, idx) => {
          assignments.push({ id: st.id, assignedRoll: String(startF + idx) });
        });
        summaryLines.push(
          `${cls} (ছাত্রী - ${females.length} জন): রোল ${startF} - ${startF + females.length - 1}`
        );
      }
    }

    if (!assignments.length) {
      setStatusMessage({
        type: "error",
        text: "বরাদ্দ করার মতো কোনো রোল পাওয়া যায়নি।",
      });
      return;
    }

    const title =
      selectedClass === "all"
        ? `সকল শ্রেণি (${assignments.length} জন) — এক ক্লিকে জেন্ডারভিত্তিক রোল বরাদ্দ`
        : `${selectedClass} (${assignments.length} জন) — এক ক্লিকে জেন্ডারভিত্তিক রোল বরাদ্দ`;

    const ok = await confirm({
      tone: "primary",
      confirmLabel: "রোল বরাদ্দ করুন",
      title: title,
      body: `${assignments.length} জন শিক্ষার্থীকে শ্রেণি ও জেন্ডার (ছাত্র: ৪০১০১..., ছাত্রী: ৪১১০১...) অনুসারে নির্ধারিত ক্রমানুসারে রোল বরাদ্দ করা হবে। যাদের রোল ইতিমধ্যে বরাদ্দ আছে তারা অপরিবর্তিত থাকবে।`,
      detail: summaryLines.join("\n"),
    });
    if (!ok) return;

    setBulkAssigning(true);
    try {
      await bulkAssignRolls(assignments);

      const rollById = new Map(assignments.map((a) => [a.id, a.assignedRoll]));
      setRegistrations((prev) =>
        prev.map((r) =>
          rollById.has(r.id) ? { ...r, assignedRoll: rollById.get(r.id) } : r
        )
      );
      setStatusMessage({
        type: "success",
        text: `${assignments.length} জন শিক্ষার্থীর রোল জেন্ডার ও শ্রেণিমতো সফলভাবে বরাদ্দ হয়েছে!`,
      });
    } catch (err) {
      console.error(err);
      setStatusMessage({
        type: "error",
        text: "রোল বরাদ্দ করতে ব্যর্থ হয়েছে: " + err.message,
      });
    } finally {
      setBulkAssigning(false);
    }
  };

  const offlineWithRollCount = useMemo(
    () =>
      registrations.filter(
        (r) => isOfflineRegistration(r) && Boolean(String(r.assignedRoll || "").trim())
      ).length,
    [registrations]
  );

  const handleResetOfflineRolls = async () => {
    const targets = registrations.filter(
      (r) => isOfflineRegistration(r) && Boolean(String(r.assignedRoll || "").trim())
    );

    if (!targets.length) {
      setStatusMessage({
        type: "error",
        text: "রোল বরাদ্দ থাকা কোনো অফলাইন শিক্ষার্থী পাওয়া যায়নি।",
      });
      return;
    }

    const ok = await confirm({
      tone: "danger",
      confirmLabel: "হ্যাঁ, অফলাইন রোল রিসেট করুন",
      title: "অফলাইন রোল রিসেট",
      body: `মোট ${targets.length} জন অফলাইন শিক্ষার্থীর পূর্বের বরাদ্দকৃত রোল মুছে ফেলা হবে। রোল পরবর্তীতে সুবিধাজনক সময়ে আবার বরাদ্দ করা যাবে।`,
    });
    if (!ok) return;

    setBulkAssigning(true);
    try {
      const assignments = targets.map((st) => ({
        id: st.id,
        assignedRoll: "",
      }));
      await bulkAssignRolls(assignments);

      const targetIds = new Set(targets.map((t) => t.id));
      setRegistrations((prev) =>
        prev.map((r) => (targetIds.has(r.id) ? { ...r, assignedRoll: "" } : r))
      );

      setStatusMessage({
        type: "success",
        text: `${targets.length} জন অফলাইন শিক্ষার্থীর রোল সফলভাবে রিসেট করা হয়েছে!`,
      });
    } catch (err) {
      console.error(err);
      setStatusMessage({
        type: "error",
        text: "রোল রিসেট করতে ব্যর্থ হয়েছে: " + err.message,
      });
    } finally {
      setBulkAssigning(false);
    }
  };

  const defaultExamCenter = () =>
    examCenters.find((c) => c.isActive !== false)?.name || "";

  const handleOpenModal = (student) => {
    refreshCenters();
    setSelectedStudent(student);
    setAssignData({
      status: student.status || "approved",
      adminNote: student.adminNote || "",
      assignedRoll: student.assignedRoll || "",
      examCenter: student.examCenter || defaultExamCenter(),
      examDate: student.examDate || "২৪ অক্টোবর ২০২৫ (শুক্রবার)",
      examTime: student.examTime || "সকাল ১০:০০ টা - ১১:০০ টা",
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

      /* Both notices hang off this one save: approval settles stage 1, roll +
         centre settle stage 2. Offer the due one right here instead of
         leaving the admin to remember who is still owed a message. */
      const updated = { ...selectedStudent, ...assignData };
      const pending = dueStages(updated);
      if (pending.length) {
        const both = pending.length === 2;
        const stage = both ? NOTICE_STAGES.ROLL : pending[0];
        const ok = await confirm({
          tone: "primary",
          confirmLabel: "WhatsApp খুলুন",
          cancelLabel: "পরে পাঠাব",
          title: both
            ? "ট্র্যাকিং ও রোল — একসাথে জানাবেন?"
            : stage === NOTICE_STAGES.APPROVAL
            ? "অনুমোদনের নোটিশ পাঠাবেন?"
            : "রোল ও কেন্দ্রের নোটিশ পাঠাবেন?",
          body: both
            ? "অনুমোদন, রোল ও কেন্দ্র একসাথেই নির্ধারিত হয়েছে। রোলের বার্তাতেই ট্র্যাকিং আইডি থাকে, তাই পরপর দুটি বার্তার বদলে একটি পূর্ণ বার্তা পাঠানো হবে।"
            : stage === NOTICE_STAGES.APPROVAL
            ? "শিক্ষার্থীকে এখন শুধু ট্র্যাকিং নম্বরটি জানানো হবে। রোল ও কেন্দ্র নির্ধারিত হলে ২য় নোটিশটি আলাদাভাবে পাঠাতে হবে।"
            : "রোল নম্বর, পরীক্ষা কেন্দ্র, সময়সূচি ও প্রবেশপত্রের ডাউনলোড লিংক পাঠানো হবে।",
          detail: `${updated.nameBn || ""} — ${
            whatsappNumberOf(updated) || "WhatsApp নম্বর নেই"
          }`,
        });
        if (ok) {
          await sendNotice(updated, stage, both ? [NOTICE_STAGES.APPROVAL] : []);
        }
      }
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

  const openAddModal = () => {
    refreshCenters();
    setOfflineForm((prev) => ({
      ...prev,
      assignedRoll: "",
      /* Pick up the managed list rather than the name this form was seeded
         with, which may since have been renamed or closed. */
      examCenter: centerOptions(prev.examCenter).includes(prev.examCenter)
        ? prev.examCenter
        : defaultExamCenter(),
    }));
    setIsAddModalOpen(true);
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
        fatherName: offlineForm.fatherName?.trim() || "",
        motherName: offlineForm.motherName?.trim() || "",
        guardianName: offlineForm.guardianName?.trim() || offlineForm.fatherName?.trim() || "",
        guardianRelation: offlineForm.guardianRelation || "পিতা",
        dateOfBirth: offlineForm.dateOfBirth || "",
        religion: offlineForm.religion || "ইসলাম",
        mobile: offlineForm.mobile?.trim() || "",
        whatsappNumber: offlineForm.whatsappNumber?.trim() || offlineForm.mobile?.trim() || "",
        
        institution: offlineForm.institution?.trim() || "",
        studentClass: offlineForm.studentClass,
        section: offlineForm.section?.trim() || "",
        classRoll: offlineForm.classRoll?.trim() || "",
        upazila: offlineForm.upazila,

        village: offlineForm.village?.trim() || "",
        postOffice: offlineForm.postOffice?.trim() || "",
        union: offlineForm.union?.trim() || "",
        thana: offlineForm.thana?.trim() || "",
        district: offlineForm.district?.trim() || "",
        presentAddress: offlineForm.presentAddress?.trim() || "",

        photoUrl: finalPhotoUrl,
        paymentMethod: offlineForm.paymentMethod,
        feeAmount: offlineForm.feeAmount.trim(),
        status: offlineForm.status,
        assignedRoll: offlineForm.assignedRoll.trim(),
        examCenter: offlineForm.examCenter.trim(),
        examDate: offlineForm.examDate.trim(),
        examTime: offlineForm.examTime.trim(),
        roomNo: offlineForm.roomNo.trim(),
        adminNote: offlineForm.adminNote.trim() || "অফলাইন রেজিস্ট্রেশন",
        registrationType: "offline",
        isOffline: true,
      };

      const res = await addRegistration(payload);
      const newEntry = { ...payload, trackingId: res.trackingId, id: res.id };

      setRegistrations((prev) => [newEntry, ...prev]);
      setIsAddModalOpen(false);
      setStatusMessage({
        type: "success",
        text: `অফলাইন শিক্ষার্থী ${newEntry.nameBn}-এর রেজিস্ট্রেশন সফলভাবে সম্পন্ন হয়েছে!`,
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
        upazila: "দক্ষিন সুরমা উপজেলা",
        village: "",
        postOffice: "",
        union: "",
        thana: "ফতেহপুর কামিল মাদ্রাসা",
        district: "সিলেট",
        presentAddress: "",
        assignedRoll: "",
        examCenter: "সিলেট সরকারি আলিয়া মাদরাসা কেন্দ্র, সিলেট",
        examDate: "২৪ অক্টোবর ২০২৫ (শুক্রবার)",
        examTime: "সকাল ১০:০০ টা - ১১:০০ টা",
        roomNo: "",
        status: "approved",
        paymentMethod: "Cash/School",
        feeAmount: "১৫০ টাকা",
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

  /* Sends one stage of the two-stage notice and records the dispatch, so the
     list keeps showing who is still owed which message.
     `alsoStamp` covers the case where a single save settles both stages: the
     roll message already carries the tracking id, so the applicant is told
     everything once instead of getting two messages back to back. */
  const sendNotice = useCallback(async (student, stage, alsoStamp = []) => {
    const phone = whatsappNumberOf(student);
    if (!phone) {
      setStatusMessage({
        type: "error",
        text: `${student.nameBn || "শিক্ষার্থী"} — কোনো WhatsApp নম্বর নেই, বার্তা পাঠানো যাচ্ছে না।`,
      });
      return false;
    }
    if (stage === NOTICE_STAGES.ROLL && !noticeStateOf(student).rollReady) {
      setStatusMessage({
        type: "error",
        text: "রোল ও কেন্দ্র দুটোই নির্ধারিত না হলে দ্বিতীয় নোটিশ পাঠানো যাবে না।",
      });
      return false;
    }

    /* Open first: the popup rides on the admin's own click, and an await for
       Firestore in between is enough for a browser to block it. */
    if (!openWhatsApp(phone, buildNoticeText(stage, student))) {
      setStatusMessage({
        type: "error",
        text: "ব্রাউজার নতুন ট্যাব খুলতে দেয়নি — পপ-আপ অনুমতি দিয়ে আবার চেষ্টা করুন।",
      });
      return false;
    }

    const stamped = {};
    const now = new Date();
    [stage, ...alsoStamp].forEach((st) => {
      stamped[NOTICE_FIELDS[st]] = now;
    });

    setRegistrations((prev) =>
      prev.map((r) => (r.id === student.id ? { ...r, ...stamped } : r))
    );
    setSelectedStudent((prev) =>
      prev && prev.id === student.id ? { ...prev, ...stamped } : prev
    );

    try {
      for (const st of [stage, ...alsoStamp]) {
        await markRegistrationNotified(student.id, st);
      }
      setStatusMessage({
        type: "success",
        text: `${student.nameBn || "শিক্ষার্থী"} — ${NOTICE_LABELS[stage]} নোটিশ WhatsApp-এ খোলা হয়েছে।`,
      });
    } catch (err) {
      console.error(err);
      setStatusMessage({
        type: "error",
        text: "বার্তা খোলা হয়েছে, তবে 'পাঠানো হয়েছে' চিহ্নটি সংরক্ষণ করা যায়নি।",
      });
    }
    return true;
  }, []);

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
      {/* Top Action & Scope Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line-soft pb-3">
        {/* Origin Switcher Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-surface-card border border-line-soft rounded-xl">
          <button
            type="button"
            onClick={() => setOriginFilter("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              originFilter === "all"
                ? "bg-primary text-primary-on shadow-sm"
                : "text-ink-muted hover:text-ink-strong hover:bg-surface-overlay/30"
            }`}
          >
            জমাকৃত অনলাইন ও অফলাইন ফরম ({registrations.length})
          </button>
          <button
            type="button"
            onClick={() => setOriginFilter("online")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              originFilter === "online"
                ? "bg-primary text-primary-on shadow-sm"
                : "text-ink-muted hover:text-ink-strong hover:bg-surface-overlay/30"
            }`}
          >
            <span>জমাকৃত অনলাইন ফরম</span>
            <span className="px-1.5 py-0.2 text-[10px] rounded-full bg-white/20 font-mono">
              {totalOnlineCount}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setOriginFilter("offline")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              originFilter === "offline"
                ? "bg-primary text-primary-on shadow-sm"
                : "text-ink-muted hover:text-ink-strong hover:bg-surface-overlay/30"
            }`}
          >
            <span>জমাকৃত অফলাইন ফরম</span>
            <span className="px-1.5 py-0.2 text-[10px] rounded-full bg-white/20 font-mono">
              {totalOfflineCount}
            </span>
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {originFilter === "offline" && (
            <Button tone="primary" icon={FaUserPlus} onClick={openAddModal}>
              + নতুন অফলাইন এন্ট্রি
            </Button>
          )}

          {originFilter === "offline" && offlineWithRollCount > 0 && (
            <Button
              tone="danger"
              icon={HiTrash}
              loading={bulkAssigning}
              title="অফলাইন রেজিস্ট্রেশনের সকল রোল রিসেট করুন"
              onClick={handleResetOfflineRolls}
            >
              <span>অফলাইন রোল রিসেট ({offlineWithRollCount})</span>
            </Button>
          )}

          <Button
            tone="secondary"
            icon={HiHashtag}
            loading={bulkAssigning}
            disabled={bulkTargets.length === 0}
            title={
              selectedClass === "all"
                ? `সকল শ্রেণি: মোট ${bulkTargets.length} জনের জেন্ডারভিত্তিক রোল বরাদ্দ হবে`
                : `${selectedClass}: ${bulkTargets.length} জনের জেন্ডারভিত্তিক রোল বরাদ্দ হবে`
            }
            onClick={handleBulkAssignRolls}
          >
            <span>
              এক ক্লিকে রোল বরাদ্দ
              {bulkTargets.length > 0 ? ` (${bulkTargets.length})` : ""}
            </span>
          </Button>

          {originFilter !== "offline" && (
            <Button tone="primary" icon={FaUserPlus} onClick={openAddModal}>
              অফলাইন নতুন রেজিস্ট্রেশন
            </Button>
          )}

          <Button tone="neutral" icon={HiArrowDownTray} onClick={exportToCSV}>
            CSV এক্সপোর্ট
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 bg-surface-card border border-line-soft rounded-lg shadow-none">
          <span className="text-2xl font-semibold text-ink-strong block font-mono">
            {stats.total}
          </span>
          <span className="text-[13px] text-ink-muted font-medium">
            {originFilter === "offline" ? "মোট জমাকৃত অফলাইন ফরম" : originFilter === "online" ? "মোট জমাকৃত অনলাইন ফরম" : "মোট জমাকৃত ফরম"}
          </span>
        </div>
        <div className="p-4 bg-surface-card border border-secondary/30 rounded-lg shadow-none">
          <span className="text-2xl font-semibold text-secondary block font-mono">
            {originFilter === "offline" ? stats.withoutRoll : stats.pending}
          </span>
          <span className="text-[13px] text-ink-muted font-medium">
            {originFilter === "offline" ? "রোল বরাদ্দ বাকি" : "অপেক্ষমাণ (Pending)"}
          </span>
        </div>
        <div className="p-4 bg-surface-card border border-primary-500/30 rounded-lg shadow-none">
          <span className="text-2xl font-semibold text-primary-400 block font-mono">
            {originFilter === "offline" ? stats.withRoll : stats.approved}
          </span>
          <span className="text-[13px] text-ink-muted font-medium">
            {originFilter === "offline" ? "রোল বরাদ্দ সম্পন্ন" : "অনুমোদিত (Approved)"}
          </span>
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
            <optgroup label="WhatsApp নোটিশ বাকি">
              <option value="notice:approval">{`🔔 ১ম নোটিশ বাকি — ট্র্যাকিং (${noticeCounts.approval})`}</option>
              <option value="notice:roll">{`🔔 ২য় নোটিশ বাকি — রোল ও কেন্দ্র (${noticeCounts.roll})`}</option>
            </optgroup>
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

      {/* A roll with no centre blocks the second notice outright, and the
          filter above cannot show it — say so here. */}
      {noticeCounts.blocked > 0 && (
        <div className="px-4 py-3 rounded-lg bg-secondary/10 border border-secondary/30 text-[13px] text-ink-body">
          <span className="font-bold text-secondary">
            {noticeCounts.blocked} জন শিক্ষার্থীর রোল আছে, কিন্তু পরীক্ষা কেন্দ্র নির্ধারিত হয়নি।
          </span>{" "}
          কেন্দ্র না বসানো পর্যন্ত তাদের ২য় WhatsApp নোটিশ (রোল ও কেন্দ্র) পাঠানো যাবে না।
        </div>
      )}

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
              scopedList.length === 0
                ? originFilter === "offline"
                  ? "এখনো কোনো অফলাইন রেজিস্ট্রেশন এন্ট্রি দেওয়া হয়নি"
                  : "এখনো কোনো অনলাইন আবেদন জমা পড়েনি"
                : "এই ফিল্টারে কোনো আবেদন মেলেনি"
            }
            description={
              scopedList.length === 0
                ? originFilter === "offline"
                  ? "কাগজের ফরম হাতে থাকলে উপরের '+ নতুন অফলাইন এন্ট্রি' বাটন থেকে সরাসরি যুক্ত করুন।"
                  : "অনলাইন পোর্টাল থেকে আবেদন জমা হলে এখানে দেখা যাবে।"
                : `মোট ${scopedList.length} টি রেকর্ডের কোনোটিই বর্তমান ফিল্টারের সাথে মেলেনি।`
            }
            action={
              scopedList.length > 0 ? (
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
                <Button tone="primary" icon={FaUserPlus} onClick={openAddModal}>
                  + নতুন অফলাইন এন্ট্রি দিন
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
                  <th className="p-3.5 whitespace-nowrap">ট্র্যাকিং ও ছবি</th>
                  <th className="p-3.5 whitespace-nowrap">পরীক্ষার্থীর নাম</th>
                  <th className="p-3.5 whitespace-nowrap">শ্রেণি ও প্রতিষ্ঠান</th>
                  <th className="p-3.5 whitespace-nowrap">ধরন ও পেমেন্ট</th>
                  <th className="p-3.5 whitespace-nowrap">বরাদ্দ রোল ও কেন্দ্র</th>
                  <th className="p-3.5 whitespace-nowrap">স্ট্যাটাস</th>
                  <th className="p-3.5 text-right whitespace-nowrap">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line-soft text-ink-body">
                {visibleList.map((st) => {
                  const isOff = isOfflineRegistration(st);
                  return (
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
                      <div className="flex items-center gap-1.5 mb-1">
                        <span
                          className={`px-2 py-0.5 rounded-md text-[11px] font-bold border ${
                            isOff
                              ? "bg-sky-500/15 text-sky-400 border-sky-500/30"
                              : "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                          }`}
                        >
                          {isOff ? "অফলাইন" : "অনলাইন"}
                        </span>
                      </div>
                      <span className="font-mono text-[12px] text-ink-muted block">
                        {st.trxId ? `Trx: ${st.trxId}` : (st.paymentMethod || "নগদ")}
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

                    <td className="p-3.5 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold whitespace-nowrap shadow-sm ${
                          st.status === "approved"
                            ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                            : st.status === "rejected"
                            ? "bg-rose-500/15 text-rose-400 border border-rose-500/30"
                            : "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                            st.status === "approved"
                              ? "bg-emerald-400"
                              : st.status === "rejected"
                              ? "bg-rose-400"
                              : "bg-amber-400 animate-pulse"
                          }`}
                        />
                        <span>
                          {st.status === "approved"
                            ? "Approved"
                            : st.status === "rejected"
                            ? "Rejected"
                            : "Pending"}
                        </span>
                      </span>
                    </td>

                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Two-stage WhatsApp notice: ১ tracking, ২ roll & centre */}
                        <NoticeButtons student={st} onSend={sendNotice} />

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
                );
              })}
              </tbody>
            </table>

            {/* Load More Pagination Section */}
            {filteredList.length > displayCount && (
              <div className="p-4 border-t border-line-soft/80 flex flex-col sm:flex-row items-center justify-between gap-3 bg-surface-low/50">
                <span className="text-xs text-ink-muted">
                  দেখানো হচ্ছে: <strong className="text-primary font-mono">{visibleList.length}</strong> / <span className="font-mono">{filteredList.length}</span> জন শিক্ষার্থী
                </span>
                <Button
                  tone="secondary"
                  size="md"
                  onClick={() => setDisplayCount((prev) => prev + 20)}
                  className="w-full sm:w-auto"
                >
                  <span>আরও ২০ জন দেখুন (Load More)</span>
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ===================================================================
          MODAL 1: ADD NEW OFFLINE STUDENT REGISTRATION MODAL
          =================================================================== */}
      {isAddModalOpen && typeof document !== "undefined" && createPortal(
        <div
          className="fixed inset-0 z-[9999] overflow-y-auto bg-black/85 backdrop-blur-md p-3 sm:p-6 flex min-h-full items-center justify-center animate-fade-in"
          onClick={() => setIsAddModalOpen(false)}
        >
          <div
            className="relative w-full max-w-5xl bg-surface-card border border-line-soft/90 rounded-2xl p-5 sm:p-7 shadow-2xl space-y-4 my-auto overflow-hidden animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Luminous Top Accent Line */}
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-primary via-emerald-400 to-teal-400" />

            {/* Header */}
            <div className="flex items-center justify-between pb-3.5 border-b border-line-soft/80">
              <div className="space-y-0.5 min-w-0">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-primary/15 text-primary border border-primary/30 flex items-center justify-center shrink-0 text-sm shadow-sm">
                    <FaUserPlus />
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-ink-strong tracking-tight truncate">
                    অফলাইন কাগজের ফরম শিক্ষার্থী এন্ট্রি
                  </h3>
                </div>
                <p className="text-xs text-ink-muted">
                  অফলাইনে জমাকৃত কাগজের ফরম থেকে সরাসরি ডাটাবেজে এন্ট্রি করুন। রোল পরবর্তীতে বরাদ্দ করা হবে।
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="w-9 h-9 rounded-xl bg-surface-low hover:bg-surface-overlay text-ink-muted hover:text-ink-strong border border-line-soft/80 flex items-center justify-center transition-colors cursor-pointer shrink-0"
                title="বন্ধ করুন"
              >
                <HiXMark className="text-lg" />
              </button>
            </div>

            <form onSubmit={handleAddOfflineSubmit} className="space-y-4">
              
              {/* SECTION 1: PERSONAL DETAILS */}
              <div className="p-4 rounded-xl bg-surface-low border border-line-soft/80 space-y-3">
                <span className="text-xs font-bold text-primary uppercase tracking-wider block">
                  ১. পরীক্ষার্থীর ব্যক্তিগত তথ্য
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div className="min-w-0">
                    <label className="block text-xs font-bold text-ink-body mb-1">
                      পরীক্ষার্থীর নাম (বাংলায়) <span className="text-error">*</span>
                    </label>
                    <input
                      type="text"
                      name="nameBn"
                      value={offlineForm.nameBn}
                      onChange={handleOfflineInputChange}
                      placeholder="নাম বাংলায়"
                      required
                      className="w-full min-h-[40px] px-3 bg-surface-card border border-line-soft/80 rounded-lg text-ink-strong text-xs font-medium focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/25 transition-all"
                    />
                  </div>

                  <div className="min-w-0">
                    <label className="block text-xs font-bold text-ink-body mb-1">
                      Name (English - Capital)
                    </label>
                    <input
                      type="text"
                      name="nameEn"
                      value={offlineForm.nameEn}
                      onChange={handleOfflineInputChange}
                      placeholder="KAZI SHAFAYAT..."
                      className="w-full min-h-[40px] px-3 bg-surface-card border border-line-soft/80 rounded-lg text-ink-strong text-xs font-medium focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/25 transition-all uppercase"
                    />
                  </div>

                  <div className="min-w-0">
                    <label className="block text-xs font-bold text-ink-body mb-1">লিঙ্গ</label>
                    <select
                      name="gender"
                      value={offlineForm.gender}
                      onChange={handleOfflineInputChange}
                      className="w-full min-h-[40px] px-3 bg-surface-card border border-line-soft/80 rounded-lg text-ink-strong text-xs font-medium focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/25 cursor-pointer transition-all"
                    >
                      <option value="ছাত্র">👨‍🎓 ছাত্র</option>
                      <option value="ছাত্রী">👩‍🎓 ছাত্রী</option>
                    </select>
                  </div>

                  <div className="min-w-0">
                    <label className="block text-xs font-bold text-ink-body mb-1">ধর্ম</label>
                    <select
                      name="religion"
                      value={offlineForm.religion}
                      onChange={handleOfflineInputChange}
                      className="w-full min-h-[40px] px-3 bg-surface-card border border-line-soft/80 rounded-lg text-ink-strong text-xs font-medium focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/25 cursor-pointer transition-all"
                    >
                      {RELIGIONS.map((rel) => (
                        <option key={rel} value={rel}>
                          {rel}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="min-w-0">
                    <label className="block text-xs font-bold text-ink-body mb-1">মোবাইল নম্বর</label>
                    <input
                      type="tel"
                      name="mobile"
                      value={offlineForm.mobile}
                      onChange={handleOfflineInputChange}
                      placeholder="017XXXXXXXX"
                      className="w-full min-h-[40px] px-3 bg-surface-card border border-line-soft/80 rounded-lg text-ink-strong text-xs font-mono font-medium focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/25 transition-all"
                    />
                  </div>

                  <div className="min-w-0">
                    <label className="block text-xs font-bold text-ink-body mb-1 flex items-center gap-1">
                      <FaWhatsapp className="text-primary text-xs" />
                      <span>WhatsApp নম্বর</span>
                    </label>
                    <input
                      type="tel"
                      name="whatsappNumber"
                      value={offlineForm.whatsappNumber}
                      onChange={handleOfflineInputChange}
                      placeholder="017XXXXXXXX"
                      className="w-full min-h-[40px] px-3 bg-surface-card border border-line-soft/80 rounded-lg text-ink-strong text-xs font-mono font-medium focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/25 transition-all"
                    />
                  </div>

                  <div className="lg:col-span-2 min-w-0">
                    <label className="block text-xs font-bold text-ink-body mb-1">পিতার নাম</label>
                    <input
                      type="text"
                      name="fatherName"
                      value={offlineForm.fatherName}
                      onChange={handleOfflineInputChange}
                      placeholder="পিতার নাম"
                      className="w-full min-h-[40px] px-3 bg-surface-card border border-line-soft/80 rounded-lg text-ink-strong text-xs font-medium focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/25 transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 2: EDUCATION & ADDRESS */}
              <div className="p-4 rounded-xl bg-surface-low border border-line-soft/80 space-y-3">
                <span className="text-xs font-bold text-primary uppercase tracking-wider block">
                  ২. শিক্ষাগত ও ঠিকানার তথ্য
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div className="lg:col-span-3 min-w-0">
                    <label className="block text-xs font-bold text-ink-body mb-1">
                      শিক্ষা প্রতিষ্ঠানের নাম <span className="text-error">*</span>
                    </label>
                    <input
                      type="text"
                      name="institution"
                      value={offlineForm.institution}
                      onChange={handleOfflineInputChange}
                      placeholder="স্কুল / মাদ্রাসার নাম"
                      required
                      className="w-full min-h-[40px] px-3 bg-surface-card border border-line-soft/80 rounded-lg text-ink-strong text-xs font-medium focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/25 transition-all"
                    />
                  </div>

                  <div className="min-w-0">
                    <label className="block text-xs font-bold text-ink-body mb-1">
                      শ্রেণি
                    </label>
                    <select
                      name="studentClass"
                      value={offlineForm.studentClass}
                      onChange={handleOfflineInputChange}
                      className="w-full min-h-[40px] px-3 bg-surface-card border border-line-soft/80 rounded-lg text-ink-strong text-xs font-bold focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/25 cursor-pointer transition-all"
                    >
                      {CLASSES.map((cls) => (
                        <option key={cls} value={cls}>
                          {cls}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
                  <div className="min-w-0">
                    <label className="block text-xs font-semibold text-ink-muted mb-1">উপজেলা *</label>
                    <select
                      name="upazila"
                      value={offlineForm.upazila}
                      onChange={handleOfflineInputChange}
                      className="w-full min-h-[38px] px-2.5 bg-surface-card border border-line-soft/80 rounded-lg text-ink-strong text-xs focus:outline-none focus:border-primary cursor-pointer"
                    >
                      {UPAZILAS.map((u) => (
                        <option key={u} value={u}>
                          {u}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="min-w-0">
                    <label className="block text-xs font-semibold text-ink-muted mb-1">থানা *</label>
                    <select
                      name="thana"
                      value={offlineForm.thana}
                      onChange={handleOfflineInputChange}
                      className="w-full min-h-[38px] px-2.5 bg-surface-card border border-line-soft/80 rounded-lg text-ink-strong text-xs focus:outline-none focus:border-primary cursor-pointer"
                    >
                      {THANAS.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="min-w-0">
                    <label className="block text-xs font-semibold text-ink-muted mb-1">ইউনিয়ন *</label>
                    <input
                      type="text"
                      name="union"
                      value={offlineForm.union}
                      onChange={handleOfflineInputChange}
                      placeholder="ইউনিয়ন"
                      required
                      className="w-full min-h-[38px] px-2.5 bg-surface-card border border-line-soft/80 rounded-lg text-ink-strong text-xs focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div className="min-w-0">
                    <label className="block text-xs font-semibold text-ink-muted mb-1">জেলা</label>
                    <input
                      type="text"
                      name="district"
                      value={offlineForm.district}
                      onChange={handleOfflineInputChange}
                      placeholder="জেলা"
                      className="w-full min-h-[38px] px-2.5 bg-surface-card border border-line-soft/80 rounded-lg text-ink-strong text-xs focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-line-soft/80">
                <Button
                  type="button"
                  tone="neutral"
                  size="md"
                  onClick={() => setIsAddModalOpen(false)}
                >
                  বাতিল
                </Button>
                <button
                  type="submit"
                  disabled={addingSubmitting}
                  className="min-h-[42px] px-6 rounded-xl bg-gradient-to-r from-emerald-500 via-primary to-emerald-600 hover:brightness-110 text-primary-on font-bold text-xs sm:text-sm shadow-md shadow-emerald-500/20 transition-all hover:scale-[1.01] active:scale-[0.98] cursor-pointer flex items-center gap-2 disabled:opacity-50 select-none"
                >
                  {addingSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                      <span>সংরক্ষণ হচ্ছে...</span>
                    </>
                  ) : (
                    <>
                      <HiCheck className="text-base" />
                      <span>সংরক্ষণ করুন</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* ===================================================================
          MODAL 2: ADMIN EDIT / ROLL ASSIGNMENT MODAL (Existing Records)
          =================================================================== */}
      {selectedStudent && typeof document !== "undefined" && createPortal(
        <div
          className="fixed inset-0 z-[9999] overflow-y-auto bg-black/85 backdrop-blur-md p-3 sm:p-6 flex min-h-full items-center justify-center animate-fade-in"
          onClick={() => setSelectedStudent(null)}
        >
          <div
            className="relative w-full max-w-3xl bg-surface-card border border-line-soft/90 rounded-2xl p-5 sm:p-7 shadow-2xl space-y-5 my-auto overflow-hidden animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Luminous Top Line */}
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-primary via-emerald-400 to-teal-400" />

            {/* Header */}
            <div className="flex items-center justify-between pb-3.5 border-b border-line-soft/80">
              <div className="space-y-0.5 min-w-0">
                <h3 className="text-base sm:text-lg font-bold text-ink-strong tracking-tight truncate">
                  আবেদন পর্যালোচনা ও রোল বরাদ্দ
                </h3>
                <span className="text-xs text-primary font-mono font-bold block">
                  ট্র্যাকিং আইডি: {selectedStudent.trackingId}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedStudent(null)}
                className="w-9 h-9 rounded-xl bg-surface-low hover:bg-surface-overlay text-ink-muted hover:text-ink-strong border border-line-soft/80 flex items-center justify-center transition-colors cursor-pointer shrink-0"
                title="বন্ধ করুন"
              >
                <HiXMark className="text-lg" />
              </button>
            </div>

            {/* Student Full Info Card */}
            <div className="p-4 sm:p-5 bg-surface-low rounded-2xl border border-line-soft/80 flex flex-col sm:flex-row items-start gap-4 text-xs sm:text-[13px] shadow-sm">
              {selectedStudent.photoUrl ? (
                <img
                  src={selectedStudent.photoUrl}
                  alt={selectedStudent.nameBn || ""}
                  className="w-20 h-24 sm:w-24 sm:h-28 rounded-xl object-cover border border-line-soft shrink-0 shadow-sm"
                />
              ) : (
                <div className="w-20 h-24 sm:w-24 sm:h-28 rounded-xl bg-surface-card border border-line-soft flex flex-col items-center justify-center text-ink-muted shrink-0 gap-1">
                  <HiAcademicCap className="text-3xl text-primary/60" />
                  <span className="text-[10px] text-ink-muted">ছবি নেই</span>
                </div>
              )}

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2.5 text-ink-body w-full">
                <div>
                  <span className="block text-[11px] text-ink-muted font-medium">নাম (বাংলা)</span>
                  <span className="font-bold text-ink-strong text-xs sm:text-sm">{selectedStudent.nameBn || "—"}</span>
                </div>
                <div>
                  <span className="block text-[11px] text-ink-muted font-medium">নাম (English)</span>
                  <span className="font-semibold text-ink-strong text-xs">{selectedStudent.nameEn || "—"}</span>
                </div>
                <div>
                  <span className="block text-[11px] text-ink-muted font-medium">লিঙ্গ ও ধর্ম</span>
                  <span className="text-ink-strong font-medium">
                    {selectedStudent.gender || "ছাত্র"} • {selectedStudent.religion || "ইসলাম"}
                  </span>
                </div>

                <div>
                  <span className="block text-[11px] text-ink-muted font-medium">পিতা / অভিভাবক</span>
                  <span className="text-ink-strong font-semibold">{selectedStudent.fatherName || selectedStudent.guardianName || "—"}</span>
                </div>
                <div>
                  <span className="block text-[11px] text-ink-muted font-medium">মাতা</span>
                  <span className="text-ink-strong font-medium">{selectedStudent.motherName || "—"}</span>
                </div>
                <div>
                  <span className="block text-[11px] text-ink-muted font-medium">জন্ম তারিখ</span>
                  <span className="text-ink-strong font-mono">{selectedStudent.dateOfBirth || "—"}</span>
                </div>

                <div>
                  <span className="block text-[11px] text-ink-muted font-medium">শ্রেণি ও শাখা</span>
                  <span className="font-bold text-primary text-xs">
                    {selectedStudent.studentClass} {selectedStudent.section ? `(${selectedStudent.section})` : ""}
                    {selectedStudent.classRoll ? ` • রোল: ${selectedStudent.classRoll}` : ""}
                  </span>
                </div>
                <div className="sm:col-span-2">
                  <span className="block text-[11px] text-ink-muted font-medium">শিক্ষা প্রতিষ্ঠান</span>
                  <span className="font-semibold text-ink-strong truncate block">{selectedStudent.institution || "—"}</span>
                </div>

                <div>
                  <span className="block text-[11px] text-ink-muted font-medium">মোবাইল নম্বর</span>
                  <span className="font-mono text-ink-strong font-semibold">{selectedStudent.mobile || selectedStudent.guardianPhone || "—"}</span>
                </div>
                <div>
                  <span className="block text-[11px] text-ink-muted font-medium">WhatsApp নম্বর</span>
                  <span className="font-mono text-emerald-400 font-bold flex items-center gap-1">
                    <FaWhatsapp className="text-xs" />
                    {selectedStudent.whatsappNumber || selectedStudent.mobile || "—"}
                  </span>
                </div>
                <div>
                  <span className="block text-[11px] text-ink-muted font-medium">পেমেন্ট মেথড</span>
                  <span className="text-secondary font-bold text-xs">
                    {selectedStudent.paymentMethod || "নগদ"}
                    {selectedStudent.trxId ? ` (${selectedStudent.trxId})` : ""}
                  </span>
                </div>

                <div className="col-span-2 sm:col-span-3 pt-1 border-t border-line-soft/60">
                  <span className="block text-[11px] text-ink-muted font-medium">ঠিকানা</span>
                  <span className="text-ink-strong text-xs">
                    {[
                      selectedStudent.village,
                      selectedStudent.postOffice,
                      selectedStudent.union,
                      selectedStudent.thana,
                      selectedStudent.upazila,
                      selectedStudent.district,
                    ]
                      .filter((v) => v && v !== "না" && v !== "N/A")
                      .join(", ") || "—"}
                  </span>
                </div>
              </div>
            </div>

            {/* Admin Edit Form */}
            <form onSubmit={handleSaveStatus} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-bold text-ink-body mb-1.5">
                    <HiShieldCheck className="text-primary text-sm" />
                    <span>আবেদনের স্ট্যাটাস নির্ধারণ</span>
                    <span className="text-error">*</span>
                  </label>
                  <select
                    value={assignData.status}
                    onChange={(e) =>
                      setAssignData((prev) => ({ ...prev, status: e.target.value }))
                    }
                    className="w-full min-h-[42px] px-3 bg-surface-card border border-line-soft/90 rounded-xl text-ink-strong text-xs font-bold focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 cursor-pointer transition-all"
                  >
                    <option value="approved">✓ অনুমোদন করুন (Approved)</option>
                    <option value="pending">⏳ অপেক্ষমাণ রাখুন (Pending)</option>
                    <option value="rejected">✕ বাতিল করুন (Rejected)</option>
                  </select>
                </div>

                <div>
                  <label className="flex items-center gap-1.5 text-xs font-bold text-ink-body mb-1.5">
                    <HiHashtag className="text-primary text-sm" />
                    <span>পরীক্ষার রোল নম্বর বরাদ্দ</span>
                  </label>
                  <input
                    type="text"
                    value={assignData.assignedRoll}
                    onChange={(e) =>
                      setAssignData((prev) => ({ ...prev, assignedRoll: e.target.value }))
                    }
                    placeholder="যেমন: ১০৫০১"
                    className="w-full min-h-[42px] px-3.5 bg-surface-card border border-primary/50 rounded-xl text-primary text-xs sm:text-sm font-mono font-bold focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/25 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="flex items-center gap-1.5 text-xs font-bold text-ink-body mb-1.5">
                  <HiBuildingLibrary className="text-secondary text-sm" />
                  <span>পরীক্ষা কেন্দ্রের নাম</span>
                </label>
                <select
                  value={assignData.examCenter}
                  onChange={(e) =>
                    setAssignData((prev) => ({ ...prev, examCenter: e.target.value }))
                  }
                  className="w-full min-h-[42px] px-3 bg-surface-card border border-line-soft/90 rounded-xl text-ink-strong text-xs font-medium focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 cursor-pointer transition-all"
                >
                  <option value="">কেন্দ্র নির্বাচন করুন</option>
                  {centerOptions(assignData.examCenter).map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
                {examCenters.length === 0 && (
                  <span className="block mt-1 text-[11px] text-ink-muted">
                    কোনো কেন্দ্র যুক্ত করা হয়নি — সাইডবারের "পরীক্ষা কেন্দ্র" ট্যাব থেকে যুক্ত করুন।
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div className="sm:col-span-2">
                  <label className="flex items-center gap-1.5 text-xs font-bold text-ink-body mb-1.5">
                    <HiCalendarDays className="text-ink-muted text-sm" />
                    <span>পরীক্ষার তারিখ ও সময়</span>
                  </label>
                  <input
                    type="text"
                    value={assignData.examDate}
                    onChange={(e) =>
                      setAssignData((prev) => ({ ...prev, examDate: e.target.value }))
                    }
                    placeholder="২৪ অক্টোবর ২০২৫ (শুক্রবার) | সকাল ১০:০০ টা"
                    className="w-full min-h-[42px] px-3.5 bg-surface-card border border-line-soft/90 rounded-xl text-ink-strong text-xs focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-1.5 text-xs font-bold text-ink-body mb-1.5">
                    <HiMapPin className="text-ink-muted text-sm" />
                    <span>রুম / সিট নম্বর</span>
                  </label>
                  <input
                    type="text"
                    value={assignData.roomNo}
                    onChange={(e) =>
                      setAssignData((prev) => ({ ...prev, roomNo: e.target.value }))
                    }
                    placeholder="রুম-২০৪"
                    className="w-full min-h-[42px] px-3.5 bg-surface-card border border-line-soft/90 rounded-xl text-ink-strong text-xs focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="flex items-center gap-1.5 text-xs font-bold text-ink-body mb-1.5">
                  <HiChatBubbleBottomCenterText className="text-ink-muted text-sm" />
                  <span>অ্যাডমিন নোট / মন্তব্য</span>
                </label>
                <input
                  type="text"
                  value={assignData.adminNote}
                  onChange={(e) =>
                    setAssignData((prev) => ({ ...prev, adminNote: e.target.value }))
                  }
                  placeholder="যেমন: ফি যাচাইকৃত ও প্রবেশপত্র প্রস্তুত"
                  className="w-full min-h-[42px] px-3.5 bg-surface-card border border-line-soft/90 rounded-xl text-ink-strong text-xs focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3.5 pt-4 border-t border-line-soft/80">
                {/* Two-stage WhatsApp dispatch */}
                <div className="w-full sm:w-auto flex items-center gap-2.5 bg-surface-low px-3 py-1.5 rounded-xl border border-line-soft/80">
                  <NoticeButtons student={selectedStudent} onSend={sendNotice} />
                  <span className="text-[11px] text-ink-muted leading-tight">
                    ১ = ট্র্যাকিং নম্বর
                    <br />২ = রোল ও কেন্দ্র
                  </span>
                </div>

                <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
                  <Button
                    type="button"
                    tone="neutral"
                    size="md"
                    onClick={() => setSelectedStudent(null)}
                  >
                    বাতিল
                  </Button>
                  <button
                    type="submit"
                    className="min-h-[42px] px-6 rounded-xl bg-gradient-to-r from-emerald-500 via-primary to-emerald-600 hover:brightness-110 text-primary-on font-bold text-xs sm:text-sm shadow-md shadow-emerald-500/20 transition-all hover:scale-[1.01] active:scale-[0.98] cursor-pointer select-none"
                  >
                    সংরক্ষণ ও অনুমোদন
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {confirmUI}
    </div>
  );
};

export default RegistrationManager;
