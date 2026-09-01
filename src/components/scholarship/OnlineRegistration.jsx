import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  HiAcademicCap,
  HiUser,
  HiPhone,
  HiBuildingOffice2,
  HiMapPin,
  HiCreditCard,
  HiPhoto,
  HiCheckCircle,
  HiExclamationCircle,
  HiSparkles,
  HiPrinter,
  HiArrowPath,
  HiInformationCircle,
  HiDocumentText,
  HiQrCode,
  HiArrowRight,
  HiArrowLeft,
  HiCheck,
  HiClipboardDocumentCheck,
  HiArrowUpTray,
  HiXMark,
  HiHome,
  HiChatBubbleLeftRight,
} from "react-icons/hi2";
import { FaGraduationCap, FaQrcode, FaCheckCircle, FaPrint, FaWhatsapp } from "react-icons/fa";
import { addRegistration, getRegistrations } from "../../services/firestore";
import { uploadToImgBB } from "../../services/imgbb";
import ExamRulesCard from "./ExamRulesCard";
import { useExamYear } from "../../context/ExamYearContext";

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

/* Registration fee and the single channel it is accepted through: bKash
   send money to the number below. The method id is stored on every record
   verbatim, because the dashboard fee report groups by it. */
const REGISTRATION_FEE = "১৫০ টাকা";
const PAYMENT_METHOD_ID = "bKash";
const PAYMENT_SEND_NUMBER = "01317993107";
const PAYMENT_SEND_NUMBER_DISPLAY = "01317-993107";

