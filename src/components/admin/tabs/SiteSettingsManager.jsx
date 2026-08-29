import React, { useState, useEffect } from "react";
import {
  HiSparkles,
  HiAcademicCap,
  HiUserGroup,
  HiPlus,
  HiTrash,
  HiTrophy,
  HiCalendarDays,
  HiShieldCheck,
  HiStar,
  HiHeart,
  HiLightBulb,
  HiPhone,
  HiIdentification,
  HiListBullet,
} from "react-icons/hi2";
import { FaFacebookF, FaYoutube, FaWhatsapp, FaCalendarAlt, FaAward } from "react-icons/fa";
import { SubTabs, Toast } from "../ui";
import {
  getHomepageContent,
  saveHomepageContent,
  getImpactStats,
  saveImpactStats,
  DEFAULT_IMPACT_STATS,
  getContactSettings,
  saveContactSettings,
  DEFAULT_CONTACT_SETTINGS,
  getImportantDates,
  saveImportantDates,
  DEFAULT_IMPORTANT_DATES,
  getAdmitCardSettings,
  saveAdmitCardSettings,
  DEFAULT_ADMIT_CARD_SETTINGS,
} from "../../../services/firestore";

const DEFAULT_SETTINGS = {
  hero: {
    badge: "কিশোরকণ্ঠ মেধাবৃত্তি - ২০২৬",
    title: "কিশোরকণ্ঠ পাঠক ফোরাম",
    subtitle: "সিলেট জেলা পশ্চিম",
    description: "নৈতিকতা ও মেধার সমন্বয়ে এক নতুন প্রজন্ম গড়ার প্রত্যয়ে আমাদের পথচলা।",
    stat1: "মেধাবৃত্তি",
    stat2: "ফোরাম",
    stat3: "পাঠচক্র",
  },
  about: {
    badge: "আমাদের সম্পর্কে",
    title: "মেধা ও মনন বিকাশে",
    highlightedTitle: "আমাদের পথচলা",
    description: "কিশোরকণ্ঠ পাঠক ফোরাম, সিলেট জেলা পশ্চিম ১৯৯৪ সালে প্রতিষ্ঠিত একটি স্বেচ্ছাসেবী সংগঠন। শিক্ষার্থীদের মেধা অন্বেষণ, নৈতিক চরিত্র গঠন এবং সুস্থ সংস্কৃতির বিকাশে নিরলসভাবে কাজ করে যাচ্ছি।",
    videoTitle: "কিশোরকণ্ঠ মেধাবৃত্তি-২০২৬",
    videoUrl: "https://www.facebook.com/61550084636519/videos/1560922935088975/",
    feature1Title: "মেধাবৃত্তি পরীক্ষা",
    feature1Desc: "শিক্ষার্থীদের সুপ্ত প্রতিভা অন্বেষণে প্রতি বছর আমরা আয়োজন করি বিশাল মেধাবৃত্তি পরীক্ষা।",
    feature2Title: "নৈতিক শিক্ষা",
    feature2Desc: "পুথিগত বিদ্যার পাশাপাশি আমরা গুরুত্ব দেই সততা, দেশপ্রেম এবং নৈতিক মূল্যবোধের ওপর।",
  },
};

const ICON_OPTIONS = [
  { id: "trophy", label: "🏆 ট্রফি (Trophy)", icon: HiTrophy },
  { id: "users", label: "👥 শিক্ষার্থী / দল (Users)", icon: HiUserGroup },
  { id: "calendar", label: "📅 ক্যালেন্ডার / বছর (Calendar)", icon: HiCalendarDays },
  { id: "shield", label: "🛡️ নিরাপত্তা / নিরপেক্ষতা (Shield)", icon: HiShieldCheck },
  { id: "academic", label: "🎓 শিক্ষা / একাডেমি (Academic)", icon: HiAcademicCap },
  { id: "star", label: "⭐ তারকা / সাফল্য (Star)", icon: HiStar },
  { id: "heart", label: "❤️ সেবা / মানবকল্যাণ (Heart)", icon: HiHeart },
  { id: "lightbulb", label: "💡 জ্ঞান / মেধা (Lightbulb)", icon: HiLightBulb },
];

