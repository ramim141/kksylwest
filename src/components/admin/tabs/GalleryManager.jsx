import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  HiPhoto,
  HiTrash,
  HiArrowUpTray,
  HiCheckCircle,
  HiSparkles,
  HiMagnifyingGlass,
  HiPencilSquare,
  HiFilm,
  HiArchiveBox,
  HiClock,
} from "react-icons/hi2";
import { uploadToImgBB } from "../../../services/imgbb";
import {
  getGalleryItems,
  addGalleryItem,
  updateGalleryItem,
  deleteGalleryItem,
  getGalleryHeroContent,
  saveGalleryHeroContent,
} from "../../../services/firestore";
import galleryImg1 from "../../../assets/images/gallery/1000288989.jpg.jpeg";
import galleryImg2 from "../../../assets/images/gallery/1000288990.jpg.jpeg";
import galleryImg3 from "../../../assets/images/gallery/1000288991.jpg.jpeg";
import galleryImg4 from "../../../assets/images/gallery/1000288992.jpg.jpeg";
import { SubTabs, Toast, useConfirm } from "../ui";
const DEFAULT_HERO_SETTINGS = {
  badge: "স্মৃতির গ্যালারি",
  headingLine1: "আমাদের গর্বের",
  headingLine2: "মুহূর্তগুলো",
  subheading:
    "কিশোরকণ্ঠ মেধাবৃত্তির আয়োজন, শিক্ষার্থীদের সাফল্য এবং অনুপ্রেরণার বিশেষ মুহূর্তগুলো এক জায়গায় দেখুন।",
  sinceYear: "১৯৯৪",
  stat1Value: "১০০+",
  stat1Label: "ছবি ও মুহূর্ত",
  stat2Value: "২০+",
  stat2Label: "বার্ষিক আয়োজন",
  stat3Value: "৩৬,০০০+",
  stat3Label: "অংশগ্রহণকারী",
  image1Url: galleryImg1,
  image2Url: galleryImg2,
  image3Url: galleryImg3,
  image4Url: galleryImg4,
};

