import React, { useState, useEffect } from "react";
import {
  HiCheckCircle,
} from "react-icons/hi2";
import { getAnnouncement, saveAnnouncement } from "../../../services/firestore";
import { Toast } from "../ui";

const AnnouncementManager = () => {
  const [formData, setFormData] = useState({
    enabled: true,
    title: "জরুরি ঘোষণা",
    message: "কিশোরকণ্ঠ মেধাবৃত্তি ২০২৫-এর অনলাইন রেজিস্ট্রেশন চলছে! আপনার প্রবেশপত্র ডাউনলোড করতে প্রবেশপত্র মেনুতে ক্লিক করুন।",
    linkText: "প্রবেশপত্র ডাউনলোড →",
    linkUrl: "/admit-card",
    badgeType: "urgent", // 'urgent' | 'info' | 'success' | 'amber'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  useEffect(() => {
    getAnnouncement().then((data) => {
      if (data) {
        setFormData((prev) => ({
          ...prev,
          ...data,
        }));
      }
      setLoading(false);
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setStatusMessage(null);

    try {
      await saveAnnouncement(formData);
      setStatusMessage({
        type: "success",
        text: "ব্রেকিং নিউজ / টপ এনাউন্সমেন্ট বার সফলভাবে আপডেট ও প্রকাশিত হয়েছে!",
      });
      setTimeout(() => setStatusMessage(null), 4000);
    } catch (err) {
      console.error(err);
      setStatusMessage({
        type: "error",
        text: "সংরক্ষণ করতে সমস্যা হয়েছে!",
      });
    } finally {
      setSaving(false);
    }
  };

  // Quick preset templates
  const applyPreset = (preset) => {
    setFormData((prev) => ({
      ...prev,
      ...preset,
    }));
  };

  if (loading) {
    return <div className="p-8 text-center text-ink-muted">লোড হচ্ছে...</div>;
  }

  return (
    <div className="space-y-6 text-ink-strong font-sans">

      <Toast message={statusMessage} onDismiss={() => setStatusMessage(null)} />

      {/* Quick Presets */}
      <div className="p-4 bg-surface-card border border-line-soft rounded-lg space-y-2">
        <span className="text-[13px] font-bold text-ink-muted block">
          ⚡ দ্রুত রেডিমেড টেমপ্লেট নির্বাচন করুন (Quick Presets):
        </span>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() =>
              applyPreset({
                enabled: true,
                title: "জরুরি ঘোষণা",
                message: "কিশোরকণ্ঠ মেধাবৃত্তি ২০২৫-এর প্রবেশপত্র প্রকাশ করা হয়েছে! আপনার রোল দিয়ে ডাউনলোড করুন।",
                linkText: "প্রবেশপত্র ডাউনলোড →",
                linkUrl: "/admit-card",
                badgeType: "urgent",
              })
            }
            className="px-3 py-1.5 rounded bg-primary/15 border border-primary/30 text-primary hover:bg-primary/25 text-[13px] font-bold transition cursor-pointer"
          >
            🎫 প্রবেশপত্র প্রকাশ
          </button>

          <button
            type="button"
            onClick={() =>
              applyPreset({
                enabled: true,
                title: "ফলাফল প্রকাশ",
                message: "কিশোরকণ্ঠ মেধাবৃত্তি ২০২৫-এর চূড়ান্ত ফলাফল প্রকাশিত হয়েছে! রোল নম্বর দিয়ে রেজাল্ট কার্ড দেখুন।",
                linkText: "ফলাফল দেখুন →",
                linkUrl: "/search",
                badgeType: "success",
              })
            }
            className="px-3 py-1.5 rounded bg-primary-500/15 border border-primary-500/30 text-primary-300 hover:bg-primary-500/25 text-[13px] font-bold transition cursor-pointer"
          >
            🏆 ফলাফল প্রকাশ
          </button>

          <button
            type="button"
            onClick={() =>
              applyPreset({
                enabled: true,
                title: "অনলাইন রেজিস্ট্রেশন",
                message: "কিশোরকণ্ঠ মেধাবৃত্তি ২০২৫-এর অনলাইন ফরম পূরণ চলছে! শেষ তারিখের পূর্বেই আবেদন সম্পন্ন করুন।",
                linkText: "আবেদন করুন →",
                linkUrl: "/scholarship",
                badgeType: "amber",
              })
            }
            className="px-3 py-1.5 rounded bg-secondary/15 border border-secondary/30 text-secondary hover:bg-secondary/25 text-[13px] font-bold transition cursor-pointer"
          >
            📝 রেজিস্ট্রেশন চলছে
          </button>

          <button
            type="button"
            onClick={() =>
              applyPreset({
                enabled: true,
                title: "পরীক্ষার রুটিন",
                message: "মেধাবৃত্তি পরীক্ষার চূড়ান্ত কেন্দ্র তালিকা ও সময়সূচী দেখতে নোটিশ বোর্ডে চোখ রাখুন।",
                linkText: "নোটিশ দেখুন →",
                linkUrl: "/notice",
                badgeType: "info",
              })
            }
            className="px-3 py-1.5 rounded bg-tertiary/15 border border-tertiary/30 text-tertiary hover:bg-tertiary/25 text-[13px] font-bold transition cursor-pointer"
          >
            📌 পরীক্ষার নোটিশ
          </button>
        </div>
      </div>

      {/* Live Preview Box */}
      <div className="p-4 sm:p-5 bg-surface-card border border-line-soft rounded-lg space-y-3 shadow-none">
        <span className="text-[13px] font-bold text-ink-muted uppercase tracking-wider block">
          লাইভ প্রিভিউ (Live Preview — ওয়েবসাইটের উপরের বার):
        </span>
        {formData.enabled ? (
          <div className="bg-surface-card text-ink-body text-[13px] py-2 px-4 rounded border border-line-soft flex items-center justify-between gap-3 shadow-inner">
            <div className="flex items-center gap-2 truncate">
              <span
                className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                  formData.badgeType === "urgent"
                    ? "bg-error shadow-sm shadow-error/50"
                    : formData.badgeType === "success"
                    ? "bg-primary-400 shadow-sm shadow-primary-400/50"
                    : formData.badgeType === "amber"
                    ? "bg-secondary shadow-sm shadow-secondary/50"
                    : "bg-primary shadow-sm shadow-primary/50"
                }`}
              />
              <p className="truncate font-medium text-[13px] text-ink-body">
                <span
                  className={`font-semibold ${
                    formData.badgeType === "urgent"
                      ? "text-error"
                      : formData.badgeType === "success"
                      ? "text-primary-400"
                      : formData.badgeType === "amber"
                      ? "text-secondary"
                      : "text-primary"
                  }`}
                >
                  {formData.title}
                </span>{" "}
                — {formData.message}
              </p>
            </div>
            {formData.linkUrl && (
              <span className="text-primary font-bold text-[13px] sm:text-[13px] underline whitespace-nowrap shrink-0">
                {formData.linkText || "বিস্তারিত →"}
              </span>
            )}
          </div>
        ) : (
          <div className="p-3 rounded bg-surface border border-line-soft text-ink-muted text-[13px] text-center font-medium">
            ⚠️ এনাউন্সমেন্ট বার বর্তমানে নিষ্ক্রিয় (Disabled)।
          </div>
        )}
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="p-5 sm:p-6 bg-surface-card border border-line-soft rounded-lg space-y-5 shadow-none"
      >
        {/* Toggle Switch */}
        <div className="flex items-center justify-between p-4 bg-surface rounded border border-line-soft">
          <div>
            <span className="text-sm font-bold text-ink-strong block">
              টপ বার চালু রাখুন (Enable Announcement Bar)
            </span>
            <span className="text-[13px] text-ink-muted block mt-0.5">
              এটি অন থাকলে ওয়েবসাইটের সবার উপরে চলমান স্ট্রিপটি প্রদর্শিত হবে
            </span>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={formData.enabled}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, enabled: e.target.checked }))
              }
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-surface-overlay peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-line-soft after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
          </label>
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-[13px] font-bold text-ink-body mb-1.5">
              শিরোনাম / ব্যাজ টেক্সট *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, title: e.target.value }))
              }
              placeholder="যেমন: জরুরি ঘোষণা / ব্রেকিং নিউজ"
              required
              className="w-full px-4 py-3 bg-surface border border-line-soft rounded text-ink-strong text-[13px] sm:text-sm font-bold focus:outline-none focus:border-primary"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-[13px] font-bold text-ink-body mb-1.5">
              বার্তা বা ঘোষণার বিবরণ *
            </label>
            <input
              type="text"
              value={formData.message}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, message: e.target.value }))
              }
              placeholder="ঘোষণার বার্তা বাংলায় লিখুন..."
              required
              className="w-full px-4 py-3 bg-surface border border-line-soft rounded text-ink-strong text-[13px] sm:text-sm font-medium focus:outline-none focus:border-primary"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-[13px] font-bold text-ink-body mb-1.5">
              বাটন টেক্সট (Button Label)
            </label>
            <input
              type="text"
              value={formData.linkText}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, linkText: e.target.value }))
              }
              placeholder="যেমন: প্রবেশপত্র ডাউনলোড →"
              className="w-full px-4 py-3 bg-surface border border-line-soft rounded text-ink-strong text-[13px] sm:text-sm font-bold focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-[13px] font-bold text-ink-body mb-1.5">
              লিংক বা গন্তব্য ইউআরএল (Target URL)
            </label>
            <input
              type="text"
              value={formData.linkUrl}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, linkUrl: e.target.value }))
              }
              placeholder="যেমন: /admit-card অথবা /search"
              className="w-full px-4 py-3 bg-surface border border-line-soft rounded text-ink-strong text-[13px] sm:text-sm font-mono focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-[13px] font-bold text-ink-body mb-1.5">
              ব্যাজ কালার (Badge Type)
            </label>
            <select
              value={formData.badgeType || "urgent"}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, badgeType: e.target.value }))
              }
              className="w-full px-4 py-3 bg-surface border border-line-soft rounded text-ink-strong text-[13px] sm:text-sm font-bold focus:outline-none focus:border-primary"
            >
              <option value="urgent">🔴 জরুরি / লাল (Urgent)</option>
              <option value="success">🟢 সাফল্য / সবুজ (Success)</option>
              <option value="amber">🟡 আবেদন / হলুদ (Amber)</option>
              <option value="info">🟣 সাধারণ / বেগুনি (Info)</option>
            </select>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-8 py-3 bg-gradient-to-r from-primary-500 to-tertiary hover:from-primary-400 hover:to-tertiary text-primary-on font-semibold rounded text-[13px] sm:text-sm shadow-none transition cursor-pointer disabled:opacity-50 flex items-center gap-2"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-line-soft border-t-transparent rounded-full animate-spin" />
                <span>সংরক্ষণ হচ্ছে...</span>
              </>
            ) : (
              <>
                <HiCheckCircle className="text-base" />
                <span>আপডেট ও প্রকাশ করুন</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AnnouncementManager;
