import React, { useState, useEffect, useRef } from "react";
import {
  HiPhoto,
  HiTrash,
  HiArrowUpTray,
  HiPlay,
  HiViewColumns,
  HiVideoCamera,
} from "react-icons/hi2";
import { uploadToImgBB } from "../../../services/imgbb";
import { Toast, useConfirm } from "../ui";
import {
  getHeroSlides,
  addHeroSlide,
  deleteHeroSlide,
  getHomepageContent,
  saveHomepageContent,
} from "../../../services/firestore";

const formatYouTubeEmbedUrl = (input) => {
  if (!input || !input.trim()) return "https://www.youtube-nocookie.com/embed/5qap5aO4i9A?autoplay=1";
  const clean = input.trim();
  if (clean.includes("youtube.com/embed/")) {
    const base = clean.split("?")[0];
    return `${base}?autoplay=1`;
  }
  const watchMatch = clean.match(/(?:youtube\.com\/watch\?v=|youtube\.com\/shorts\/)([a-zA-Z0-9_-]+)/);
  if (watchMatch && watchMatch[1]) {
    return `https://www.youtube-nocookie.com/embed/${watchMatch[1]}?autoplay=1`;
  }
  const shortMatch = clean.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);
  if (shortMatch && shortMatch[1]) {
    return `https://www.youtube-nocookie.com/embed/${shortMatch[1]}?autoplay=1`;
  }
  if (/^[a-zA-Z0-9_-]{6,20}$/.test(clean)) {
    return `https://www.youtube-nocookie.com/embed/${clean}?autoplay=1`;
  }
  return `https://www.youtube-nocookie.com/embed/${clean}?autoplay=1`;
};

