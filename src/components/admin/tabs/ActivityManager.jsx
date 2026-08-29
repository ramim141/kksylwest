import React, { useState, useEffect } from "react";
import { Button, Toast, useConfirm } from "../ui";
import {
  HiSparkles,
  HiTrash,
  HiPencilSquare,
  HiAcademicCap,
  HiEye,
  HiXMark,
} from "react-icons/hi2";
import {
  getActivities,
  addActivity,
  updateActivity,
  deleteActivity,
  seedDefaultActivities,
} from "../../../services/firestore";

const ActivityManager = () => {
  const [activities, setActivities] = useState([]);
  const [confirm, confirmUI] = useConfirm();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [previewActivity, setPreviewActivity] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    badge: "কার্যক্রম",
    content: "",
    details: "",
    orderIndex: "1",
    theme: "emerald",
  });

  const loadActivitiesList = async () => {
    try {
      setLoading(true);
      const data = await getActivities();
      if (data) setActivities(data);
      else setActivities([]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadActivitiesList();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.content) {
      setStatusMessage({
        type: "error",
        text: "দয়া করে কার্যক্রমের শিরোনাম এবং সংক্ষিপ্ত বিবরণ প্রদান করুন!",
      });
      return;
    }

    setSubmitting(true);
    setStatusMessage(null);

    try {
      const payload = {
        title: formData.title,
        badge: formData.badge || "কার্যক্রম",
        content: formData.content,
        details: formData.details || formData.content,
        orderIndex: Number(formData.orderIndex) || activities.length + 1,
        theme: formData.theme || "emerald",
      };

      if (editingId) {
        await updateActivity(editingId, payload);
        setStatusMessage({
          type: "success",
          text: "কার্যক্রম সফলভাবে আপডেট করা হয়েছে!",
        });
      } else {
        await addActivity(payload);
        setStatusMessage({
          type: "success",
          text: "নতুন কার্যক্রম সফলভাবে যুক্ত করা হয়েছে!",
        });
      }

      setFormData({
        title: "",
        badge: "কার্যক্রম",
        content: "",
        details: "",
        orderIndex: `${activities.length + 2}`,
        theme: "emerald",
      });
      setEditingId(null);

      await loadActivitiesList();
    } catch (err) {
      console.error(err);
      setStatusMessage({
        type: "error",
        text: err.message || "কার্যক্রম সংরক্ষণ করতে ব্যর্থ হয়েছে!",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setFormData({
      title: item.title || "",
      badge: item.badge || "কার্যক্রম",
      content: item.content || "",
      details: item.details || "",
      orderIndex: `${item.orderIndex || 1}`,
      theme: item.theme || "emerald",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    const ok = await confirm({
        title: "কার্যক্রমটি মুছে ফেলবেন?",
        body: "হোমপেজের কার্যক্রম সেকশন থেকে এটি সঙ্গে সঙ্গে সরে যাবে। এই কাজটি ফেরানো যাবে না।",
        confirmLabel: "মুছে ফেলুন",
        tone: "danger",
      });
      if (!ok) return;
    try {
      await deleteActivity(id);
      setActivities((prev) => prev.filter((a) => a.id !== id));
      setStatusMessage({ type: "success", text: "কার্যক্রম মুছে ফেলা হয়েছে!" });
    } catch (err) {
      setStatusMessage({ type: "error", text: "মুছে ফেলতে ব্যর্থ হয়েছে!" });
    }
  };

  const handleSeedData = async () => {
    const ok = await confirm({
        title: "ডিফল্ট কার্যক্রম যুক্ত করবেন?",
        body: "ডাটাবেজে পূর্বনির্ধারিত ৬টি কার্যক্রম যোগ হবে। ইতিমধ্যে থাকা কার্যক্রমগুলো অপরিবর্তিত থাকবে।",
        confirmLabel: "যুক্ত করুন",
        tone: "primary",
      });
      if (!ok) return;
    setSubmitting(true);
    try {
      await seedDefaultActivities();
      setStatusMessage({
        type: "success",
        text: "ডিফল্ট ৬টি কার্যক্রম সফলভাবে Firestore ডাটাবেজে যুক্ত হয়েছে!",
      });
      await loadActivitiesList();
    } catch (err) {
      setStatusMessage({
        type: "error",
        text: "ডাটাবেজে যুক্ত করতে সমস্যা হয়েছে: " + err.message,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="flex justify-end">
        <Button tone="neutral" icon={HiSparkles} onClick={handleSeedData} loading={submitting}>
          ডিফল্ট ৬টি কার্যক্রম যুক্ত করুন
        </Button>
      </div>

      <Toast message={statusMessage} onDismiss={() => setStatusMessage(null)} />

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 items-start">
        {/* Left: Form (5 cols) */}
        <div className="lg:col-span-5 lg:sticky lg:top-[5.5rem] p-5 sm:p-6 bg-surface-card border border-line-soft rounded-lg space-y-4">
          <h3 className="text-sm font-bold text-ink-strong uppercase tracking-wider flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-primary-container/20 text-primary flex items-center justify-center text-[13px]">
              +
            </span>
            {editingId ? "কার্যক্রম সম্পাদনা করুন" : "নতুন কার্যক্রম যুক্ত করুন"}
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[13px] font-semibold text-ink-body mb-1.5">
                কার্যক্রমের নাম / শিরোনাম *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="যেমন: মেধাবৃত্তি কার্যক্রম"
                required
                className="w-full px-4 py-2.5 bg-surface-lowest border border-line-soft rounded text-ink-strong text-[13px] focus:outline-none focus:border-primary/40"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[13px] font-semibold text-ink-body mb-1.5">
                  ট্যাগ / ব্যাজ নাম
                </label>
                <input
                  type="text"
                  name="badge"
                  value={formData.badge}
                  onChange={handleInputChange}
                  placeholder="যেমন: শিক্ষা"
                  className="w-full px-3 py-2 bg-surface-lowest border border-line-soft rounded text-ink-strong text-[13px] focus:outline-none focus:border-primary/40"
                />
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-ink-body mb-1.5">
                  ক্রম (Order Index)
                </label>
                <input
                  type="number"
                  name="orderIndex"
                  value={formData.orderIndex}
                  onChange={handleInputChange}
                  min="1"
                  className="w-full px-3 py-2 bg-surface-lowest border border-line-soft rounded text-ink-strong text-[13px] focus:outline-none focus:border-primary/40"
                />
              </div>
            </div>

            <div>
              <label className="block text-[13px] font-semibold text-ink-body mb-1.5">
                কালার থিম
              </label>
              <select
                name="theme"
                value={formData.theme}
                onChange={handleInputChange}
                className="w-full px-3.5 py-2.5 bg-surface-lowest border border-line-soft rounded text-ink-strong text-[13px] focus:outline-none focus:border-primary/40"
              >
                <option value="emerald">সবুজ (Emerald / Teal)</option>
                <option value="blue">নীল (Blue / Cyan)</option>
                <option value="purple">বেগুনি (Purple / Pink)</option>
                <option value="amber">কমলা / সোনালী (Amber / Orange)</option>
                <option value="rose">লাল / গোলাপী (Rose / Red)</option>
              </select>
            </div>

            <div>
              <label className="block text-[13px] font-semibold text-ink-body mb-1.5">
                সংক্ষিপ্ত বিবরণ (কার্ডে দেখাবে) *
              </label>
              <textarea
                name="content"
                rows={3}
                value={formData.content}
                onChange={handleInputChange}
                placeholder="হোমপেজের স্লাইডার কার্ডে প্রদর্শিত সংক্ষিপ্ত বিবরণ..."
                required
                className="w-full px-4 py-2.5 bg-surface-lowest border border-line-soft rounded text-ink-strong text-[13px] focus:outline-none focus:border-primary/40 leading-relaxed"
              ></textarea>
            </div>

            <div>
              <label className="block text-[13px] font-semibold text-ink-body mb-1.5">
                বিস্তারিত বিবরণ (ক্লিক করলে পপআপ মডালে দেখাবে)
              </label>
              <textarea
                name="details"
                rows={4}
                value={formData.details}
                onChange={handleInputChange}
                placeholder="সম্পূর্ণ বিস্তারিত প্যারাগ্রাফ..."
                className="w-full px-4 py-2.5 bg-surface-lowest border border-line-soft rounded text-ink-strong text-[13px] focus:outline-none focus:border-primary/40 leading-relaxed"
              ></textarea>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 py-3 bg-gradient-to-r from-primary-container to-tertiary-container hover:from-primary-container hover:to-tertiary-container text-ink-strong text-[13px] font-bold rounded transition cursor-pointer disabled:opacity-50"
              >
                {submitting ? "সেভ হচ্ছে..." : editingId ? "আপডেট করুন" : "কার্যক্রম যুক্ত করুন"}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(null);
                    setFormData({
                      title: "",
                      badge: "কার্যক্রম",
                      content: "",
                      details: "",
                      orderIndex: `${activities.length + 1}`,
                      theme: "emerald",
                    });
                  }}
                  className="px-4 py-3 bg-surface-card hover:bg-surface-overlay text-ink-body text-[13px] rounded cursor-pointer"
                >
                  বাতিল
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Right: Existing Activities List (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-4 bg-surface-card border border-line-soft rounded flex items-center justify-between shadow-overlay">
            <h3 className="text-sm font-bold text-ink-strong flex items-center gap-2">
              <HiAcademicCap className="text-primary" />
              বর্তমান কার্যক্রম তালিকা ({activities.length > 0 ? `${activities.length} টি আইটেম` : "ডিফল্ট কার্যক্রম চলমান"})
            </h3>
            <span className="text-[13px] text-primary font-semibold">
              হোমপেজের সাথে লাইভ
            </span>
          </div>

          {loading ? (
            <div className="p-12 text-center text-ink-muted bg-surface-card rounded">
              লোড হচ্ছে...
            </div>
          ) : activities.length === 0 ? (
            <div className="p-8 text-center text-ink-muted bg-surface-card border border-line-soft rounded space-y-3">
              <p className="text-[13px] text-ink-body">
                ফায়ারস্টোরে কাস্টম কার্যক্রম যুক্ত নেই। বর্তমানে ওয়েবসাইটের <strong>৬টি ডিফল্ট কার্যক্রম</strong> হোমপেজে প্রদর্শিত হচ্ছে।
              </p>
              <p className="text-[13px] text-primary">
                বাম পাশের ফর্ম দিয়ে নতুন কার্যক্রম অ্যাড করলেই হোমপেজ স্বয়ংক্রিয়ভাবে আপডেট হয়ে যাবে!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {activities.map((item, index) => (
                <div
                  key={item.id}
                  className="p-5 rounded bg-surface-card border border-line-soft hover:border-line-soft transition duration-200 space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2.5 py-0.5 rounded-full bg-primary-container/20 text-primary-300 border border-primary/30 text-[12px] font-bold">
                        #{item.orderIndex || index + 1}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-surface-card text-ink-body text-[12px] font-semibold">
                        {item.badge}
                      </span>
                      <span className="text-[12px] text-tertiary uppercase font-semibold">
                        {item.theme} থিম
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setPreviewActivity(item)}
                        className="w-10 h-10 inline-flex items-center justify-center shrink-0 hover:bg-surface-card text-ink-body hover:text-ink-strong rounded transition cursor-pointer"
                        title="মডাল প্রিভিউ দেখুন"
                      >
                        <HiEye className="text-base" />
                      </button>
                      <button
                        onClick={() => handleEdit(item)}
                        className="w-10 h-10 inline-flex items-center justify-center shrink-0 hover:bg-surface-card text-ink-body hover:text-ink-strong rounded transition cursor-pointer"
                        title="সম্পাদনা"
                      >
                        <HiPencilSquare className="text-base" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="w-10 h-10 inline-flex items-center justify-center shrink-0 hover:bg-tertiary-900/40 text-tertiary hover:text-tertiary rounded transition cursor-pointer"
                        title="মুছে ফেলুন"
                      >
                        <HiTrash className="text-base" />
                      </button>
                    </div>
                  </div>

                  <h4 className="text-sm font-bold text-ink-strong">{item.title}</h4>
                  <p className="text-[13px] text-ink-body leading-relaxed line-clamp-2">
                    {item.content}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Details Preview Modal */}
      {previewActivity && (
        <div
          onClick={() => setPreviewActivity(null)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-lg w-full bg-surface border border-line-soft rounded-lg p-6 space-y-4 shadow-overlay"
          >
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 rounded-full bg-primary-container/20 text-primary-300 text-[13px] font-bold">
                {previewActivity.badge}
              </span>
              <button
                onClick={() => setPreviewActivity(null)}
                className="w-10 h-10 inline-flex items-center justify-center shrink-0 rounded text-ink-muted hover:text-ink-strong hover:bg-surface-card"
              >
                <HiXMark className="text-xl" />
              </button>
            </div>
            <h3 className="text-lg font-bold text-ink-strong">{previewActivity.title}</h3>
            <p className="text-[13px] text-ink-body leading-relaxed max-h-60 overflow-y-auto whitespace-pre-wrap">
              {previewActivity.details || previewActivity.content}
            </p>
          </div>
        </div>
      )}

      {confirmUI}
    </div>
  );
};

export default ActivityManager;