const OnlineRegistration = () => {
  const examYear = useExamYear();
  const [activeTab, setActiveTab] = useState("form"); // 'form' | 'track'
  const [currentStep, setCurrentStep] = useState(1); // 1: Personal, 2: Academic & Address, 3: Payment

  const [formData, setFormData] = useState({
    nameBn: "",
    nameEn: "",
    gender: "ছাত্র", // छात्र | छात्रा
    fatherName: "",
    motherName: "",
    guardianName: "",
    guardianRelation: "পিতা",
    dateOfBirth: "",
    religion: "ইসলাম",
    mobile: "",
    whatsappNumber: "",
    
    // Academic Details
    institution: "",
    studentClass: "১০ম শ্রেণি",
    section: "ক",
    classRoll: "",
    upazila: "দক্ষিণ সুরমা থানা",

    // Address Details
    village: "",
    postOffice: "",
    union: "",
    thana: "দক্ষিণ সুরমা",
    district: "সিলেট",
    presentAddress: "",

    // Photo & Payment
    photoUrl: "",
    paymentMethod: PAYMENT_METHOD_ID,
    senderNumber: "",
    trxId: "",
  });

  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState("");
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [registeredData, setRegisteredData] = useState(null);

  // Status tracking & payment copy state
  const [trackIdInput, setTrackIdInput] = useState("");
  const [trackedRecord, setTrackedRecord] = useState(null);
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [trackError, setTrackError] = useState(null);
  const [copiedTrackingId, setCopiedTrackingId] = useState(false);
  const [copiedPaymentNumber, setCopiedPaymentNumber] = useState(false);

  const handleCopyPaymentNumber = (num) => {
    const cleanNum = num.replace(/[^0-9]/g, "");
    if (navigator.clipboard) {
      navigator.clipboard.writeText(cleanNum);
      setCopiedPaymentNumber(true);
      setTimeout(() => setCopiedPaymentNumber(false), 2000);
    }
  };

  const handleCopyTrackingId = (id) => {
    if (navigator.clipboard && id) {
      navigator.clipboard.writeText(id);
      setCopiedTrackingId(true);
      setTimeout(() => setCopiedTrackingId(false), 2000);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCopyPermanentToPresent = () => {
    const permStr = [
      formData.village ? `গ্রাম: ${formData.village}` : "",
      formData.postOffice ? `ডাক: ${formData.postOffice}` : "",
      formData.union ? `ইউনিয়ন: ${formData.union}` : "",
      formData.thana ? `থানা: ${formData.thana}` : "",
      formData.district ? `জেলা: ${formData.district}` : "",
    ]
      .filter(Boolean)
      .join(", ");

    setFormData((prev) => ({ ...prev, presentAddress: permStr }));
  };

  const handlePhotoSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("ছবির সাইজ ৫MB এর কম হতে হবে!");
        return;
      }
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const validateStep = (step) => {
    setSubmitError(null);
    if (step === 1) {
      if (!formData.nameBn.trim()) {
        setSubmitError("অনুগ্রহ করে পরীক্ষার্থীর নাম (বাংলায়) লিখুন।");
        return false;
      }
      if (!formData.fatherName.trim()) {
        setSubmitError("অনুগ্রহ করে পিতার নাম লিখুন।");
        return false;
      }
      if (!formData.mobile.trim()) {
        setSubmitError("অনুগ্রহ করে মোবাইল নম্বর প্রদান করুন।");
        return false;
      }
      if (!formData.whatsappNumber.trim()) {
        setSubmitError("অনুগ্রহ করে WhatsApp নম্বর প্রদান করুন (যেখানে রোল ও প্রবেশপত্র পাঠানো হবে)।");
        return false;
      }
    } else if (step === 2) {
      if (!formData.institution.trim()) {
        setSubmitError("অনুগ্রহ করে শিক্ষা প্রতিষ্ঠানের নাম লিখুন।");
        return false;
      }
      if (!formData.thana.trim()) {
        setSubmitError("অনুগ্রহ করে থানা / উপজেলার নাম লিখুন।");
        return false;
      }
      if (!formData.union.trim()) {
        setSubmitError("অনুগ্রহ করে ইউনিয়নের নাম লিখুন।");
        return false;
      }
    } else if (step === 3) {
      if (!formData.senderNumber.trim()) {
        setSubmitError("অনুগ্রহ করে যে নম্বর থেকে ফি পাঠিয়েছেন সেই প্রেরক নম্বর লিখুন।");
        return false;
      }
      if (!formData.trxId.trim()) {
        setSubmitError("অনুগ্রহ করে পেমেন্ট ট্রানজেকশন আইডি (TrxID) প্রদান করুন।");
        return false;
      }
    }
    return true;
  };

  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 3));
      window.scrollTo({ top: 120, behavior: "smooth" });
    }
  };

  const handlePrevStep = () => {
    setSubmitError(null);
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    window.scrollTo({ top: 120, behavior: "smooth" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null);

    if (!validateStep(1) || !validateStep(2) || !validateStep(3)) {
      return;
    }

    setSubmitting(true);

    try {
      let finalPhotoUrl = formData.photoUrl || "";

      // 1. Upload photo to ImgBB if selected
      if (photoFile) {
        setUploadingPhoto(true);
        try {
          const uploadRes = await uploadToImgBB(photoFile);
          if (uploadRes?.url) {
            finalPhotoUrl = uploadRes.url;
          }
        } catch (uploadErr) {
          console.warn("ImgBB upload issue, continuing with submission:", uploadErr);
        } finally {
          setUploadingPhoto(false);
        }
      }

      // 2. Prepare full registration payload matching physical form
      const payload = {
        nameBn: formData.nameBn.trim(),
        nameEn: formData.nameEn.trim(),
        gender: formData.gender,
        fatherName: formData.fatherName.trim(),
        motherName: formData.motherName.trim(),
        guardianName: formData.guardianName.trim() || formData.fatherName.trim(),
        guardianRelation: formData.guardianRelation,
        dateOfBirth: formData.dateOfBirth,
        religion: formData.religion,
        mobile: formData.mobile.trim(),
        whatsappNumber: formData.whatsappNumber.trim() || formData.mobile.trim(),
        
        institution: formData.institution.trim(),
        studentClass: formData.studentClass,
        section: formData.section.trim(),
        classRoll: formData.classRoll.trim(),
        upazila: formData.upazila,

        village: formData.village.trim(),
        postOffice: formData.postOffice.trim(),
        union: formData.union.trim(),
        thana: formData.thana.trim(),
        district: formData.district.trim(),
        presentAddress: formData.presentAddress.trim(),

        photoUrl: finalPhotoUrl,
        paymentMethod: formData.paymentMethod,
        senderNumber: formData.senderNumber.trim(),
        trxId: formData.trxId.trim(),
        feeAmount: REGISTRATION_FEE,
        status: "pending", // Pending admin review & manual roll assignment
        assignedRoll: "",
        examCenter: "",
        examDate: "২৪ অক্টোবর ২০২৫ (শুক্রবার)",
        examTime: "সকাল ১০:০০ টা - ১১:৩০ টা",
        roomNo: "",
      };

      // 3. Save to Firestore
      const res = await addRegistration(payload);
      setRegisteredData({ ...payload, trackingId: res.trackingId, id: res.id });
    } catch (err) {
      console.error("Registration error:", err);
      setSubmitError(
        err.message || "রেজিস্ট্রেশন জমা দিতে সমস্যা হয়েছে। অনুগ্রহ করে ইন্টারনেট সংযোগ চেক করে আবার চেষ্টা করুন।"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleTrackSubmit = async (e) => {
    e.preventDefault();
    const query = trackIdInput.trim();
    if (!query) return;

    setTrackingLoading(true);
    setTrackError(null);
    setTrackedRecord(null);

    try {
      const allRegs = await getRegistrations();
      const cleanQ = query.toLowerCase();
      const cleanDigits = query.replace(/[^0-9]/g, "");

      const match = allRegs.find(
        (r) =>
          r.trackingId?.toLowerCase() === cleanQ ||
          r.trackingId?.replace(/[^0-9]/g, "") === cleanDigits ||
          r.assignedRoll === query ||
          r.mobile?.replace(/[^0-9]/g, "") === cleanDigits ||
          r.whatsappNumber?.replace(/[^0-9]/g, "") === cleanDigits
      );

      if (match) {
        setTrackedRecord(match);
      } else {
        setTrackError("এই ট্র্যাকিং নম্বর, রোল বা মোবাইল নম্বরে কোনো আবেদন পাওয়া যায়নি!");
      }
    } catch (err) {
      console.error("Track error:", err);
      setTrackError("স্ট্যাটাস যাচাই করতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।");
    } finally {
      setTrackingLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-lowest text-ink-strong py-6 sm:py-12 px-3 sm:px-6 font-sans selection:bg-primary-container selection:text-white transition-colors duration-200">
      <div className="max-w-3xl mx-auto space-y-6 sm:space-y-8">

        {/* HEADER HERO */}
        <div className="text-center space-y-2 sm:space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-container/15 text-primary-300 border border-primary/30 text-xs font-bold uppercase tracking-wider">
            <HiSparkles className="text-sm text-primary" />
            <span>কিশোরকণ্ঠ মেধা বৃত্তি {examYear}</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
            অনলাইন <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-container via-tertiary-container to-tertiary-container">রেজিস্ট্রেশন পোর্টাল</span>
          </h1>

          <p className="text-xs sm:text-sm text-ink-muted max-w-xl mx-auto leading-relaxed">
            সিলেট জেলা পশ্চিম অঞ্চলের ৪র্থ থেকে ১০ম শ্রেণির শিক্ষার্থীদের মেধা বৃত্তি পরীক্ষার অফিসিয়াল অনলাইন আবেদন ফরম।
          </p>
        </div>

        {/* ===================================================================
            DUAL MODE SWITCHER TABS (New Application vs Track Status)
            =================================================================== */}
        <div className="grid grid-cols-2 gap-1.5 p-1 bg-surface border border-line-soft rounded-lg max-w-md mx-auto">
          <button
            type="button"
            onClick={() => {
              setActiveTab("form");
              setRegisteredData(null);
            }}
            className={`flex items-center justify-center gap-1 py-2 rounded text-xs sm:text-sm font-bold transition-all cursor-pointer truncate ${
              activeTab === "form"
                ? "bg-gradient-to-r from-primary-container to-tertiary-container text-white font-black scale-[1.02]"
                : "text-ink-muted hover:text-white"
            }`}
          >
            <HiDocumentText className="text-sm shrink-0" />
            <span className="truncate whitespace-nowrap">নতুন আবেদন</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("track")}
            className={`flex items-center justify-center gap-1 py-2 rounded text-xs sm:text-sm font-bold transition-all cursor-pointer truncate ${
              activeTab === "track"
                ? "bg-gradient-to-r from-primary-container to-tertiary-container text-white font-black scale-[1.02]"
                : "text-ink-muted hover:text-white"
            }`}
          >
            <HiQrCode className="text-sm shrink-0" />
            <span className="truncate whitespace-nowrap">আবেদন ট্র্যাকিং</span>
          </button>
        </div>

        {/* Official Exam Rules Card */}
        <ExamRulesCard defaultExpanded={false} />

        {/* ===================================================================
            SUCCESS VIEW: DIGITAL APPLICATION SLIP WITH TRACKING ID
            =================================================================== */}
        {registeredData ? (
          <div className="p-5 sm:p-8 bg-surface border-2 border-primary/40 rounded-xl shadow-overlay space-y-6 text-center animate-scaleUp">
            <div className="w-16 h-16 rounded-xl bg-primary-container/20 text-primary flex items-center justify-center text-3xl mx-auto">
              <HiCheckCircle />
            </div>

            <div className="space-y-1.5">
              <span className="px-3 py-1 rounded-full bg-secondary-container/15 text-secondary text-xs font-black uppercase tracking-wider">
                আবেদন সফলভাবে গৃহীত হয়েছে
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white">
                ধন্যবাদ, {registeredData.nameBn}!
              </h2>
              <p className="text-xs sm:text-sm text-ink-muted max-w-md mx-auto leading-relaxed">
                আপনার আবেদনটি পর্যালোচনার জন্য জমা রয়েছে। অ্যাডমিন প্যানেল থেকে তথ্য ও পেমেন্ট যাচাই করে অনুমোদনের পর আপনার WhatsApp নম্বরে রোল নম্বর ও প্রবেশপত্র পাঠিয়ে দেওয়া হবে।
              </p>
            </div>

            {/* Tracking ID Copy Box */}
            <div className="p-4 rounded-lg bg-primary-900/40 border border-primary/40 space-y-2 max-w-md mx-auto text-left">
              <span className="text-[11px] font-bold text-primary-300 block">
                আপনার অফিসিয়াল ট্র্যাকিং আইডি (সংরক্ষণ করুন):
              </span>
              <div className="flex items-center justify-between gap-2">
                <span className="text-base sm:text-lg font-black font-mono text-primary select-all">
                  {registeredData.trackingId}
                </span>
                <button
                  type="button"
                  onClick={() => handleCopyTrackingId(registeredData.trackingId)}
                  className="px-3 py-1.5 rounded bg-primary-container hover:bg-primary-700 text-white text-xs font-bold flex items-center gap-1 transition active:scale-95 cursor-pointer"
                >
                  {copiedTrackingId ? <HiCheck className="text-sm" /> : <HiClipboardDocumentCheck className="text-sm" />}
                  <span>{copiedTrackingId ? "কপি হয়েছে!" : "কপি করুন"}</span>
                </button>
              </div>
            </div>

            {/* Candidate Summary Receipt */}
            <div className="p-4 rounded-lg bg-surface-lowest border border-line-soft space-y-2 text-xs sm:text-sm text-left max-w-md mx-auto">
              <div className="flex justify-between py-1 border-b border-line-soft">
                <span className="text-ink-muted">নাম:</span>
                <span className="font-bold text-white">{registeredData.nameBn}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-line-soft">
                <span className="text-ink-muted">শ্রেণি:</span>
                <span className="font-bold text-white">{registeredData.studentClass}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-line-soft">
                <span className="text-ink-muted">প্রতিষ্ঠান:</span>
                <span className="font-bold text-white">{registeredData.institution}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-line-soft">
                <span className="text-ink-muted">WhatsApp নম্বর:</span>
                <span className="font-bold font-mono text-primary">{registeredData.whatsappNumber}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-ink-muted">বর্তমান স্ট্যাটাস:</span>
                <span className="px-2 py-0.5 rounded-full bg-secondary-container/20 text-secondary font-bold text-xs">
                  যাচাইাধীন (Pending Review)
                </span>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-2 max-w-md mx-auto">
              <button
                type="button"
                onClick={() => {
                  setActiveTab("track");
                  setTrackIdInput(registeredData.trackingId);
                  setRegisteredData(null);
                }}
                className="w-full sm:w-auto px-5 py-3 rounded bg-gradient-to-r from-primary-container to-tertiary-container text-white text-xs sm:text-sm font-bold hover:scale-105 active:scale-95 transition cursor-pointer"
              >
                আবেদন ট্র্যাকিং করুন →
              </button>
              <button
                type="button"
                onClick={() => {
                  setRegisteredData(null);
                  setCurrentStep(1);
                  setFormData({
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
                    photoUrl: "",
                    paymentMethod: PAYMENT_METHOD_ID,
                    senderNumber: "",
                    trxId: "",
                  });
                  setPhotoFile(null);
                  setPhotoPreview("");
                }}
                className="w-full sm:w-auto px-5 py-3 rounded bg-surface-card text-ink-body text-xs sm:text-sm font-bold hover:bg-surface-overlay transition cursor-pointer"
              >
                নতুন আরেকটি আবেদন করুন
              </button>
            </div>
          </div>
        ) : activeTab === "form" ? (
          /* ===================================================================
              3-STEP REGISTRATION WIZARD FORM
              =================================================================== */
          <div className="p-4 sm:p-8 bg-surface border border-line-soft rounded-xl shadow-overlay space-y-6">

            {/* Step Progress Wizard Bar */}
            <div className="relative pb-2">
              <div className="absolute top-4 sm:top-4.5 -translate-y-1/2 left-8 right-8 h-1 bg-surface-card z-0">
                <div
                  className="h-full bg-gradient-to-r from-primary-container to-tertiary-container transition-all duration-300"
                  style={{
                    width: currentStep === 1 ? "0%" : currentStep === 2 ? "50%" : "100%",
                  }}
                />
              </div>

              <div className="relative z-10 flex items-center justify-between">
                {[
                  { step: 1, label: "ব্যক্তিগত তথ্য", icon: HiUser },
                  { step: 2, label: "শিক্ষা ও ঠিকানা", icon: HiAcademicCap },
                  { step: 3, label: "ফি ও সাবমিট", icon: HiCreditCard },
                ].map((s) => {
                  const Icon = s.icon;
                  const isActive = currentStep >= s.step;
                  const isCurrent = currentStep === s.step;
                  return (
                    <div key={s.step} className="flex flex-col items-center gap-1 text-center">
                      <div
                        className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold transition-all ${
                          isCurrent
                            ? "bg-primary-container text-white ring-4 ring-primary/20 scale-110"
                            : isActive
                            ? "bg-tertiary-container text-white"
                            : "bg-surface-card text-ink-muted"
                        }`}
                      >
                        {isActive && currentStep > s.step ? <HiCheck className="text-sm" /> : <Icon className="text-xs sm:text-sm" />}
                      </div>
                      <span
                        className={`text-[10px] sm:text-xs font-bold transition-colors ${
                          isCurrent
                            ? "text-primary font-black"
                            : "text-ink-muted"
                        }`}
                      >
                        {s.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Error Banner */}
            {submitError && (
              <div className="p-3.5 rounded-lg bg-tertiary-container/10 border border-tertiary/30 text-tertiary text-xs sm:text-sm font-bold flex items-center gap-2">
                <HiExclamationCircle className="text-lg shrink-0" />
                <span>{submitError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">

              {/* =============================================================
                  STEP 1: PERSONAL & GUARDIAN DETAILS
                  ============================================================= */}
              {currentStep === 1 && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="border-b border-line-soft pb-2">
                    <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                      <HiUser className="text-primary" />
                      <span>১. পরীক্ষার্থী ও অভিভাবকের তথ্য</span>
                    </h3>
                    <p className="text-xs text-ink-muted">
                      অফিসিয়াল সার্টিফিকেট ও প্রবেশপত্রের জন্য সঠিক তথ্য পূরণ করুন।
                    </p>
                  </div>

                  {/* Name Bangla & English */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-ink-body">
                        পরীক্ষার্থীর নাম (বাংলায়) <span className="text-tertiary">*</span>
                      </label>
                      <input
                        type="text"
                        name="nameBn"
                        value={formData.nameBn}
                        onChange={handleInputChange}
                        placeholder="উদা: কাজী শাফায়াত আলিফ সিফাত"
                        required
                        className="w-full px-3.5 py-2.5 rounded bg-surface-lowest border border-line-soft text-xs sm:text-sm text-white focus:outline-none focus:border-primary/40 font-medium"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-ink-body">
                        ইংরেজিতে (Name in English - Capital Letters)
                      </label>
                      <input
                        type="text"
                        name="nameEn"
                        value={formData.nameEn}
                        onChange={handleInputChange}
                        placeholder="KAZI SHAFAYAT ALIF SIFAT"
                        className="w-full px-3.5 py-2.5 rounded bg-surface-lowest border border-line-soft text-xs sm:text-sm text-white focus:outline-none focus:border-primary/40 font-medium uppercase font-sans"
                      />
                    </div>
                  </div>

                  {/* Gender Selector (Chhatro / Chhatri) */}
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-ink-body">
                      লিঙ্গ (Gender) <span className="text-tertiary">*</span>
                    </label>
                    <div className="grid grid-cols-2 gap-2.5">
                      {["ছাত্র", "ছাত্রী"].map((g) => (
                        <button
                          key={g}
                          type="button"
                          onClick={() => setFormData((prev) => ({ ...prev, gender: g }))}
                          className={`py-2 px-4 rounded text-xs sm:text-sm font-black border transition-all cursor-pointer ${
                            formData.gender === g
                              ? "bg-primary-container text-white border-primary/40"
                              : "bg-surface-lowest text-ink-body border-line-soft"
                          }`}
                        >
                          {g === "ছাত্র" ? "👨‍🎓 ছাত্র" : "👩‍🎓 ছাত্রী"}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Father & Mother Name */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-ink-body">
                        পিতার নাম (বাংলায়) <span className="text-tertiary">*</span>
                      </label>
                      <input
                        type="text"
                        name="fatherName"
                        value={formData.fatherName}
                        onChange={handleInputChange}
                        placeholder="পিতার পূর্ণ নাম লিখুন"
                        required
                        className="w-full px-3.5 py-2.5 rounded bg-surface-lowest border border-line-soft text-xs sm:text-sm text-white focus:outline-none focus:border-primary/40 font-medium"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-ink-body">
                        মাতার নাম (বাংলায়)
                      </label>
                      <input
                        type="text"
                        name="motherName"
                        value={formData.motherName}
                        onChange={handleInputChange}
                        placeholder="মাতার পূর্ণ নাম লিখুন"
                        className="w-full px-3.5 py-2.5 rounded bg-surface-lowest border border-line-soft text-xs sm:text-sm text-white focus:outline-none focus:border-primary/40 font-medium"
                      />
                    </div>
                  </div>

                  {/* Guardian Name & Relation */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-ink-body">
                        অভিভাবকের নাম
                      </label>
                      <input
                        type="text"
                        name="guardianName"
                        value={formData.guardianName}
                        onChange={handleInputChange}
                        placeholder="পিতার নাম অথবা অন্য অভিভাবকের নাম"
                        className="w-full px-3.5 py-2.5 rounded bg-surface-lowest border border-line-soft text-xs sm:text-sm text-white focus:outline-none focus:border-primary/40 font-medium"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-ink-body">
                        সম্পর্ক
                      </label>
                      <select
                        name="guardianRelation"
                        value={formData.guardianRelation}
                        onChange={handleInputChange}
                        className="w-full px-3.5 py-2.5 rounded bg-surface-lowest border border-line-soft text-xs sm:text-sm text-white focus:outline-none focus:border-primary/40 font-medium cursor-pointer"
                      >
                        {GUARDIAN_RELATIONS.map((r) => (
                          <option key={r} value={r}>
                            {r}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* DOB & Religion */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-ink-body">
                        জন্ম তারিখ (Date of Birth)
                      </label>
                      <input
                        type="date"
                        name="dateOfBirth"
                        value={formData.dateOfBirth}
                        onChange={handleInputChange}
                        onClick={(e) => {
                          try {
                            e.target.showPicker?.();
                          } catch (err) {}
                        }}
                        className="w-full px-3.5 py-2.5 rounded bg-surface-lowest border border-line-soft text-xs sm:text-sm text-white focus:outline-none focus:border-primary/40 font-mono [color-scheme:light] dark:[color-scheme:dark] cursor-pointer"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-ink-body">
                        ধর্ম (Religion)
                      </label>
                      <select
                        name="religion"
                        value={formData.religion}
                        onChange={handleInputChange}
                        className="w-full px-3.5 py-2.5 rounded bg-surface-lowest border border-line-soft text-xs sm:text-sm text-white focus:outline-none focus:border-primary/40 font-medium cursor-pointer"
                      >
                        {RELIGIONS.map((rel) => (
                          <option key={rel} value={rel}>
                            {rel}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Mobile & WhatsApp Number */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-ink-body">
                        মোবাইল নম্বর <span className="text-tertiary">*</span>
                      </label>
                      <input
                        type="tel"
                        name="mobile"
                        value={formData.mobile}
                        onChange={handleInputChange}
                        placeholder="017XXXXXXXX"
                        required
                        className="w-full px-3.5 py-2.5 rounded bg-surface-lowest border border-line-soft text-xs sm:text-sm text-white focus:outline-none focus:border-primary/40 font-mono"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-ink-body flex items-center justify-between">
                        <span className="flex items-center gap-1 text-primary">
                          <FaWhatsapp className="text-sm" /> WhatsApp নম্বর (নোটিফিকেশন যাবে)
                        </span>
                        <span className="text-tertiary">*</span>
                      </label>
                      <input
                        type="tel"
                        name="whatsappNumber"
                        value={formData.whatsappNumber}
                        onChange={handleInputChange}
                        placeholder="017XXXXXXXX"
                        required
                        className="w-full px-3.5 py-2.5 rounded bg-surface-lowest border border-primary/40 text-xs sm:text-sm text-white focus:outline-none focus:border-primary/40 font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* =============================================================
                  STEP 2: ACADEMIC DETAILS & ADDRESS
                  ============================================================= */}
              {currentStep === 2 && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="border-b border-line-soft pb-2">
                    <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                      <HiAcademicCap className="text-primary" />
                      <span>২. শিক্ষাগত তথ্য, ঠিকানা ও ছবি</span>
                    </h3>
                    <p className="text-xs text-ink-muted">
                      বিদ্যালয়ের বিবরণ ও যোগাযোগের ঠিকানা পূরণ করুন।
                    </p>
                  </div>

                  {/* Institution Name */}
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-ink-body">
                      শিক্ষা প্রতিষ্ঠানের নাম <span className="text-tertiary">*</span>
                    </label>
                    <input
                      type="text"
                      name="institution"
                      value={formData.institution}
                      onChange={handleInputChange}
                      placeholder="উদা: শাহজালাল এন জি এফ এফ স্কুল এন্ড কলেজ"
                      required
                      className="w-full px-3.5 py-2.5 rounded bg-surface-lowest border border-line-soft text-xs sm:text-sm text-white focus:outline-none focus:border-primary/40 font-medium"
                    />
                  </div>

                  {/* Class, Section, Roll */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-ink-body">
                        শ্রেণি <span className="text-tertiary">*</span>
                      </label>
                      <select
                        name="studentClass"
                        value={formData.studentClass}
                        onChange={handleInputChange}
                        className="w-full px-3.5 py-2.5 rounded bg-surface-lowest border border-line-soft text-xs sm:text-sm text-white focus:outline-none focus:border-primary/40 font-bold cursor-pointer"
                      >
                        {CLASSES.map((cls) => (
                          <option key={cls} value={cls}>
                            {cls}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-ink-body">
                        শাখা (Section)
                      </label>
                      <input
                        type="text"
                        name="section"
                        value={formData.section}
                        onChange={handleInputChange}
                        placeholder="উদা: ক / A / বিজ্ঞান"
                        className="w-full px-3.5 py-2.5 rounded bg-surface-lowest border border-line-soft text-xs sm:text-sm text-white focus:outline-none focus:border-primary/40 font-medium"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-ink-body">
                        ক্লাস রোল নম্বর
                      </label>
                      <input
                        type="text"
                        name="classRoll"
                        value={formData.classRoll}
                        onChange={handleInputChange}
                        placeholder="উদা: ০৫"
                        className="w-full px-3.5 py-2.5 rounded bg-surface-lowest border border-line-soft text-xs sm:text-sm text-white focus:outline-none focus:border-primary/40 font-mono"
                      />
                    </div>
                  </div>

                  {/* Permanent Address Fields */}
                  <div className="space-y-2 pt-2 border-t border-line-soft">
                    <label className="block text-xs font-black text-ink-body">
                      স্থায়ী ঠিকানা (Permanent Address)
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
                      <div className="space-y-1">
                        <label className="block text-[11px] text-ink-muted">গ্রাম</label>
                        <input
                          type="text"
                          name="village"
                          value={formData.village}
                          onChange={handleInputChange}
                          placeholder="গ্রামের নাম"
                          className="w-full px-3 py-2 rounded bg-surface-lowest border border-line-soft text-xs text-white focus:outline-none focus:border-primary/40 font-medium"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="block text-[11px] text-ink-muted">ডাকঘর</label>
                        <input
                          type="text"
                          name="postOffice"
                          value={formData.postOffice}
                          onChange={handleInputChange}
                          placeholder="ডাকঘর"
                          className="w-full px-3 py-2 rounded bg-surface-lowest border border-line-soft text-xs text-white focus:outline-none focus:border-primary/40 font-medium"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="block text-[11px] text-ink-muted">
                          ইউনিয়ন <span className="text-tertiary">*</span>
                        </label>
                        <input
                          type="text"
                          name="union"
                          value={formData.union}
                          onChange={handleInputChange}
                          placeholder="ইউনিয়নের নাম"
                          required
                          className="w-full px-3 py-2 rounded bg-surface-lowest border border-line-soft text-xs text-white focus:outline-none focus:border-primary/40 font-medium"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="block text-[11px] text-ink-muted">
                          থানা / উপজেলা <span className="text-tertiary">*</span>
                        </label>
                        <input
                          type="text"
                          name="thana"
                          value={formData.thana}
                          onChange={handleInputChange}
                          placeholder="থানা"
                          required
                          className="w-full px-3 py-2 rounded bg-surface-lowest border border-line-soft text-xs text-white focus:outline-none focus:border-primary/40 font-medium"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="block text-[11px] text-ink-muted">জেলা</label>
                        <input
                          type="text"
                          name="district"
                          value={formData.district}
                          onChange={handleInputChange}
                          placeholder="জেলা"
                          className="w-full px-3 py-2 rounded bg-surface-lowest border border-line-soft text-xs text-white focus:outline-none focus:border-primary/40 font-medium"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Present Address */}
                  <div className="space-y-1 pt-1">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold text-ink-body">
                        বর্তমান ঠিকানা (Present Address)
                      </label>
                      <button
                        type="button"
                        onClick={handleCopyPermanentToPresent}
                        className="text-[11px] font-bold text-primary hover:underline cursor-pointer"
                      >
                        স্থায়ী ঠিকানার অনুরূপ
                      </button>
                    </div>
                    <input
                      type="text"
                      name="presentAddress"
                      value={formData.presentAddress}
                      onChange={handleInputChange}
                      placeholder="বাসা নং, রোড নং, এলাকা..."
                      className="w-full px-3.5 py-2.5 rounded bg-surface-lowest border border-line-soft text-xs sm:text-sm text-white focus:outline-none focus:border-primary/40 font-medium"
                    />
                  </div>

                  {/* Photo Upload Card */}
                  <div className="space-y-1.5 pt-2">
                    <label className="block text-xs font-bold text-ink-body">
                      পাসপোর্ট সাইজ ছবি আপলোড (ঐচ্ছিক)
                    </label>

                    {photoPreview ? (
                      <div className="relative p-3 rounded-lg bg-primary-container/10 border border-primary/30 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={photoPreview}
                            alt="Student Preview"
                            className="w-12 h-12 rounded object-cover border border-primary/40"
                          />
                          <div>
                            <span className="text-xs font-bold text-white block">
                              ছবি সংযুক্ত হয়েছে
                            </span>
                            <span className="text-[10px] text-ink-muted">
                              {(photoFile?.size / 1024).toFixed(1)} KB
                            </span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setPhotoFile(null);
                            setPhotoPreview("");
                          }}
                          className="w-8 h-8 rounded-full bg-tertiary-container/15 hover:bg-tertiary-container/25 text-tertiary flex items-center justify-center transition cursor-pointer"
                        >
                          <HiXMark className="text-lg" />
                        </button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-line-soft hover:border-primary/40 rounded-lg bg-surface-lowest text-center cursor-pointer transition group">
                        <HiPhoto className="text-3xl text-ink-muted group-hover:text-primary mb-1 transition-colors" />
                        <span className="text-xs font-bold text-ink-body">
                          ছবি সিলেক্ট করুন বা ড্র্যাগ করুন
                        </span>
                        <span className="text-[10px] text-ink-muted">
                          JPG, PNG (সর্বোচ্চ ৫ MB)
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoSelect}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                </div>
              )}

              {/* =============================================================
                  STEP 3: PAYMENT & SUBMISSION
                  ============================================================= */}
              {currentStep === 3 && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="border-b border-line-soft pb-2">
                    <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                      <HiCreditCard className="text-primary" />
                      <span>৩. রেজিস্ট্রেশন ফি ও নিশ্চিতকরণ</span>
                    </h3>
                    <p className="text-xs text-ink-muted">
                      নির্ধারিত ফি পরিশোধ করে প্রেরক নম্বর ও TrxID প্রদান করুন।
                    </p>
                  </div>

                  {/* Send Money Guide Card */}
                  <div className="p-4 rounded-lg bg-gradient-to-br from-surface via-surface to-surface-lowest text-white border border-line-soft shadow-overlay space-y-3">
                    <div className="flex items-center justify-between border-b border-line-soft pb-2">
                      <div>
                        <span className="text-[10px] font-bold text-secondary uppercase tracking-wider block">
                          রেজিস্ট্রেশন ফি
                        </span>
                        <span className="text-xl font-black text-white">{REGISTRATION_FEE}</span>
                      </div>
                      <span className="px-2.5 py-1 rounded-full bg-primary-container/20 text-primary-300 text-xs font-bold border border-primary/30">
                        Send Money (ব্যক্তিগত)
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      <span className="text-xs text-ink-muted font-medium block">
                        বিকাশ (bKash) সেন্ড মানি নম্বর:
                      </span>
                      <div className="flex items-center justify-between p-2.5 rounded bg-surface-card/80 border border-line-soft">
                        <span className="text-base sm:text-lg font-black font-mono text-secondary tracking-wider">
                          {PAYMENT_SEND_NUMBER_DISPLAY}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopyPaymentNumber(PAYMENT_SEND_NUMBER)}
                          className="px-3 py-1 rounded bg-primary-container hover:bg-primary-container text-white text-xs font-bold flex items-center gap-1 transition active:scale-95 cursor-pointer"
                        >
                          {copiedPaymentNumber ? <HiCheck /> : <HiClipboardDocumentCheck />}
                          <span>{copiedPaymentNumber ? "কপি হয়েছে!" : "কপি"}</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Sender Number & TrxID */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-ink-body">
                        প্রেরক মোবাইল নম্বর (যেখান থেকে পাঠিয়েছেন) <span className="text-tertiary">*</span>
                      </label>
                      <input
                        type="tel"
                        name="senderNumber"
                        value={formData.senderNumber}
                        onChange={handleInputChange}
                        placeholder="01XXXXXXXXX"
                        required
                        className="w-full px-3.5 py-2.5 rounded bg-surface-lowest border border-line-soft text-xs sm:text-sm text-white focus:outline-none focus:border-primary/40 font-mono"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-ink-body">
                        ট্রানজেকশন আইডি (TrxID) <span className="text-tertiary">*</span>
                      </label>
                      <input
                        type="text"
                        name="trxId"
                        value={formData.trxId}
                        onChange={handleInputChange}
                        placeholder="উদা: BL98A2K5X"
                        required
                        className="w-full px-3.5 py-2.5 rounded bg-surface-lowest border border-line-soft text-xs sm:text-sm text-white focus:outline-none focus:border-primary/40 font-mono uppercase"
                      />
                    </div>
                  </div>

                  {/* Important Notice */}
                  <div className="p-3 rounded bg-secondary-container/10 border border-secondary/30 text-secondary text-xs font-medium space-y-1">
                    <p className="font-bold flex items-center gap-1">
                      <HiInformationCircle className="text-sm shrink-0" />
                      জরুরি নোটিশ:
                    </p>
                    <p className="text-[11px] leading-relaxed">
                      আবেদন জমা দেওয়ার পর অ্যাডমিন প্যানেলে আপনার পেমেন্ট যাচাই করা হবে। অনুমোদন সম্পন্ন হলে আপনার প্রদানকৃত WhatsApp নম্বরে <strong>রোল নম্বর, কেন্দ্র ও প্রবেশপত্র ডাউনলোড লিঙ্ক</strong> স্বয়ংক্রিয়ভাবে পাঠিয়ে দেওয়া হবে।
                    </p>
                  </div>
                </div>
              )}

              {/* =============================================================
                  NAVIGATION BUTTONS (Prev / Next / Submit)
                  ============================================================= */}
              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-line-soft">
                {currentStep > 1 ? (
                  <button
                    type="button"
                    onClick={handlePrevStep}
                    className="flex items-center justify-center gap-1.5 py-3 px-4 rounded bg-surface-card text-ink-body hover:bg-surface-overlay text-xs sm:text-sm font-bold transition active:scale-95 cursor-pointer"
                  >
                    <HiArrowLeft className="text-sm" />
                    <span>পূর্ববর্তী</span>
                  </button>
                ) : (
                  <div />
                )}

                {currentStep < 3 ? (
                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="flex items-center justify-center gap-1.5 py-3 px-4 rounded bg-gradient-to-r from-primary-container to-tertiary-container hover:from-primary-container hover:to-tertiary-container text-white text-xs sm:text-sm font-black transition active:scale-95 cursor-pointer col-start-2"
                  >
                    <span>পরবর্তী</span>
                    <HiArrowRight className="text-sm" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={submitting || uploadingPhoto}
                    className="flex items-center justify-center gap-1.5 py-3 px-4 rounded bg-gradient-to-r from-primary-container via-tertiary-container to-tertiary-container hover:from-primary-container hover:to-tertiary-container text-white text-xs sm:text-sm font-black transition active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed col-start-2"
                  >
                    {submitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>জমা হচ্ছে...</span>
                      </>
                    ) : (
                      <>
                        <HiCheck className="text-base" />
                        <span>আবেদন জমা দিন</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </form>
          </div>
        ) : (
          /* ===================================================================
              APPLICATION STATUS TRACKING TAB
              =================================================================== */
          <div className="p-4 sm:p-8 bg-surface border border-line-soft rounded-xl shadow-overlay space-y-6">
            <div className="border-b border-line-soft pb-2">
              <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                <HiQrCode className="text-primary" />
                <span>আবেদনের স্ট্যাটাস ও প্রবেশপত্র যাচাই</span>
              </h3>
              <p className="text-xs text-ink-muted">
                আপনার আবেদনের ট্র্যাকিং আইডি, রোল বা WhatsApp নম্বর দিয়ে বর্তমান অবস্থা জানুন।
              </p>
            </div>

            <form onSubmit={handleTrackSubmit} className="space-y-3">
              <div className="relative">
                <input
                  type="text"
                  value={trackIdInput}
                  onChange={(e) => setTrackIdInput(e.target.value)}
                  placeholder="ট্র্যাকিং আইডি (KKMB-2025-...) বা মোবাইল নম্বর লিখুন"
                  required
                  className="w-full pl-4 pr-24 py-3.5 rounded-lg bg-surface-lowest border border-line-soft text-xs sm:text-sm text-white focus:outline-none focus:border-primary/40 font-mono font-bold"
                />
                <button
                  type="submit"
                  disabled={trackingLoading}
                  className="absolute right-2 top-2 bottom-2 px-4 rounded bg-gradient-to-r from-primary-container to-tertiary-container text-white text-xs font-bold hover:scale-105 active:scale-95 transition disabled:opacity-50 cursor-pointer"
                >
                  {trackingLoading ? "খোঁজা হচ্ছে..." : "যাচাই করুন"}
                </button>
              </div>
            </form>

            {trackError && (
              <div className="p-4 rounded-lg bg-tertiary-container/10 border border-tertiary/30 text-tertiary text-xs font-bold text-center">
                {trackError}
              </div>
            )}

            {trackedRecord && (
              <div className="p-5 rounded-xl bg-surface-lowest border border-line-soft space-y-4 animate-scaleUp">
                <div className="flex items-center justify-between border-b border-line-soft pb-3">
                  <div>
                    <span className="text-[10px] text-ink-muted font-bold block">ট্র্যাকিং নম্বর:</span>
                    <span className="text-sm font-black font-mono text-primary">
                      {trackedRecord.trackingId}
                    </span>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-black ${
                      trackedRecord.status === "approved"
                        ? "bg-primary-container/20 text-primary-300 border border-primary/40"
                        : trackedRecord.status === "rejected"
                        ? "bg-tertiary-container/20 text-tertiary border border-tertiary/40"
                        : "bg-secondary-container/20 text-secondary border border-secondary/40"
                    }`}
                  >
                    {trackedRecord.status === "approved"
                      ? "✓ অনুমোদিত (Approved)"
                      : trackedRecord.status === "rejected"
                      ? "✕ বাতিল (Rejected)"
                      : "⏳ যাচাইাধীন (Pending)"}
                  </span>
                </div>

                <div className="space-y-2 text-xs sm:text-sm">
                  <div className="flex justify-between py-1 border-b border-line-soft">
                    <span className="text-ink-muted">নাম:</span>
                    <span className="font-bold text-white">{trackedRecord.nameBn}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-line-soft">
                    <span className="text-ink-muted">শ্রেণি:</span>
                    <span className="font-bold text-white">{trackedRecord.studentClass}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-line-soft">
                    <span className="text-ink-muted">প্রতিষ্ঠান:</span>
                    <span className="font-bold text-white">{trackedRecord.institution}</span>
                  </div>

                  {trackedRecord.status === "approved" && (
                    <>
                      <div className="flex justify-between py-1 border-b border-line-soft bg-primary-container/10 p-2 rounded">
                        <span className="text-primary-300 font-bold">অফিসিয়াল রোল:</span>
                        <span className="font-black font-mono text-base text-primary">
                          {trackedRecord.assignedRoll || "অ্যাসাইন প্রক্রিয়াধীন"}
                        </span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-line-soft">
                        <span className="text-ink-muted">পরীক্ষা কেন্দ্র:</span>
                        <span className="font-bold text-white">{trackedRecord.examCenter || "সিলেট সরকারি আলিয়া মাদরাসা কেন্দ্র"}</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-ink-muted">পরীক্ষার সময়:</span>
                        <span className="font-bold text-white">{trackedRecord.examDate || "২৪ অক্টোবর ২০২৫"} ({trackedRecord.examTime || "সকাল ১০:০০ টা"})</span>
                      </div>
                    </>
                  )}
                </div>

                {trackedRecord.status === "approved" && trackedRecord.assignedRoll && (
                  <Link
                    to={`/admit-card?roll=${trackedRecord.assignedRoll}`}
                    className="block w-full py-3 px-4 rounded bg-gradient-to-r from-primary-container to-tertiary-container text-white font-black text-center text-xs sm:text-sm hover:scale-[1.02] active:scale-95 transition"
                  >
                    🪪 অফিসিয়াল প্রবেশপত্র ডাউনলোড করুন →
                  </Link>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default OnlineRegistration;