const HeroManager = () => {
  const [slides, setSlides] = useState([]);
  const [confirm, confirmUI] = useConfirm();
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  // Video settings state
  const [videoUrlInput, setVideoUrlInput] = useState("https://www.youtube.com/watch?v=5qap5aO4i9A");
  const [savingVideo, setSavingVideo] = useState(false);
  const [videoStatus, setVideoStatus] = useState(null);

  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    caption: "",
    orderIndex: "1",
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [slidesData, homeContent] = await Promise.all([
        getHeroSlides(),
        getHomepageContent(),
      ]);

      if (slidesData) setSlides(slidesData);
      else setSlides([]);

      if (homeContent?.hero?.videoUrl) {
        setVideoUrlInput(homeContent.hero.videoUrl);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setStatusMessage({
        type: "error",
        text: "দয়া করে হিরো ব্যানারের একটি ছবি নির্বাচন করুন!",
      });
      return;
    }

    setUploading(true);
    setStatusMessage(null);

    try {
      // 1. Upload to ImgBB
      const imgData = await uploadToImgBB(selectedFile);

      // 2. Save to Firestore
      await addHeroSlide({
        imageUrl: imgData.url,
        caption: formData.caption || "",
        orderIndex: Number(formData.orderIndex) || slides.length + 1,
      });

      setStatusMessage({
        type: "success",
        text: "হিরো ব্যানার সফলভাবে ImgBB-তে আপলোড ও হোমপেজে যুক্ত হয়েছে!",
      });

      // Reset
      setSelectedFile(null);
      setImagePreview(null);
      setFormData({
        caption: "",
        orderIndex: `${slides.length + 2}`,
      });
      if (fileInputRef.current) fileInputRef.current.value = "";

      const updated = await getHeroSlides();
      if (updated) setSlides(updated);
    } catch (err) {
      console.error(err);
      setStatusMessage({
        type: "error",
        text: err.message || "ছবি আপলোড করতে ব্যর্থ হয়েছে!",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    const ok = await confirm({
        title: "স্লাইডটি মুছে ফেলবেন?",
        body: "হোমপেজের হিরো স্লাইডার থেকে এই ছবি ও ক্যাপশনটি সরে যাবে।",
        confirmLabel: "মুছে ফেলুন",
        tone: "danger",
      });
      if (!ok) return;
    try {
      await deleteHeroSlide(id);
      setSlides((prev) => prev.filter((s) => s.id !== id));
      setStatusMessage({ type: "success", text: "হিরো ব্যানার মুছে ফেলা হয়েছে!" });
    } catch (err) {
      setStatusMessage({ type: "error", text: "ব্যানার মুছতে ব্যর্থ হয়েছে!" });
    }
  };

  const handleSaveVideoUrl = async (e) => {
    e.preventDefault();
    try {
      setSavingVideo(true);
      setVideoStatus(null);

      await saveHomepageContent({
        hero: {
          videoUrl: videoUrlInput.trim(),
        },
      });

      setVideoStatus({
        type: "success",
        text: "মেধাবৃত্তির ভিডিও লিংক সফলভাবে আপডেট করা হয়েছে!",
      });
    } catch (err) {
      console.error(err);
      setVideoStatus({
        type: "error",
        text: "ভিডিও লিংক সেভ করতে সমস্যা হয়েছে!",
      });
    } finally {
      setSavingVideo(false);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">

      {/* Video URL Management Card */}
      <div className="p-6 bg-surface-card border border-primary/30 rounded-lg shadow-none space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-line-soft pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded bg-primary/20 text-primary border border-primary/30 flex items-center justify-center text-lg">
              <HiVideoCamera />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-ink-strong">
                মেধাবৃত্তির ভিডিও লিংক (YouTube Video URL)
              </h3>
              <p className="text-[13px] text-ink-muted">
                হোমপেজে "মেধাবৃত্তির ভিডিও দেখুন" বাটনে ক্লিক করলে এই ভিডিওটি পপআপে চলবে।
              </p>
            </div>
          </div>
        </div>

        <Toast message={videoStatus} onDismiss={() => setVideoStatus(null)} />

        <form onSubmit={handleSaveVideoUrl} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
          <div className="md:col-span-8 space-y-1.5">
            <label className="block text-[13px] font-semibold text-ink-body">
              YouTube ভিডিও লিংক বা Video ID (যেমন: https://www.youtube.com/watch?v=... বা 5qap5aO4i9A)
            </label>
            <div className="relative">
              <input
                type="text"
                value={videoUrlInput}
                onChange={(e) => setVideoUrlInput(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=5qap5aO4i9A"
                className="w-full px-4 py-2.5 bg-surface-lowest border border-line-soft rounded text-ink-strong text-[13px] focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div className="md:col-span-4">
            <button
              type="submit"
              disabled={savingVideo}
              className="w-full py-2.5 px-4 bg-primary hover:bg-primary text-ink-strong font-bold rounded transition flex items-center justify-center gap-2 text-[13px] shadow-none cursor-pointer disabled:opacity-50"
            >
              {savingVideo ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>সেভ হচ্ছে...</span>
                </>
              ) : (
                <>
                  <HiPlay className="text-sm" />
                  <span>ভিডিও লিংক আপডেট করুন</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Live Video Preview */}
        {videoUrlInput && (
          <div className="pt-2">
            <p className="text-[13px] font-semibold text-ink-muted mb-1.5 flex items-center gap-1.5">
              <span>লাইভ প্রিভিউ:</span>
            </p>
            <div className="w-full max-w-md aspect-video rounded overflow-hidden border border-line-soft bg-black/40 shadow-inner">
              <iframe
                src={formatYouTubeEmbedUrl(videoUrlInput)}
                title="Video Preview"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full border-0"
              />
            </div>
          </div>
        )}
      </div>

      <Toast message={statusMessage} onDismiss={() => setStatusMessage(null)} />

      {/* Grid Layout for Banners */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 items-start">
        {/* Left: Upload Form (4 cols) */}
        <div className="lg:col-span-4 p-6 bg-surface-card border border-line-soft rounded-lg space-y-4">
          <h3 className="text-sm font-bold text-ink-strong uppercase tracking-wider flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-primary-container/20 text-primary flex items-center justify-center text-[13px]">
              +
            </span>
            নতুন হিরো ব্যানার আপলোড
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Banner Image File */}
            <div>
              <label className="block text-[13px] font-semibold text-ink-body mb-1.5">
                ব্যানার ছবি নির্বাচন করুন *
              </label>
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-line-soft hover:border-primary/80 bg-surface-lowest/60 p-4 rounded-lg text-center cursor-pointer transition relative overflow-hidden group min-h-[160px] flex flex-col items-center justify-center"
              >
                {imagePreview ? (
                  <div className="relative w-full">
                    <img
                      src={imagePreview}
                      alt="Banner Preview"
                      className="w-full h-36 object-cover rounded border border-line-soft"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition rounded">
                      <span className="text-[13px] text-ink-strong font-semibold">ছবি পরিবর্তন করুন</span>
                    </div>
                  </div>
                ) : (
                  <>
                    <HiPhoto className="text-4xl text-ink-muted group-hover:text-primary mb-2 transition" />
                    <p className="text-[13px] text-ink-strong font-semibold">ব্যানার ছবি সিলেক্ট করুন</p>
                    <p className="text-[12px] text-ink-muted mt-1">প্রস্তাবিত সাইজ: 16:9 বা HD ইমেজ (ImgBB)</p>
                  </>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>

            <div>
              <label className="block text-[13px] font-semibold text-ink-body mb-1.5">
                ব্যানার ক্যাপশন (Caption Text)
              </label>
              <input
                type="text"
                name="caption"
                value={formData.caption}
                onChange={handleInputChange}
                placeholder="যেমন: ২০২৫ সালের কিশোরকণ্ঠ মেধাবৃত্তি পরীক্ষার মুহূর্ত"
                className="w-full px-4 py-2.5 bg-surface-lowest border border-line-soft rounded text-ink-strong text-[13px] focus:outline-none focus:border-primary/40"
              />
            </div>

            <div>
              <label className="block text-[13px] font-semibold text-ink-body mb-1.5">
                ক্রম (Order Sequence)
              </label>
              <input
                type="number"
                name="orderIndex"
                value={formData.orderIndex}
                onChange={handleInputChange}
                min="1"
                className="w-full px-4 py-2 bg-surface-lowest border border-line-soft rounded text-ink-strong text-[13px] focus:outline-none focus:border-primary/40"
              />
            </div>

            <button
              type="submit"
              disabled={uploading}
              className="w-full py-3.5 bg-gradient-to-r from-primary-container to-tertiary-container hover:from-primary-container hover:to-tertiary-container text-ink-strong font-bold rounded transition flex items-center justify-center gap-2 disabled:opacity-50 text-[13px] cursor-pointer"
            >
              {uploading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>ImgBB-তে ব্যানার আপলোড হচ্ছে...</span>
                </>
              ) : (
                <>
                  <HiArrowUpTray className="text-base" />
                  <span>হিরো ব্যানার সেভ করুন</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right: Existing Slides (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="p-4 bg-surface-card border border-line-soft rounded flex items-center justify-between shadow-overlay">
            <h3 className="text-sm font-bold text-ink-strong flex items-center gap-2">
              <HiViewColumns className="text-primary" />
              বর্তমান স্লাইডার ব্যানার ({slides.length > 0 ? `${slides.length} টি স্লাইড` : "ডিফল্ট ব্যানার চলমান"})
            </h3>
            <span className="text-[13px] text-primary font-semibold">
              হোমপেজে লাইভ
            </span>
          </div>

          {loading ? (
            <div className="p-12 text-center text-ink-muted bg-surface-card rounded">
              ব্যানার লোড হচ্ছে...
            </div>
          ) : slides.length === 0 ? (
            <div className="p-8 text-center text-ink-muted bg-surface-card border border-line-soft rounded space-y-3">
              <p className="text-[13px] text-ink-body">
                ফায়ারস্টোরে কোনো কাস্টম হিরো ব্যানার নেই। বর্তমানে ওয়েবসাইটের <strong>৩টি ডিফল্ট ব্যানার</strong> হিরো ফ্রেমে প্রদর্শিত হচ্ছে।
              </p>
              <p className="text-[13px] text-primary">
                বাম পাশের ফর্ম থেকে আপনার নতুন ছবি আপলোড করলেই হোমপেজের থাম্বনেইল ও বড় ফ্রেম স্বয়ংক্রিয়ভাবে আপডেট হয়ে যাবে!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {slides.map((slide, index) => (
                <div
                  key={slide.id}
                  className="group relative bg-surface-lowest border border-line-soft rounded-lg overflow-hidden hover:border-primary/50 transition duration-300 flex flex-col justify-between"
                >
                  <div className="relative overflow-hidden h-44">
                    <img
                      src={slide.imageUrl}
                      alt={slide.caption || `Slide ${index + 1}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                    <div className="absolute top-2 left-2 px-2.5 py-0.5 rounded-full bg-black/70 text-ink-strong text-[12px] font-mono">
                      স্লাইড #{slide.orderIndex || index + 1}
                    </div>
                    <button
                      onClick={() => handleDelete(slide.id)}
                      className="absolute top-2 right-2 p-2 bg-tertiary-container/90 hover:bg-tertiary-container text-ink-strong rounded opacity-0 group-hover:opacity-100 transition shadow cursor-pointer"
                      title="মুছে ফেলুন"
                    >
                      <HiTrash className="text-sm" />
                    </button>
                  </div>

                  <div className="p-3 bg-surface-card">
                    <p className="text-[13px] font-semibold text-ink-strong truncate">
                      {slide.caption || "কোনো ক্যাপশন নেই"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {confirmUI}
    </div>
  );
};

export default HeroManager;