const GalleryManager = () => {
  const [activeSubTab, setActiveSubTab] = useState("hero"); // Default to hero so admin directly sees the requested stats/photos CRUD
  const [items, setItems] = useState([]);
  const [confirm, confirmUI] = useConfirm();
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [previewModalImg, setPreviewModalImg] = useState(null);
  const [editingItemId, setEditingItemId] = useState(null);

  // Gallery Item Form (for adding photos to grid)
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);
  const [itemForm, setItemForm] = useState({
    title: "",
    description: "",
    category: "recent", // 'recent', 'archive', 'documentary'
    date: new Date().toLocaleDateString("bn-BD", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }),
    imageUrl: "",
    videoUrl: "",
    attendees: "",
  });

  // Gallery Hero Settings Form
  const [heroForm, setHeroForm] = useState(DEFAULT_HERO_SETTINGS);
  const [savingHero, setSavingHero] = useState(false);
  const [heroUploadingKey, setHeroUploadingKey] = useState(null);

  const heroFileInputRef1 = useRef(null);
  const heroFileInputRef2 = useRef(null);
  const heroFileInputRef3 = useRef(null);

  const loadAllData = async () => {
    try {
      setLoading(true);
      const [galleryList, heroSettings] = await Promise.allSettled([
        getGalleryItems("all"),
        getGalleryHeroContent(),
      ]);

      if (galleryList.status === "fulfilled" && galleryList.value) {
        setItems(galleryList.value);
      } else {
        setItems([]);
      }

      if (heroSettings.status === "fulfilled" && heroSettings.value) {
        setHeroForm((prev) => ({
          ...prev,
          ...heroSettings.value,
          image1Url: heroSettings.value.image1Url || galleryImg1,
          image2Url: heroSettings.value.image2Url || galleryImg2,
          image3Url: heroSettings.value.image3Url || galleryImg3,
        }));
      }
    } catch (err) {
      console.error("Gallery manager load error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // -------------------------------------------------------------
  // HERO IMAGE UPLOAD HANDLERS
  // -------------------------------------------------------------
  const handleHeroPhotoUpload = async (key, file) => {
    if (!file) return;
    setHeroUploadingKey(key);
    setStatusMessage(null);
    try {
      const uploadedUrl = await uploadToImgBB(file);
      setHeroForm((prev) => ({
        ...prev,
        [key]: uploadedUrl,
      }));
      setStatusMessage({
        type: "success",
        text: `ছবি সফলভাবে আপলোড হয়েছে! পরিবর্তন লাইভ করতে নিচের 'সংরক্ষণ করুন' বাটনে ক্লিক করুন।`,
      });
    } catch (err) {
      console.error(err);
      setStatusMessage({
        type: "error",
        text: "ছবি আপলোড করতে ব্যর্থ হয়েছে! ImgBB API বা ইন্টারনেট সংযোগ চেক করুন।",
      });
    } finally {
      setHeroUploadingKey(null);
    }
  };

  const handleSaveHeroSettings = async (e) => {
    if (e) e.preventDefault();
    setSavingHero(true);
    setStatusMessage(null);

    try {
      await saveGalleryHeroContent(heroForm);
      setStatusMessage({
        type: "success",
        text: "গ্যালারি হিরো সেকশনের সকল সংখ্যা, বিবরণ ও ৩টি ছবি সফলভাবে সংরক্ষিত ও লাইভ হয়েছে!",
      });
    } catch (err) {
      console.error(err);
      setStatusMessage({
        type: "error",
        text: err.message || "সংরক্ষণ করতে ব্যর্থ হয়েছে!",
      });
    } finally {
      setSavingHero(false);
    }
  };

  const handleResetHeroDefaults = async () => {
    const ok = await confirm({
      title: "হিরো সেকশন রিসেট করবেন?",
      body: "শিরোনাম, পরিসংখ্যান ও শোপিস ছবিগুলো ডিফল্ট অবস্থায় ফিরে যাবে। এখনো সংরক্ষণ না করা পরিবর্তন হারিয়ে যাবে।",
      confirmLabel: "রিসেট করুন",
      tone: "danger",
    });
    if (ok) setHeroForm(DEFAULT_HERO_SETTINGS);
  };

  // -------------------------------------------------------------
  // GALLERY GRID ITEM HANDLERS
  // -------------------------------------------------------------
  const handleItemFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  const handleItemFormChange = (e) => {
    const { name, value } = e.target;
    setItemForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleItemSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    setStatusMessage(null);

    try {
      let finalImageUrl = itemForm.imageUrl;

      if (selectedFile) {
        finalImageUrl = await uploadToImgBB(selectedFile);
      }

      if (!finalImageUrl && itemForm.category !== "documentary") {
        throw new Error("দয়া করে একটি ছবি আপলোড করুন অথবা ছবির লিঙ্ক দিন!");
      }

      const payload = {
        ...itemForm,
        imageUrl: finalImageUrl,
      };

      if (editingItemId) {
        await updateGalleryItem(editingItemId, payload);
        setStatusMessage({
          type: "success",
          text: "গ্যালারি আইটেম সফলভাবে আপডেট করা হয়েছে!",
        });
      } else {
        await addGalleryItem(payload);
        setStatusMessage({
          type: "success",
          text: "নতুন ছবি/ইভেন্ট গ্যালারিতে সফলভাবে যুক্ত হয়েছে!",
        });
      }

      handleResetItemForm();
      await loadAllData();
    } catch (err) {
      console.error(err);
      setStatusMessage({
        type: "error",
        text: err.message || "আইটেম সংরক্ষণ করতে ব্যর্থ হয়েছে!",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleEditItem = (item) => {
    setEditingItemId(item.id);
    setItemForm({
      title: item.title || "",
      description: item.description || "",
      category: item.category || "recent",
      date: item.date || "",
      imageUrl: item.imageUrl || "",
      videoUrl: item.videoUrl || "",
      attendees: item.attendees || "",
    });
    setImagePreview(item.imageUrl || null);
    setSelectedFile(null);
    window.scrollTo({ top: 300, behavior: "smooth" });
  };

  const handleDeleteItem = async (id) => {
    const ok = await confirm({
        title: "ছবিটি মুছে ফেলবেন?",
        body: "ছবিটি গ্যালারি থেকে স্থায়ীভাবে সরে যাবে এবং ওয়েবসাইটে আর দেখা যাবে না।",
        confirmLabel: "মুছে ফেলুন",
        tone: "danger",
      });
      if (!ok) return;

    try {
      await deleteGalleryItem(id);
      setStatusMessage({
        type: "success",
        text: "ছবিটি সফলভাবে মুছে ফেলা হয়েছে!",
      });
      await loadAllData();
    } catch (err) {
      console.error(err);
      setStatusMessage({
        type: "error",
        text: "ছবি মুছতে সমস্যা হয়েছে!",
      });
    }
  };

  const handleResetItemForm = () => {
    setEditingItemId(null);
    setItemForm({
      title: "",
      description: "",
      category: "recent",
      date: new Date().toLocaleDateString("bn-BD", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
      imageUrl: "",
      videoUrl: "",
      attendees: "",
    });
    setSelectedFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Filtered gallery items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchCat =
        selectedCategory === "all" || item.category === selectedCategory;
      const matchSearch =
        searchTerm === "" ||
        item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchTerm.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [items, selectedCategory, searchTerm]);

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn text-ink-strong">

      <Toast message={statusMessage} onDismiss={() => setStatusMessage(null)} />

      <SubTabs
        value={activeSubTab}
        onChange={setActiveSubTab}
        tabs={[
          { id: "hero", label: "হিরো, পরিসংখ্যান ও শোপিস ছবি", icon: HiSparkles },
          { id: "items", label: "সকল ছবি ও অ্যালবাম", icon: HiPhoto, count: items.length },
        ]}
      />

      {loading ? (
        <div className="p-12 text-center text-ink-muted bg-surface-card rounded-lg border border-line-soft">
          ডাটা লোড হচ্ছে...
        </div>
      ) : (
        <div>
          {/* ===================================================================
              SUBTAB 1: GALLERY HERO CONTENT, STATS & 3 SHOWCASE PHOTOS (CRUD)
              =================================================================== */}
          {activeSubTab === "hero" && (
            <form onSubmit={handleSaveHeroSettings} className="space-y-6">
              
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 items-start">
                
                {/* Left Form: Titles & 3 Stats Numbers (7 Cols) */}
                <div className="lg:col-span-7 p-5 sm:p-7 rounded-lg bg-surface-card border border-line-soft shadow-none space-y-5">
                  <div className="flex items-center justify-between pb-3 border-b border-line-soft">
                    <h3 className="text-sm font-bold text-ink-strong uppercase tracking-wider flex items-center gap-2">
                      <HiSparkles className="text-secondary text-base" /> হিরোর টেক্সট ও ৩টি পরিসংখ্যান সংখ্যা
                    </h3>

                    <button
                      type="button"
                      onClick={handleResetHeroDefaults}
                      className="text-[13px] text-ink-muted hover:text-ink-strong underline cursor-pointer"
                    >
                      ডিফল্টে রিসেট
                    </button>
                  </div>

                  {/* Badge & Year */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-[13px] font-bold text-ink-muted mb-1">
                        টপ হাইলাইট ব্যাজ (Badge Text)
                      </label>
                      <input
                        type="text"
                        value={heroForm.badge}
                        onChange={(e) => setHeroForm((p) => ({ ...p, badge: e.target.value }))}
                        placeholder="যেমন: স্মৃতির গ্যালারি"
                        className="w-full px-3.5 py-2.5 bg-surface border border-line-soft rounded text-[13px] sm:text-sm font-semibold text-ink-strong focus:outline-none focus:border-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-[13px] font-bold text-ink-muted mb-1">
                        ঐতিহ্য শুরুর বছর (Since Badge Year)
                      </label>
                      <input
                        type="text"
                        value={heroForm.sinceYear}
                        onChange={(e) => setHeroForm((p) => ({ ...p, sinceYear: e.target.value }))}
                        placeholder="যেমন: ১৯৯৪"
                        className="w-full px-3.5 py-2.5 bg-surface border border-line-soft rounded text-[13px] sm:text-sm font-semibold text-ink-strong focus:outline-none focus:border-primary font-mono"
                      />
                    </div>
                  </div>

                  {/* Headings */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-[13px] font-bold text-ink-muted mb-1">
                        হেডিং লাইন ১ (সাধারণ টেক্সট)
                      </label>
                      <input
                        type="text"
                        value={heroForm.headingLine1}
                        onChange={(e) => setHeroForm((p) => ({ ...p, headingLine1: e.target.value }))}
                        placeholder="যেমন: আমাদের গর্বের"
                        className="w-full px-3.5 py-2.5 bg-surface border border-line-soft rounded text-[13px] sm:text-sm font-semibold text-ink-strong focus:outline-none focus:border-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-[13px] font-bold text-ink-muted mb-1">
                        হেডিং লাইন ২ (গ্র্যাডিয়েন্ট টেক্সট)
                      </label>
                      <input
                        type="text"
                        value={heroForm.headingLine2}
                        onChange={(e) => setHeroForm((p) => ({ ...p, headingLine2: e.target.value }))}
                        placeholder="যেমন: মুহূর্তগুলো"
                        className="w-full px-3.5 py-2.5 bg-surface border border-line-soft rounded text-[13px] sm:text-sm font-semibold text-primary-400 focus:outline-none focus:border-primary"
                      />
                    </div>
                  </div>

                  {/* Subheading */}
                  <div>
                    <label className="block text-[13px] font-bold text-ink-muted mb-1">
                      সাবহেডিং / গ্যালারির ভূমিকা বার্তা
                    </label>
                    <textarea
                      rows={3}
                      value={heroForm.subheading}
                      onChange={(e) => setHeroForm((p) => ({ ...p, subheading: e.target.value }))}
                      placeholder="কিশোরকণ্ঠ মেধাবৃত্তির আয়োজন..."
                      className="w-full px-3.5 py-2.5 bg-surface border border-line-soft rounded text-[13px] sm:text-sm font-normal text-ink-strong focus:outline-none focus:border-primary leading-relaxed"
                    />
                  </div>

                  {/* 3 Stats Numbers Controls */}
                  <div className="pt-3 border-t border-line-soft space-y-3">
                    <span className="text-[13px] font-bold text-secondary uppercase tracking-wider block">
                      📊 ৩টি পরিসংখ্যান কার্ডের সংখ্যা ও লেবেল পরিবর্তন:
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      
                      {/* Stat 1 */}
                      <div className="p-3.5 rounded bg-surface border border-primary-500/30 space-y-2">
                        <span className="text-[12px] font-bold text-primary-400 block">১. ছবি ও মুহূর্ত</span>
                        <input
                          type="text"
                          value={heroForm.stat1Value}
                          onChange={(e) => setHeroForm((p) => ({ ...p, stat1Value: e.target.value }))}
                          placeholder="১০০+"
                          className="w-full px-2.5 py-1.5 bg-surface-card border border-line-soft rounded-lg text-sm font-semibold text-primary-400 font-mono text-center"
                        />
                        <input
                          type="text"
                          value={heroForm.stat1Label}
                          onChange={(e) => setHeroForm((p) => ({ ...p, stat1Label: e.target.value }))}
                          placeholder="ছবি ও মুহূর্ত"
                          className="w-full px-2.5 py-1 bg-surface-card border border-line-soft rounded-lg text-[13px] font-semibold text-ink-body text-center"
                        />
                      </div>

                      {/* Stat 2 */}
                      <div className="p-3.5 rounded bg-surface border border-secondary/30 space-y-2">
                        <span className="text-[12px] font-bold text-secondary block">২. বার্ষিক আয়োজন</span>
                        <input
                          type="text"
                          value={heroForm.stat2Value}
                          onChange={(e) => setHeroForm((p) => ({ ...p, stat2Value: e.target.value }))}
                          placeholder="২০+"
                          className="w-full px-2.5 py-1.5 bg-surface-card border border-line-soft rounded-lg text-sm font-semibold text-secondary font-mono text-center"
                        />
                        <input
                          type="text"
                          value={heroForm.stat2Label}
                          onChange={(e) => setHeroForm((p) => ({ ...p, stat2Label: e.target.value }))}
                          placeholder="বার্ষিক আয়োজন"
                          className="w-full px-2.5 py-1 bg-surface-card border border-line-soft rounded-lg text-[13px] font-semibold text-ink-body text-center"
                        />
                      </div>

                      {/* Stat 3 */}
                      <div className="p-3.5 rounded bg-surface border border-primary/30 space-y-2">
                        <span className="text-[12px] font-bold text-primary block">৩. অংশগ্রহণকারী</span>
                        <input
                          type="text"
                          value={heroForm.stat3Value}
                          onChange={(e) => setHeroForm((p) => ({ ...p, stat3Value: e.target.value }))}
                          placeholder="৩৬,০০০+"
                          className="w-full px-2.5 py-1.5 bg-surface-card border border-line-soft rounded-lg text-sm font-semibold text-primary font-mono text-center"
                        />
                        <input
                          type="text"
                          value={heroForm.stat3Label}
                          onChange={(e) => setHeroForm((p) => ({ ...p, stat3Label: e.target.value }))}
                          placeholder="অংশগ্রহণকারী"
                          className="w-full px-2.5 py-1 bg-surface-card border border-line-soft rounded-lg text-[13px] font-semibold text-ink-body text-center"
                        />
                      </div>

                    </div>
                  </div>
                </div>

                {/* Right Form: 3 Showcase Photos Collage (5 Cols) */}
                <div className="lg:col-span-5 lg:sticky lg:top-[5.5rem] p-5 sm:p-6 rounded-lg bg-surface-card border border-line-soft space-y-4">
                  <div className="pb-3 border-b border-line-soft">
                    <h3 className="text-sm font-bold text-ink-strong uppercase tracking-wider flex items-center gap-2">
                      <HiPhoto className="text-primary text-base" /> ডানপাশের ৩টি শোপিস ফটো
                    </h3>
                    <p className="text-[13px] text-ink-muted mt-0.5">
                      কম্পিউটার থেকে ছবি আপলোড করুন অথবা ডাইরেক্ট লিঙ্ক পেস্ট করুন।
                    </p>
                  </div>

                  {/* Photo 1: Main Top Right */}
                  <div className="p-3.5 rounded bg-surface border border-line-soft space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[13px] font-bold text-ink-strong">১. প্রধান ছবি (টপ-ডান)</span>
                      {heroUploadingKey === "image1Url" && (
                        <span className="text-[12px] text-secondary font-bold animate-pulse">আপলোড হচ্ছে...</span>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      <img
                        src={heroForm.image1Url}
                        alt="Photo 1"
                        className="w-16 h-12 object-cover rounded-lg border border-line-strong/40 shrink-0"
                      />
                      <div className="flex-1 space-y-1.5">
                        <input
                          type="file"
                          ref={heroFileInputRef1}
                          accept="image/*"
                          onChange={(e) => handleHeroPhotoUpload("image1Url", e.target.files?.[0])}
                          className="hidden"
                        />
                        <button
                          type="button"
                          onClick={() => heroFileInputRef1.current?.click()}
                          className="w-full py-1.5 px-3 rounded-lg bg-primary hover:bg-primary text-ink-strong font-bold text-[13px] flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <HiArrowUpTray /> ছবি আপলোড করুন
                        </button>
                        <input
                          type="text"
                          value={heroForm.image1Url}
                          onChange={(e) => setHeroForm((p) => ({ ...p, image1Url: e.target.value }))}
                          placeholder="বা ছবির লিঙ্ক..."
                          className="w-full px-2.5 py-1 bg-surface-card border border-line-soft rounded text-[13px] text-ink-body font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Photo 2: Left Portrait */}
                  <div className="p-3.5 rounded bg-surface border border-line-soft space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[13px] font-bold text-ink-strong">২. বামপাশের পোর্ট্রেট ছবি</span>
                      {heroUploadingKey === "image2Url" && (
                        <span className="text-[12px] text-secondary font-bold animate-pulse">আপলোড হচ্ছে...</span>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      <img
                        src={heroForm.image2Url}
                        alt="Photo 2"
                        className="w-16 h-12 object-cover rounded-lg border border-line-strong/40 shrink-0"
                      />
                      <div className="flex-1 space-y-1.5">
                        <input
                          type="file"
                          ref={heroFileInputRef2}
                          accept="image/*"
                          onChange={(e) => handleHeroPhotoUpload("image2Url", e.target.files?.[0])}
                          className="hidden"
                        />
                        <button
                          type="button"
                          onClick={() => heroFileInputRef2.current?.click()}
                          className="w-full py-1.5 px-3 rounded-lg bg-primary hover:bg-primary text-ink-strong font-bold text-[13px] flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <HiArrowUpTray /> ছবি আপলোড করুন
                        </button>
                        <input
                          type="text"
                          value={heroForm.image2Url}
                          onChange={(e) => setHeroForm((p) => ({ ...p, image2Url: e.target.value }))}
                          placeholder="বা ছবির লিঙ্ক..."
                          className="w-full px-2.5 py-1 bg-surface-card border border-line-soft rounded text-[13px] text-ink-body font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Photo 3: Bottom Right */}
                  <div className="p-3.5 rounded bg-surface border border-line-soft space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[13px] font-bold text-ink-strong">৩. নিচের ডানপাশের ছবি</span>
                      {heroUploadingKey === "image3Url" && (
                        <span className="text-[12px] text-secondary font-bold animate-pulse">আপলোড হচ্ছে...</span>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      <img
                        src={heroForm.image3Url}
                        alt="Photo 3"
                        className="w-16 h-12 object-cover rounded-lg border border-line-strong/40 shrink-0"
                      />
                      <div className="flex-1 space-y-1.5">
                        <input
                          type="file"
                          ref={heroFileInputRef3}
                          accept="image/*"
                          onChange={(e) => handleHeroPhotoUpload("image3Url", e.target.files?.[0])}
                          className="hidden"
                        />
                        <button
                          type="button"
                          onClick={() => heroFileInputRef3.current?.click()}
                          className="w-full py-1.5 px-3 rounded-lg bg-primary hover:bg-primary text-ink-strong font-bold text-[13px] flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <HiArrowUpTray /> ছবি আপলোড করুন
                        </button>
                        <input
                          type="text"
                          value={heroForm.image3Url}
                          onChange={(e) => setHeroForm((p) => ({ ...p, image3Url: e.target.value }))}
                          placeholder="বা ছবির লিঙ্ক..."
                          className="w-full px-2.5 py-1 bg-surface-card border border-line-soft rounded text-[13px] text-ink-body font-mono"
                        />
                      </div>
                    </div>
                  </div>

                </div>

              </div>

              {/* Bottom Sticky Save Button */}
              <div className="p-5 rounded-lg bg-surface-card border border-line-soft flex items-center justify-between gap-4 shadow-none">
                <p className="text-[13px] text-ink-muted hidden sm:block">
                  সবগুলো সংখ্যা ও ছবি পরিবর্তন সম্পন্ন হলে সেভ বাটনে ক্লিক করুন।
                </p>

                <button
                  type="submit"
                  disabled={savingHero}
                  className="w-full sm:w-auto px-8 py-3.5 rounded bg-gradient-to-r from-primary-500 to-tertiary hover:from-primary-400 hover:to-tertiary text-primary-on font-semibold text-sm shadow-none transition-all hover:scale-102 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {savingHero ? (
                    <>
                      <div className="w-4 h-4 border-2 border-line-soft border-t-transparent rounded-full animate-spin" />
                      <span>সংরক্ষণ হচ্ছে...</span>
                    </>
                  ) : (
                    <>
                      <HiCheckCircle className="text-lg" />
                      <span>💾 গ্যালারি হিরো তথ্য ও ৩টি ছবি সংরক্ষণ করুন</span>
                    </>
                  )}
                </button>
              </div>

            </form>
          )}

          {/* ===================================================================
              SUBTAB 2: GALLERY PHOTOS & ALBUM ITEMS CRUD
              =================================================================== */}
          {activeSubTab === "items" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 items-start">
              
              {/* Left Form: Add / Edit Item (5 cols) */}
              <div className="lg:col-span-5 lg:sticky lg:top-[5.5rem] p-5 sm:p-6 rounded-lg bg-surface-card border border-line-soft space-y-4">
                <h3 className="text-sm font-bold text-ink-strong uppercase tracking-wider flex items-center gap-2 pb-3 border-b border-line-soft">
                  <HiPhoto className="text-primary text-base" />
                  {editingItemId ? "গ্যালারি ছবি সম্পাদনা" : "নতুন ছবি / অ্যালবাম যুক্ত করুন"}
                </h3>

                <form onSubmit={handleItemSubmit} className="space-y-4">
                  {/* Category Selector */}
                  <div>
                    <label className="block text-[13px] font-bold text-ink-muted mb-1">
                      ক্যাটাগরি নির্বাচন করুন *
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: "recent", label: "সাম্প্রতিক", icon: HiClock },
                        { id: "archive", label: "আর্কাইভ", icon: HiArchiveBox },
                        { id: "documentary", label: "ডকুমেন্টারি", icon: HiFilm },
                      ].map((cat) => (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => setItemForm((p) => ({ ...p, category: cat.id }))}
                          className={`p-2.5 rounded border text-[13px] font-bold transition flex flex-col items-center justify-center gap-1 cursor-pointer ${
                            itemForm.category === cat.id
                              ? "bg-primary text-ink-strong border-primary shadow-none"
                              : "bg-surface border-line-soft text-ink-muted hover:text-ink-strong"
                          }`}
                        >
                          <cat.icon className="text-base" />
                          <span>{cat.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Title */}
                  <div>
                    <label className="block text-[13px] font-bold text-ink-muted mb-1">
                      শিরোনাম / ইভেন্টের নাম *
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={itemForm.title}
                      onChange={handleItemFormChange}
                      placeholder="যেমন: কিশোরকণ্ঠ মেধাবৃত্তি ২০২৫ পুরস্কার বিতরণী"
                      required
                      className="w-full px-3.5 py-2.5 bg-surface border border-line-soft rounded text-[13px] sm:text-sm font-semibold text-ink-strong focus:outline-none focus:border-primary"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-[13px] font-bold text-ink-muted mb-1">
                      বিবরণ / ক্যাপশন
                    </label>
                    <textarea
                      rows={2}
                      name="description"
                      value={itemForm.description}
                      onChange={handleItemFormChange}
                      placeholder="ইভেন্ট বা ছবির বিবরণ..."
                      className="w-full px-3.5 py-2 bg-surface border border-line-soft rounded text-[13px] text-ink-strong focus:outline-none focus:border-primary leading-relaxed"
                    />
                  </div>

                  {/* Date */}
                  <div>
                    <label className="block text-[13px] font-bold text-ink-muted mb-1">
                      তারিখ
                    </label>
                    <input
                      type="text"
                      name="date"
                      value={itemForm.date}
                      onChange={handleItemFormChange}
                      placeholder="যেমন: ১৫ অক্টোবর, ২০২৫"
                      className="w-full px-3.5 py-2 bg-surface border border-line-soft rounded text-[13px] text-ink-strong focus:outline-none focus:border-primary"
                    />
                  </div>

                  {/* Documentary Fields */}
                  {itemForm.category === "documentary" && (
                    <div className="p-3.5 bg-surface rounded border border-primary/30 space-y-2.5">
                      <span className="text-[12px] font-bold text-primary uppercase block">
                        ভিডিও লিঙ্ক (YouTube URL)
                      </span>
                      <input
                        type="text"
                        name="videoUrl"
                        value={itemForm.videoUrl}
                        onChange={handleItemFormChange}
                        placeholder="https://www.youtube.com/watch?v=..."
                        className="w-full px-3 py-1.5 bg-surface-card border border-line-soft rounded-lg text-[13px] text-ink-strong"
                      />
                    </div>
                  )}

                  {/* Image Upload Area */}
                  <div>
                    <label className="block text-[13px] font-bold text-ink-muted mb-1">
                      ছবি নির্বাচন (ImgBB Cloud)
                    </label>
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="p-4 border-2 border-dashed border-line-soft hover:border-primary bg-surface rounded-lg cursor-pointer text-center transition flex flex-col items-center justify-center gap-2"
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleItemFileSelect}
                        className="hidden"
                      />
                      {imagePreview ? (
                        <div className="relative w-full">
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="w-full h-32 object-cover rounded border border-line-strong/40"
                          />
                          <p className="text-[12px] text-ink-body mt-1">ছবি পরিবর্তন করতে ক্লিক করুন</p>
                        </div>
                      ) : (
                        <>
                          <div className="w-10 h-10 rounded-full bg-primary/15 text-primary flex items-center justify-center text-xl">
                            <HiArrowUpTray />
                          </div>
                          <p className="text-[13px] text-ink-body font-bold">ছবি সিলেক্ট করুন</p>
                          <span className="text-[12px] text-ink-muted">PNG, JPG, WEBP ফরম্যাট</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Direct Image URL */}
                  <div>
                    <label className="block text-[12px] text-ink-muted mb-1">
                      অথবা সরাসরি ছবির অনলাইন লিঙ্ক
                    </label>
                    <input
                      type="text"
                      name="imageUrl"
                      value={itemForm.imageUrl}
                      onChange={(e) => {
                        handleItemFormChange(e);
                        if (e.target.value) setImagePreview(e.target.value);
                      }}
                      placeholder="https://..."
                      className="w-full px-3 py-1.5 bg-surface border border-line-soft rounded text-[13px] text-ink-strong font-mono"
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <button
                      type="submit"
                      disabled={uploading}
                      className="flex-1 py-3 rounded bg-primary hover:bg-primary text-ink-strong font-bold text-[13px] transition shadow-none cursor-pointer disabled:opacity-50"
                    >
                      {uploading
                        ? "আপলোড হচ্ছে..."
                        : editingItemId
                        ? "আপডেট সংরক্ষণ"
                        : "গ্যালারিতে যুক্ত করুন"}
                    </button>
                    {editingItemId && (
                      <button
                        type="button"
                        onClick={handleResetItemForm}
                        className="px-4 py-3 bg-surface-overlay/40 hover:bg-surface-overlay text-ink-body text-[13px] font-bold rounded cursor-pointer"
                      >
                        বাতিল
                      </button>
                    )}
                  </div>
                </form>
              </div>

              {/* Right Table / Grid: Gallery Items List (7 cols) */}
              <div className="lg:col-span-7 space-y-4">
                {/* Search & Filter Bar */}
                <div className="p-4 rounded-lg bg-surface-card border border-line-soft flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
                  <div className="flex items-center gap-1 bg-surface p-1 rounded border border-line-soft overflow-x-auto w-full sm:w-auto">
                    {[
                      { id: "all", label: "সকল" },
                      { id: "recent", label: "সাম্প্রতিক" },
                      { id: "archive", label: "আর্কাইভ" },
                      { id: "documentary", label: "ভিডিও" },
                    ].map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`px-3 py-1.5 rounded-lg text-[13px] font-bold transition cursor-pointer whitespace-nowrap ${
                          selectedCategory === cat.id
                            ? "bg-primary text-ink-strong"
                            : "text-ink-muted hover:text-ink-strong"
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>

                  <div className="relative w-full sm:w-56">
                    <HiMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted text-[13px]" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="খুঁজুন..."
                      className="w-full pl-8 pr-3 py-1.5 bg-surface border border-line-soft rounded text-[13px] text-ink-strong focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>

                {/* Items Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 max-h-[600px] overflow-y-auto pr-1">
                  {filteredItems.map((item) => (
                    <div
                      key={item.id}
                      className="p-3.5 rounded-lg bg-surface-card border border-line-soft hover:border-primary/40 shadow-lg space-y-2.5 flex flex-col justify-between"
                    >
                      <div className="space-y-2">
                        <div className="relative h-28 w-full rounded overflow-hidden bg-black/40">
                          <img
                            src={item.imageUrl || galleryImg1}
                            alt={item.title}
                            className="w-full h-full object-cover"
                          />
                          <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/75 text-[12px] font-bold text-ink-strong uppercase">
                            {item.category}
                          </span>
                        </div>

                        <h4 className="text-[13px] font-bold text-ink-strong truncate">{item.title}</h4>
                        <p className="text-[13px] text-ink-muted line-clamp-1">{item.description}</p>
                      </div>

                      <div className="pt-2 border-t border-line-soft flex items-center justify-between">
                        <span className="text-[12px] text-ink-muted">{item.date}</span>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleEditItem(item)}
                            className="w-10 h-10 inline-flex items-center justify-center shrink-0 rounded-lg bg-surface-overlay/40 hover:bg-primary text-ink-body hover:text-ink-strong transition cursor-pointer"
                            title="সম্পাদনা"
                          >
                            <HiPencilSquare className="text-sm" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteItem(item.id)}
                            className="w-10 h-10 inline-flex items-center justify-center shrink-0 rounded-lg bg-error/15 hover:bg-error text-error hover:text-ink-strong transition cursor-pointer"
                            title="মুছে ফেলুন"
                          >
                            <HiTrash className="text-sm" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

              </div>

            </div>
          )}
        </div>
      )}

      {confirmUI}
    </div>
  );
};

export default GalleryManager;
