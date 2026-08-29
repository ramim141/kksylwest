import React, { useState, useEffect, useRef } from "react";
import {
  HiUserGroup,
  HiTrash,
  HiPencilSquare,
  HiPhoto,
} from "react-icons/hi2";
import { FaFacebookF } from "react-icons/fa";
import { uploadToImgBB } from "../../../services/imgbb";
import { Toast, useConfirm } from "../ui";
import {
  getCommitteeMembers,
  addCommitteeMember,
  updateCommitteeMember,
  deleteCommitteeMember,
} from "../../../services/firestore";

const CommitteeManager = () => {
  const [members, setMembers] = useState([]);
  const [confirm, confirmUI] = useConfirm();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);
  const [editingId, setEditingId] = useState(null);

  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [currentImgUrl, setCurrentImgUrl] = useState("");
  const photoInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: "",
    role: "সদস্য",
    orderIndex: "1",
    facebook: "",
  });

  const loadMembers = async () => {
    try {
      setLoading(true);
      const data = await getCommitteeMembers();
      if (data) setMembers(data);
      else setMembers([]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMembers();
  }, []);

  const handlePhotoSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedPhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.role) return;

    setSubmitting(true);
    setStatusMessage(null);

    try {
      let imgUrl = currentImgUrl;
      if (selectedPhoto) {
        const uploadRes = await uploadToImgBB(selectedPhoto);
        imgUrl = uploadRes.url;
      }

      const payload = {
        name: formData.name,
        role: formData.role,
        orderIndex: Number(formData.orderIndex) || members.length + 1,
        facebook: formData.facebook || "#",
        img: imgUrl,
      };

      if (editingId) {
        await updateCommitteeMember(editingId, payload);
        setStatusMessage({
          type: "success",
          text: "পরিচালনা পর্ষদের সদস্য তথ্য সফলভাবে আপডেট করা হয়েছে!",
        });
      } else {
        await addCommitteeMember(payload);
        setStatusMessage({
          type: "success",
          text: "পরিচালনা পর্ষদে নতুন সদস্য সফলভাবে যুক্ত করা হয়েছে!",
        });
      }

      handleResetForm();
      await loadMembers();
    } catch (err) {
      console.error(err);
      setStatusMessage({
        type: "error",
        text: err.message || "সদস্য সংরক্ষণ করতে সমস্যা হয়েছে!",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (m) => {
    setEditingId(m.id);
    setFormData({
      name: m.name || "",
      role: m.role || "সদস্য",
      orderIndex: `${m.orderIndex || 1}`,
      facebook: m.facebook === "#" ? "" : m.facebook || "",
    });
    setCurrentImgUrl(m.img || "");
    setPhotoPreview(m.img || null);
    setSelectedPhoto(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleResetForm = () => {
    setEditingId(null);
    setSelectedPhoto(null);
    setPhotoPreview(null);
    setCurrentImgUrl("");
    setFormData({
      name: "",
      role: "সদস্য",
      orderIndex: `${members.length + 2}`,
      facebook: "",
    });
    if (photoInputRef.current) photoInputRef.current.value = "";
  };

  const handleDelete = async (id) => {
    const ok = await confirm({
        title: "সদস্যকে মুছে ফেলবেন?",
        body: "পরিচালনা পর্ষদের তালিকা থেকে এই সদস্যের নাম, ছবি ও পদবি স্থায়ীভাবে মুছে যাবে।",
        confirmLabel: "মুছে ফেলুন",
        tone: "danger",
      });
      if (!ok) return;
    try {
      await deleteCommitteeMember(id);
      setMembers((prev) => prev.filter((m) => m.id !== id));
      setStatusMessage({ type: "success", text: "সদস্য সফলভাবে মুছে ফেলা হয়েছে!" });
    } catch (err) {
      setStatusMessage({ type: "error", text: "মুছতে ব্যর্থ হয়েছে!" });
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">

      <Toast message={statusMessage} onDismiss={() => setStatusMessage(null)} />

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 items-start">
        {/* Form (5 cols) */}
        <div className="lg:col-span-5 lg:sticky lg:top-[5.5rem] p-5 sm:p-6 bg-surface-card border border-line-soft rounded-lg space-y-4">
          <h3 className="text-sm font-bold text-ink-strong uppercase tracking-wider flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-tertiary-container/20 text-tertiary flex items-center justify-center text-[13px]">
              +
            </span>
            {editingId ? "সদস্য তথ্য সম্পাদনা করুন" : "নতুন সদস্য যুক্ত করুন"}
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Photo Picker */}
            <div>
              <label className="block text-[13px] font-semibold text-ink-body mb-1.5">
                সদস্যের ছবি (ঐচ্ছিক - ImgBB ক্লাউড আপলোড)
              </label>
              <div
                onClick={() => photoInputRef.current?.click()}
                className="border-2 border-dashed border-line-soft hover:border-tertiary/80 bg-surface-lowest/60 p-4 rounded-lg text-center cursor-pointer transition flex flex-col items-center justify-center min-h-[130px] group"
              >
                {photoPreview ? (
                  <div className="relative">
                    <img
                      src={photoPreview}
                      alt="Preview"
                      className="w-20 h-20 object-cover rounded-full border-2 border-tertiary/40"
                    />
                    <span className="absolute -bottom-1 -right-1 bg-tertiary-container text-ink-strong p-1 rounded-full text-[12px]">
                      ✓
                    </span>
                  </div>
                ) : (
                  <>
                    <HiPhoto className="text-3xl text-ink-muted group-hover:text-tertiary mb-1" />
                    <p className="text-[13px] text-ink-strong font-medium">ছবি নির্বাচন করুন</p>
                    <p className="text-[12px] text-ink-muted">JPG, PNG (ImgBB এ সেভ হবে)</p>
                  </>
                )}
              </div>
              <input
                ref={photoInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoSelect}
                className="hidden"
              />
            </div>

            <div>
              <label className="block text-[13px] font-semibold text-ink-body mb-1.5">
                সদস্যের পুরো নাম *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="যেমন: আবু জুবায়ের"
                required
                className="w-full px-4 py-2.5 bg-surface-lowest border border-line-soft rounded text-ink-strong text-[13px] focus:outline-none focus:border-tertiary/40"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[13px] font-semibold text-ink-body mb-1.5">
                  পদবী / পদমর্যাদা *
                </label>
                <input
                  type="text"
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  placeholder="যেমন: চেয়ারম্যান"
                  required
                  className="w-full px-3 py-2 bg-surface-lowest border border-line-soft rounded text-ink-strong text-[13px] focus:outline-none focus:border-tertiary/40"
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
                  className="w-full px-3 py-2 bg-surface-lowest border border-line-soft rounded text-ink-strong text-[13px] focus:outline-none focus:border-tertiary/40"
                />
              </div>
            </div>

            <div>
              <label className="block text-[13px] font-semibold text-ink-body mb-1.5">
                ফেসবুক প্রোফাইল লিঙ্ক (ঐচ্ছিক)
              </label>
              <input
                type="url"
                name="facebook"
                value={formData.facebook}
                onChange={handleInputChange}
                placeholder="https://facebook.com/username"
                className="w-full px-4 py-2.5 bg-surface-lowest border border-line-soft rounded text-ink-strong text-[13px] focus:outline-none focus:border-tertiary/40"
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 py-3.5 bg-gradient-to-r from-tertiary-container to-tertiary-container hover:from-tertiary-container hover:to-tertiary-container text-ink-strong font-bold rounded transition flex items-center justify-center gap-2 disabled:opacity-50 text-[13px] cursor-pointer"
              >
                {submitting ? "সংরক্ষণ হচ্ছে..." : editingId ? "আপডেট করুন" : "সদস্য যুক্ত করুন"}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={handleResetForm}
                  className="px-4 py-3.5 bg-surface-card hover:bg-surface-overlay text-ink-body text-[13px] rounded cursor-pointer"
                >
                  বাতিল
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Member Cards Grid (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-4 bg-surface-card border border-line-soft rounded flex items-center justify-between shadow-overlay">
            <h3 className="text-sm font-bold text-ink-strong flex items-center gap-2">
              <HiUserGroup className="text-tertiary" />
              পরিচালনা পর্ষদের সদস্য তালিকা ({members.length > 0 ? `${members.length} জন` : "ডিফল্ট কমিটি সক্রিয়"})
            </h3>
            <span className="text-[13px] text-tertiary font-semibold">
              হোমপেজের সাথে লাইভ
            </span>
          </div>

          {loading ? (
            <div className="p-12 text-center text-ink-muted bg-surface-card rounded">
              লোড হচ্ছে...
            </div>
          ) : members.length === 0 ? (
            <div className="p-8 text-center text-ink-muted bg-surface-card border border-line-soft rounded space-y-3">
              <p className="text-[13px] text-ink-body">
                ফায়ারস্টোরে কাস্টম মেম্বার নেই। বর্তমানে ওয়েবসাইটের <strong>১১ জন বিশিষ্ট কর্মকর্তার ডিফল্ট তালিকা</strong> হোমপেজে প্রদর্শিত হচ্ছে।
              </p>
              <p className="text-[13px] text-tertiary">
                বাম পাশের ফর্ম থেকে নতুন সদস্য যুক্ত করলে অথবা ছবি দিলে হোমপেজ স্বয়ংক্রিয়ভাবে আপডেট হয়ে যাবে!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {members.map((m, index) => (
                <div
                  key={m.id}
                  className="p-4 bg-surface-card border border-line-soft rounded-lg hover:border-tertiary/40 transition duration-200 flex items-center justify-between gap-3 group"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    {m.img ? (
                      <img
                        src={m.img}
                        alt={m.name}
                        className="w-14 h-14 rounded-full object-cover border-2 border-tertiary/40 flex-shrink-0"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-full bg-surface-card border border-line-soft flex items-center justify-center text-ink-strong font-bold text-lg flex-shrink-0">
                        {m.name?.charAt(0) || "U"}
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="px-1.5 py-0.5 rounded bg-tertiary-container/20 text-tertiary text-[9px] font-bold font-mono">
                          #{m.orderIndex || index + 1}
                        </span>
                        <h4 className="text-[13px] font-bold text-ink-strong truncate">{m.name}</h4>
                      </div>
                      <p className="text-[13px] text-tertiary font-semibold truncate mt-0.5">{m.role}</p>
                      {m.facebook && m.facebook !== "#" && (
                        <a
                          href={m.facebook}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[12px] text-ink-muted hover:text-tertiary flex items-center gap-1 mt-1 truncate"
                        >
                          <FaFacebookF className="text-[9px] text-tertiary" /> ফেসবুক প্রোফাইল
                        </a>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => handleEdit(m)}
                      className="p-2 text-ink-muted hover:text-ink-strong hover:bg-surface-card rounded transition cursor-pointer"
                      title="সম্পাদনা করুন"
                    >
                      <HiPencilSquare className="text-base" />
                    </button>
                    <button
                      onClick={() => handleDelete(m.id)}
                      className="p-2 text-tertiary hover:bg-tertiary-900/30 rounded transition cursor-pointer"
                      title="মুছে ফেলুন"
                    >
                      <HiTrash className="text-base" />
                    </button>
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

export default CommitteeManager;