const COLOR_OPTIONS = [
  { id: "emerald", label: "Emerald (পান্না সবুজ)", badge: "bg-primary-500/20 text-primary-400 border-primary-500/40" },
  { id: "sky", label: "Sky (আকাশী নীল)", badge: "bg-tertiary/20 text-tertiary border-tertiary/40" },
  { id: "amber", label: "Amber (স্বর্ণালী হলুদ)", badge: "bg-secondary/20 text-secondary border-secondary/40" },
  { id: "indigo", label: "Indigo (গাঢ় নীল)", badge: "bg-primary/20 text-primary border-primary/40" },
  { id: "purple", label: "Purple (বেগুনী)", badge: "bg-tertiary/20 text-tertiary border-tertiary/40" },
  { id: "rose", label: "Rose (গোলাপী লাল)", badge: "bg-error/20 text-error border-error/40" },
  { id: "teal", label: "Teal (সবুজ-নীল)", badge: "bg-tertiary/20 text-tertiary border-tertiary/40" },
];

const SiteSettingsManager = () => {
  const [activeSubTab, setActiveSubTab] = useState("contact"); // 'contact' | 'dates' | 'admit' | 'stats' | 'general'
  const [formData, setFormData] = useState(DEFAULT_SETTINGS);
  const [statsList, setStatsList] = useState(DEFAULT_IMPACT_STATS);
  const [contactData, setContactData] = useState(DEFAULT_CONTACT_SETTINGS);
  const [datesData, setDatesData] = useState(DEFAULT_IMPORTANT_DATES);
  const [admitData, setAdmitData] = useState(DEFAULT_ADMIT_CARD_SETTINGS);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [contentData, loadedStats, loadedContact, loadedDates, loadedAdmit] = await Promise.all([
        getHomepageContent(),
        getImpactStats(),
        getContactSettings(),
        getImportantDates(),
        getAdmitCardSettings(),
      ]);

      if (contentData) {
        setFormData({
          hero: { ...DEFAULT_SETTINGS.hero, ...contentData.hero },
          about: { ...DEFAULT_SETTINGS.about, ...contentData.about },
        });
      }
      if (loadedStats && loadedStats.length > 0) setStatsList(loadedStats);
      if (loadedContact) setContactData(loadedContact);
      if (loadedDates) setDatesData(loadedDates);
      if (loadedAdmit) setAdmitData(loadedAdmit);
    } catch (err) {
      console.error("Load site settings error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const showToast = (text, type = "success") => {
    setStatusMessage({ type, text });
    setTimeout(() => setStatusMessage(null), 4000);
  };

  // 1. Save Contact & Footer
  const handleSaveContact = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await saveContactSettings(contactData);
      showToast("ফুটার ও গ্লোবাল কন্টাক্ট সেটিংস সফলভাবে সংরক্ষিত হয়েছে!");
    } catch (e) {
      showToast("সংরক্ষণ করতে সমস্যা হয়েছে!", "error");
    } finally {
      setSaving(false);
    }
  };

  // 2. Save Important Dates
  const handleSaveDates = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await saveImportantDates(datesData);
      showToast("গুরুত্বপূর্ণ তারিখ ও কাউন্টডাউন টাইমার সফলভাবে সংরক্ষিত হয়েছে!");
    } catch (e) {
      showToast("সংরক্ষণ করতে সমস্যা হয়েছে!", "error");
    } finally {
      setSaving(false);
    }
  };

  // 3. Save Admit Card Settings & Rules
  const handleSaveAdmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await saveAdmitCardSettings(admitData);
      showToast("প্রবেশপত্রের ডিফল্ট ও সাধারণ নিয়মাবলি সফলভাবে সংরক্ষিত হয়েছে!");
    } catch (e) {
      showToast("সংরক্ষণ করতে সমস্যা হয়েছে!", "error");
    } finally {
      setSaving(false);
    }
  };

  // 4. Save Stats
  const handleSaveStats = async () => {
    setSaving(true);
    try {
      await saveImpactStats(statsList);
      showToast("পরিসংখ্যান কার্ডসমূহ সফলভাবে আপডেট করা হয়েছে!");
    } catch (err) {
      showToast("সংরক্ষণ করতে সমস্যা হয়েছে!", "error");
    } finally {
      setSaving(false);
    }
  };

  // 5. Save General
  const handleSaveGeneral = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await saveHomepageContent(formData);
      showToast("সাধারণ তথ্য সফলভাবে আপডেট করা হয়েছে!");
    } catch (err) {
      showToast("সংরক্ষণ করতে সমস্যা হয়েছে!", "error");
    } finally {
      setSaving(false);
    }
  };

  // Rules List helpers
  const handleAddRule = () => {
    setAdmitData((prev) => ({
      ...prev,
      rules: [...(prev.rules || []), "নতুন পরীক্ষা সংক্রান্ত নিয়মাবলি..."],
    }));
  };

  const handleUpdateRule = (index, text) => {
    setAdmitData((prev) => {
      const updated = [...(prev.rules || [])];
      updated[index] = text;
      return { ...prev, rules: updated };
    });
  };

  const handleDeleteRule = (index) => {
    setAdmitData((prev) => ({
      ...prev,
      rules: prev.rules.filter((_, i) => i !== index),
    }));
  };

  if (loading) {
    return <div className="p-8 text-center text-ink-muted">লোড হচ্ছে...</div>;
  }

  return (
    <div className="space-y-6 text-ink-strong font-sans">
      

      <Toast message={statusMessage} onDismiss={() => setStatusMessage(null)} />

      <SubTabs
        value={activeSubTab}
        onChange={setActiveSubTab}
        tabs={[
          { id: "contact", label: "ফুটার ও যোগাযোগ", icon: HiPhone },
          { id: "dates", label: "তারিখ ও কাউন্টডাউন", icon: HiCalendarDays },
          { id: "admit", label: "প্রবেশপত্রের নিয়ম", icon: HiIdentification },
          { id: "stats", label: "মূল পরিসংখ্যান", icon: HiTrophy },
          { id: "general", label: "সাধারণ তথ্য", icon: HiSparkles },
        ]}
      />

      {/* ===================================================================
          SUBTAB 1: FOOTER & GLOBAL CONTACT SETTINGS
          =================================================================== */}
      {activeSubTab === "contact" && (
        <form onSubmit={handleSaveContact} className="p-5 sm:p-6 bg-surface-card border border-line-soft rounded-lg space-y-6 shadow-none animate-fadeIn">
          <div className="border-b border-line-soft pb-3">
            <h3 className="text-base sm:text-lg font-semibold text-ink-strong flex items-center gap-2">
              <HiPhone className="text-primary-400" />
              <span>ফুটার ও কন্টাক্ট ইনফরমেশন সেটিংস</span>
            </h3>
            <p className="text-[13px] text-ink-muted mt-0.5">
              এখানে পরিবর্তন করলে ফুটার, কন্টাক্ট পেজ এবং হেল্পলাইনে তাত্ক্ষণিক লাইভ আপডেট হবে।
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-[13px] font-bold text-ink-body mb-1.5">
                সংগঠনের নাম *
              </label>
              <input
                type="text"
                value={contactData.organizationName}
                onChange={(e) => setContactData({ ...contactData, organizationName: e.target.value })}
                required
                className="w-full px-4 py-3 bg-surface border border-line-soft rounded text-ink-strong text-[13px] sm:text-sm font-bold focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-[13px] font-bold text-ink-body mb-1.5">
                শাখার নাম *
              </label>
              <input
                type="text"
                value={contactData.branchName}
                onChange={(e) => setContactData({ ...contactData, branchName: e.target.value })}
                required
                className="w-full px-4 py-3 bg-surface border border-line-soft rounded text-ink-strong text-[13px] sm:text-sm font-bold focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-[13px] font-bold text-ink-body mb-1.5">
                প্রতিষ্ঠা সাল
              </label>
              <input
                type="text"
                value={contactData.establishedYear}
                onChange={(e) => setContactData({ ...contactData, establishedYear: e.target.value })}
                className="w-full px-4 py-3 bg-surface border border-line-soft rounded text-ink-strong text-[13px] sm:text-sm font-bold focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-[13px] font-bold text-ink-body mb-1.5">
                প্রধান হেল্পলাইন ফোন *
              </label>
              <input
                type="text"
                value={contactData.helplinePrimary}
                onChange={(e) => setContactData({ ...contactData, helplinePrimary: e.target.value })}
                required
                className="w-full px-4 py-3 bg-surface border border-line-soft rounded text-ink-strong text-[13px] sm:text-sm font-bold focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-[13px] font-bold text-ink-body mb-1.5">
                বিকল্প হেল্পলাইন ফোন
              </label>
              <input
                type="text"
                value={contactData.helplineSecondary}
                onChange={(e) => setContactData({ ...contactData, helplineSecondary: e.target.value })}
                className="w-full px-4 py-3 bg-surface border border-line-soft rounded text-ink-strong text-[13px] sm:text-sm font-bold focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-[13px] font-bold text-ink-body mb-1.5">
                অফিসিয়াল হোয়াটসঅ্যাপ নম্বর *
              </label>
              <input
                type="text"
                value={contactData.whatsappNumber}
                onChange={(e) => setContactData({ ...contactData, whatsappNumber: e.target.value })}
                required
                className="w-full px-4 py-3 bg-surface border border-line-soft rounded text-ink-strong text-[13px] sm:text-sm font-bold focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-[13px] font-bold text-ink-body mb-1.5">
                অফিসিয়াল ইমেইল এড্রেস *
              </label>
              <input
                type="email"
                value={contactData.email}
                onChange={(e) => setContactData({ ...contactData, email: e.target.value })}
                required
                className="w-full px-4 py-3 bg-surface border border-line-soft rounded text-ink-strong text-[13px] sm:text-sm font-medium focus:outline-none focus:border-primary font-mono"
              />
            </div>

            <div>
              <label className="block text-[13px] font-bold text-ink-body mb-1.5">
                ফেসবুক পেজ লিংক (Facebook URL)
              </label>
              <input
                type="url"
                value={contactData.facebookUrl}
                onChange={(e) => setContactData({ ...contactData, facebookUrl: e.target.value })}
                className="w-full px-4 py-3 bg-surface border border-line-soft rounded text-ink-strong text-[13px] sm:text-sm font-mono focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-[13px] font-bold text-ink-body mb-1.5">
                ইউটিউব চ্যানেল লিংক (YouTube URL)
              </label>
              <input
                type="url"
                value={contactData.youtubeUrl}
                onChange={(e) => setContactData({ ...contactData, youtubeUrl: e.target.value })}
                className="w-full px-4 py-3 bg-surface border border-line-soft rounded text-ink-strong text-[13px] sm:text-sm font-mono focus:outline-none focus:border-primary"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-[13px] font-bold text-ink-body mb-1.5">
                অফিস ঠিকানা (Office Address) *
              </label>
              <input
                type="text"
                value={contactData.officeAddress}
                onChange={(e) => setContactData({ ...contactData, officeAddress: e.target.value })}
                required
                className="w-full px-4 py-3 bg-surface border border-line-soft rounded text-ink-strong text-[13px] sm:text-sm font-medium focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-[13px] font-bold text-ink-body mb-1.5">
                অফিসের সময়সূচী (Office Hours)
              </label>
              <input
                type="text"
                value={contactData.officeHours}
                onChange={(e) => setContactData({ ...contactData, officeHours: e.target.value })}
                className="w-full px-4 py-3 bg-surface border border-line-soft rounded text-ink-strong text-[13px] sm:text-sm font-medium focus:outline-none focus:border-primary"
              />
            </div>

            <div className="sm:col-span-3">
              <label className="block text-[13px] font-bold text-ink-body mb-1.5">
                ফুটার বায়ো / স্লোগান (Footer Bio)
              </label>
              <textarea
                rows={2}
                value={contactData.bio}
                onChange={(e) => setContactData({ ...contactData, bio: e.target.value })}
                className="w-full px-4 py-3 bg-surface border border-line-soft rounded text-ink-strong text-[13px] sm:text-sm font-medium focus:outline-none focus:border-primary leading-relaxed"
              />
            </div>

            <div className="sm:col-span-3">
              <label className="block text-[13px] font-bold text-ink-body mb-1.5">
                ফুটার কপিরাইট টেক্সট (Copyright Notice)
              </label>
              <input
                type="text"
                value={contactData.copyrightText}
                onChange={(e) => setContactData({ ...contactData, copyrightText: e.target.value })}
                className="w-full px-4 py-3 bg-surface border border-line-soft rounded text-ink-strong text-[13px] sm:text-sm font-medium focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-8 py-3 bg-gradient-to-r from-primary-500 to-tertiary hover:from-primary-400 hover:to-tertiary text-primary-on font-semibold rounded text-[13px] sm:text-sm shadow-none transition cursor-pointer disabled:opacity-50 flex items-center gap-2"
            >
              {saving ? "সংরক্ষণ হচ্ছে..." : "ফুটার সেটিংস সংরক্ষণ করুন"}
            </button>
          </div>
        </form>
      )}

      {/* ===================================================================
          SUBTAB 2: IMPORTANT DATES & COUNTDOWN TIMER
          =================================================================== */}
      {activeSubTab === "dates" && (
        <form onSubmit={handleSaveDates} className="p-5 sm:p-6 bg-surface-card border border-line-soft rounded-lg space-y-6 shadow-none animate-fadeIn">
          <div className="border-b border-line-soft pb-3">
            <h3 className="text-base sm:text-lg font-semibold text-ink-strong flex items-center gap-2">
              <HiCalendarDays className="text-secondary" />
              <span>গুরুত্বপূর্ণ পরীক্ষার তারিখ ও লাইভ কাউন্টডাউন সেটিংস</span>
            </h3>
            <p className="text-[13px] text-ink-muted mt-0.5">
              এখানে নির্ধারিত তারিখ অনুযায়ী ওয়েবসাইট হোমপেজ ও স্কলারশিপ পেজের কাউন্টডাউন টাইমার সরাসরি পরিচালিত হবে।
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-[13px] font-bold text-ink-body mb-1.5">
                পরীক্ষার শিক্ষাবর্ষ (Exam Year)
              </label>
              <input
                type="text"
                value={datesData.examYear}
                onChange={(e) => setDatesData({ ...datesData, examYear: e.target.value })}
                className="w-full px-4 py-3 bg-surface border border-line-soft rounded text-ink-strong text-[13px] sm:text-sm font-bold focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-[13px] font-bold text-ink-body mb-1.5">
                কাউন্টডাউনের মূল লক্ষ্য (Active Countdown Target)
              </label>
              <select
                value={datesData.activeCountdownTarget || "examDate"}
                onChange={(e) => setDatesData({ ...datesData, activeCountdownTarget: e.target.value })}
                className="w-full px-4 py-3 bg-surface border border-line-soft rounded text-ink-strong text-[13px] sm:text-sm font-bold focus:outline-none focus:border-primary"
              >
                <option value="registrationDeadline">📝 অনলাইন রেজিস্ট্রেশনের শেষ সময়</option>
                <option value="examDate">🎯 পরীক্ষার দিন ও সময়</option>
                <option value="resultPublishDate">🏆 ফলাফল প্রকাশের দিন</option>
              </select>
            </div>

            <div className="sm:col-span-1">
              <label className="block text-[13px] font-bold text-ink-body mb-1.5">
                পরীক্ষার তারিখ ও বার (বাংলা টেক্সট) *
              </label>
              <input
                type="text"
                value={datesData.examDateBn}
                onChange={(e) => setDatesData({ ...datesData, examDateBn: e.target.value })}
                required
                className="w-full px-4 py-3 bg-surface border border-line-soft rounded text-ink-strong text-[13px] sm:text-sm font-bold focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-[13px] font-bold text-ink-body mb-1.5">
                পরীক্ষার সময়সূচী (বাংলা টেক্সট) *
              </label>
              <input
                type="text"
                value={datesData.examTimeBn}
                onChange={(e) => setDatesData({ ...datesData, examTimeBn: e.target.value })}
                required
                className="w-full px-4 py-3 bg-surface border border-line-soft rounded text-ink-strong text-[13px] sm:text-sm font-bold focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-[13px] font-bold text-ink-body mb-1.5">
                পরীক্ষার তারিখ ও সময় (ISO DateTime for Timer) *
              </label>
              <input
                type="datetime-local"
                value={datesData.examDate?.substring(0, 16) || ""}
                onChange={(e) => setDatesData({ ...datesData, examDate: e.target.value })}
                required
                className="w-full px-4 py-3 bg-surface border border-line-soft rounded text-ink-strong text-[13px] sm:text-sm font-mono focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-[13px] font-bold text-ink-body mb-1.5">
                রেজিস্ট্রেশনের শেষ সময় (ISO DateTime) *
              </label>
              <input
                type="datetime-local"
                value={datesData.registrationDeadline?.substring(0, 16) || ""}
                onChange={(e) => setDatesData({ ...datesData, registrationDeadline: e.target.value })}
                required
                className="w-full px-4 py-3 bg-surface border border-line-soft rounded text-ink-strong text-[13px] sm:text-sm font-mono focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-[13px] font-bold text-ink-body mb-1.5">
                রেজিস্ট্রেশন শেষ তারিখ (বাংলা টেক্সট) *
              </label>
              <input
                type="text"
                value={datesData.registrationDeadlineBn}
                onChange={(e) => setDatesData({ ...datesData, registrationDeadlineBn: e.target.value })}
                required
                className="w-full px-4 py-3 bg-surface border border-line-soft rounded text-ink-strong text-[13px] sm:text-sm font-bold focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-[13px] font-bold text-ink-body mb-1.5">
                প্রবেশপত্র বিতরণের তারিখ (বাংলা টেক্সট)
              </label>
              <input
                type="text"
                value={datesData.admitCardReleaseDateBn}
                onChange={(e) => setDatesData({ ...datesData, admitCardReleaseDateBn: e.target.value })}
                className="w-full px-4 py-3 bg-surface border border-line-soft rounded text-ink-strong text-[13px] sm:text-sm font-bold focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-[13px] font-bold text-ink-body mb-1.5">
                ফলাফল প্রকাশের তারিখ (বাংলা টেক্সট)
              </label>
              <input
                type="text"
                value={datesData.resultPublishDateBn}
                onChange={(e) => setDatesData({ ...datesData, resultPublishDateBn: e.target.value })}
                className="w-full px-4 py-3 bg-surface border border-line-soft rounded text-ink-strong text-[13px] sm:text-sm font-bold focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-[13px] font-bold text-ink-body mb-1.5">
                পুরস্কার বিতরণী তারিখ (বাংলা টেক্সট)
              </label>
              <input
                type="text"
                value={datesData.prizeDistributionDateBn}
                onChange={(e) => setDatesData({ ...datesData, prizeDistributionDateBn: e.target.value })}
                className="w-full px-4 py-3 bg-surface border border-line-soft rounded text-ink-strong text-[13px] sm:text-sm font-bold focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-8 py-3 bg-gradient-to-r from-primary-500 to-tertiary hover:from-primary-400 hover:to-tertiary text-primary-on font-semibold rounded text-[13px] sm:text-sm shadow-none transition cursor-pointer disabled:opacity-50 flex items-center gap-2"
            >
              {saving ? "সংরক্ষণ হচ্ছে..." : "তারিখ ও কাউন্টডাউন সংরক্ষণ করুন"}
            </button>
          </div>
        </form>
      )}

      {/* ===================================================================
          SUBTAB 3: ADMIT CARD DEFAULTS & PRINTED RULES
          =================================================================== */}
      {activeSubTab === "admit" && (
        <form onSubmit={handleSaveAdmit} className="p-5 sm:p-6 bg-surface-card border border-line-soft rounded-lg space-y-6 shadow-none animate-fadeIn">
          <div className="border-b border-line-soft pb-3">
            <h3 className="text-base sm:text-lg font-semibold text-ink-strong flex items-center gap-2">
              <HiIdentification className="text-error" />
              <span>প্রবেশপত্রের ডিফল্ট তথ্য ও পরীক্ষা সংক্রান্ত নিয়মাবলি</span>
            </h3>
            <p className="text-[13px] text-ink-muted mt-0.5">
              প্রবেশপত্রে স্বয়ংক্রিয়ভাবে প্রিন্ট হওয়া ডিফল্ট কেন্দ্র, সময়সূচী, বিষয় ও নিচের ৮টি নিয়মাবলি এখান থেকে সরাসরি এডিট করুন।
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-[13px] font-bold text-ink-body mb-1.5">
                ডিফল্ট পরীক্ষা কেন্দ্র (Default Center) *
              </label>
              <input
                type="text"
                value={admitData.defaultCenter}
                onChange={(e) => setAdmitData({ ...admitData, defaultCenter: e.target.value })}
                required
                className="w-full px-4 py-3 bg-surface border border-line-soft rounded text-ink-strong text-[13px] sm:text-sm font-bold focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-[13px] font-bold text-ink-body mb-1.5">
                ডিফল্ট পরীক্ষার তারিখ ও বার *
              </label>
              <input
                type="text"
                value={admitData.defaultExamDate}
                onChange={(e) => setAdmitData({ ...admitData, defaultExamDate: e.target.value })}
                required
                className="w-full px-4 py-3 bg-surface border border-line-soft rounded text-ink-strong text-[13px] sm:text-sm font-bold focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-[13px] font-bold text-ink-body mb-1.5">
                ডিফল্ট পরীক্ষার সময় *
              </label>
              <input
                type="text"
                value={admitData.defaultExamTime}
                onChange={(e) => setAdmitData({ ...admitData, defaultExamTime: e.target.value })}
                required
                className="w-full px-4 py-3 bg-surface border border-line-soft rounded text-ink-strong text-[13px] sm:text-sm font-bold focus:outline-none focus:border-primary"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-[13px] font-bold text-ink-body mb-1.5">
                পরীক্ষার বিষয়সমূহ (Subjects list in table) *
              </label>
              <input
                type="text"
                value={admitData.defaultSubjects}
                onChange={(e) => setAdmitData({ ...admitData, defaultSubjects: e.target.value })}
                required
                className="w-full px-4 py-3 bg-surface border border-line-soft rounded text-ink-strong text-[13px] sm:text-sm font-medium focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-[13px] font-bold text-ink-body mb-1.5">
                পরীক্ষা নিয়ন্ত্রকের পদবি
              </label>
              <input
                type="text"
                value={admitData.controllerTitle}
                onChange={(e) => setAdmitData({ ...admitData, controllerTitle: e.target.value })}
                className="w-full px-4 py-3 bg-surface border border-line-soft rounded text-ink-strong text-[13px] sm:text-sm font-bold focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-[13px] font-bold text-ink-body mb-1.5">
                সিলমোহরের টেক্সট (Seal Centre)
              </label>
              <div className="grid grid-cols-3 gap-2">
                <input
                  type="text"
                  value={admitData.sealText1 || "SEAL"}
                  onChange={(e) => setAdmitData({ ...admitData, sealText1: e.target.value })}
                  placeholder="SEAL"
                  className="px-2 py-3 bg-surface border border-line-soft rounded text-ink-strong text-[13px] font-mono text-center"
                />
                <input
                  type="text"
                  value={admitData.sealText2 || "KKMB"}
                  onChange={(e) => setAdmitData({ ...admitData, sealText2: e.target.value })}
                  placeholder="KKMB"
                  className="px-2 py-3 bg-surface border border-line-soft rounded text-ink-strong text-[13px] font-mono text-center font-bold"
                />
                <input
                  type="text"
                  value={admitData.sealText3 || "SYLHET"}
                  onChange={(e) => setAdmitData({ ...admitData, sealText3: e.target.value })}
                  placeholder="SYLHET"
                  className="px-2 py-3 bg-surface border border-line-soft rounded text-ink-strong text-[13px] font-mono text-center"
                />
              </div>
            </div>
          </div>

          {/* Printed Rules List Builder */}
          <div className="space-y-3 pt-3 border-t border-line-soft">
            <div className="flex items-center justify-between">
              <label className="text-[13px] sm:text-sm font-bold text-ink-body flex items-center gap-2">
                <HiListBullet className="text-error text-base" />
                <span>প্রবেশপত্রে মুদ্রিত সাধারণ নিয়মাবলি (Rules List)</span>
              </label>
              <button
                type="button"
                onClick={handleAddRule}
                className="px-3 py-1.5 bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30 rounded text-[13px] font-bold flex items-center gap-1 transition cursor-pointer"
              >
                <HiPlus /> নতুন নিয়ম যোগ করুন
              </button>
            </div>

            <div className="space-y-2.5">
              {(admitData.rules || []).map((rule, idx) => (
                <div key={idx} className="flex items-center gap-2 bg-surface p-2.5 rounded border border-line-soft">
                  <span className="w-6 h-6 rounded-full bg-error/20 text-error border border-error/30 flex items-center justify-center text-[13px] font-bold shrink-0">
                    {idx + 1}
                  </span>
                  <input
                    type="text"
                    value={rule}
                    onChange={(e) => handleUpdateRule(idx, e.target.value)}
                    className="flex-1 bg-transparent border-none text-[13px] sm:text-sm text-ink-strong font-medium focus:outline-none"
                    placeholder="নিয়ম লিখুন..."
                  />
                  <button
                    type="button"
                    onClick={() => handleDeleteRule(idx)}
                    className="p-1.5 text-ink-muted hover:text-error transition cursor-pointer"
                    title="মুছে ফেলুন"
                  >
                    <HiTrash className="text-base" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-8 py-3 bg-gradient-to-r from-primary-500 to-tertiary hover:from-primary-400 hover:to-tertiary text-primary-on font-semibold rounded text-[13px] sm:text-sm shadow-none transition cursor-pointer disabled:opacity-50 flex items-center gap-2"
            >
              {saving ? "সংরক্ষণ হচ্ছে..." : "প্রবেশপত্রের সেটিংস সংরক্ষণ করুন"}
            </button>
          </div>
        </form>
      )}

      {/* ===================================================================
          SUBTAB 4: STATS CRUD
          =================================================================== */}
      {activeSubTab === "stats" && (
        <div className="p-5 sm:p-6 bg-surface-card border border-line-soft rounded-lg space-y-6 shadow-none animate-fadeIn">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line-soft pb-3">
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-ink-strong flex items-center gap-2">
                <HiTrophy className="text-secondary" />
                <span>মূল পরিসংখ্যান কার্ডসমূহ (Impact Stats Cards)</span>
              </h3>
              <p className="text-[13px] text-ink-muted mt-0.5">
                হোমপেজ ও বিভিন্ন পেজে প্রদর্শিত মূল পরিসংখ্যান কার্ডগুলো যোগ, পরিবর্তন বা মুছে ফেলুন।
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setStatsList([
                  ...statsList,
                  {
                    id: `stat_${Date.now()}`,
                    number: "১০০+",
                    label: "নতুন অর্জন",
                    iconType: "academic",
                    color: "emerald",
                  },
                ]);
              }}
              className="px-4 py-2 bg-primary-500 hover:bg-primary-400 text-primary-on font-semibold text-[13px] rounded shadow transition cursor-pointer flex items-center gap-1.5"
            >
              <HiPlus /> নতুন কার্ড যোগ করুন
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {statsList.map((stat, idx) => (
              <div key={stat.id || idx} className="p-4 bg-surface border border-line-soft rounded space-y-3 relative">
                <div className="flex items-center justify-between">
                  <span className="text-[13px] font-bold text-ink-muted">কার্ড #{idx + 1}</span>
                  <button
                    type="button"
                    onClick={() => setStatsList(statsList.filter((_, i) => i !== idx))}
                    className="text-ink-muted hover:text-error transition cursor-pointer p-1"
                    title="মুছে ফেলুন"
                  >
                    <HiTrash className="text-base" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[13px] font-bold text-ink-muted mb-1">সংখ্যা (যেমন: ৮০০+)</label>
                    <input
                      type="text"
                      value={stat.number}
                      onChange={(e) => {
                        const upd = [...statsList];
                        upd[idx].number = e.target.value;
                        setStatsList(upd);
                      }}
                      className="w-full px-3 py-2 bg-surface-card border border-line-soft rounded-lg text-ink-strong font-bold text-[13px]"
                    />
                  </div>

                  <div>
                    <label className="block text-[13px] font-bold text-ink-muted mb-1">আইকন</label>
                    <select
                      value={stat.iconType || "trophy"}
                      onChange={(e) => {
                        const upd = [...statsList];
                        upd[idx].iconType = e.target.value;
                        setStatsList(upd);
                      }}
                      className="w-full px-3 py-2 bg-surface-card border border-line-soft rounded-lg text-ink-strong font-bold text-[13px]"
                    >
                      {ICON_OPTIONS.map((ico) => (
                        <option key={ico.id} value={ico.id}>{ico.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="col-span-2">
                    <label className="block text-[13px] font-bold text-ink-muted mb-1">লেবেল / বিবরণ (Label)</label>
                    <input
                      type="text"
                      value={stat.label}
                      onChange={(e) => {
                        const upd = [...statsList];
                        upd[idx].label = e.target.value;
                        setStatsList(upd);
                      }}
                      className="w-full px-3 py-2 bg-surface-card border border-line-soft rounded-lg text-ink-strong font-medium text-[13px]"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="button"
              onClick={handleSaveStats}
              disabled={saving}
              className="px-8 py-3 bg-gradient-to-r from-primary-500 to-tertiary hover:from-primary-400 hover:to-tertiary text-primary-on font-semibold rounded text-[13px] sm:text-sm shadow-none transition cursor-pointer disabled:opacity-50"
            >
              {saving ? "সংরক্ষণ হচ্ছে..." : "পরিসংখ্যান সংরক্ষণ করুন"}
            </button>
          </div>
        </div>
      )}

      {/* ===================================================================
          SUBTAB 5: GENERAL INFO
          =================================================================== */}
      {activeSubTab === "general" && (
        <form onSubmit={handleSaveGeneral} className="p-5 sm:p-6 bg-surface-card border border-line-soft rounded-lg space-y-6 shadow-none animate-fadeIn">
          <div className="border-b border-line-soft pb-3">
            <h3 className="text-base sm:text-lg font-semibold text-ink-strong flex items-center gap-2">
              <HiSparkles className="text-tertiary" />
              <span>সাধারণ টেক্সট ও টাইটেল কনফিগারেশন</span>
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[13px] font-bold text-ink-body mb-1.5">হিরো ব্যাজ টেক্সট</label>
              <input
                type="text"
                value={formData.hero.badge}
                onChange={(e) => setFormData({ ...formData, hero: { ...formData.hero, badge: e.target.value } })}
                className="w-full px-4 py-3 bg-surface border border-line-soft rounded text-ink-strong text-[13px] sm:text-sm font-bold focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[13px] font-bold text-ink-body mb-1.5">হিরো টাইটেল</label>
              <input
                type="text"
                value={formData.hero.title}
                onChange={(e) => setFormData({ ...formData, hero: { ...formData.hero, title: e.target.value } })}
                className="w-full px-4 py-3 bg-surface border border-line-soft rounded text-ink-strong text-[13px] sm:text-sm font-bold focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-[13px] font-bold text-ink-body mb-1.5">হিরো বিবরণ</label>
              <textarea
                rows={2}
                value={formData.hero.description}
                onChange={(e) => setFormData({ ...formData, hero: { ...formData.hero, description: e.target.value } })}
                className="w-full px-4 py-3 bg-surface border border-line-soft rounded text-ink-strong text-[13px] sm:text-sm font-medium focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-8 py-3 bg-gradient-to-r from-primary-500 to-tertiary hover:from-primary-400 hover:to-tertiary text-primary-on font-semibold rounded text-[13px] sm:text-sm shadow-none transition cursor-pointer disabled:opacity-50"
            >
              {saving ? "সংরক্ষণ হচ্ছে..." : "সাধারণ তথ্য সংরক্ষণ করুন"}
            </button>
          </div>
        </form>
      )}

    </div>
  );
};

export default SiteSettingsManager;
