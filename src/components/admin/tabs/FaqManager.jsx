import React, { useState, useEffect, useMemo } from "react";
import { Toast, useConfirm } from "../ui";
import {
  HiTrash,
  HiPencilSquare,
  HiMagnifyingGlass,
  HiChevronDown,
} from "react-icons/hi2";
import {
  getFaqs,
  addFaq,
  updateFaq,
  deleteFaq,
} from "../../../services/firestore";

const FaqManager = () => {
  const [faqs, setFaqs] = useState([]);
  const [confirm, confirmUI] = useConfirm();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [previewOpenId, setPreviewOpenId] = useState(null);

  const [formData, setFormData] = useState({
    question: "",
    answer: "",
    category: "exam",
    color: "blue",
    orderIndex: "1",
  });

  const loadFaqsList = async () => {
    try {
      setLoading(true);
      const data = await getFaqs();
      if (data) setFaqs(data);
      else setFaqs([]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFaqsList();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.question || !formData.answer) {
      setStatusMessage({
        type: "error",
        text: "দয়া করে প্রশ্ন এবং উত্তর প্রদান করুন!",
      });
      return;
    }

    setSubmitting(true);
    setStatusMessage(null);

    try {
      const payload = {
        question: formData.question,
        answer: formData.answer,
        category: formData.category || "exam",
        color: formData.color || "blue",
        orderIndex: Number(formData.orderIndex) || faqs.length + 1,
      };

      if (editingId) {
        await updateFaq(editingId, payload);
        setStatusMessage({
          type: "success",
          text: "প্রশ্নোত্তর সফলভাবে আপডেট করা হয়েছে!",
        });
      } else {
        await addFaq(payload);
        setStatusMessage({
          type: "success",
          text: "নতুন প্রশ্নোত্তর সফলভাবে যুক্ত করা হয়েছে!",
        });
      }

      setFormData({
        question: "",
        answer: "",
        category: "exam",
        color: "blue",
        orderIndex: `${faqs.length + 2}`,
      });
      setEditingId(null);

      await loadFaqsList();
    } catch (err) {
      console.error(err);
      setStatusMessage({
        type: "error",
        text: err.message || "প্রশ্নোত্তর সংরক্ষণ করতে ব্যর্থ হয়েছে!",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setFormData({
      question: item.question || "",
      answer: item.answer || "",
      category: item.category || "exam",
      color: item.color || "blue",
      orderIndex: `${item.orderIndex || 1}`,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    const ok = await confirm({
        title: "প্রশ্নোত্তরটি মুছে ফেলবেন?",
        body: "হোমপেজের FAQ সেকশন থেকে এই প্রশ্ন ও উত্তরটি সরে যাবে।",
        confirmLabel: "মুছে ফেলুন",
        tone: "danger",
      });
      if (!ok) return;
    try {
      await deleteFaq(id);
      setFaqs((prev) => prev.filter((f) => f.id !== id));
      setStatusMessage({ type: "success", text: "প্রশ্নোত্তর মুছে ফেলা হয়েছে!" });
    } catch (err) {
      setStatusMessage({ type: "error", text: "মুছে ফেলতে ব্যর্থ হয়েছে!" });
    }
  };

  const filteredFaqs = useMemo(() => {
    return faqs.filter((item) => {
      const matchSearch =
        searchTerm === "" ||
        item.question?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.answer?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchCat =
        selectedCategory === "all" || item.category === selectedCategory;

      return matchSearch && matchCat;
    });
  }, [faqs, searchTerm, selectedCategory]);

  return (
    <div className="space-y-8 animate-fadeIn">

      <Toast message={statusMessage} onDismiss={() => setStatusMessage(null)} />

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 items-start">
        {/* Left: Form (5 cols) */}
        <div className="lg:col-span-5 lg:sticky lg:top-[5.5rem] p-5 sm:p-6 bg-surface-card border border-line-soft rounded-lg space-y-4">
          <h3 className="text-sm font-bold text-ink-strong uppercase tracking-wider flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-tertiary-container/20 text-tertiary flex items-center justify-center text-[13px]">
              +
            </span>
            {editingId ? "প্রশ্নোত্তর সম্পাদনা করুন" : "নতুন প্রশ্নোত্তর যুক্ত করুন"}
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[13px] font-semibold text-ink-body mb-1.5">
                প্রশ্ন (Question) *
              </label>
              <input
                type="text"
                name="question"
                value={formData.question}
                onChange={handleInputChange}
                placeholder="যেমন: পরীক্ষার ফি কত এবং কীভাবে জমা দিতে হবে?"
                required
                className="w-full px-4 py-2.5 bg-surface-lowest border border-line-soft rounded text-ink-strong text-[13px] focus:outline-none focus:border-tertiary/40"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[13px] font-semibold text-ink-body mb-1.5">
                  ক্যাটাগরি
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-surface-lowest border border-line-soft rounded text-ink-strong text-[13px] focus:outline-none focus:border-tertiary/40"
                >
                  <option value="eligibility">যোগ্যতা (Eligibility)</option>
                  <option value="registration">রেজিস্ট্রেশন</option>
                  <option value="exam">পরীক্ষা (Exam)</option>
                  <option value="payment">পেমেন্ট (Payment)</option>
                </select>
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-ink-body mb-1.5">
                  ক্রম (Order)
                </label>
                <input
                  type="number"
                  name="orderIndex"
                  value={formData.orderIndex}
                  onChange={handleInputChange}
                  min="1"
                  className="w-full px-3 py-2 bg-surface-lowest border border-line-soft rounded text-ink-strong text-[13px] focus:outline-none focus:border-tertiary/40"
                />
              </div>
            </div>

            <div>
              <label className="block text-[13px] font-semibold text-ink-body mb-1.5">
                আইকন কালার
              </label>
              <select
                name="color"
                value={formData.color}
                onChange={handleInputChange}
                className="w-full px-3.5 py-2.5 bg-surface-lowest border border-line-soft rounded text-ink-strong text-[13px] focus:outline-none focus:border-tertiary/40"
              >
                <option value="blue">নীল (Blue)</option>
                <option value="purple">বেগুনি (Purple)</option>
                <option value="cyan">সায়ান (Cyan)</option>
                <option value="amber">সোনালী (Amber)</option>
                <option value="emerald">সবুজ (Emerald)</option>
                <option value="rose">লাল / গোলাপী (Rose)</option>
              </select>
            </div>

            <div>
              <label className="block text-[13px] font-semibold text-ink-body mb-1.5">
                উত্তর (Answer) *
              </label>
              <textarea
                name="answer"
                rows={5}
                value={formData.answer}
                onChange={handleInputChange}
                placeholder="প্রশ্নের বিস্তারিত ও স্পষ্ট উত্তর লিখুন..."
                required
                className="w-full px-4 py-2.5 bg-surface-lowest border border-line-soft rounded text-ink-strong text-[13px] focus:outline-none focus:border-tertiary/40 leading-relaxed"
              ></textarea>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 py-3 bg-gradient-to-r from-tertiary-container to-tertiary-container hover:from-tertiary-container hover:to-tertiary-container text-ink-strong text-[13px] font-bold rounded transition cursor-pointer disabled:opacity-50"
              >
                {submitting ? "সেভ হচ্ছে..." : editingId ? "আপডেট করুন" : "প্রশ্নোত্তর সংরক্ষণ করুন"}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(null);
                    setFormData({
                      question: "",
                      answer: "",
                      category: "exam",
                      color: "blue",
                      orderIndex: `${faqs.length + 1}`,
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

        {/* Right: Existing FAQs List (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Filter Bar */}
          <div className="p-4 bg-surface-card border border-line-soft rounded flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-overlay">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
              {[
                { id: "all", label: "সকল" },
                { id: "eligibility", label: "যোগ্যতা" },
                { id: "registration", label: "রেজিস্ট্রেশন" },
                { id: "exam", label: "পরীক্ষা" },
                { id: "payment", label: "পেমেন্ট" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedCategory(tab.id)}
                  className={`px-3 py-1.5 rounded text-[13px] font-semibold whitespace-nowrap transition cursor-pointer ${
                    selectedCategory === tab.id
                      ? "bg-tertiary-container text-ink-strong"
                      : "text-ink-muted hover:text-ink-strong hover:bg-surface-card"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="relative">
              <HiMagnifyingGlass className="absolute left-3 top-2.5 text-ink-muted text-[13px]" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="প্রশ্ন খুঁজুন..."
                className="w-full sm:w-44 pl-8 pr-3 py-1.5 bg-surface-lowest border border-line-soft rounded text-ink-strong text-[13px] focus:outline-none focus:border-tertiary/40"
              />
            </div>
          </div>

          {/* FAQ Accordion List */}
          {loading ? (
            <div className="p-12 text-center text-ink-muted bg-surface-card rounded">
              লোড হচ্ছে...
            </div>
          ) : filteredFaqs.length === 0 ? (
            <div className="p-8 text-center text-ink-muted bg-surface-card border border-line-soft rounded space-y-3">
              <p className="text-[13px] text-ink-body">
                ফায়ারস্টোরে কাস্টম প্রশ্নোত্তর নেই। বর্তমানে ওয়েবসাইটের <strong>১০টি ডিফল্ট প্রশ্নোত্তর</strong> হোমপেজে প্রদর্শিত হচ্ছে।
              </p>
              <p className="text-[13px] text-tertiary">
                বাম পাশের ফর্ম দিয়ে নতুন প্রশ্ন যোগ করলে হোমপেজ স্বয়ংক্রিয়ভাবে আপডেট হয়ে যাবে!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredFaqs.map((item, index) => {
                const isOpen = previewOpenId === item.id;
                return (
                  <div
                    key={item.id}
                    className="rounded bg-surface-card border border-line-soft hover:border-line-soft transition duration-200 overflow-hidden"
                  >
                    <div
                      onClick={() => setPreviewOpenId(isOpen ? null : item.id)}
                      className="p-4 sm:p-5 flex items-center justify-between gap-3 cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full bg-tertiary-container/20 text-tertiary flex items-center justify-center text-[13px] font-bold font-mono">
                          {item.orderIndex || index + 1}
                        </span>
                        <h4 className="text-[13px] sm:text-sm font-bold text-ink-strong leading-relaxed">
                          {item.question}
                        </h4>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="px-2.5 py-0.5 rounded-full bg-surface-card text-ink-body text-[12px] font-semibold uppercase">
                          {item.category}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(item);
                          }}
                          className="w-10 h-10 inline-flex items-center justify-center shrink-0 hover:bg-surface-card text-ink-body hover:text-ink-strong rounded transition cursor-pointer"
                          title="সম্পাদনা"
                        >
                          <HiPencilSquare className="text-base" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(item.id);
                          }}
                          className="w-10 h-10 inline-flex items-center justify-center shrink-0 hover:bg-tertiary-900/40 text-tertiary hover:text-tertiary rounded transition cursor-pointer"
                          title="মুছে ফেলুন"
                        >
                          <HiTrash className="text-base" />
                        </button>
                        <HiChevronDown
                          className={`text-ink-muted text-lg transition-transform duration-200 ${
                            isOpen ? "rotate-180 text-tertiary" : ""
                          }`}
                        />
                      </div>
                    </div>

                    {isOpen && (
                      <div className="px-5 pb-5 pt-1 text-[13px] text-ink-body leading-relaxed border-t border-line-soft/60 bg-surface-lowest/40">
                        {item.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {confirmUI}
    </div>
  );
};

export default FaqManager;
