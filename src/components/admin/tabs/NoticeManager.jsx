import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  HiTrash,
  HiPencilSquare,
  HiBookmark,
  HiBell,
  HiMagnifyingGlass,
  HiPaperClip,
  HiPhoto,
  HiArrowUpTray,
  HiXMark,
} from "react-icons/hi2";
import { uploadToImgBB } from "../../../services/imgbb";
import { Button, EmptyState, Toast, useConfirm } from "../ui";
import {
  getNotices,
  addNotice,
  updateNotice,
  deleteNotice,
} from "../../../services/firestore";

const NoticeManager = () => {
  const [notices, setNotices] = useState([]);
  const [confirm, confirmUI] = useConfirm();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [previewImage, setPreviewImage] = useState(null);

  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: new Date().toLocaleDateString("bn-BD", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }),
    time: new Date().toLocaleTimeString("bn-BD", {
      hour: "2-digit",
      minute: "2-digit",
    }),
    type: "announcement",
    isPinned: false,
    attachmentUrl: "",
    imageUrl: "",
  });

  const loadNoticesList = async () => {
    try {
      setLoading(true);
      const data = await getNotices();
      if (data) setNotices(data);
      else setNotices([]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNoticesList();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleImageFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingPhoto(true);
      const imgRes = await uploadToImgBB(file);
      const finalUrl = imgRes.displayUrl || imgRes.url;
      setFormData((prev) => ({ ...prev, imageUrl: finalUrl }));
      setStatusMessage({
        type: "success",
        text: "নোটিশের ছবি ImgBB-তে আপলোড হয়েছে!",
      });
    } catch (err) {
      setStatusMessage({
        type: "error",
        text: "ছবি আপলোড ব্যর্থ হয়েছে! " + err.message,
      });
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.description) {
      setStatusMessage({
        type: "error",
        text: "দয়া করে নোটিশের শিরোনাম ও বিবরণ প্রদান করুন!",
      });
      return;
    }

    setSubmitting(true);
    setStatusMessage(null);

    try {
      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        date: formData.date || "",
        time: formData.time || "",
        type: formData.type || "announcement",
        isPinned: Boolean(formData.isPinned),
        attachmentUrl: formData.attachmentUrl ? formData.attachmentUrl.trim() : "",
        imageUrl: formData.imageUrl ? formData.imageUrl.trim() : "",
      };

      if (editingId) {
        await updateNotice(editingId, payload);
        setStatusMessage({
          type: "success",
          text: "নোটিশ সফলভাবে আপডেট করা হয়েছে!",
        });
      } else {
        await addNotice(payload);
        setStatusMessage({
          type: "success",
          text: "নতুন নোটিশ সফলভাবে প্রকাশ করা হয়েছে!",
        });
      }

      handleReset();
      await loadNoticesList();
    } catch (err) {
      console.error(err);
      setStatusMessage({
        type: "error",
        text: err.message || "নোটিশ সেভ করতে সমস্যা হয়েছে!",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (notice) => {
    setEditingId(notice.id);
    setFormData({
      title: notice.title || "",
      description: notice.description || "",
      date: notice.date || "",
      time: notice.time || "",
      type: notice.type || "announcement",
      isPinned: Boolean(notice.isPinned),
      attachmentUrl: notice.attachmentUrl || "",
      imageUrl: notice.imageUrl || "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleReset = () => {
    setFormData({
      title: "",
      description: "",
      date: new Date().toLocaleDateString("bn-BD", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
      time: new Date().toLocaleTimeString("bn-BD", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      type: "announcement",
      isPinned: false,
      attachmentUrl: "",
      imageUrl: "",
    });
    setEditingId(null);
  };

  const handleDelete = async (id, title) => {
    const ok = await confirm({
        title: "নোটিশটি মুছে ফেলবেন?",
        body: "নোটিশ বোর্ড থেকে এটি স্থায়ীভাবে সরে যাবে।",
        detail: title,
      });
      if (!ok) return;
    try {
      await deleteNotice(id);
      setNotices((prev) => prev.filter((n) => n.id !== id));
      setStatusMessage({ type: "success", text: "নোটিশ মুছে ফেলা হয়েছে!" });
    } catch (err) {
      setStatusMessage({ type: "error", text: "নোটিশ মুছতে ব্যর্থ হয়েছে!" });
    }
  };

  const filteredNotices = useMemo(() => {
    return notices.filter((item) => {
      const matchSearch =
        searchTerm === "" ||
        item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchType =
        selectedType === "all" ||
        (selectedType === "pinned" ? item.isPinned : item.type === selectedType);

      return matchSearch && matchType;
    });
  }, [notices, searchTerm, selectedType]);

  return (
    <div className="space-y-6 animate-fadeIn font-sans text-ink-strong">

      <Toast message={statusMessage} onDismiss={() => setStatusMessage(null)} />

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 items-start">
        {/* Left: Create/Edit Form (5 cols) */}
        <div className="lg:col-span-5 lg:sticky lg:top-[5.5rem] p-5 sm:p-6 bg-surface-card border border-line-soft rounded-lg space-y-4">
          <h3 className="text-[13px] sm:text-sm font-semibold text-ink-strong uppercase tracking-wider flex items-center gap-2 pb-3 border-b border-line-soft">
            <HiBell className="text-tertiary text-base" />
            <span>{editingId ? "নোটিশ সম্পাদনা করুন" : "নতুন নোটিশ প্রকাশ করুন"}</span>
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[13px] font-bold text-ink-body mb-1">
                নোটিশের শিরোনাম *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="যেমন: পুরষ্কার বিতরণী অনুষ্ঠান সংক্রান্ত জরুরি নোটিশ"
                required
                className="w-full px-3.5 py-2.5 bg-surface border border-line-soft rounded text-ink-strong text-[13px] font-medium focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-[13px] font-bold text-ink-body mb-1">
                ক্যাটাগরি
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                className="w-full px-3.5 py-2.5 bg-surface border border-line-soft rounded text-ink-strong text-[13px] font-bold focus:outline-none focus:border-primary"
              >
                <option value="announcement">ঘোষণা (Announcement)</option>
                <option value="result">ফলাফল (Result)</option>
                <option value="event">ইভেন্ট / অনুষ্ঠান (Event)</option>
                <option value="circular">সার্কুলার / নীতিমালা (Circular)</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[13px] font-bold text-ink-body mb-1">
                  তারিখ
                </label>
                <input
                  type="text"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-surface border border-line-soft rounded text-ink-strong text-[13px] font-medium focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-[13px] font-bold text-ink-body mb-1">
                  সময়
                </label>
                <input
                  type="text"
                  name="time"
                  value={formData.time}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-surface border border-line-soft rounded text-ink-strong text-[13px] font-medium focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            <div>
              <label className="block text-[13px] font-bold text-ink-body mb-1">
                নোটিশের বিস্তারিত বিবরণ *
              </label>
              <textarea
                name="description"
                rows={4}
                value={formData.description}
                onChange={handleInputChange}
                placeholder="নোটিশের সম্পূর্ণ বার্তা এখানে লিখুন..."
                required
                className="w-full px-3.5 py-2.5 bg-surface border border-line-soft rounded text-ink-strong text-[13px] font-medium focus:outline-none focus:border-primary resize-none leading-relaxed"
              />
            </div>

            {/* Attachment & Circular Image */}
            <div className="p-3.5 bg-surface rounded border border-line-soft space-y-3">
              <span className="text-[13px] font-bold text-tertiary uppercase tracking-wider block">
                সংযুক্তি ও ফাইল লিঙ্ক (ঐচ্ছিক)
              </span>

              <div>
                <label className="block text-[13px] text-ink-muted mb-1">
                  পিডিএফ বা ডাউনলোড লিঙ্ক (Drive / Document URL)
                </label>
                <input
                  type="text"
                  name="attachmentUrl"
                  value={formData.attachmentUrl}
                  onChange={handleInputChange}
                  placeholder="https://..."
                  className="w-full px-3 py-2 bg-surface border border-line-soft rounded text-ink-strong text-[13px] focus:outline-none focus:border-primary font-mono"
                />
              </div>

              <div>
                <label className="block text-[13px] text-ink-muted mb-1">
                  নোটিশ সার্কুলার ছবি (ImgBB Upload)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    name="imageUrl"
                    value={formData.imageUrl}
                    onChange={handleInputChange}
                    placeholder="https://i.ibb.co/..."
                    className="flex-1 px-3 py-2 bg-surface border border-line-soft rounded text-ink-strong text-[13px] focus:outline-none focus:border-primary font-mono"
                  />
                  <label className="px-3.5 py-2 bg-tertiary/20 hover:bg-tertiary/30 text-tertiary border border-tertiary/30 rounded text-[13px] font-bold transition cursor-pointer flex items-center gap-1 flex-shrink-0">
                    <HiArrowUpTray /> {uploadingPhoto ? "..." : "আপলোড"}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileSelect}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* Pin to Top Checkbox */}
            <div className="flex items-center gap-2.5 p-3 bg-surface border border-secondary/30 rounded">
              <input
                type="checkbox"
                id="isPinned"
                name="isPinned"
                checked={formData.isPinned}
                onChange={handleInputChange}
                className="w-4 h-4 rounded text-secondary bg-surface border-line-strong/40 focus:ring-secondary cursor-pointer"
              />
              <label
                htmlFor="isPinned"
                className="text-[13px] font-bold text-secondary cursor-pointer flex items-center gap-1.5"
              >
                <HiBookmark className="text-secondary" />
                গুরুত্বপূর্ণ নোটিশ হিসেবে উপরে পিন করে রাখুন
              </label>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="submit"
                disabled={submitting || uploadingPhoto}
                className="flex-1 py-3 bg-gradient-to-r from-tertiary to-primary hover:from-tertiary hover:to-primary text-ink-strong font-bold rounded text-[13px] sm:text-sm transition cursor-pointer shadow-lg shadow-tertiary/25 disabled:opacity-50"
              >
                {submitting
                  ? "সংরক্ষণ হচ্ছে..."
                  : editingId
                  ? "আপডেট সংরক্ষণ করুন"
                  : "নোটিশ প্রকাশ করুন"}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-4 py-3 bg-surface-overlay/40 hover:bg-surface-overlay text-ink-body text-[13px] font-bold rounded cursor-pointer"
                >
                  বাতিল
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Right: Notices List (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Filter Bar */}
          <div className="p-4 bg-surface-card border border-line-soft rounded-lg flex flex-col sm:flex-row items-center justify-between gap-3 shadow-none">
            <div className="flex items-center gap-1.5 bg-surface p-1 rounded border border-line-soft overflow-x-auto w-full sm:w-auto scrollbar-none">
              {[
                { id: "all", label: `সকল (${notices.length})` },
                { id: "pinned", label: "পিনকৃত 📌" },
                { id: "announcement", label: "ঘোষণা" },
                { id: "result", label: "ফলাফল" },
                { id: "event", label: "ইভেন্ট" },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setSelectedType(t.id)}
                  className={`px-3 py-1.5 rounded-lg text-[13px] font-bold transition cursor-pointer whitespace-nowrap ${
                    selectedType === t.id
                      ? "bg-tertiary text-ink-strong shadow-sm"
                      : "text-ink-muted hover:text-ink-strong"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-48">
              <HiMagnifyingGlass className="absolute left-3 top-2.5 text-ink-muted text-[13px]" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="অনুসন্ধান..."
                className="w-full pl-8 pr-3 py-1.5 bg-surface border border-line-soft rounded text-ink-strong text-[13px] focus:outline-none focus:border-tertiary"
              />
            </div>
          </div>

          {/* List */}
          {loading ? (
            <div className="p-12 text-center text-ink-muted bg-surface-card rounded-lg border border-line-soft">
              লোড হচ্ছে...
            </div>
          ) : filteredNotices.length === 0 ? (
            <EmptyState
              icon={HiBell}
              title={
                notices.length === 0
                  ? "এখনো কোনো নোটিশ প্রকাশ করা হয়নি"
                  : "এই খোঁজে কোনো নোটিশ মেলেনি"
              }
              description={
                notices.length === 0
                  ? "বাম পাশের ফর্মটি পূরণ করে প্রথম নোটিশটি প্রকাশ করুন — এটি সঙ্গে সঙ্গে ওয়েবসাইটের নোটিশ বোর্ডে দেখা যাবে।"
                  : "সার্চ শব্দ বা নোটিশের ধরন বদলে আবার দেখুন।"
              }
              action={
                notices.length > 0 ? (
                  <Button
                    tone="neutral"
                    onClick={() => {
                      setSearchTerm("");
                      setSelectedType("all");
                    }}
                  >
                    ফিল্টার মুছে সব দেখুন
                  </Button>
                ) : null
              }
            />
          ) : (
            <div className="space-y-3 max-h-[700px] overflow-y-auto pr-1 scrollbar-none">
              {filteredNotices.map((n) => (
                <div
                  key={n.id}
                  className={`p-5 rounded-lg bg-surface-card border transition duration-200 space-y-3 shadow-none ${
                    n.isPinned
                      ? "border-secondary/40 bg-secondary/8"
                      : "border-line-soft hover:border-tertiary/40"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      {n.isPinned && (
                        <span className="px-2.5 py-0.5 rounded-full bg-secondary/20 text-secondary border border-secondary/30 text-[12px] font-bold">
                          📌 পিনকৃত নোটিশ
                        </span>
                      )}
                      <span className="px-2.5 py-0.5 rounded-full bg-tertiary/20 text-tertiary border border-tertiary/30 text-[12px] font-bold">
                        {n.type === "result"
                          ? "ফলাফল"
                          : n.type === "event"
                          ? "ইভেন্ট"
                          : n.type === "circular"
                          ? "সার্কুলার"
                          : "ঘোষণা"}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleEdit(n)}
                        className="p-2 text-ink-muted hover:text-ink-strong rounded hover:bg-surface-overlay/40 transition cursor-pointer"
                        title="সম্পাদনা"
                      >
                        <HiPencilSquare className="text-base" />
                      </button>
                      <button
                        onClick={() => handleDelete(n.id, n.title)}
                        className="p-2 text-ink-muted hover:text-error rounded hover:bg-surface-overlay/40 transition cursor-pointer"
                        title="মুছে ফেলুন"
                      >
                        <HiTrash className="text-base" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-ink-strong mb-1">
                      {n.title}
                    </h4>
                    <p className="text-[13px] text-ink-body leading-relaxed line-clamp-3">
                      {n.description}
                    </p>
                  </div>

                  {/* Attachment / Image badges */}
                  <div className="flex items-center gap-2 flex-wrap text-[13px]">
                    {n.imageUrl && (
                      <button
                        type="button"
                        onClick={() => setPreviewImage(n.imageUrl)}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded bg-surface-overlay/40 border border-line-soft text-tertiary text-[13px] font-bold hover:bg-surface-overlay cursor-pointer"
                      >
                        <HiPhoto /> সার্কুলার ছবি দেখুন
                      </button>
                    )}
                    {n.attachmentUrl && (
                      <a
                        href={n.attachmentUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 px-3 py-1 rounded bg-surface-overlay/40 border border-line-soft text-primary text-[13px] font-bold hover:bg-surface-overlay"
                      >
                        <HiPaperClip /> ফাইল ডাউনলোড
                      </a>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-[12px] text-ink-muted pt-2 border-t border-line-soft">
                    <span>📅 {n.date || "তারিখ নেই"}</span>
                    <span>⏰ {n.time || ""}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Image Preview Modal */}
      {previewImage && (
        <div
          onClick={() => setPreviewImage(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-3xl w-full bg-surface-card border border-line-soft rounded-lg p-4 shadow-2xl"
          >
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute top-4 right-4 p-2 text-ink-muted hover:text-ink-strong rounded-full bg-white/[0.1] transition cursor-pointer"
            >
              <HiXMark className="text-xl" />
            </button>
            <img
              src={previewImage}
              alt=""
              className="w-full max-h-[80vh] object-contain rounded"
            />
          </div>
        </div>
      )}

      {confirmUI}
    </div>
  );
};

export default NoticeManager;
